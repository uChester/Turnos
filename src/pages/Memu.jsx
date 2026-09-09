import { useState } from 'react';

export default function MenuBarberia({ cambiarPantalla }) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('RESERVAR TURNO');
  const opciones = ['RESERVAR TURNO', 'CORTES Y PRECIOS', 'CONTACTO', 'CANCELAR TURNO'];

  return (
    <main className="game-screen" aria-label="Menú principal de la barbería">
      <div className="menu-banner" aria-hidden="true">
        <img src="img/ChatGPT Image 22 ago 2026, 08_42_09 p.m..png" alt="" />
      </div>

      <header className="menu-header">
        <h1 className="game-title">Menú Principal</h1>
      </header>

      <nav className="game-menu" aria-label="Opciones principales">
        {opciones.map((opcion) => {
          const estaActiva = opcionSeleccionada === opcion;
          return (
            <button
              key={opcion}
              type="button"
              onMouseEnter={() => setOpcionSeleccionada(opcion)}
              onFocus={() => setOpcionSeleccionada(opcion)}
              onClick={() => cambiarPantalla(opcion)}
              className={`game-menu-item${estaActiva ? ' is-active' : ''}`}
            >
              <span className="game-menu-marker" aria-hidden="true">✦</span>
              <span>{opcion}</span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}
