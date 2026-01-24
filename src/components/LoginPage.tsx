import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, User, GraduationCap, ArrowRight, Key, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    const { refreshPerfil } = useAuth();
    const [view, setView] = useState<'selection' | 'teacher-auth' | 'student-verify' | 'student-auth'>('selection');
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
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            rol: view === 'teacher-auth' ? 'profesor' : 'alumno',
                            nombre: studentName || email.split('@')[0],
                            codigo_sala: roomCode
                        }
                    }
                });
                if (error) throw error;
                alert('¡Cuenta creada! Revisa tu email para confirmar tu cuenta y entrar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // Forzar refresco de perfil en el context
                await refreshPerfil();
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
            setView('student-auth');
            setIsSignUp(true); // Los alumnos suelen registrarse por primera vez así
        } catch (err) {
            setError('Error al verificar el código.');
        } finally {
            setLoading(false);
        }
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
                            onClick={() => {
                                setView('teacher-auth');
                                setIsSignUp(false);
                            }}
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
                            onClick={() => {
                                setView('student-verify');
                                setIsSignUp(false);
                            }}
                            className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden text-left"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 rounded-bl-full"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <User className="w-9 h-9 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">Soy Alumno/a</h2>
                                <p className="text-gray-700 mb-6 font-medium leading-relaxed">Accede con tu correo para hablar con el Mentor IA y ver tu progreso.</p>
                                <div className="flex items-center justify-end gap-2 text-pink-600 font-bold group-hover:gap-4 transition-all">
                                    <span>Entrar ahora</span>
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
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 relative">
                <button
                    onClick={() => {
                        if (view === 'student-auth' && isSignUp) setView('student-verify');
                        else setView('selection');
                        setError('');
                    }}
                    className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </button>

                <div className="flex justify-center mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-2xl ${view === 'teacher-auth' ? 'from-blue-500 to-purple-600' : 'from-pink-500 to-rose-600'}`}>
                        {view === 'teacher-auth' ? <GraduationCap className="w-12 h-12 text-white" /> : (view === 'student-verify' ? <Key className="w-12 h-12 text-white" /> : <User className="w-12 h-12 text-white" />)}
                    </div>
                </div>

                <h1 className="text-3xl font-black text-gray-900 text-center mb-2 uppercase tracking-tight">
                    {view === 'teacher-auth' ? 'Panel Docente' : 'Acceso Alumno'}
                </h1>
                <p className="text-gray-500 text-center mb-10 font-medium leading-relaxed">
                    {view === 'teacher-auth'
                        ? (isSignUp ? 'Crea tu cuenta profesional' : 'Inicia sesión para gestionar tus clases')
                        : (view === 'student-verify' ? 'Introduce el código de tu sala' : `Únete al proyecto: ${foundProject?.nombre}`)}
                </p>

                {view === 'student-verify' ? (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Código de Sala</label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all text-center text-3xl font-black tracking-[0.2em]"
                                placeholder="XXXXXX"
                                required
                                autoFocus
                            />
                        </div>
                        {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100">{error}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
                        >
                            {loading ? 'Verificando...' : 'Verificar Sala'}
                        </button>
                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setView('student-auth');
                                    setIsSignUp(false);
                                }}
                                className="text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors"
                            >
                                Ya tengo cuenta de alumno
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleAuth} className="space-y-6">
                        {isSignUp && (
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold"
                                    placeholder="Ej: Juan Pérez"
                                    required={isSignUp}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100">{error}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${view === 'teacher-auth' ? 'bg-blue-600' : 'bg-rose-600'} text-white`}
                        >
                            {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Entrar al Panel'}
                        </button>
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors"
                            >
                                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
