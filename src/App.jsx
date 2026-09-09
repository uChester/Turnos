import { useState } from 'react';
import MenuBarberia from './pages/Memu.jsx';
import Cortes from './componentes/Cortes.jsx';
import Reserva from './componentes/Reserva.jsx';
import Contacto from './componentes/Contacto.jsx';
import CancelarTurno from './componentes/CancelarTurno.jsx';

async function solicitarAPI(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    headers: { 'Content-Type': 'application/json', ...opciones.headers },
    ...opciones,
  });
  const contenido = respuesta.status === 204 ? null : await respuesta.json();

  if (!respuesta.ok) throw new Error(contenido?.mensaje || 'No se pudo completar la solicitud.');
  return contenido;
}

export default function App() {
  const [pantallaActual, setPantallaActual] = useState('MENU');

  const crearReserva = (datos) => solicitarAPI('/api/reservas', {
    method: 'POST',
    body: JSON.stringify(datos),
  });

  const buscarReserva = (codigo) => solicitarAPI(`/api/reservas/${encodeURIComponent(codigo)}`);

  const cancelarReservaPorCodigo = (codigo) => solicitarAPI(`/api/reservas/${encodeURIComponent(codigo)}`, {
    method: 'DELETE',
  });

  if (pantallaActual === 'MENU') return <MenuBarberia cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'CORTES Y PRECIOS') return <Cortes cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'RESERVAR TURNO') return <Reserva cambiarPantalla={setPantallaActual} crearReserva={crearReserva} />;
  if (pantallaActual === 'CONTACTO') return <Contacto cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'CANCELAR TURNO') {
    return <CancelarTurno cambiarPantalla={setPantallaActual} buscarReserva={buscarReserva} cancelarReservaPorCodigo={cancelarReservaPorCodigo} />;
  }

  return <div>Error: Pantalla no encontrada</div>;
}
