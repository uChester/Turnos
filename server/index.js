const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());

function datosValidos({ nombre, telefono, fecha, hora }) {
  const camposCompletos = [nombre, telefono, fecha, hora]
    .every((valor) => typeof valor === 'string' && valor.trim());
  if (!camposCompletos) return false;

  const fechaParseada = new Date(`${fecha}T00:00:00Z`);
  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha)
    && !Number.isNaN(fechaParseada.valueOf())
    && fechaParseada.toISOString().slice(0, 10) === fecha;
  const horaValida = /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

  return fechaValida && horaValida;
}

function nuevoCodigo() {
  return `BARBER-${crypto.randomInt(100000, 1000000)}`;
}

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

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ mensaje: 'No fue posible comunicarse con la base de datos.' });
});

app.listen(port, '0.0.0.0', () => console.log(`API de reservas disponible en el puerto ${port}`));
