import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, User, GraduationCap, ArrowRight, Key, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    const { refreshPerfil } = useAuth();
    const [view, setView] = useState<'selection' | 'teacher-auth' | 'student-verify' | 'family-auth' | 'student-auth'>('selection');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionData, setSessionData] = useState<any>(null);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [foundProject, setFoundProject] = useState<any>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let targetRole = 'alumno';
            if (view === 'teacher-auth') targetRole = 'profesor';
            if (view === 'family-auth') targetRole = 'familia';

            let sessionData = null;

            if (isSignUp) {
                // Pre-set flags to avoid race condition with auto-login/redirect
                if (view === 'teacher-auth') localStorage.setItem('isNewTeacher', 'true');
                else if (view === 'family-auth') localStorage.setItem('isNewFamily', 'true');
                else localStorage.setItem('isNewStudent', 'true');

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

                if (error) {
                    localStorage.removeItem('isNewTeacher');
                    localStorage.removeItem('isNewStudent');
                    localStorage.removeItem('isNewFamily');
                    throw error;
                }

                if (data.session) {
                    sessionData = data.session;
                    await refreshPerfil();
                } else {
                    alert('Cuenta creada. Revisa tu email para confirmar e iniciar sesión.');
                    return;
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                sessionData = data.session;
            }

            if (sessionData) {
                // Check Role Mismatch
                const currentRole = sessionData.user?.user_metadata?.rol;

                if (currentRole && currentRole !== targetRole) {
                    const roleNames: Record<string, string> = { 'profesor': 'Profesor', 'alumno': 'Alumno', 'familia': 'Familia' };
                    const msg = `⚠️ Esta cuenta es de ${roleNames[currentRole] || currentRole}. Redirigiendo a tu panel correspondiente...`;
                    // toast.warning(msg) if available, else alert or silent redirect
                    console.warn(msg);
                }

                setSessionData(sessionData);
                await refreshPerfil();
            }
        } catch (error: any) {
            console.error(error);
            if (error.message?.toLowerCase().includes("limit") || error.message?.toLowerCase().includes("rate")) {
                setError("🛑 Límite de seguridad alcanzado: Demasiados intentos. Espera unos segundos.");
            } else {
                setError(error.message || 'Error desconocido al iniciar sesión.');
            }
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
            setError("Error iniciando sesión social: " + error.message);
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
            setIsSignUp(true);
        } catch (err) {
            setError('Error al verificar el código.');
        } finally {
            setLoading(false);
        }
    };

    if (view === 'selection') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-b-[4rem] z-0"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl z-0"></div>
                <div className="absolute top-20 left-20 w-24 h-24 bg-white/5 rounded-full blur-xl z-0"></div>

                <div className="relative z-10 w-full max-w-5xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-3xl mb-6 border border-white/20 shadow-xl">
                            <Brain className="w-16 h-16 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-md">Panel ABP + IA</h1>
                        <p className="text-xl md:text-2xl text-indigo-100 font-medium max-w-2xl mx-auto leading-relaxed">
                            Plataforma integral para el aprendizaje basado en proyectos
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CARD 1: PROFESOR */}
                        <button
                            onClick={() => { setView('teacher-auth'); setIsSignUp(false); }}
                            className="bg-white rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left border border-slate-100 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] transition-transform group-hover:scale-110"></div>
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors relative z-10">
                                <GraduationCap className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 relative z-10">Soy Profesor</h2>
                            <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed relative z-10">
                                Gestiona tus clases, supervisa proyectos y configura el Mentor IA.
                            </p>
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm relative z-10 group-hover:translate-x-2 transition-transform">
                                <span>Acceder</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* CARD 2: FAMILIA */}
                        <button
                            onClick={() => { setView('family-auth'); setIsSignUp(false); }}
                            className="bg-white rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left border border-slate-100 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[4rem] transition-transform group-hover:scale-110"></div>
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-600 transition-colors relative z-10">
                                <Users className="w-8 h-8 text-rose-600 group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 relative z-10">Soy Familia</h2>
                            <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed relative z-10">
                                Sigue el progreso de tus hijos y conecta con su aprendizaje.
                            </p>
                            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm relative z-10 group-hover:translate-x-2 transition-transform">
                                <span>Acceder</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* CARD 3: ESTUDIANTE */}
                        <button
                            onClick={() => { setView('student-auth'); setIsSignUp(false); }}
                            className="bg-white rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left border border-slate-100 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[4rem] transition-transform group-hover:scale-110"></div>
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors relative z-10">
                                <User className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 relative z-10">Soy Alumno</h2>
                            <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed relative z-10">
                                Únete a tu equipo, realiza tareas y consulta al Mentor IA.
                            </p>
                            <div className="flex items-center gap-2 text-purple-600 font-bold text-sm relative z-10 group-hover:translate-x-2 transition-transform">
                                <span>Acceder</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-indigo-200 text-sm font-medium">© 2024 Dashboard Docente y Feedback. v3.7.0</p>
                    </div>
                </div>
            </div>
        );
    }

    // LOGIN FORM WRAPPER
    const getRoleConfig = () => {
        switch (view) {
            case 'teacher-auth': return { title: 'Panel Docente', color: 'blue', icon: GraduationCap };
            case 'family-auth': return { title: 'Portal Familiar', color: 'rose', icon: Users };
            default: return { title: 'Acceso Alumno', color: 'purple', icon: User };
        }
    };
    const config = getRoleConfig();
    const Icon = config.icon;

    if (view === 'student-verify') {
        // ... (Keep existing verify logic if needed, or implement simplified flow)
        // For simplicity, reusing the form structure below, but student-verify usually needs code input first.
        // Let's implement the code verification screen here if view is 'student-verify'
        return (
            <div className={`min-h-screen bg-gradient-to-br from-${config.color}-500 to-${config.color}-700 flex items-center justify-center p-4`}>
                <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative">
                    {/* Back Button */}
                    <button onClick={() => setView('student-auth')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600"><ArrowRight className="w-6 h-6 rotate-180" /></button>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-800">Código de Clase</h2>
                        <p className="text-slate-500 text-sm">Introduce el código que te dio tu profesor</p>
                    </div>
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="w-full text-center text-3xl font-black tracking-widest py-4 bg-slate-50 border-2 border-slate-200 rounded-xl uppercase placeholder-slate-300 focus:border-purple-500 outline-none transition-all"
                            placeholder="CODE"
                            maxLength={6}
                        />
                        {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest">
                            {loading ? 'Verificando...' : 'Continuar'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-slate-100 flex items-center justify-center p-4 relative`}>
            {/* Dynamic Background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${config.color}-600 to-${config.color}-800`}></div>

            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative z-10 animate-in zoom-in-95 duration-300">
                <button
                    onClick={() => {
                        if (view === 'student-auth' && isSignUp) setView('selection'); // Back to main
                        else setView('selection');
                        setError('');
                    }}
                    className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </button>

                <div className="flex justify-center mb-6">
                    <div className={`w-20 h-20 bg-${config.color}-50 rounded-3xl flex items-center justify-center shadow-inner`}>
                        <Icon className={`w-10 h-10 text-${config.color}-600`} />
                    </div>
                </div>

                <h1 className="text-2xl font-black text-gray-900 text-center mb-2 uppercase tracking-tight">
                    {config.title}
                </h1>
                <p className="text-gray-500 text-center mb-8 font-medium text-sm px-4">
                    {isSignUp ? 'Crea tu cuenta para comenzar' : 'Introduce tus credenciales para acceder'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-600 text-xs"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('azure')}
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-600 text-xs"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-4 h-4" />
                            Microsoft
                        </button>
                    </div>

                    <div className="relative mb-6">
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
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold text-sm text-slate-800"
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
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold text-sm text-slate-800"
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
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-bold text-sm text-slate-800"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100 flex gap-2 items-start"><span>⚠️</span>{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] bg-${config.color}-600 text-white`}
                    >
                        {loading ? 'Cargando...' : sessionData ? 'Accediendo...' : isSignUp ? 'Crear Cuenta' : 'Entrar'}
                    </button>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                if (view === 'student-auth' && !isSignUp) {
                                    // Special case for students: New students might need to verify code first?
                                    // Actually, if they click "Register", we might want to ask for code.
                                    setView('student-verify');
                                    setRoomCode('');
                                } else {
                                    setIsSignUp(!isSignUp);
                                }
                            }}
                            className="text-slate-400 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest transition-colors"
                        >
                            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : (view === 'student-auth' ? '¿Eres nuevo? Únete con Código' : '¿No tienes cuenta? Regístrate')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
