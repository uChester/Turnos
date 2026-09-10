import { useState } from 'react';
import MenuBarberia from './pages/Memu.jsx';
import Cortes from './componentes/Cortes.jsx';
import Reserva from './componentes/Reserva.jsx';
import Contacto from './componentes/Contacto.jsx';
import CancelarTurno from './componentes/CancelarTurno.jsx';
import AgendaDueno from './componentes/AgendaDueno.jsx';
import { supabase } from './superbase.js'; // Ajustado según tu importación actual

export default function App() {
  const [pantallaActual, setPantallaActual] = useState('MENU');

  // 1. Crear una nueva reserva en Supabase 📝
  const crearReserva = async (datos) => {
    const codigo = `BARBER-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from('turnos')
      .insert([
        {
          nombre: datos.nombre,
          telefono: datos.telefono,
          fecha: datos.fecha,
          hora: datos.hora,
          codigo: codigo,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Error al crear la reserva: ${error.message}`);
    return data;
  };

  // 2. Consultar disponibilidad según los turnos agendados 🕒
  const consultarDisponibilidad = async (fecha) => {
    const horariosPosibles = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    
    const { data, error } = await supabase
      .from('turnos')
      .select('hora')
      .eq('fecha', fecha);

    if (error) throw new Error(`Error al consultar disponibilidad: ${error.message}`);

    const horasOcupadas = data.map((t) => t.hora.slice(0, 5)); // Ajuste de formato HH:MM
    const horarios = horariosPosibles.map((hora) => ({
      hora,
      disponible: !horasOcupadas.includes(hora),
    }));

    return { horarios };
  };

  // 3. Buscar reserva por código 🔍
  const buscarReserva = async (codigo) => {
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error || !data) throw new Error('No se encontró ninguna reserva con ese código.');
    return data;
  };

  // 4. Cancelar reserva por código ❌
  const cancelarReservaPorCodigo = async (codigo) => {
    const { error } = await supabase
      .from('turnos')
      .delete()
      .eq('codigo', codigo);

    if (error) throw new Error(`Error al cancelar la reserva: ${error.message}`);
    return true;
  };

  // 5. Consultar la agenda completa del dueño para un día 📅
  const consultarAgendaDueno = async (fecha) => {
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('fecha', fecha)
      .order('hora', { ascending: true });

    if (error) throw new Error(`Error al obtener la agenda: ${error.message}`);
    return data;
  };

  if (pantallaActual === 'MENU') return <MenuBarberia cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'CORTES Y PRECIOS') return <Cortes cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'RESERVAR TURNO') {
    return <Reserva cambiarPantalla={setPantallaActual} crearReserva={crearReserva} consultarDisponibilidad={consultarDisponibilidad} />;
  }
  if (pantallaActual === 'CONTACTO') return <Contacto cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'CANCELAR TURNO') {
    return <CancelarTurno cambiarPantalla={setPantallaActual} buscarReserva={buscarReserva} cancelarReservaPorCodigo={cancelarReservaPorCodigo} />;
  }
  if (pantallaActual === 'AGENDA DEL DUEÑO') return <AgendaDueno cambiarPantalla={setPantallaActual} consultarAgenda={consultarAgendaDueno} />;

  return <div>Error: Pantalla no encontrada</div>;
}