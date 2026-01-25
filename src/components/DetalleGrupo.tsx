import { ArrowLeft, CheckCircle2, Circle, Brain, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Grupo, ProyectoFase } from '../types';
import { RepositorioColaborativo } from './RepositorioColaborativo';
import { ChatIA } from './ChatIA';
import { RoadmapView } from './RoadmapView';

interface DetalleGrupoProps {
  grupo: Grupo;
  fases: ProyectoFase[];
  onBack: () => void;
  onViewFeedback?: () => void;
}

interface TipoPregunta {
  tipo: string;
  cantidad: number;
  color: string;
  icon: string | any;
}

export function DetalleGrupo({ grupo, fases, onBack, onViewFeedback }: DetalleGrupoProps) {
  const [vistaActiva, setVistaActiva] = useState<'detalle' | 'compartir' | 'chat'>('detalle');

  // Asegurar que empezamos arriba al entrar al detalle
  useState(() => {
    window.scrollTo(0, 0);
  });

  // Hardcoded stats can remain for now or be derived
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 sticky top-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al dashboard</span>
        </button>

        <div className="flex flex-wrap md:flex-nowrap gap-1 md:gap-4 mt-2">
          <button
            onClick={() => setVistaActiva('detalle')}
            className={`flex-1 md:flex-none px-4 py-3 text-sm font-bold transition-all border-b-2 text-center ${vistaActiva === 'detalle'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 md:bg-transparent'
              : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
          >
            Detalle
          </button>
          <button
            onClick={() => setVistaActiva('compartir')}
            className={`flex-1 md:flex-none px-4 py-3 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 text-center ${vistaActiva === 'compartir'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 md:bg-transparent'
              : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Trabajo compartido</span>
            <span className="sm:hidden">Recursos</span>
          </button>
          <button
            onClick={() => setVistaActiva('chat')}
            className={`flex-1 md:flex-none px-4 py-3 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 text-center ${vistaActiva === 'chat'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 md:bg-transparent'
              : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Control IA</span>
            <span className="sm:hidden">IA</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto overflow-hidden">
        {vistaActiva === 'detalle' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 mb-6 shadow-sm">
              {/* Header Stats & Info */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 flex flex-wrap items-center gap-3">
                      {grupo.nombre}
                      {grupo.pedir_ayuda && (
                        <span className="animate-pulse px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-rose-200">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                          Ayuda urgente
                        </span>
                      )}
                    </h1>
                    <div className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest leading-none">
                      DEPARTAMENTO DE <span className="text-gray-900">{grupo.departamento}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border-2 ${getEstadoColor(grupo.estado)} shadow-sm`}>
                      {grupo.estado}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Compact */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs uppercase tracking-wider font-bold text-slate-400">
                    <span>Progreso</span>
                    <span className="text-slate-800">{grupo.progreso}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${grupo.progreso}%` }} />
                  </div>
                </div>

                {/* Miembros Compact */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {grupo.miembros && grupo.miembros.map((miembro: string, index: number) => (
                    <span key={index} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-full font-medium">
                      {miembro}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TABLERO KANBAN DE TAREAS (Vision Alumno) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  Tablero de Tareas
                </h2>
                <button
                  onClick={onViewFeedback}
                  className="text-sm text-indigo-600 font-bold hover:underline"
                >
                  Ver Feedback Detallado
                </button>
              </div>
              <RoadmapView
                fases={fases}
                hitosGrupo={grupo.hitos || []}
                onToggleHito={() => { }}
                readOnly={true}
                layout="compact-grid"
              />
            </div>

            {/* ACTIVIDAD IA (Debajo, para evitar scroll excesivo si no es necesario) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Analítica de Interacción IA
              </h2>

              {grupo.interacciones_ia > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                    <div className="text-4xl font-black text-blue-600 mb-1">{grupo.interacciones_ia}</div>
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">Interacciones Totales</div>
                    <p className="text-sm text-slate-500 mt-2 max-w-[200px]">Preguntas y respuestas intercambiadas con el Mentor virtual.</p>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Distribución de Consultas (Estimada)</div>
                    <div className="flex flex-col gap-3">
                      {tiposPreguntas.map((tipoPregunta, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-24 text-xs font-bold text-slate-600">{tipoPregunta.tipo}</div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                              <div
                                className={`h-full ${tipoPregunta.color} opacity-80`}
                                // Mock distribution logic based on total interactions for "real feel"
                                style={{ width: `${Math.min(100, (tipoPregunta.cantidad / 10) * 100)}%` }}
                              />
                            </div>
                            <div className="w-6 text-xs font-bold text-slate-500">{tipoPregunta.cantidad}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-slate-900 font-bold mb-1">Sin actividad registrada</h3>
                  <p className="text-slate-500 text-sm">Este grupo aún no ha interactuado con el Mentor IA.</p>
                </div>
              )}
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