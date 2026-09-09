// src/componentes/Cortes.jsx

export default function Cortes({ cambiarPantalla }) {
  // Lista de servicios de la barbería
  const servicios = [
    { id: 1, nombre: "Corte Tradicional", precio: "$15", desc: "Tijera y máquina con acabado clásico." },
    { id: 2, nombre: "Barba Completa", precio: "$10", desc: "Perfilado, toalla caliente y bálsamo." },
    { id: 3, nombre: "Combo Barbería", precio: "$22", desc: "Corte de cabello + arreglo de barba." }
  ];

  return (
    <main className="game-screen">
      <div className="game-page flex flex-col gap-6">
      <h2 className="game-title">
        Cortes y Servicios
      </h2>

      <div className="flex flex-col gap-4 w-full">
        {servicios.map((servicio) => (
          <div 
            key={servicio.id} 
            className="game-panel p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg text-slate-100">{servicio.nombre}</h3>
              <p className="text-sm text-slate-400">{servicio.desc}</p>
            </div>
            <span className="text-slate-200 font-bold text-xl ml-4">{servicio.precio}</span>
          </div>
          
        ))}
            <button 
        onClick={() => cambiarPantalla("MENU")}
        className="game-back self-start mb-4 text-sm font-semibold flex items-center gap-1"
      >
        ← Volver al Menú
      </button>
      </div>
      </div>
    </main>
  );
}
