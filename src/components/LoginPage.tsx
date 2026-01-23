import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, User, GraduationCap, ArrowRight, Key, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    const { setGuestUser } = useAuth();
    const [view, setView] = useState<'selection' | 'teacher-auth' | 'student-access' | 'student-name'>('selection');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [foundProject, setFoundProject] = useState<any>(null);

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

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase
                .from('proyectos')
                .select('*')
                .eq('codigo_sala', roomCode.trim().toUpperCase())
                .single();

            if (error || !data) {
                setError('Código de sala no válido. Revisa que esté bien escrito.');
                return;
            }

            setFoundProject(data);
            setView('student-name');
        } catch (err) {
            setError('Error al verificar el código.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalStudentAccess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim()) return;

        setGuestUser({
            nombre: studentName.trim(),
            clase: 'General', // Opcional: podrías pedirla también
            grupo: 'Sin asignar',
            proyectoId: foundProject.id
        });
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
                        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg text-center font-sans tracking-tight">Panel ABP + IA</h1>
                        <p className="text-2xl text-white font-medium drop-shadow-md text-center opacity-90">Aprendizaje Basado en Proyectos con Inteligencia Artificial</p>
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
                                <p className="text-gray-700 mb-6 font-medium leading-relaxed">Gestiona tus proyectos ABP, supervisa grupos y configura el Mentor IA.</p>
                                <div className="flex items-center justify-end gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
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
                                <p className="text-gray-700 mb-6 font-medium leading-relaxed">Accede con tu código de sala para hablar con el Mentor IA y ver tu progreso.</p>
                                <div className="flex items-center justify-end gap-2 text-purple-600 font-bold group-hover:gap-4 transition-all">
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
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative">
                <button
                    onClick={() => {
                        if (view === 'student-name') setView('student-access');
                        else setView('selection');
                        setError('');
                    }}
                    className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </button>

                <div className="flex justify-center mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-2xl ${view === 'teacher-auth' ? 'from-blue-500 to-purple-600' : 'from-purple-500 to-pink-600'}`}>
                        {view === 'teacher-auth' ? <GraduationCap className="w-12 h-12 text-white" /> : <Key className="w-12 h-12 text-white" />}
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                    {view === 'teacher-auth' ? 'Panel Docente' : 'Acceso Alumno'}
                </h1>
                <p className="text-gray-500 text-center mb-10 font-medium">
                    {view === 'teacher-auth'
                        ? (isSignUp ? 'Crea tu cuenta profesional' : 'Inicia sesión en tu dashboard')
                        : (view === 'student-name' ? `Proyecto: ${foundProject?.nombre}` : 'Introduce el código de tu sala')}
                </p>

                {view === 'teacher-auth' ? (
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Profesional</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                                placeholder="tu@instituto.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100">{error}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
                        >
                            {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Entrar al Dashboard'}
                        </button>
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-purple-600 hover:text-purple-700 text-sm font-bold"
                            >
                                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                            </button>
                        </div>
                    </form>
                ) : view === 'student-name' ? (
                    <form onSubmit={handleFinalStudentAccess} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Escribe tu nombre completo</label>
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all text-lg font-semibold"
                                placeholder="Ej: Juan Pérez"
                                required
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <Check className="w-6 h-6" />
                            Acceder al Proyecto
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Código de Sala</label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all text-center text-3xl font-black tracking-[0.2em]"
                                placeholder="XXXXXX"
                                required
                                autoFocus
                            />
                        </div>
                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100">{error}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl"
                        >
                            {loading ? 'Verificando...' : 'Verificar Código'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
