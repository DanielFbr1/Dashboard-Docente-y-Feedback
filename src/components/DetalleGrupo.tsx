import { ArrowLeft, CheckCircle2, Circle, Brain, Share2, MessageSquare, Users, Bot, Pencil, ClipboardList, ExternalLink, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Grupo, ProyectoFase } from '../types';
import { RepositorioColaborativo } from './RepositorioColaborativo';
import { MentorChat } from './MentorChat';
import { ChatGrupo } from './ChatGrupo';
import { RoadmapView } from './RoadmapView';
import { ModalConfiguracionIA } from './ModalConfiguracionIA';
import { LivingTree } from './LivingTree';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface DetalleGrupoProps {
  grupo: Grupo;
  fases: ProyectoFase[];
  onBack: () => void;
  onViewFeedback?: () => void;
  onAssignTask?: () => void;
  onEditGroup?: () => void;
  onViewStudent?: (alumno: string) => void;
}

export function DetalleGrupo({ grupo, fases, onBack, onViewFeedback, onAssignTask, onEditGroup, onViewStudent }: DetalleGrupoProps) {
  const [vistaActiva, setVistaActiva] = useState<'detalle' | 'compartir' | 'chat' | 'tareas'>('detalle');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Asegurar que empezamos arriba al entrar al detalle
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
        >
          <div className="p-2 bg-slate-100 rounded-full group-hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Volver</span>
        </button>

        <nav className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 mx-auto">
          {[
            { id: 'detalle', label: 'Detalles', icon: Circle },
            { id: 'tareas', label: 'Tareas', icon: CheckCircle2 },
            { id: 'compartir', label: 'Recursos', icon: Share2 },
            { id: 'chat', label: 'Comunicaciones', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVistaActiva(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${vistaActiva === tab.id
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${vistaActiva === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto overflow-hidden">
        {vistaActiva === 'detalle' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: INFO & ACTIONS */}
            <div className="lg:col-span-2 space-y-6">

              {/* Main Card */}
              <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                <div className="flex flex-col gap-6">

                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 mb-2 flex flex-wrap items-center gap-3">
                        {grupo.nombre}
                        {grupo.pedir_ayuda && (
                          <span className="animate-pulse px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-rose-200">
                            Ayuda urgente
                          </span>
                        )}
                      </h1>
                    </div>
                    <div>
                      <span className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full border-2 ${getEstadoColor(grupo.estado)} shadow-sm`}>
                        {grupo.estado}
                      </span>
                    </div>
                  </div>

                  {/* Actions Buttons Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Botón Configuración IA */}
                    <button
                      onClick={() => setShowConfigModal(true)}
                      className="flex items-center gap-3 p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-95 group shadow-md shadow-indigo-200"
                    >
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <Bot className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm">Configurar Mentor IA</span>
                    </button>

                    {onEditGroup && (
                      <button onClick={onEditGroup} className="flex items-center gap-3 p-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all font-bold text-sm active:scale-95 border border-amber-200 shadow-sm group">
                        <div className="p-2 bg-white/50 rounded-lg text-amber-600 group-hover:bg-white/80 transition-colors">
                          <Pencil className="w-5 h-5" />
                        </div>
                        Editar Grupo
                      </button>
                    )}

                    {onAssignTask && (
                      <button onClick={onAssignTask} className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-all font-bold text-sm active:scale-95 border border-indigo-100 shadow-sm group">
                        <div className="p-2 bg-white rounded-lg text-indigo-500 group-hover:bg-indigo-200 transition-colors">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        Asignar Tarea
                      </button>
                    )}
                  </div>

                  {/* Miembros */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Equipo de Trabajo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {grupo.miembros && grupo.miembros.map((miembro: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => onViewStudent && onViewStudent(miembro)}
                          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all text-left w-full group"
                          title="Ver evaluación del alumno"
                        >
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {miembro.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-700">{miembro}</div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1 group-hover:text-indigo-500">
                              Evaluar
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between text-xs uppercase tracking-wider font-bold text-slate-500">
                      <span>Progreso de Tareas</span>
                      <span className="text-slate-800">{grupo.progreso}%</span>
                    </div>
                    <div className="w-full h-3 bg-white border border-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${grupo.progreso}%` }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: BIG TREE */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-md sticky top-24 flex flex-col items-center justify-center min-h-[500px] h-full">
                <h3 className="absolute top-6 left-6 text-xs font-black text-slate-300 uppercase tracking-widest">Bio-Estado del Grupo</h3>
                <LivingTree
                  progress={grupo.progreso}
                  health={100}
                  size={320}
                  showLabels={true}
                />
                <div className="mt-4 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Crecimiento</div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          // Otros tabs
          vistaActiva === 'tareas' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RoadmapView
                fases={fases}
                hitosGrupo={grupo.hitos || []}
                onToggleHito={() => { }}
                readOnly={true}
                layout="compact-grid"
              />
            </div>
          ) : vistaActiva === 'chat' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)] min-h-[600px] max-w-[1600px] mx-auto">

              {/* Left Column: AI Mentor (PURPLE) */}
              <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col relative">
                <div className="absolute top-0 left-0 w-full z-10 bg-white/95 backdrop-blur-sm pt-5 px-6 pb-2">
                  <div className="flex items-center gap-2 border-b-2 border-indigo-500 pb-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-black text-indigo-900 uppercase tracking-widest">Mentor IA</span>
                  </div>
                </div>
                <div className="pt-20 h-full flex flex-col">
                  <MentorChat
                    grupo={grupo}
                    readOnly={true}
                  />
                </div>
              </div>

              {/* Right Column: Group Chat (GREEN) */}
              <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col relative">
                <div className="absolute top-0 left-0 w-full z-10 bg-white/95 backdrop-blur-sm pt-5 px-6 pb-2">
                  <div className="flex items-center gap-2 border-b-2 border-green-500 pb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-black text-green-900 uppercase tracking-widest">Chat del Equipo</span>
                  </div>
                </div>
                <div className="pt-20 h-full flex flex-col">
                  <ChatGrupo
                    grupoId={String(grupo.id)}
                    miembroActual="Profesor"
                    esProfesor={true}
                  />
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in">
              <RepositorioColaborativo grupo={grupo} todosLosGrupos={[]} />
            </div>
          )
        )}
      </main>

      {/* Modal Configuración IA */}
      {showConfigModal && (
        <ModalConfiguracionIA
          onClose={() => setShowConfigModal(false)}
          grupo={grupo}
        />
      )}
    </div>
  );
}