import { FileQuestion, Sparkles } from 'lucide-react';

interface EstadoVacioProps {
  titulo: string;
  descripcion: string;
  onCargarEjemplo?: () => void;
  textoBoton?: string;
}

export function EstadoVacio({ titulo, descripcion, onCargarEjemplo, textoBoton = "Ver ejemplo" }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{descripcion}</p>
      {onCargarEjemplo && (
        <button
          onClick={onCargarEjemplo}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {textoBoton}
        </button>
      )}
    </div>
  );
}
