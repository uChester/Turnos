const crypto = require('node:crypto');
const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

function fechaValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const fechaParseada = new Date(`${fecha}T00:00:00Z`);
  return !Number.isNaN(fechaParseada.valueOf()) && fechaParseada.toISOString().slice(0, 10) === fecha;
}

function minutosDesdeHora(hora) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) return null;
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

function horariosDelDia(fecha) {
  // La fecha ISO se interpreta en UTC para obtener correctamente el día elegido por el cliente.
  const esDomingo = new Date(`${fecha}T00:00:00Z`).getUTCDay() === 0;
  const inicio = minutosDesdeHora(esDomingo ? '10:00' : '09:00');
  const fin = minutosDesdeHora(esDomingo ? '18:00' : '23:00');
  const duracionTurno = 60;

  const horarios = [];
  for (let minuto = inicio; minuto + duracionTurno <= fin; minuto += duracionTurno) {
    horarios.push(`${String(Math.floor(minuto / 60)).padStart(2, '0')}:${String(minuto % 60).padStart(2, '0')}`);
  }
  return horarios;
}

function datosValidos({ nombre, telefono, fecha, hora }) {
  const camposCompletos = [nombre, telefono, fecha, hora]
    .every((valor) => typeof valor === 'string' && valor.trim());
  if (!camposCompletos) return false;

  return fechaValida(fecha) && horariosDelDia(fecha).includes(hora);
}

function nuevoCodigo() {
  return `BARBER-${crypto.randomInt(100000, 1000000)}`;
}

function autorizarDueno(req, res, next) {
  const claveConfigurada = process.env.ADMIN_TOKEN;
  const encabezado = req.get('authorization') || '';
  const claveRecibida = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : '';

  if (!claveConfigurada) return res.status(503).json({ mensaje: 'El acceso del dueño todavía no está configurado.' });
  if (claveRecibida.length !== claveConfigurada.length
    || !crypto.timingSafeEqual(Buffer.from(claveRecibida), Buffer.from(claveConfigurada))) {
    return res.status(401).json({ mensaje: 'Clave de acceso incorrecta.' });
  }
  return next();
}

app.get('/api/disponibilidad', async (req, res, next) => {
  const { fecha } = req.query;
  if (!fechaValida(fecha)) return res.status(400).json({ mensaje: 'Indica una fecha válida.' });

  try {
    const { rows } = await pool.query('SELECT hora FROM reservas WHERE fecha = $1', [fecha]);
    const ocupados = new Set(rows.map(({ hora }) => String(hora).slice(0, 5)));
    return res.json({
      fecha,
      horarios: horariosDelDia(fecha).map((hora) => ({ hora, disponible: !ocupados.has(hora) })),
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/dueno/reservas', autorizarDueno, async (req, res, next) => {
  const { fecha } = req.query;
  if (!fechaValida(fecha)) return res.status(400).json({ mensaje: 'Indica una fecha válida.' });

  try {
    const { rows } = await pool.query(
      'SELECT codigo, nombre, telefono, fecha, hora FROM reservas WHERE fecha = $1 ORDER BY hora ASC',
      [fecha],
    );
    const reservasPorHora = new Map(rows.map((reserva) => [String(reserva.hora).slice(0, 5), reserva]));
    return res.json({
      fecha,
      horarios: horariosDelDia(fecha).map((hora) => ({ hora, reserva: reservasPorHora.get(hora) || null })),
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/reservas/:codigo', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT codigo, nombre, telefono, fecha, hora FROM reservas WHERE codigo = $1',
      [req.params.codigo.trim().toUpperCase()],
    );

    if (!rows[0]) return res.status(404).json({ mensaje: 'No se encontró ninguna reserva con ese código.' });
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/reservas', async (req, res, next) => {
  const { nombre, telefono, fecha, hora } = req.body;
  if (!datosValidos({ nombre, telefono, fecha, hora })) {
    return res.status(400).json({ mensaje: 'Los datos de la reserva no son válidos.' });
  }

  try {
    // El código tiene también una restricción UNIQUE; se reintenta ante una colisión improbable.
    for (let intento = 0; intento < 3; intento += 1) {
      const codigo = nuevoCodigo();
      try {
        const { rows } = await pool.query(
          `INSERT INTO reservas (codigo, nombre, telefono, fecha, hora)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING codigo, nombre, telefono, fecha, hora`,
          [codigo, nombre.trim(), telefono.trim(), fecha, hora],
        );
        return res.status(201).json(rows[0]);
      } catch (error) {
        if (error.code === '23505' && error.constraint === 'reservas_fecha_hora_unica') {
          return res.status(409).json({ mensaje: 'Ese horario ya fue reservado. Elegí otro.' });
        }
        if (error.code !== '23505') throw error;
      }
    }
    return res.status(503).json({ mensaje: 'No se pudo generar un código de reserva. Intentá nuevamente.' });
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/reservas/:codigo', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM reservas WHERE codigo = $1', [req.params.codigo.trim().toUpperCase()]);
    if (!rowCount) return res.status(404).json({ mensaje: 'La reserva ya no existe.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ mensaje: 'No fue posible comunicarse con la base de datos.' });
});

// Vercel importa esta aplicación como una función serverless. No abrir un puerto aquí.
module.exports = app;
