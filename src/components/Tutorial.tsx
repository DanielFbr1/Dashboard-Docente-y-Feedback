import { Info, X } from 'lucide-react';
import { useState } from 'react';

interface TutorialProps {
  titulo: string;
  pasos: string[];
  consejos?: string[];
}

export function Tutorial({ titulo, pasos, consejos }: TutorialProps) {
  const [mostrar, setMostrar] = useState(true);

  if (!mostrar) {
    return (
      <button
        onClick={() => setMostrar(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
      >
        <Info className="w-4 h-4" />
        Mostrar guía
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
        </div>
        <button
          onClick={() => setMostrar(false)}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <div className="font-medium text-gray-900 mb-3">Pasos a seguir:</div>
        <ol className="space-y-2">
          {pasos.map((paso, index) => (
            <li key={index} className="flex gap-3 text-gray-700">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-semibold">
                {index + 1}
              </span>
              <span className="flex-1 pt-0.5">{paso}</span>
            </li>
          ))}
        </ol>
      </div>

      {consejos && consejos.length > 0 && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4">
          <div className="font-medium text-gray-900 mb-2 text-sm">💡 Consejos:</div>
          <ul className="space-y-1">
            {consejos.map((consejo, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>{consejo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
