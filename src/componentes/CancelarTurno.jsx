import { useState } from 'react';

function formatoHora(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return `${horas % 12 || 12}:${String(minutos).padStart(2, '0')} ${horas >= 12 ? 'PM' : 'AM'}`;
}

export default function CancelarTurno({ cambiarPantalla, buscarReserva, cancelarReservaPorCodigo }) {
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [reservaEncontrada, setReservaEncontrada] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito(false);
    setReservaEncontrada(null);
    setCargando(true);

    try {
      setReservaEncontrada(await buscarReserva(codigoBusqueda.trim().toUpperCase()));
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleConfirmarCancelacion = async () => {
    setMensajeError('');
    setCargando(true);
    try {
      await cancelarReservaPorCodigo(reservaEncontrada.codigo);
      setReservaEncontrada(null);
      setCodigoBusqueda('');
      setMensajeExito(true);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="game-screen">
      <div className="game-page flex flex-col items-center">
        <h2 className="game-title self-start">Cancelar Turno</h2>

        <form onSubmit={handleBuscar} className="game-panel flex flex-col gap-4 w-full p-6 mb-4">
          <div>
            <label className="block text-gray-300 mb-1 text-sm" htmlFor="codigo">Ingresa tu código de reserva:</label>
            <input id="codigo" type="text" value={codigoBusqueda} onChange={(e) => setCodigoBusqueda(e.target.value)}
              placeholder="Ej: BARBER-123456" required disabled={cargando}
              className="w-full bg-black/40 border border-slate-600 text-white p-2 focus:outline-none focus:border-slate-300 font-mono uppercase tracking-wider" />
          </div>
          <button type="submit" disabled={cargando} className="game-action font-bold py-3 px-4 disabled:cursor-wait disabled:opacity-60">
            {cargando ? 'Consultando...' : 'Buscar reserva'}
          </button>
        </form>

        {mensajeError && <div className="game-panel border-slate-500/60 text-slate-200 p-4 w-full text-sm mb-4 text-center">{mensajeError}</div>}
        {mensajeExito && <div className="game-panel border-slate-500/60 text-slate-200 p-4 w-full text-sm mb-4 text-center">Tu turno ha sido cancelado con éxito.</div>}

        {reservaEncontrada && (
          <div className="game-panel p-6 w-full text-center">
            <h3 className="text-lg font-bold text-gray-100 mb-2">Reserva encontrada</h3>
            <p className="text-sm text-gray-300 mb-1">Cliente: <span className="font-semibold text-white">{reservaEncontrada.nombre}</span></p>
            <p className="text-sm text-gray-300 mb-1">Fecha: <span className="font-semibold text-white">{reservaEncontrada.fecha}</span></p>
            <p className="text-sm text-gray-300 mb-4">Hora: <span className="font-semibold text-white">{formatoHora(reservaEncontrada.hora)}</span></p>
            <button onClick={handleConfirmarCancelacion} disabled={cargando} className="game-action w-full font-bold py-3 px-4 disabled:cursor-wait disabled:opacity-60">
              {cargando ? 'Cancelando...' : 'Confirmar cancelación'}
            </button>
          </div>
        )}

        <button onClick={() => cambiarPantalla('MENU')} className="game-back self-start mt-4 text-sm font-semibold flex items-center gap-1">
          ← Volver al Menú
        </button>
      </div>
    </main>
  );
}
