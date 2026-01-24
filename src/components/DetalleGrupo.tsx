import { ArrowLeft, CheckCircle2, Circle, Brain, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Grupo } from '../types';
import { RepositorioColaborativo } from './RepositorioColaborativo';
import { ChatIA } from './ChatIA';

interface DetalleGrupoProps {
  grupo: Grupo;
  onBack: () => void;
  onViewFeedback?: () => void;
}

interface Hito {
  nombre: string;
  descripcion: string;
  completado: boolean;
}

interface TipoPregunta {
  tipo: string;
  cantidad: number;
  color: string;
  icon: string | any;
}

export function DetalleGrupo({ grupo, onBack, onViewFeedback }: DetalleGrupoProps) {
  const [vistaActiva, setVistaActiva] = useState<'detalle' | 'compartir' | 'chat'>('detalle');

  const hitos: Hito[] = [
    { nombre: 'Brief', descripcion: 'Definición del proyecto y objetivos', completado: true },
    { nombre: 'Guion', descripcion: 'Elaboración del contenido y estructura', completado: true },
    { nombre: 'Grabación', descripcion: 'Captura de audio y video', completado: grupo.progreso >= 60 },
    { nombre: 'Edición', descripcion: 'Post-producción y ajustes', completado: grupo.progreso >= 85 },
    { nombre: 'Publicación', descripcion: 'Lanzamiento y difusión', completado: grupo.progreso === 100 }
  ];

  const tiposPreguntas: TipoPregunta[] = [
    { tipo: 'Metacognitivas', cantidad: 5, color: 'bg-purple-500', icon: '💡' },
    { tipo: 'Técnica', cantidad: 3, color: 'bg-blue-500', icon: '🛠️' },
    { tipo: 'Organizativas', cantidad: 2, color: 'bg-green-500', icon: '📅' },
    { tipo: 'Creativas', cantidad: 2, color: 'bg-orange-500', icon: '🎨' }
  ];

  const maxCantidad = Math.max(...tiposPreguntas.map(t => t.cantidad));

  const getEstadoColor = (estado: Grupo['estado']) => {
    switch (estado) {
      case 'Completado': return 'bg-green-100 text-green-700 border-green-300';
      case 'Casi terminado': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'En progreso': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Bloqueado': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al dashboard</span>
        </button>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setVistaActiva('detalle')}
            className={`px-4 py-2 font-medium transition-all border-b-2 ${vistaActiva === 'detalle'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Detalles del grupo
          </button>
          <button
            onClick={() => setVistaActiva('compartir')}
            className={`px-4 py-2 font-medium transition-all border-b-2 flex items-center gap-2 ${vistaActiva === 'compartir'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            <Share2 className="w-4 h-4" />
            Trabajo compartido
          </button>
          <button
            onClick={() => setVistaActiva('chat')}
            className={`px-4 py-2 font-medium transition-all border-b-2 flex items-center gap-2 ${vistaActiva === 'chat'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            <Brain className="w-4 h-4" />
            Control IA
          </button>
        </div>
      </header>

      <main className="p-8">
        {vistaActiva === 'detalle' ? (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">{grupo.nombre}</h1>
                    <div className="text-sm text-gray-600 mb-2">
                      Departamento: <span className="font-medium">{grupo.departamento}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(grupo.estado)}`}>
                    {grupo.estado}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-sm text-gray-600">Miembros del grupo:</div>
                  <div className="flex flex-wrap gap-2">
                    {grupo.miembros && grupo.miembros.map((miembro: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {miembro}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progreso del proyecto</span>
                    <span className="font-medium text-gray-900">{grupo.progreso}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${grupo.progreso}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Línea de tiempo del proyecto</h2>
                <div className="flex flex-col gap-4">
                  {hitos.map((hito, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {hito.completado ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium mb-1 ${hito.completado ? 'text-gray-900' : 'text-gray-400'}`}>
                          {hito.nombre}
                        </div>
                        <div className={`text-sm ${hito.completado ? 'text-gray-600' : 'text-gray-400'}`}>
                          {hito.descripcion}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad con la IA</h2>
                <div className="flex flex-col gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total de interacciones</div>
                    <div className="text-3xl font-semibold text-blue-600">{grupo.interacciones_ia}</div>
                    <div className="text-xs text-gray-500 mt-1">preguntas realizadas al mentor IA</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Tipos de preguntas más frecuentes</div>
                    <div className="flex flex-col gap-3">
                      {tiposPreguntas.map((tipoPregunta, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-32 text-sm text-gray-600">{tipoPregunta.tipo}</div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${tipoPregunta.color} transition-all`}
                                style={{ width: `${(tipoPregunta.cantidad / maxCantidad) * 100}%` }}
                              />
                            </div>
                            <div className="w-6 text-sm font-medium text-gray-700">{tipoPregunta.cantidad}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onViewFeedback}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!onViewFeedback}
              >
                Ver feedback y evaluación
              </button>
            </div>
          </>
        ) : vistaActiva === 'compartir' ? (
          <RepositorioColaborativo grupo={grupo} todosLosGrupos={[]} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-8 h-8 text-purple-600" />
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Supervisión del Mentor IA</h2>
                  <p className="text-sm text-slate-400 font-medium">Observando el diálogo socrático del equipo {grupo.nombre}</p>
                </div>
              </div>
              <ChatIA grupo={grupo} readOnly={true} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}