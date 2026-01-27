import { X, Sparkles, MessageSquare, Brain, Mic, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { Grupo } from '../types';

interface ModalConfiguracionIAProps {
    onClose: () => void;
    grupo?: Grupo; // Grupo es opcional para compatibilidad, pero necesario para guardar
}

export function ModalConfiguracionIA({ onClose, grupo }: ModalConfiguracionIAProps) {
    // Estados iniciales basados en el grupo (o defaults)
    const [nivelExigencia, setNivelExigencia] = useState<'Bajo' | 'Medio' | 'Alto'>('Medio');
    const [tono, setTono] = useState<'Divertido' | 'Serio' | 'Socrático'>('Divertido');
    const [frecuenciaEmojis, setFrecuenciaEmojis] = useState(true);

    // NUEVOS ESTADOS para Voz y Micro
    const [vozActivada, setVozActivada] = useState(grupo?.configuracion?.voz_activada ?? true);
    const [microfonoActivado, setMicrofonoActivado] = useState(grupo?.configuracion?.microfono_activado ?? true);
    const [guardando, setGuardando] = useState(false);

    const handleGuardar = async () => {
        setGuardando(true);
        // Toast optimista
        // toast.loading('Guardando ajustes...');

        try {
            if (grupo) {
                // Actualizar DB real
                const newConfig = {
                    ...grupo.configuracion,
                    voz_activada: vozActivada,
                    microfono_activado: microfonoActivado
                    // Aquí podríamos guardar también nivelExigencia, tono, etc. si el esquema lo soporta
                };

                const { error } = await supabase
                    .from('grupos')
                    .update({ configuracion: newConfig })
                    .eq('id', grupo.id);

                if (error) throw error;
                toast.success('Ajustes y permisos actualizados');
            } else {
                toast.success('Ajustes simulados guardados (No hay grupo seleccionado)');
            }
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar configuración');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Ajustes Mentor IA</h2>
                            <p className="text-purple-100 font-medium text-sm">Personaliza cómo interactúa con tus alumnos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6 bg-gray-50 flex-1 overflow-y-auto">
                    {/* Nivel de Exigencia */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-wide mb-4">
                            <Brain className="w-4 h-4 text-purple-600" />
                            Nivel de Exigencia
                        </label>
                        <div className="flex gap-2">
                            {['Bajo', 'Medio', 'Alto'].map((nivel) => (
                                <button
                                    key={nivel}
                                    onClick={() => setNivelExigencia(nivel as any)}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${nivelExigencia === nivel
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {nivel}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tono */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-wide mb-4">
                            <MessageSquare className="w-4 h-4 text-pink-600" />
                            Estilo de Comunicación
                        </label>
                        <select
                            value={tono}
                            onChange={(e) => setTono(e.target.value as any)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:border-purple-500 transition-all"
                        >
                            <option value="Divertido">Divertido y Dinámico 🌟</option>
                            <option value="Serio">Directo y Formal 👨‍🏫</option>
                            <option value="Socrático">Solo hace preguntas 🤔</option>
                        </select>
                    </div>

                    {/* PERMISOS DE VOZ (NUEVO BLOQUE) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-indigo-600" />
                            Capacidades de Audio
                        </h4>

                        {/* Toggle Microfono */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${microfonoActivado ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Mic className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 block">Permitir Micrófono</span>
                                    <span className="text-xs text-gray-500 font-medium">Los alumnos pueden hablar con la IA</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setMicrofonoActivado(!microfonoActivado)}
                                className={`w-14 h-8 rounded-full transition-colors relative ${microfonoActivado ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${microfonoActivado ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Toggle Altavoz */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${vozActivada ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Volume2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 block">Voz de la IA</span>
                                    <span className="text-xs text-gray-500 font-medium">La IA puede leer sus respuestas</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setVozActivada(!vozActivada)}
                                className={`w-14 h-8 rounded-full transition-colors relative ${vozActivada ? 'bg-pink-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${vozActivada ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Toggle Emojis */}
                    <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <span className="font-bold text-gray-900">Uso de Emojis</span>
                        <button
                            onClick={() => setFrecuenciaEmojis(!frecuenciaEmojis)}
                            className={`w-14 h-8 rounded-full transition-colors relative ${frecuenciaEmojis ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${frecuenciaEmojis ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        onClick={handleGuardar}
                        disabled={guardando}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
