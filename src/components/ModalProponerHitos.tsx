import { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Loader2, Send } from 'lucide-react';
import { HitoGrupo, ProyectoFase } from '../types';

interface ModalProponerHitosProps {
    fase: ProyectoFase;
    onClose: () => void;
    onSubmit: (hitos: Partial<HitoGrupo>[]) => void;
}

export function ModalProponerHitos({ fase, onClose, onSubmit }: ModalProponerHitosProps) {
    const [hitos, setHitos] = useState<{ titulo: string; descripcion: string }[]>([
        { titulo: '', descripcion: '' }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock AI Generation - En una app real conectaría con OpenAI/Gemini
    const generateIdeas = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const sugerencias = [
                { titulo: 'Investigación preliminar', descripcion: 'Buscar referentes y estado del arte' },
                { titulo: 'Boceto inicial', descripcion: 'Primeros trazados de la idea' },
                { titulo: 'Validación de materiales', descripcion: 'Confirmar lista de recursos necesarios' }
            ];
            setHitos([...hitos.filter(h => h.titulo.trim() !== ''), ...sugerencias]);
            setIsGenerating(false);
        }, 1500);
    };

    const handleAddHito = () => {
        setHitos([...hitos, { titulo: '', descripcion: '' }]);
    };

    const handleRemoveHito = (index: number) => {
        const newHitos = [...hitos];
        newHitos.splice(index, 1);
        setHitos(newHitos);
    };

    const handleChange = (index: number, field: 'titulo' | 'descripcion', value: string) => {
        const newHitos = [...hitos];
        newHitos[index][field] = value;
        setHitos(newHitos);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hitosValidos = hitos.filter(h => h.titulo.trim() !== '').map(h => ({
            ...h,
            fase_id: fase.id,
            estado: 'propuesto' as const
        }));
        onSubmit(hitosValidos);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full p-8 relative flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Definir Hitos Cooperativos</h2>
                            <p className="text-slate-500 font-medium">Fase: {fase.nombre}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        Define los objetivos de esta fase. El Mentor IA puede sugerirte ideas, pero tú decides.
                        El profesor deberá aprobar tu propuesta antes de empezar.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-4">
                    {hitos.map((hito, index) => (
                        <div key={index} className="flex gap-3 items-start animate-in slide-in-from-bottom-2 duration-300">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 mt-2">
                                {index + 1}
                            </div>
                            <div className="flex-1 space-y-2">
                                <input
                                    value={hito.titulo}
                                    onChange={(e) => handleChange(index, 'titulo', e.target.value)}
                                    placeholder="Título del hito (ej. Crear guion técnico)"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-400"
                                />
                                <input
                                    value={hito.descripcion}
                                    onChange={(e) => handleChange(index, 'descripcion', e.target.value)}
                                    placeholder="Pequeña descripción..."
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm text-slate-600"
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveHito(index)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg mt-2 transition-all"
                                disabled={hitos.length === 1}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={handleAddHito}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Añadir otro hito
                    </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-4">
                    <button
                        type="button"
                        onClick={generateIdeas}
                        disabled={isGenerating}
                        className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all flex items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Sugerir con IA
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Enviar Propuesta
                    </button>
                </div>
            </div>
        </div>
    );
}
