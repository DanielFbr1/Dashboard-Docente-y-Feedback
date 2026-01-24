import { useState } from 'react';
import { X, Tag, Layout, Check, Sparkles, School, GraduationCap, PenTool } from 'lucide-react';
import { Proyecto, ProyectoEstado } from '../types';

interface ModalCrearProyectoProps {
    onClose: () => void;
    onCrear: (proyecto: Omit<Proyecto, 'id' | 'grupos'>) => void;
}

export function ModalCrearProyecto({ onClose, onCrear }: ModalCrearProyectoProps) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipo, setTipo] = useState('Radio/Podcast');
    const [clase, setClase] = useState('5.º Primaria - A');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre.trim()) {
            onCrear({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                tipo,
                clase,
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Layout className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Nuevo Proyecto</h2>
                            <p className="text-blue-100 font-bold text-sm uppercase tracking-widest mt-1">Configuración ABP</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-2xl p-2 transition-all relative z-10">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-slate-50/50">
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                <PenTool className="w-3 h-3 text-blue-500" />
                                Identidad del Proyecto
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-xl font-bold transition-all shadow-sm"
                                placeholder="Ej: Radio Escolar 2024"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Breve Descripción
                            </label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none h-28 resize-none font-medium shadow-sm"
                                placeholder="¿Cuál es el objetivo principal?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                    <Tag className="w-3 h-3 text-emerald-500" />
                                    Categoría
                                </label>
                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold shadow-sm cursor-pointer appearance-none"
                                >
                                    <option value="Radio/Podcast">Radio / Podcast</option>
                                    <option value="Video/YouTube">Video / YouTube</option>
                                    <option value="STEM/Robótica">STEM / Robótica</option>
                                    <option value="Investigación">Investigación</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                    <School className="w-3 h-3 text-purple-500" />
                                    Clase / Curso
                                </label>
                                <select
                                    value={clase}
                                    onChange={(e) => setClase(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-black shadow-sm cursor-pointer appearance-none"
                                >
                                    <option value="5.º Primaria - A">5.º Primaria - A</option>
                                    <option value="5.º Primaria - B">5.º Primaria - B</option>
                                    <option value="6.º Primaria - A">6.º Primaria - A</option>
                                    <option value="6.º Primaria - B">6.º Primaria - B</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                        >
                            <Check className="w-6 h-6" />
                            Crear Espacio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

