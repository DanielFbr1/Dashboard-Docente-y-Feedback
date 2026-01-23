import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface EjemploSeccionProps {
  children: React.ReactNode;
}

export function EjemploSeccion({ children }: EjemploSeccionProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between p-5 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">Ejemplo práctico</div>
            <div className="text-sm text-gray-600">Haz clic para ver un caso de uso completo</div>
          </div>
        </div>
        {expandido ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {expandido && (
        <div className="p-6 pt-0 border-t border-amber-200">
          {children}
        </div>
      )}
    </div>
  );
}
