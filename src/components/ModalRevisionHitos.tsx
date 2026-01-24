import { X, CheckCircle2, XCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { Grupo, HitoGrupo } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ModalRevisionHitosProps {
    grupos: Grupo[];
    onClose: () => void;
    onUpdateGrupo: (id: string | number, hitoId: string, nuevoEstado: 'aprobado' | 'rechazado') => void;
}

export function ModalRevisionHitos({ grupos, onClose, onUpdateGrupo }: ModalRevisionHitosProps) {
    // Filtrar solo los hitos que están en revisión
    const revisiones = grupos.flatMap(g =>
        (g.hitos || [])
            .filter(h => h.estado === 'revision')
            .map(h => ({ ...h, grupoId: g.id, grupoNombre: g.nombre }))
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white relative">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight uppercase">Revisiones Pendientes</h2>
                            <p className="text-orange-100 font-bold text-xs uppercase tracking-widest mt-1">Valida el progreso de tus alumnos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {revisiones.length > 0 ? (
                        revisiones.map((rev) => (
                            <div
                                key={`${rev.grupoId}-${rev.id}`}
                                className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-all border-l-4 border-l-amber-500"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {rev.grupoNombre}
                                        </span>
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Fase: {rev.fase_id}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                                        {rev.titulo}
                                    </h3>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onUpdateGrupo(rev.grupoId, rev.id, 'rechazado')}
                                        className="p-4 bg-white text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-50 transition-all shadow-sm group"
                                        title="Rechazar hito"
                                    >
                                        <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => onUpdateGrupo(rev.grupoId, rev.id, 'aprobado')}
                                        className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                                    >
                                        <CheckCircle2 className="w-5 h-5 font-bold" />
                                        <span>Aprobar</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center space-y-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                                <CheckCircle2 className="w-10 h-10 text-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Todo al día</h3>
                                <p className="text-slate-400 font-medium text-sm">No hay hitos esperando revisión en este momento.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        La aprobación aumentará el progreso del grupo automáticamente
                    </p>
                </div>
            </div>
        </div>
    );
}
