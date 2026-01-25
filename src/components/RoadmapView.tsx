import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { ProyectoFase, HitoGrupo } from '../types';

interface RoadmapViewProps {
    fases: ProyectoFase[];
    hitosGrupo: HitoGrupo[];
    onToggleHito: (faseId: string, hitoTitulo: string, currentEstado: string) => void;
    currentPhaseId?: string;
    readOnly?: boolean;
    layout?: 'horizontal' | 'vertical' | 'compact-grid';
}

export function RoadmapView({ fases = [], hitosGrupo, onToggleHito, currentPhaseId, readOnly = false, layout = 'horizontal', onProposeMilestones }: RoadmapViewProps & { onProposeMilestones?: (faseId: string) => void }) {
    const [activePhase, setActivePhase] = useState<string>(currentPhaseId || (fases.length > 0 ? fases[0].id : ''));

    // Helper to find the status of a specific milestone for this group
    const getHitoStatus = (faseId: string, hitoTitulo: string) => {
        const hito = hitosGrupo.find(h => h.fase_id === faseId && h.titulo === hitoTitulo);
        return hito?.estado || 'pendiente';
    };

    // LAYOUT TAREAS (KANBAN: Pendientes, En Curso, Completadas)
    if (layout === 'compact-grid') {
        // Flatten all milestones from all phases (respecting the "custom only" rule)
        const allTasks: { faseId: string, faseNombre: string, titulo: string, status: string }[] = [];

        fases.forEach(fase => {
            const customHitos = hitosGrupo.filter(h => h.fase_id === fase.id);
            // Logic: If custom hitos exist, use them. If not, use template (unless strict student-only mode).
            // Per previous instructions: "solo salgan los de los alumnos".
            // So we iterate `customHitos`.
            if (customHitos.length > 0) {
                customHitos.forEach(h => {
                    allTasks.push({
                        faseId: fase.id,
                        faseNombre: fase.nombre,
                        titulo: h.titulo,
                        status: h.estado || 'pendiente'
                    });
                });
            } else if (!readOnly) {
                // If not readOnly (student view), and no custom hitos, we show nothing (as they need to propose).
                // If readOnly (teacher view inspecting), maybe show nothing too?
            }
        });

        // Group by Status
        // Status keys: 'pendiente', 'propuesto', 'revision', 'aprobado', 'rechazado'
        // Mapping to Columns:
        // PENDIENTES: 'pendiente', 'propuesto' (maybe?)
        // EN CURSO: 'revision' (The user wants "En curso". In our flow, 'revision' is waiting for approval.
        //            To have a real "En curso", we'd need a new status. 
        //            For now, let's treat 'revision' as the "In Progress" column roughly, or explain it.)
        //            Actually, let's put 'pendiente' in "Pendientes".
        //            'revision' in "En Curso" (Validation phase).
        //            'aprobado' in "Completadas".

        const pendientes = allTasks.filter(t => t.status === 'pendiente' || t.status === 'propuesto' || t.status === 'rechazado');
        const enCurso = allTasks.filter(t => t.status === 'revision');
        // Note: 'revision' technically means "Done by student, waiting for teacher".
        // If we want a true "Doing" state, we need to add it. But for this refactor, we map what we have.
        // Pending consideration: A task "En curso" usually isn't "Entregada".
        // Maybe the user wants to filter tasks that are "Unlocked"?
        // Let's stick to the visual request: 3 columns.

        const completadas = allTasks.filter(t => t.status === 'aprobado');

        const Column = ({ title, tasks, colorClass, icon: Icon }: any) => (
            <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${colorClass}`}>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs">{title}</h4>
                    <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-black text-slate-700">{tasks.length}</span>
                </div>
                <div className="p-3 space-y-3 bg-slate-50/50 flex-1 overflow-y-auto max-h-[400px]">
                    {tasks.length === 0 ? (
                        <div className="text-center py-6 text-slate-300 text-xs italic">Vacío</div>
                    ) : (
                        tasks.map((task: any, i: number) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{task.faseNombre}</div>
                                <div className="text-sm font-bold text-slate-700 mb-2 leading-snug">{task.titulo}</div>

                                {task.status === 'pendiente' && (
                                    <button
                                        onClick={() => onToggleHito(task.faseId, task.titulo, task.status)}
                                        className="w-full py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-500 rounded-lg text-xs font-bold border border-slate-100 hover:border-indigo-100 transition-colors"
                                    >
                                        Empezar / Entregar
                                    </button>
                                )}
                                {task.status === 'revision' && (
                                    <div className="text-[10px] flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">
                                        <Clock className="w-3 h-3" />
                                        En Revisión
                                    </div>
                                )}
                                {task.status === 'aprobado' && (
                                    <div className="text-[10px] flex items-center gap-1 text-emerald-500 font-bold bg-emerald-50 px-2 py-1 rounded">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Completado
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );

        if (allTasks.length === 0) return <div className="text-center py-8 text-slate-400 italic">No hay tareas definidas. Usa el asistente IA para crear algunas.</div>;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Column title="Pendientes" tasks={pendientes} colorClass="bg-slate-100" />
                <Column title="En Curso / Revisión" tasks={enCurso} colorClass="bg-amber-50" />
                <Column title="Completadas" tasks={completadas} colorClass="bg-emerald-50" />
            </div>
        )
    }

    // Si layout es vertical, mostramos todo en una lista expandida
    if (layout === 'vertical') {
        return (
            <div className="w-full space-y-6">
                {(fases || []).map((fase) => (
                    <div key={fase.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${fase.estado === 'completado' ? 'text-emerald-500' :
                                    fase.estado === 'actual' ? 'text-purple-600' : 'text-slate-400'
                                    }`}>
                                    {fase.estado}
                                </span>
                                <h4 className="font-bold text-slate-800">{fase.nombre}</h4>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {fase.hitos?.map((hitoTitulo, index) => {
                                const hito = hitosGrupo.find(h => h.fase_id === fase.id && h.titulo === hitoTitulo);
                                const status = hito?.estado || 'pendiente';

                                return (
                                    <div key={index} className={`flex items-center justify-between p-3 rounded-xl border ${status === 'aprobado' ? 'bg-emerald-50 border-emerald-100' :
                                        status === 'revision' ? 'bg-amber-50 border-amber-100' :
                                            'bg-white border-slate-100 hover:border-purple-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <button
                                                disabled={readOnly || status === 'aprobado' || status === 'revision'}
                                                onClick={() => onToggleHito(fase.id, hitoTitulo, status)}
                                                className={`shrink-0 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                {status === 'aprobado' ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                ) : status === 'revision' ? (
                                                    <Clock className="w-5 h-5 text-amber-500" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-slate-300 hover:text-purple-500" />
                                                )}
                                            </button>
                                            <span className={`text-sm font-medium ${status === 'aprobado' ? 'text-slate-700' : 'text-slate-600'}`}>{hitoTitulo}</span>
                                        </div>
                                        {status === 'revision' && (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">Revisión</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        )
    }



    return (
        <div className="w-full">
            {/* Phases Timeline Scrollable */}
            <div className="flex overflow-x-auto pb-6 gap-2 no-scrollbar">
                {(fases || []).map((fase) => (
                    <button
                        key={fase.id}
                        onClick={() => setActivePhase(fase.id)}
                        className={`flex-shrink-0 px-6 py-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 min-w-[160px] ${activePhase === fase.id
                            ? 'bg-white border-purple-600 shadow-xl shadow-purple-100 ring-4 ring-purple-50'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-purple-200'
                            }`}
                    >
                        <span className={`text-[10px] font-black uppercase tracking-widest ${fase.estado === 'completado' ? 'text-emerald-500' :
                            fase.estado === 'actual' ? 'text-purple-600' : 'text-slate-400'
                            }`}>
                            {fase.estado}
                        </span>
                        <span className={`text-md font-bold leading-tight text-left ${activePhase === fase.id ? 'text-slate-800' : 'text-slate-500'
                            }`}>
                            {fase.nombre}
                        </span>
                    </button>
                ))}
            </div>

            {/* Milestones List for Active Phase */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    Hitos de {fases.find(f => f.id === activePhase)?.nombre || 'esta fase'}
                </h3>

                <div className="space-y-3">
                    {/* Dynamic Milestones for Active Phase */}
                    {(() => {
                        const phase = fases.find(f => f.id === activePhase);
                        if (!phase) return null;

                        // Same logic: strict preference for custom milestones
                        const customHitos = hitosGrupo.filter(h => h.fase_id === phase.id).map(h => h.titulo);
                        const hitosToRender = customHitos.length > 0 ? customHitos : (readOnly ? (phase.hitos || []) : []);

                        if (hitosToRender.length === 0) {
                            return <p className="text-slate-400 italic text-center py-4">No hay hitos definidos para esta fase.</p>;
                        }

                        return hitosToRender.map((hitoTitulo, index) => {
                            const status = getHitoStatus(activePhase, hitoTitulo);

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${status === 'aprobado' ? 'bg-emerald-50 border-emerald-100' :
                                        status === 'revision' ? 'bg-amber-50 border-amber-100' :
                                            'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            disabled={readOnly || status === 'aprobado' || status === 'revision'}
                                            onClick={() => onToggleHito(activePhase, hitoTitulo, status)}
                                            className={`shrink-0 transition-transform active:scale-95 ${readOnly ? 'cursor-default' : 'cursor-pointer'
                                                }`}
                                        >
                                            {status === 'aprobado' ? (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            ) : status === 'revision' ? (
                                                <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-slate-300 hover:text-purple-500" />
                                            )}
                                        </button>
                                        <div className="flex flex-col">
                                            <span className={`font-medium ${status === 'aprobado' ? 'text-slate-700' : 'text-slate-600'}`}>
                                                {hitoTitulo}
                                            </span>
                                            {status === 'revision' && (
                                                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Esperando aprobación del profesor</span>
                                            )}
                                            {status === 'aprobado' && (
                                                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Completado y verificado</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-slate-400 border border-slate-100 shadow-sm">
                                        +10 XP
                                    </div>
                                </div>
                            );
                        });
                    })()}

                    {/* Eliminar renderizado anterior duplicado/condicional complejo */}
                    {false && (!fases.find(f => f.id === activePhase)?.hitos || fases.find(f => f.id === activePhase)?.hitos?.length === 0) && (
                        <p className="text-slate-400 italic text-center py-4">No hay hitos definidos para esta fase.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
