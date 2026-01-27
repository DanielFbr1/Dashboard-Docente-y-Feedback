import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, User, GraduationCap, ArrowRight, Key, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    const { refreshPerfil } = useAuth();
    // 'selection' | 'teacher-auth' | 'student-verify' | 'student-auth' | 'family-auth'
    const [view, setView] = useState<string>('selection');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionData, setSessionData] = useState<any>(null);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [foundProject, setFoundProject] = useState<any>(null);

    const handleRoleSelection = (role: 'profesor' | 'alumno' | 'familia', nextView: string) => {
        localStorage.setItem('intended_role', role);
        setView(nextView);
        setIsSignUp(false); // Default to login
        setError('');
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Determine target role based on view or local storage logic
            let targetRole = 'profesor';
            if (view === 'student-auth') targetRole = 'alumno';
            if (view === 'family-auth') targetRole = 'familia';

            // Backup with localStorage if creating new account
            if (isSignUp) {
                localStorage.setItem('intended_role', targetRole);
            }

            let sessionData = null;

            if (isSignUp) {
                // Pre-set flags to avoid race condition with auto-login/redirect
                if (targetRole === 'profesor') localStorage.setItem('isNewTeacher', 'true');
                if (targetRole === 'alumno') localStorage.setItem('isNewStudent', 'true');

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
                    throw error;
                }

                // Si hay sesión, es que no requiere confirmación o se autoconfirmó
                if (data.session) {
                    sessionData = data.session;
                    // Forzar refresco y dar un pequeño margen para que el perfil se detecte
                    await refreshPerfil();
                } else {
                    // Si no hay sesión, probablemente requiere verificar email
                    alert('Cuenta creada. Revisa tu email para confirmar e iniciar sesión.');
                    return;
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                sessionData = data.session;
            }

            if (sessionData) {
                setSessionData(sessionData);
                await refreshPerfil();
            }
        } catch (error: any) {
            console.error(error);
            if (error.message?.toLowerCase().includes("limit") || error.message?.toLowerCase().includes("rate")) {
                setError("🛑 Límite de seguridad alcanzado: Demasiados registros seguidos. Espera unos segundos o pide al profesor que revise la configuración de 'Rate Limits' en Supabase.");
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
            handleRoleSelection('alumno', 'student-auth');
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
                <div className="max-w-7xl w-full animate-in fade-in duration-500">
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                                <Brain className="w-12 h-12 text-purple-600" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-lg text-center font-sans tracking-tight">Panel ABP + IA</h1>
                        <p className="text-2xl text-white font-medium drop-shadow-md text-center opacity-90">Selecciona tu perfil para continuar</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {/* Profesor */}
                        <button
                            onClick={() => handleRoleSelection('profesor', 'teacher-auth')}
                            className="group relative bg-white server-card rounded-[2rem] p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:translate-y-[-5px] overflow-hidden text-left"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 opacity-10 rounded-bl-[100px] transition-all group-hover:scale-110"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Soy Docente</h2>
                                <p className="text-gray-500 mb-8 font-medium leading-relaxed flex-1">
                                    Gestiona proyectos, supervisa grupos y configura el Mentor IA para tu clase.
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-blue-600 font-black uppercase tracking-widest text-xs">Acceso Profesional</span>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-600">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Alumno */}
                        <button
                            onClick={() => handleRoleSelection('alumno', 'student-verify')}
                            className="group relative bg-white server-card rounded-[2rem] p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:translate-y-[-5px] overflow-hidden text-left"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 rounded-bl-[100px] transition-all group-hover:scale-110"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Soy Estudiante</h2>
                                <p className="text-gray-500 mb-8 font-medium leading-relaxed flex-1">
                                    Únete a tu clase, chatea con el Mentor IA y completa tus proyectos.
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-purple-600 font-black uppercase tracking-widest text-xs">Acceso Estudiante</span>
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all text-purple-600">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Familia */}
                        <button
                            onClick={() => handleRoleSelection('familia', 'family-auth')}
                            className="group relative bg-white server-card rounded-[2rem] p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:translate-y-[-5px] overflow-hidden text-left"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-400 opacity-10 rounded-bl-[100px] transition-all group-hover:scale-110"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Soy Familia</h2>
                                <p className="text-gray-500 mb-8 font-medium leading-relaxed flex-1">
                                    Consulta el progreso de tus hijos y mantente informado de las novedades del centro.
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-rose-600 font-black uppercase tracking-widest text-xs">Acceso Familiar</span>
                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all text-rose-600">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Configuración visual según el rol seleccionado
    const roleConfig = {
        'teacher-auth': {
            title: 'Panel Docente',
            icon: <GraduationCap className="w-8 h-8 text-white" />,
            gradient: 'from-blue-500 to-purple-600',
            bg: 'bg-blue-600',
            text: 'Inicia sesión para gestionar tus clases'
        },
        'student-auth': {
            title: 'Acceso Estudiante',
            icon: <User className="w-8 h-8 text-white" />,
            gradient: 'from-purple-500 to-pink-600',
            bg: 'bg-purple-600',
            text: 'Accede para unirte a tu clase'
        },
        'student-verify': {
            title: 'Unirse a Clase',
            icon: <Key className="w-8 h-8 text-white" />,
            gradient: 'from-purple-500 to-pink-600',
            bg: 'bg-purple-600',
            text: 'Introduce el código de sala'
        },
        'family-auth': {
            title: 'Portal Familiar',
            icon: <Heart className="w-8 h-8 text-white" />,
            gradient: 'from-pink-500 to-rose-600',
            bg: 'bg-rose-600',
            text: 'Inicia sesión para ver el progreso'
        }
    };

    const currentConfig = roleConfig[view as keyof typeof roleConfig] || roleConfig['teacher-auth'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
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
                    <div className={`w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg ${currentConfig.gradient}`}>
                        {currentConfig.icon}
                    </div>
                </div>

                <h1 className="text-2xl font-black text-gray-900 text-center mb-2 uppercase tracking-tight">
                    {currentConfig.title}
                </h1>
                <p className="text-gray-500 text-center mb-6 font-medium leading-relaxed text-sm">
                    {isSignUp && view !== 'student-verify' ? 'Crea tu cuenta' : currentConfig.text}
                </p>

                {view === 'student-verify' ? (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Código de la Sala</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all font-black text-lg tracking-widest uppercase"
                                    placeholder="EJ: AB12"
                                    maxLength={6}
                                />
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100">{error}</div>}
                        <button type="submit" disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-lg">
                            {loading ? 'Verificando...' : 'Continuar'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAuth} className="space-y-4">
                        {/* Social Login Buttons - Hide for student verify but show for auth */}
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
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${currentConfig.bg} text-white`}
                        >
                            {loading ? 'Cargando...' : sessionData ? 'Redirigiendo...' : isSignUp ? 'Crear Cuenta' : 'Entrar'}
                        </button>
                        <div className="mt-4 text-center space-y-4">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors block w-full"
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
