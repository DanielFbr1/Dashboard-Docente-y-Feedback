import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ProyectoFase, HitoGrupo } from '../types';
import { toast } from 'sonner';

interface ModalProponerHitosProps {
    fase: ProyectoFase;
    onClose: () => void;
    onSubmit: (hitos: any[]) => void;
}

export function ModalProponerHitos({ fase, onClose, onSubmit }: ModalProponerHitosProps) {
    const [nuevosHitos, setNuevosHitos] = useState<{ titulo: string; descripcion: string }[]>([
        { titulo: '', descripcion: '' }
    ]);

    const handleAddRow = () => {
        setNuevosHitos([...nuevosHitos, { titulo: '', descripcion: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        setNuevosHitos(nuevosHitos.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: 'titulo' | 'descripcion', value: string) => {
        const updated = [...nuevosHitos];
        updated[index][field] = value;
        setNuevosHitos(updated);
    };

    const handleSubmit = () => {
        // Validar
        const validos = nuevosHitos.filter(h => h.titulo.trim() !== '');
        if (validos.length === 0) {
            toast.error("Añade al menos un hito con título");
            return;
        }

        const hitosParaEnviar = validos.map(h => ({
            id: crypto.randomUUID(),
            fase_id: fase.id,
            titulo: h.titulo,
            descripcion: h.descripcion,
            estado: 'propuesto',
            comentario_docente: ''
        }));

        onSubmit(hitosParaEnviar);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">Proponer Hitos</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Fase: {fase.nombre}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-4">
                        Define las tareas o hitos que tu grupo quiere lograr en esta fase. El profesor deberá aprobarlos antes de empezar.
                    </p>

                    <div className="space-y-4">
                        {nuevosHitos.map((hito, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Título de la tarea (ej: Buscar fuentes)"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                        value={hito.titulo}
                                        onChange={(e) => handleChange(idx, 'titulo', e.target.value)}
                                    />
                                    <textarea
                                        placeholder="Descripción (opcional)"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                        rows={2}
                                        value={hito.descripcion}
                                        onChange={(e) => handleChange(idx, 'descripcion', e.target.value)}
                                    />
                                </div>
                                {nuevosHitos.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveRow(idx)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddRow}
                        className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Añadir otro hito
                    </button>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm"
                    >
                        Enviar Propuesta
                    </button>
                </div>
            </div>
        </div>
    );
}
