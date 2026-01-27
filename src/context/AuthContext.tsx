import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Perfil {
    id: string;
    nombre: string;
    rol: 'profesor' | 'alumno' | 'familia';
    clase?: string;
    grupo_id?: number;
    proyecto_id?: string;
    codigo_sala?: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    perfil: Perfil | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    perfil: null,
    loading: true,
    signOut: async () => { },
    refreshPerfil: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPerfil = async (user: User) => {
        try {
            console.log("👤 Analizando metadata para:", user.id);
            let metadata = user.user_metadata;

            // CHECK ROLE SWITCH INTENT
            const intendedRole = localStorage.getItem('intended_role');
            if (intendedRole && (intendedRole === 'profesor' || intendedRole === 'alumno' || intendedRole === 'familia')) {
                if (metadata.rol !== intendedRole) {
                    console.log(`🔄 Cambio de rol detectado: ${metadata.rol} -> ${intendedRole}`);
                    // Actualizar en Supabase
                    const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
                        data: { rol: intendedRole }
                    });

                    if (error) {
                        console.error("Error actualizando rol:", error);
                    } else if (updatedUser) {
                        metadata = updatedUser.user_metadata;
                        // update local user object too
                        setUser(updatedUser);
                    }
                }
                // Limpiar intent para futuras sesiones (o mantenerlo? Mejor limpiar)
                localStorage.removeItem('intended_role');
            }

            if (metadata?.rol) {
                const fetchedPerfil: Perfil = {
                    id: user.id,
                    nombre: metadata.nombre || user.email?.split('@')[0] || 'Usuario',
                    rol: metadata.rol,
                    clase: metadata.clase,
                    codigo_sala: metadata.codigo_sala,
                    proyecto_id: metadata.proyecto_id
                };
                setPerfil(fetchedPerfil);

                console.log("✅ Perfil cargado:", metadata.rol);
            } else {
                console.warn("⚠️ Usuario sin rol en metadata - Defaulting to teacher");
                setPerfil({
                    id: user.id,
                    nombre: user.email?.split('@')[0] || 'Profesor',
                    rol: 'profesor'
                });
            }
        } catch (err) {
            console.error("❌ Error analizando perfil:", err);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!isMounted) return;

                console.log("🔑 Sesión inicial:", session ? "Presente" : "Nula");
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchPerfil(session.user);
                }
            } catch (err) {
                console.error("❌ Error en initializeAuth:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            console.log("🔄 Evento Auth:", event, session ? "Hay sesión" : "Sin sesión");

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setPerfil(null);
                setLoading(false);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Si es un SIGNED_IN, verificamos el perfil (y el posible cambio de rol)
                await fetchPerfil(session.user);
            } else {
                setPerfil(null);
            }

            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            console.log("🔌 Iniciando cierre de sesión...");
            setLoading(true);
            await supabase.auth.signOut();
            setPerfil(null);
            console.log("👋 Sesión cerrada correctamente");
        } catch (err) {
            console.error("❌ Error en signOut:", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshPerfil = async () => {
        try {
            const { data: { user: latestUser } } = await supabase.auth.getUser();
            if (latestUser) {
                setUser(latestUser);
                await fetchPerfil(latestUser);
            }
        } catch (err) {
            console.error("❌ Error refrescando perfil:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, perfil, loading, signOut, refreshPerfil }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

