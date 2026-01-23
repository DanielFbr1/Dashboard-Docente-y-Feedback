import { Brain, MessageSquare, TrendingUp, PieChart, Lightbulb, Cog, Users as UsersIcon, Sparkles, Plus } from 'lucide-react';
import { useState } from 'react';
import { Grupo } from '../types';
import { ChatIA } from './ChatIA';

interface InteraccionesIAProps {
  grupos: Grupo[];
  onSelectGrupo: (grupo: Grupo) => void;
}

interface TipoInteraccion {
  tipo: string;
  color: string;
  icon: any;
  total: number;
  descripcion: string;
  ejemplo: string;
}

export function InteraccionesIA({ grupos, onSelectGrupo }: InteraccionesIAProps) {
  const [grupoChat, setGrupoChat] = useState<Grupo | null>(null);

  if (grupos.length === 0) {
    return null; // El estado vacío se maneja en el Dashboard
  }

  const totalInteracciones = grupos.reduce((sum, g) => sum + g.interacciones_ia, 0);

  const tiposInteraccion: TipoInteraccion[] = [
    {
      tipo: 'Metacognitivas',
      color: 'bg-purple-100 border-purple-300 text-purple-700',
      icon: Brain,
      total: Math.floor(totalInteracciones * 0.35),
      descripcion: 'Preguntas sobre el proceso de pensamiento y aprendizaje',
      ejemplo: '¿Por qué creéis que esta estrategia funcionará mejor?'
    },
    {
      tipo: 'Técnicas',
      color: 'bg-blue-100 border-blue-300 text-blue-700',
      icon: Cog,
      total: Math.floor(totalInteracciones * 0.25),
      descripcion: 'Consultas sobre herramientas y procedimientos',
      ejemplo: '¿Qué herramientas podríais investigar para esta tarea?'
    },
    {
      tipo: 'Organizativas',
      color: 'bg-green-100 border-green-300 text-green-700',
      icon: UsersIcon,
      total: Math.floor(totalInteracciones * 0.20),
      descripcion: 'Preguntas sobre coordinación y gestión del equipo',
      ejemplo: '¿Cómo podéis distribuir las tareas según las fortalezas?'
    },
    {
      tipo: 'Creativas',
      color: 'bg-orange-100 border-orange-300 text-orange-700',
      icon: Lightbulb,
      total: Math.floor(totalInteracciones * 0.20),
      descripcion: 'Preguntas que estimulan el pensamiento creativo',
      ejemplo: '¿Qué os sorprendería ver en un proyecto como este?'
    }
  ];

  const gruposOrdenados = [...grupos].sort((a, b) => b.interacciones_ia - a.interacciones_ia);
  const maxInteracciones = Math.max(...grupos.map(g => g.interacciones_ia));

  return (
    <>
      {grupoChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Chat con Mentor IA - {grupoChat.nombre}</h3>
              <button
                onClick={() => setGrupoChat(null)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ChatIA grupo={grupoChat} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* Header con estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">Total interacciones</div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{totalInteracciones}</div>
            <div className="text-xs text-gray-500 mt-1">preguntas realizadas</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Promedio por grupo</div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{Math.round(totalInteracciones / grupos.length)}</div>
            <div className="text-xs text-gray-500 mt-1">interacciones por grupo</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm text-gray-600">Más activo</div>
            </div>
            <div className="text-xl font-semibold text-gray-900">{gruposOrdenados[0]?.nombre.split('–')[0]}</div>
            <div className="text-xs text-gray-500 mt-1">{gruposOrdenados[0]?.interacciones_ia} interacciones</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-sm text-gray-600">Esta semana</div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{Math.floor(totalInteracciones * 0.4)}</div>
            <div className="text-xs text-gray-500 mt-1">nuevas preguntas</div>
          </div>
        </div>

        {/* Tipos de interacciones */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Tipos de preguntas (metodología socrática)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiposInteraccion.map((tipo) => {
              const Icon = tipo.icon;
              return (
                <div key={tipo.tipo} className={`border rounded-lg p-5 ${tipo.color}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6" />
                      <div>
                        <div className="font-semibold text-lg">{tipo.tipo}</div>
                        <div className="text-xs mt-1">{tipo.descripcion}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{tipo.total}</div>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded p-3 text-sm italic">
                    <span className="font-medium">Ejemplo:</span> "{tipo.ejemplo}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking de grupos por interacciones */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Actividad por grupo
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {gruposOrdenados.map((grupo, index) => (
              <div
                key={grupo.id}
                className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{grupo.nombre}</div>
                  <div className="text-sm text-gray-500">{grupo.departamento}</div>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${(grupo.interacciones_ia / maxInteracciones) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-right font-semibold text-gray-900">{grupo.interacciones_ia}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGrupoChat(grupo)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Chat con IA
                  </button>
                  <button
                    onClick={() => onSelectGrupo(grupo)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}