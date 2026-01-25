import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { ProyectoFase, HitoGrupo } from '../types';

interface RoadmapViewProps {
    fases: ProyectoFase[];
    hitosGrupo: HitoGrupo[];
    onToggleHito: (faseId: string, hitoTitulo: string, currentEstado: string) => void;
    currentPhaseId?: string;
    readOnly?: boolean;
    layout?: 'horizontal' | 'vertical';
}

export function RoadmapView({ fases = [], hitosGrupo, onToggleHito, currentPhaseId, readOnly = false, layout = 'horizontal' }: RoadmapViewProps) {
    const [activePhase, setActivePhase] = useState<string>(currentPhaseId || (fases.length > 0 ? fases[0].id : ''));

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

    // Helper to find the status of a specific milestone for this group
    const getHitoStatus = (faseId: string, hitoTitulo: string) => {
        const hito = hitosGrupo.find(h => h.fase_id === faseId && h.titulo === hitoTitulo);
        return hito?.estado || 'pendiente';
    };

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
                    {fases.find(f => f.id === activePhase)?.hitos?.map((hitoTitulo, index) => {
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
                    })}

                    {(!fases.find(f => f.id === activePhase)?.hitos || fases.find(f => f.id === activePhase)?.hitos?.length === 0) && (
                        <p className="text-slate-400 italic text-center py-4">No hay hitos definidos para esta fase.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
