import { Users, Circle } from 'lucide-react';
import { useState } from 'react';

interface AlumnoEnLinea {
  id: string;
  nombre: string;
  timestamp: Date;
}

export function ListaAlumnosEnLinea() {
  const [alumnosConectados] = useState<AlumnoEnLinea[]>([
    { id: '1', nombre: 'Ana García', timestamp: new Date() },
    { id: '2', nombre: 'Carlos López', timestamp: new Date() },
    { id: '3', nombre: 'María Fernández', timestamp: new Date() },
  ]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-4 py-2">
        <Users className="w-5 h-5 text-green-600" />
        <div>
          <div className="font-semibold text-gray-900 text-sm">Alumnos en línea</div>
          <div className="text-xs text-gray-600">{alumnosConectados.length} conectados</div>
        </div>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto px-2">
        {alumnosConectados.map((alumno) => (
          <div
            key={alumno.id}
            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {alumno.nombre.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{alumno.nombre}</div>
              <div className="text-xs text-gray-500">Hace {Math.floor((new Date().getTime() - alumno.timestamp.getTime()) / 60000)} min</div>
            </div>
            <Circle className="w-2 h-2 text-green-500 fill-green-500 animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>

      {alumnosConectados.length === 0 && (
        <div className="text-center py-6 px-4">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No hay alumnos conectados</p>
        </div>
      )}
    </div>
  );
}
