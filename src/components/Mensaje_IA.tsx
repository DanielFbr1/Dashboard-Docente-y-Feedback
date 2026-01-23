interface MensajeIAProps {
  mensaje: string;
  tipo: 'Metacognitiva' | 'Técnica' | 'Organizativa' | 'Creativa';
}

export function Mensaje_IA({ mensaje, tipo }: MensajeIAProps) {
  const getTipoColor = (tipo: MensajeIAProps['tipo']) => {
    switch (tipo) {
      case 'Metacognitiva':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Técnica':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Organizativa':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Creativa':
        return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 mb-4">
      <div className="text-xs font-medium text-gray-600">IA mentor</div>
      <div className="max-w-[80%] p-3 bg-gray-100 text-gray-900 rounded-lg rounded-tl-none border border-gray-200">
        {mensaje}
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTipoColor(tipo)}`}>
        {tipo}
      </span>
    </div>
  );
}
