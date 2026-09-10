// src/componentes/Contacto.jsx

export default function Contacto({ cambiarPantalla }) {
  const numeroWhatsApp = "5493865232326"; // 💡 Número con código de país
  const mensaje = encodeURIComponent("¡Hola! Quisiera hacer una consulta sobre la barbería.");

  const abrirWhatsApp = () => {
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, "_blank");
  };

  return (
    <main className="game-screen">
      <div className="game-page flex flex-col gap-6">
      <h2 className="game-title">
        Contacto y Ubicación
      </h2>

      <div className="game-panel flex flex-col gap-4 w-full p-6 text-slate-200">
        {/* Horarios */}
        <div>
          <h3 className="text-slate-100 font-semibold mb-1">Horarios de Atención</h3>
          <p className="text-sm text-gray-300">Lunes a Sábado: 9:00 a 23:00 hs</p>
          <p className="text-sm text-gray-300">Domingos: 10:00 a 18:00 hs</p>
        </div>

        <hr className="border-zinc-800" />

        {/* Ubicación */}
        <div>
          <h3 className="text-slate-100 font-semibold mb-1">Dirección</h3>
          <p className="text-sm text-gray-300">Barrio Sofía, Santa Bárbara</p>
          <p className="text-sm text-gray-300">Aguilares, Tucumán, Argentina</p>
        </div>

        <hr className="border-zinc-800" />

        {/* Botón WhatsApp */}
        <button
          onClick={abrirWhatsApp}
          className="game-action w-full font-bold py-3 flex items-center justify-center gap-2 mt-2"
        >
          💬 Enviar WhatsApp
        </button>
      </div>

      {/* Botón Volver */}
      <button 
        onClick={() => cambiarPantalla("MENU")}
        className="game-back text-sm font-semibold flex items-center gap-1 self-start"
      >
        ← Volver al Menú
      </button>
      </div>
    </main>
  );
}
