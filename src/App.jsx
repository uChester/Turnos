import { useEffect, useState } from 'react';
import MenuBarberia from './pages/Memu.jsx';
import Cortes from './componentes/Cortes.jsx';
import Reserva from './componentes/Reserva.jsx';
import Contacto from './componentes/Contacto.jsx';
import CancelarTurno from './componentes/CancelarTurno.jsx';
import AgendaDueno from './componentes/AgendaDueno.jsx';

async function solicitarAPI(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    headers: { 'Content-Type': 'application/json', ...opciones.headers },
    ...opciones,
  });
  const texto = respuesta.status === 204 ? '' : await respuesta.text();
  let contenido = null;
  if (texto) {
    try {
      contenido = JSON.parse(texto);
    } catch {
      // Una página HTML o una respuesta vacía suele indicar que la API no está desplegada.
    }
  }

  if (!respuesta.ok) {
    const detalle = contenido?.mensaje
      || (texto ? 'El servidor respondió con un formato inesperado. Verifica que la API esté iniciada.' : 'El servidor no devolvió una respuesta.');
    throw new Error(detalle);
  }
  if (respuesta.status === 204) return null;
  if (!contenido) throw new Error('La API no devolvió los datos esperados. Verifica que el servidor esté actualizado e iniciado.');
  return contenido;
}

export default function App() {
  const pantallaDesdeEnlace = () => window.location.hash === '#agenda-dueno' ? 'AGENDA DEL DUEÑO' : 'MENU';
  const [pantallaActual, setPantallaActual] = useState(pantallaDesdeEnlace);

  useEffect(() => {
    const actualizarPantalla = () => setPantallaActual(pantallaDesdeEnlace());
    window.addEventListener('hashchange', actualizarPantalla);
    return () => window.removeEventListener('hashchange', actualizarPantalla);
  }, []);

  const cambiarPantalla = (pantalla) => {
    window.location.hash = pantalla === 'AGENDA DEL DUEÑO' ? 'agenda-dueno' : '';
    setPantallaActual(pantalla);
  };

  const crearReserva = (datos) => solicitarAPI('/api/reservas', {
    method: 'POST',
    body: JSON.stringify(datos),
  });

  const consultarDisponibilidad = (fecha) => solicitarAPI(`/api/disponibilidad?fecha=${encodeURIComponent(fecha)}`);

  const buscarReserva = (codigo) => solicitarAPI(`/api/reservas/${encodeURIComponent(codigo)}`);

  const cancelarReservaPorCodigo = (codigo) => solicitarAPI(`/api/reservas/${encodeURIComponent(codigo)}`, {
    method: 'DELETE',
  });

  const consultarAgendaDueno = (fecha, clave) => solicitarAPI(`/api/dueno/reservas?fecha=${encodeURIComponent(fecha)}`, {
    headers: { Authorization: `Bearer ${clave}` },
  });

  if (pantallaActual === 'MENU') return <MenuBarberia cambiarPantalla={cambiarPantalla} />;
  if (pantallaActual === 'CORTES Y PRECIOS') return <Cortes cambiarPantalla={cambiarPantalla} />;
  if (pantallaActual === 'RESERVAR TURNO') {
    return <Reserva cambiarPantalla={cambiarPantalla} crearReserva={crearReserva} consultarDisponibilidad={consultarDisponibilidad} />;
  }
  if (pantallaActual === 'CONTACTO') return <Contacto cambiarPantalla={cambiarPantalla} />;
  if (pantallaActual === 'CANCELAR TURNO') {
    return <CancelarTurno cambiarPantalla={cambiarPantalla} buscarReserva={buscarReserva} cancelarReservaPorCodigo={cancelarReservaPorCodigo} />;
  }
  if (pantallaActual === 'AGENDA DEL DUEÑO') return <AgendaDueno cambiarPantalla={cambiarPantalla} consultarAgenda={consultarAgendaDueno} />;

  return <div>Error: Pantalla no encontrada</div>;
}
