// ¿Cómo cambiarías esta línea para agregar 'alHacerClic'?
// src/components/BotonMenu.jsx

export default function BotonMenu({ texto, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="bg-zinc-900 hover:bg-amber-600 text-gray-100 font-medium py-3 px-6 rounded-lg border border-amber-600/30 transition-all duration-200 uppercase tracking-wider"
    >
      {texto}
    </button>
  );
}