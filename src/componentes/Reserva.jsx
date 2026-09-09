import { useState } from 'react';

export default function Reserva({ cambiarPantalla, crearReserva }) {
  const [datosReserva, setDatosReserva] = useState({ nombre: '', telefono: '', fecha: '', hora: '' });
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosReserva((datos) => ({ ...datos, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError('');
    setEnviando(true);

    try {
      const reserva = await crearReserva(datosReserva);
      setReservaConfirmada(reserva);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setEnviando(false);
    }
  };

  if (reservaConfirmada) {
    return (
      <main className="game-screen">
        <div className="game-page flex flex-col items-center text-center">
          <div className="game-panel p-6 w-full">
            <h2 className="game-title text-3xl mb-4">Turno Reservado</h2>
            <p className="text-gray-300 text-sm mb-4">Guarda tu código para cualquier consulta o cancelación:</p>
            <div className="border border-slate-400/50 bg-black/30 py-3 px-6 mb-6 inline-block">
              <span className="text-slate-100 font-mono text-2xl font-bold tracking-widest">{reservaConfirmada.codigo}</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Cliente: <span className="text-white">{reservaConfirmada.nombre}</span><br />
              Fecha: <span className="text-white">{reservaConfirmada.fecha}</span> a las <span className="text-white">{reservaConfirmada.hora}</span> hs
            </p>
            <button onClick={() => cambiarPantalla('MENU')} className="game-action w-full font-bold py-3 px-4">
              Volver al Menú Principal
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="game-screen">
      <div className="game-page flex flex-col items-center">
        <h2 className="game-title self-start">Reservar Turno</h2>

        <form onSubmit={handleSubmit} className="game-panel flex flex-col gap-4 w-full p-6">
          <div>
            <label className="block text-gray-300 mb-1 text-sm" htmlFor="nombre">Nombre completo:</label>
            <input id="nombre" type="text" name="nombre" value={datosReserva.nombre} onChange={handleChange} required disabled={enviando}
              className="w-full bg-black/40 border border-slate-600 text-white p-2 focus:outline-none focus:border-slate-300" placeholder="Ej: Juan Pérez" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm" htmlFor="telefono">Teléfono de contacto:</label>
            <input id="telefono" type="tel" name="telefono" value={datosReserva.telefono} onChange={handleChange} required disabled={enviando}
              className="w-full bg-black/40 border border-slate-600 text-white p-2 focus:outline-none focus:border-slate-300" placeholder="Ej: 381 123 4567" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm" htmlFor="fecha">Fecha:</label>
            <input id="fecha" type="date" name="fecha" value={datosReserva.fecha} onChange={handleChange} required disabled={enviando}
              className="w-full bg-black/40 border border-slate-600 text-white p-2 focus:outline-none focus:border-slate-300" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm" htmlFor="hora">Hora:</label>
            <input id="hora" type="time" name="hora" value={datosReserva.hora} onChange={handleChange} required disabled={enviando}
              className="w-full bg-black/40 border border-slate-600 text-white p-2 focus:outline-none focus:border-slate-300" />
          </div>

          {mensajeError && <p className="border border-slate-500/60 bg-black/30 p-3 text-sm text-slate-200">{mensajeError}</p>}

          <button type="submit" disabled={enviando} className="game-action mt-4 font-bold py-3 px-4 disabled:cursor-wait disabled:opacity-60">
            {enviando ? 'Guardando reserva...' : 'Confirmar Reserva'}
          </button>
        </form>

        <button onClick={() => cambiarPantalla('MENU')} className="game-back self-start mt-4 text-sm font-semibold flex items-center gap-1">
          ← Volver al Menú
        </button>
      </div>
    </main>
  );
}
