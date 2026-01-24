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
            const targetRole = (view === 'teacher-auth') ? 'profesor' : 'alumno';

            let sessionData = null;

            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            rol: targetRole,
                            nombre: studentName || email.split('@')[0],
                            codigo_sala: roomCode
                        }
                    }
                });
                if (error) throw error;

                // Si hay sesión, es que no requiere confirmación o se autoconfirmó
                if (data.session) {
                    sessionData = data.session;
                } else {
                    // Si no hay sesión, probablemente requiere verificar email
                    alert('Cuenta creada. Si no entras automáticamente, revisa tu email para confirmar.');
                    return;
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                sessionData = data.session;
            }

            if (sessionData) {
                // Forzar refresco de perfil en el context
                await refreshPerfil();

                // Marcar que es un nuevo registro para mostrar el tutorial
                if (isSignUp) {
                    if (view === 'teacher-auth') {
                        localStorage.setItem('isNewTeacher', 'true');
                    } else {
                        localStorage.setItem('isNewStudent', 'true');
                    }
                }
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'azure') => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setError(error.message);
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
                                setView('student-auth');
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
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative">
                <button
                    onClick={() => {
                        if (view === 'student-auth' && isSignUp) setView('student-verify');
                        else setView('selection');
                        setError('');
                    }}
                    className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </button>

                <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg ${view === 'teacher-auth' ? 'from-blue-500 to-purple-600' : 'from-pink-500 to-rose-600'}`}>
                        {view === 'teacher-auth' ? <GraduationCap className="w-8 h-8 text-white" /> : (view === 'student-verify' ? <Key className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />)}
                    </div>
                </div>

                <h1 className="text-2xl font-black text-gray-900 text-center mb-2 uppercase tracking-tight">
                    {view === 'teacher-auth' ? 'Panel Docente' : 'Acceso Alumno'}
                </h1>
                <p className="text-gray-500 text-center mb-6 font-medium leading-relaxed text-sm">
                    {view === 'teacher-auth'
                        ? (isSignUp ? 'Crea tu cuenta profesional' : 'Inicia sesión para gestionar tus clases')
                        : 'Accede para unirte a tu clase'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('azure')}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-4 h-4" />
                            Microsoft
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px]">O usa tu email</span>
                        </div>
                    </div>

                    {isSignUp && (
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nombre Completo</label>
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                placeholder="Ej: Juan Pérez"
                                required={isSignUp}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold text-sm"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${view === 'teacher-auth' ? 'bg-blue-600' : 'bg-rose-600'} text-white`}
                    >
                        {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Entrar al Panel'}
                    </button>
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors"
                        >
                            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
