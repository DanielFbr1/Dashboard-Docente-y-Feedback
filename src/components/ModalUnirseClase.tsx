import { X, Key, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ModalUnirseClaseProps {
    onClose: () => void;
    onJoinSuccess: () => void;
}

export function ModalUnirseClase({ onClose, onJoinSuccess }: ModalUnirseClaseProps) {
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Verificar el código
            const { data: proyecto, error: projError } = await supabase
                .from('proyectos')
                .select('*')
                .eq('codigo_sala', roomCode.trim().toUpperCase())
                .single();

            if (projError || !proyecto) {
                setError('Código inválido. Verifica que esté bien escrito.');
                return;
            }

            // 2. Actualizar el perfil del alumno
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    codigo_sala: proyecto.codigo_sala,
                    proyecto_id: proyecto.id
                }
            });

            if (updateError) throw updateError;

            // 3. CRITICAL: Sincronizar tabla pública 'profiles' para que el profesor lo vea
            await supabase.from('profiles').update({
                codigo_sala: proyecto.codigo_sala,
                proyecto_id: proyecto.id
            }).eq('id', (await supabase.auth.getUser()).data.user?.id);

            // Guardar en historial local
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const historyKey = `student_classes_history_${user.id}`;
                const historyStr = localStorage.getItem(historyKey);
                let history = historyStr ? JSON.parse(historyStr) : [];

                // Evitar duplicados
                if (!history.some((h: any) => h.id === proyecto.id)) {
                    history.push({
                        id: proyecto.id,
                        nombre: proyecto.nombre,
                        codigo: proyecto.codigo_sala,
                        lastAccessed: Date.now()
                    });
                    localStorage.setItem(historyKey, JSON.stringify(history));
                }
            }

            toast.success(`¡Te has unido a ${proyecto.nombre}!`);
            onJoinSuccess();
            onClose();

        } catch (err: any) {
            console.error('Error joining class:', err);
            setError('Error al unirse. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                        <Key className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Unirse a otra clase</h2>
                    <p className="text-gray-500 text-sm mb-6">Introduce un nuevo código para cambiar de proyecto</p>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none text-center text-2xl font-black tracking-[0.2em] transition-all"
                            placeholder="XXXXXX"
                            required
                            autoFocus
                        />

                        {error && <div className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-xl">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Unirse al Grupo'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
