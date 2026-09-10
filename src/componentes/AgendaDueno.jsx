import { useState } from 'react';

function fechaDeHoy() {
  const ahora = new Date();
  const zonaLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
  return zonaLocal.toISOString().slice(0, 10);
}

function formatoHora(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return `${horas % 12 || 12}:${String(minutos).padStart(2, '0')} ${horas >= 12 ? 'PM' : 'AM'}`;
}

export default function AgendaDueno({ cambiarPantalla, consultarAgenda }) {
  const [fecha, setFecha] = useState(fechaDeHoy);
  const [clave, setClave] = useState('');
  const [agenda, setAgenda] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);

  const consultar = async (evento) => {
    evento.preventDefault();
    setMensajeError('');
    setCargando(true);
    try {
      setAgenda(await consultarAgenda(fecha, clave));
    } catch (error) {
      setAgenda(null);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="game-screen">
      <div className="game-page flex flex-col items-center">
        <h2 className="game-title self-start">Agenda del Dueño</h2>
        <form onSubmit={consultar} className="game-panel flex flex-col gap-4 w-full p-6 mb-4">
          <div>
            <label className="block text-gray-300 mb-1 text-sm" htmlFor="fecha-agenda">Día:</label>
            <input id="fecha-agenda" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required disabled={cargando}
              className="w-full bg-black/40 border border-slate-600 text-white p-2 focus:outline-none focus:border-slate-300" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm" htmlFor="clave-agenda">Clave del dueño:</label>
            <input id="clave-agenda" type="password" value={clave} onChange={(e) => setClave(e.target.value)} required disabled={cargando} autoComplete="current-password"
              className="w-full bg-black/40 border border-slate-600 text-white p-2 focus:outline-none focus:border-slate-300" />
          </div>
          <button type="submit" disabled={cargando} className="game-action font-bold py-3 px-4 disabled:cursor-wait disabled:opacity-60">
            {cargando ? 'Cargando agenda...' : 'Ver agenda'}
          </button>
        </form>

        {mensajeError && <p className="game-panel border-slate-500/60 p-3 w-full text-sm text-slate-200 mb-4">{mensajeError}</p>}

        {agenda && (
          <section className="game-panel w-full p-6" aria-live="polite">
            <h3 className="text-xl text-gray-100 mb-4">Turnos del {agenda.fecha}</h3>
            <div className="flex flex-col gap-2">
              {agenda.horarios.map(({ hora, reserva }) => (
                <article key={hora} className="border border-slate-600/60 bg-black/20 p-3 text-sm">
                  <p className="font-bold text-white">{formatoHora(hora)} · {reserva ? 'Ocupado' : 'Disponible'}</p>
                  {reserva && <p className="mt-1 text-gray-300">{reserva.nombre} · {reserva.telefono}<br /><span className="font-mono text-xs">{reserva.codigo}</span></p>}
                </article>
              ))}
            </div>
          </section>
        )}

        <button onClick={() => cambiarPantalla('MENU')} className="game-back self-start mt-4 text-sm font-semibold flex items-center gap-1">← Volver al Menú</button>
      </div>
    </main>
  );
}
