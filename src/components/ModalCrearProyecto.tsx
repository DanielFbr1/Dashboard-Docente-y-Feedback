import { useState } from 'react';
import { X, Tag, Layout, Check, Sparkles } from 'lucide-react';
import { Proyecto, ProyectoEstado } from '../types';

interface ModalCrearProyectoProps {
    onClose: () => void;
    onCrear: (proyecto: Omit<Proyecto, 'id' | 'grupos'>) => void;
}

export function ModalCrearProyecto({ onClose, onCrear }: ModalCrearProyectoProps) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipo, setTipo] = useState('Radio/Podcast');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre.trim()) {
            onCrear({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                tipo,
                estado: 'En preparación' as ProyectoEstado,
                codigo_sala: Math.random().toString(36).substring(2, 8).toUpperCase(),
                fases: [
                    { id: 'f1', nombre: 'Investigación', estado: 'actual' },
                    { id: 'f2', nombre: 'Desarrollo', estado: 'pendiente' },
                    { id: 'f3', nombre: 'Producto Final', estado: 'pendiente' },
                ]
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Layout className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Nuevo Proyecto ABP</h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Proyecto</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: Radio Escolar 2024"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            placeholder="Describe brevemente el objetivo..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Proyecto</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Radio/Podcast">Radio / Podcast</option>
                            <option value="Video/YouTube">Video / YouTube</option>
                            <option value="STEM/Robótica">STEM / Robótica</option>
                            <option value="Investigación">Investigación</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Crear Proyecto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
