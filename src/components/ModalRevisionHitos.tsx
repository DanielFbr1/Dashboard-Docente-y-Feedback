import { useState } from 'react';
import { X, CheckCircle2, XCircle, Edit2, AlertCircle, Save } from 'lucide-react';
import { Grupo, HitoGrupo } from '../types';
import { toast } from 'sonner';

interface ModalRevisionHitosProps {
    grupo: Grupo;
    onClose: () => void;
    onResolve: (hitosActualizados: HitoGrupo[]) => void;
}

export function ModalRevisionHitos({ grupo, onClose, onResolve }: ModalRevisionHitosProps) {
    // Filtrar solo hitos propuestos para revisión inicial, o mostrar todos?
    // Mejor mostrar solo los propuestos para no saturar, o una lista con secciones.
    // Vamos a enfocarnos en los propuestos.
    const [hitos, setHitos] = useState<HitoGrupo[]>(
        (grupo.hitos || []).filter(h => h.estado === 'propuesto')
    );

    const [decisiones, setDecisiones] = useState<Record<string, { accion: 'aprobar' | 'rechazar' | 'pendiente', comentario?: string, nuevoTitulo?: string }>>({});

    const handleDecision = (id: string, accion: 'aprobar' | 'rechazar') => {
        setDecisiones(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), accion }
        }));
    };

    const handleComentario = (id: string, comentario: string) => {
        setDecisiones(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), comentario }
        }));
    };

    const handleTitulo = (id: string, nuevoTitulo: string) => {
        setDecisiones(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), nuevoTitulo }
        }));
    }

    const handleSave = () => {
        // Procesar decisiones
        const hitosActualizados = (grupo.hitos || []).map(h => {
            if (h.estado !== 'propuesto') return h;

            const decision = decisiones[h.id];
            if (!decision || decision.accion === 'pendiente') return h;

            if (decision.accion === 'aprobar') {
                return {
                    ...h,
                    estado: 'pendiente', // Pasa a pendiente para ser trabajado
                    titulo: decision.nuevoTitulo || h.titulo,
                    comentario_docente: decision.comentario
                } as HitoGrupo;
            } else {
                // Rechazado
                return {
                    ...h,
                    estado: 'rechazado',
                    comentario_docente: decision.comentario
                } as HitoGrupo;
            }
        });

        onResolve(hitosActualizados);
        toast.success("Revisiones guardadas correctamente");
        onClose();
    };

    if (hitos.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">¡Todo al día!</h3>
                    <p className="text-slate-500 mb-6">No hay propuestas pendientes de revisión en este grupo.</p>
                    <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Cerrar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full p-8 relative flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Revisar Propuestas</h2>
                            <p className="text-slate-500 font-medium">Grupo: {grupo.nombre}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        Revisa los objetivos propuestos por los alumnos. Puedes aprobarlos, o rechazarlos con feedback para que los mejoren.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-4">
                    {hitos.map((hito) => {
                        const decision = decisiones[hito.id] || { accion: 'pendiente' };

                        return (
                            <div key={hito.id} className={`p-5 rounded-2xl border transition-all ${decision.accion === 'aprobar' ? 'bg-emerald-50 border-emerald-200' :
                                    decision.accion === 'rechazar' ? 'bg-rose-50 border-rose-200' :
                                        'bg-white border-slate-200'
                                }`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 mr-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Propuesta</label>
                                        {decision.accion === 'aprobar' ? (
                                            <input
                                                className="w-full bg-emerald-100/50 border-emerald-200 rounded px-2 py-1 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                                value={decision.nuevoTitulo !== undefined ? decision.nuevoTitulo : hito.titulo}
                                                onChange={(e) => handleTitulo(hito.id, e.target.value)}
                                            />
                                        ) : (
                                            <h3 className="text-lg font-bold text-slate-800">{hito.titulo}</h3>
                                        )}
                                        {hito.descripcion && <p className="text-sm text-slate-500 mt-1">{hito.descripcion}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDecision(hito.id, 'aprobar')}
                                            className={`p-2 rounded-lg transition-all ${decision.accion === 'aprobar' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-500'}`}
                                            title="Aprobar"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDecision(hito.id, 'rechazar')}
                                            className={`p-2 rounded-lg transition-all ${decision.accion === 'rechazar' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-500'}`}
                                            title="Rechazar"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Feedback Area */}
                                {(decision.accion === 'rechazar' || decision.accion === 'aprobar') && (
                                    <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            placeholder={decision.accion === 'rechazar' ? "¿Por qué se rechaza? (Feedback)" : "Comentario opcional"}
                                            className={`w-full px-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 ${decision.accion === 'rechazar' ? 'bg-white border-rose-200 focus:ring-rose-500 placeholder:text-rose-300' :
                                                    'bg-white border-emerald-200 focus:ring-emerald-500 placeholder:text-emerald-300'
                                                }`}
                                            value={decision.comentario || ''}
                                            onChange={(e) => handleComentario(hito.id, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Guardar Decisiones
                    </button>
                </div>
            </div>
        </div>
    );
}
