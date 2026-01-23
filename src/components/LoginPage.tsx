import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, User, GraduationCap, ArrowRight, Key } from 'lucide-react';

export function LoginPage() {
    const [view, setView] = useState<'selection' | 'teacher-auth' | 'student-access'>('selection');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('¡Cuenta creada! Revisa tu email para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentAccess = (e: React.FormEvent) => {
        e.preventDefault();
        // Por ahora simulamos el acceso de alumno con código
        alert('Acceso de alumno con código: ' + roomCode + '. Esta función se conectará pronto a la base de datos real.');
        // Aquí podríamos forzar un login anónimo o guardar el estado en local
    };

    if (view === 'selection') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
                <div className="max-w-6xl w-full">
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                                <Brain className="w-12 h-12 text-purple-600" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg text-center">Panel ABP + IA</h1>
                        <p className="text-2xl text-white font-medium drop-shadow-md text-center">Aprendizaje Basado en Proyectos con Inteligencia Artificial</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Profesor */}
                        <button
                            onClick={() => setView('teacher-auth')}
                            className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden text-left"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 opacity-10 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-9 h-9 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">Soy Profesor/a</h2>
                                <p className="text-gray-700 mb-6 font-medium">Gestiona tus proyectos ABP, supervisa grupos y configura el Mentor IA.</p>
                                <div className="flex items-center justify-end gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                                    <span>Iniciar sesión</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </button>

                        {/* Alumno */}
                        <button
                            onClick={() => setView('student-access')}
                            className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden text-left"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <User className="w-9 h-9 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">Soy Alumno/a</h2>
                                <p className="text-gray-700 mb-6 font-medium">Accede con tu código de sala para hablar con el Mentor IA y ver tu progreso.</p>
                                <div className="flex items-center justify-end gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all">
                                    <span>Entrar con código</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                    onClick={() => setView('selection')}
                    className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </button>

                <div className="flex justify-center mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-2xl ${view === 'teacher-auth' ? 'from-blue-500 to-purple-600' : 'from-purple-500 to-pink-600'}`}>
                        {view === 'teacher-auth' ? <GraduationCap className="w-12 h-12 text-white" /> : <Key className="w-12 h-12 text-white" />}
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                    {view === 'teacher-auth' ? 'Panel Docente' : 'Acceso Alumno'}
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    {view === 'teacher-auth' ? (isSignUp ? 'Crea tu cuenta profesional' : 'Inicia sesión en tu dashboard') : 'Introduce el código de tu sala'}
                </p>

                {view === 'teacher-auth' ? (
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                        >
                            {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Entrar al Dashboard'}
                        </button>
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleStudentAccess} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código de Sala</label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-center text-2xl font-bold tracking-widest"
                                placeholder="XXX-XXX"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
                        >
                            Entrar a mi clase
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
