import { Users, Circle, Hand } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Grupo } from '../types';

interface AlumnoEnLinea {
  id: string;
  nombre: string;
  timestamp: Date;
}

interface ListaAlumnosProps {
  proyectoId?: string;
  grupos?: Grupo[]; // New prop to check 'pedir_ayuda' status
}

export function ListaAlumnosEnLinea({ proyectoId, grupos = [] }: ListaAlumnosProps) {
  const [alumnosConectados, setAlumnosConectados] = useState<AlumnoEnLinea[]>([]);

  useEffect(() => {
    // Si no hay proyecto, mostramos vacío o mock
    if (!proyectoId) return;

    const channel = supabase.channel(`room:${proyectoId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const connected: AlumnoEnLinea[] = [];

        // Transformar estado de presencia a nuestro array
        for (const id in newState) {
          const users = newState[id] as any[]; // Array de sesiones por usuario
          users.forEach(user => {
            connected.push({
              id: user.id,
              nombre: user.nombre,
              timestamp: new Date(user.online_at)
            });
          });
        }

        // Eliminar duplicados si el mismo usuario abre varias pestañas
        const uniqueConnected = Array.from(new Map(connected.map(item => [item.id, item])).values());
        setAlumnosConectados(uniqueConnected);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [proyectoId]);

  const isAskingForHelp = (nombreAlumno: string) => {
    // Find group where this student is a member
    const grupo = grupos.find(g => {
      // Normalizamos para comparar (ignorar mayúsculas/espacios si es necesario)
      return g.miembros.some(m => m.toLowerCase().includes(nombreAlumno.toLowerCase()) || nombreAlumno.toLowerCase().includes(m.toLowerCase()));
    });

    if (grupo?.pedir_ayuda) {
      console.log(`MATCH FOUND: ${nombreAlumno} needs help in group ${grupo.nombre}`);
    } else if (grupo) {
      // Found group but no help needed
    } else {
      console.log(`NO MATCH: Could not find group for online user: ${nombreAlumno}`, grupos.map(g => g.miembros));
    }

    return grupo?.pedir_ayuda;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-4 py-2">
        <Users className="w-5 h-5 text-green-600" />
        <div>
          <div className="font-semibold text-gray-900 text-sm">Alumnos en línea</div>
          <div className="text-xs text-gray-600">{alumnosConectados.length} conectados</div>
          <div className="text-[9px] text-gray-300 font-mono select-all" title="ID de Sala">Room: {proyectoId?.slice(0, 8)}...</div>
        </div>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto px-2">
        {alumnosConectados.map((alumno) => (
          <div
            key={alumno.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isAskingForHelp(alumno.nombre) ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm relative">
              {alumno.nombre.charAt(0)}
              {isAskingForHelp(alumno.nombre) && (
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-white animate-bounce">
                  <Hand className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                {alumno.nombre}
                {isAskingForHelp(alumno.nombre) && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
                    Pide Ayuda
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {/* Cálculo simple de tiempo, o "En línea" */}
                En línea
              </div>
            </div>
            <Circle className="w-2 h-2 text-green-500 fill-green-500 animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>

      {alumnosConectados.length === 0 && (
        <div className="text-center py-6 px-4">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Esperando alumnos...</p>
        </div>
      )}
    </div>
  );
}
