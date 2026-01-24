import { Key, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface UnirseClaseScreenProps {
    alumnoId: string;
    onJoinSuccess: (projectId: string, codigoSala: string) => void;
    onLogout: () => void;
}

export function UnirseClaseScreen({ alumnoId, onJoinSuccess, onLogout }: UnirseClaseScreenProps) {
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

            toast.success(`¡Bienvenido a ${proyecto.nombre}!`);
            onJoinSuccess(proyecto.id, proyecto.codigo_sala);

        } catch (err: any) {
            console.error('Error joining class:', err);
            setError('Error al unirse. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-10 text-center">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Key className="w-10 h-10 text-pink-500" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Únete a tu clase</h1>
                <p className="text-gray-500 font-medium mb-8">Introduce el código que te ha dado el profesor</p>

                <form onSubmit={handleJoin} className="space-y-4">
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none text-center text-3xl font-black tracking-[0.2em] transition-all"
                        placeholder="XXXXXX"
                        required
                        autoFocus
                    />

                    {error && <div className="text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-xl">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Entrar <ArrowRight className="w-5 h-5" /></>}
                    </button>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-1 mx-auto"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                </form>
            </div>
        </div>
    );
}
