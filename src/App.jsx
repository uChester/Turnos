import { useState, useEffect } from 'react';
import MenuBarberia from './pages/Memu.jsx';
import Cortes from './componentes/Cortes.jsx';
import Reserva from './componentes/Reserva.jsx';
import Contacto from './componentes/Contacto.jsx';
import CancelarTurno from './componentes/CancelarTurno.jsx';
import AgendaDueno from './componentes/AgendaDueno.jsx';
import { supabase } from './superbase.js';

// 🕒 Helper para generar horarios según el día (Lunes-Sábado: 09:00-23:00 / Domingo: 10:00-18:00)
function obtenerHorariosPorFecha(fechaStr) {
  if (!fechaStr) return [];
  const [year, month, day] = fechaStr.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  const esDomingo = fecha.getDay() === 0; // 0 = Domingo

  const horaInicio = esDomingo ? 10 : 9;
  const horaFin = esDomingo ? 18 : 23;

  const horarios = [];
  for (let h = horaInicio; h <= horaFin; h++) {
    const horaFormateada = `${String(h).padStart(2, '0')}:00`;
    horarios.push(horaFormateada);
  }
  return horarios;
}

export default function App() {
  const [pantallaActual, setPantallaActual] = useState('MENU');
  const [esPanelDueno, setEsPanelDueno] = useState(false);

  // Detecta si se ingresa desde el enlace secreto del dueño
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setEsPanelDueno(true);
      setPantallaActual('AGENDA DEL DUEÑO');
    }
  }, []);

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
    const horariosPosibles = obtenerHorariosPorFecha(fecha);
    
    const { data, error } = await supabase
      .from('turnos')
      .select('hora')
      .eq('fecha', fecha);

    if (error) throw new Error(`Error al consultar disponibilidad: ${error.message}`);

    const horasOcupadas = data.map((t) => t.hora.slice(0, 5));
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

  // 5. Consultar la agenda completa del dueño adaptada a AgendaDueno.jsx 📅
  const consultarAgendaDueno = async (fecha, clave) => {
    const CLAVE_CORRECTA = 'SantaBarberHouse'; // 👈 Tu clave secreta
    if (clave !== CLAVE_CORRECTA) {
      throw new Error('La clave ingresada es incorrecta.');
    }

    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('fecha', fecha)
      .order('hora', { ascending: true });

    if (error) throw new Error(`Error al obtener la agenda: ${error.message}`);

    const horariosPosibles = obtenerHorariosPorFecha(fecha);
    const horarios = horariosPosibles.map((hora) => {
      const reservaEncontrada = data.find((t) => t.hora.slice(0, 5) === hora);
      return {
        hora,
        reserva: reservaEncontrada || null,
      };
    });

    return { fecha, horarios };
  };

  // Si se entra por el enlace de admin, renderiza directo el panel del dueño
  if (esPanelDueno || pantallaActual === 'AGENDA DEL DUEÑO') {
    return (
      <AgendaDueno 
        cambiarPantalla={() => {
          window.location.href = window.location.origin;
        }} 
        consultarAgenda={consultarAgendaDueno} 
      />
    );
  }

  if (pantallaActual === 'MENU') return <MenuBarberia cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'CORTES Y PRECIOS') return <Cortes cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'RESERVAR TURNO') {
    return <Reserva cambiarPantalla={setPantallaActual} crearReserva={crearReserva} consultarDisponibilidad={consultarDisponibilidad} />;
  }
  if (pantallaActual === 'CONTACTO') return <Contacto cambiarPantalla={setPantallaActual} />;
  if (pantallaActual === 'CANCELAR TURNO') {
    return <CancelarTurno cambiarPantalla={setPantallaActual} buscarReserva={buscarReserva} cancelarReservaPorCodigo={cancelarReservaPorCodigo} />;
  }

  return <div>Error: Pantalla no encontrada</div>;
}