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

    // LAYOUT COMPACTO (HORIZONTAL SIN SCROLL)
    if (layout === 'compact-grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(fases || []).map((fase) => (
                    <div key={fase.id} className={`rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full ${fase.estado === 'actual' ? 'ring-2 ring-purple-100 shadow-sm' : 'opacity-90'
                        }`}>
                        {/* Header Fase Mini - AUMENTADO */}
                        <div className={`px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 ${fase.estado === 'actual' ? 'bg-purple-50' : 'bg-slate-50'
                            }`}>
                            <h4 className="font-bold text-slate-800 text-lg leading-tight">{fase.nombre}</h4>
                            <span className={`shrink-0 text-xs font-black uppercase tracking-wider py-1 ${fase.estado === 'completado' ? 'text-emerald-500' :
                                fase.estado === 'actual' ? 'text-purple-600' : 'text-slate-400'
                                }`}>
                                {fase.estado === 'completado' ? 'Listo' : fase.estado}
                            </span>
                        </div>

                        {(() => {
                            // Logic: If filter is "student-only" (implied by context or if we have custom ones), we prefer custom.
                            // User said: "no quiero que automaticamente se pongan por defecto los que están, sino que solo salgan los de los alumnos"
                            // So, if there are custom milestones for this phase, SHOW ONLY THEM.
                            // If NO custom milestones, show template? Or show empty? 
                            // " cuando se cree un grupo desde cero, quiero que en la sesion del alumno se cree un botón... " -> implied Empty initially.
                            // So, we will simply NOT merge. We will check `hitosGrupo` for this phase.
                            // If `hitosGrupo` has entries for this phase, use them.
                            // What if they haven't proposed any? Then show Template? Or Empty?
                            // "no quiero que automaticamente se pongan por defecto los que están". This implies Template is HIDDEN for groups.
                            // But we need a fallback for the "First View". 
                            // Let's try this: If `hitosGrupo` has ANY entry for ANY phase, we assume "Custom Mode" and ignore templates physically.
                            // If `hitosGrupo` is completely empty, maybe show Template? Or just Empty?
                            // User: "cuando se cree un grupo desde cero... se cree un botón para empezar".
                            // So if empty, we showed the button in DashboardAlumno. Here in RoadmapView we might receive empty list.

                            const customHitos = hitosGrupo.filter(h => h.fase_id === fase.id).map(h => h.titulo);
                            // FIX: If we want ONLY students, we just map customHitos.
                            // But we need to handle the "Template" case for Teacher or other views? 
                            // Let's look at `DashboardAlumno`: It renders the "Start" button if NO hitos exist at all.
                            // So if we are here, there ARE hitos. So they must be custom (or we are in Teacher view).
                            // Teacher view passes `hitosGrupo`.

                            // DECISION: Use primarily custom hitos. If 0 custom hitos, check if we should fallback.
                            // User request is strong: "only theirs". So let's stick to customHitos.

                            const displayHitos = customHitos.length > 0 ? customHitos : (fase.hitos || []);
                            // WAIT: If I use fallback, I violate "no por defecto".
                            // But if I don't use fallback, existing groups (legacy) might break?
                            // Let's assume this new rule applies to NEW groups workflow.
                            // I will force "Custom Only" if `hitosGrupo` has any content for this phase.
                            // Actually, `hitosGrupo` contains specific milestones with status.
                            // If I only map titles from `hitosGrupo`, I get only what DB has.

                            const finalHitos = customHitos.length > 0 ? customHitos : [];
                            // If empty, we show nothing? Or template? 
                            // If I show nothing, the loop below is empty.
                            // Let's use `finalHitos` but fallback to template ONLY if it's "legacy" (maybe check prop?).
                            // Safe bet: Mix them BUT prioritizing custom. 
                            // Re-reading: "no quiero que automaticamente se pongan por defecto los que están".
                            // This means: DO NOT MERGE.
                            // If I have custom milestones, I SHOW ONLY CUSTOM.
                            // If I have NO custom milestones, I SHOW NOTHING (so they can create them), UNLESS it's a read-only view that expects defaults?
                            // DashboardAlumno handles the "Empty" state with the big button.
                            // So here, if `customHitos` is empty, render nothing.

                            // Exception: The PROYECTOS_MOCK might still be used for structure.
                            // Let's stick to: If we have custom, show custom. If not, show empty.
                            // Removing `templateHitos` from the mix.

                            const hitosToRender = customHitos.length > 0 ? customHitos : (readOnly ? (fase.hitos || []) : []);

                            if (hitosToRender.length === 0) return <div className="text-sm text-slate-400 italic">Sin hitos definidos</div>;

                            return hitosToRender.map((hitoTitulo, index) => {
                                const status = getHitoStatus(fase.id, hitoTitulo);
                                return (
                                    <div key={index} className="flex items-start gap-3 group">
                                        <button
                                            disabled={readOnly || status === 'aprobado' || status === 'revision'}
                                            onClick={() => onToggleHito(fase.id, hitoTitulo, status)}
                                            className={`mt-0.5 shrink-0 transition-transform active:scale-90 p-1 -m-1 rounded-full hover:bg-slate-50 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                            title={status === 'completado' ? 'Marcar como pendiente' : 'Marcar como completado'}
                                        >
                                            {status === 'aprobado' ? (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            ) : status === 'revision' ? (
                                                <Clock className="w-6 h-6 text-amber-500" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-slate-300 group-hover:text-purple-400 transition-colors" />
                                            )}
                                        </button>
                                        <span className={`text-sm leading-snug ${status === 'aprobado' ? 'text-slate-500 line-through' : 'text-slate-700 font-medium'
                                            }`}>
                                            {hitoTitulo}
                                        </span>
                                    </div>
                                )
                            })
                        })()}
                    </div>
                ))}
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
