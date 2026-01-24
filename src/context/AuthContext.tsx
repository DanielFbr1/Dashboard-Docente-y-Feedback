import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Perfil {
    id: string;
    nombre: string;
    rol: 'profesor' | 'alumno';
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

    const fetchPerfil = async (userId: string) => {
        try {
            console.log("👤 Cargando perfil para:", userId);
            const { data: { user } } = await supabase.auth.getUser();
            const metadata = user?.user_metadata;

            if (metadata?.rol) {
                setPerfil({
                    id: userId,
                    nombre: metadata.nombre || user?.email?.split('@')[0] || 'Usuario',
                    rol: metadata.rol,
                    clase: metadata.clase,
                    codigo_sala: metadata.codigo_sala,
                    proyecto_id: metadata.proyecto_id
                });
                console.log("✅ Perfil cargado:", metadata.rol);
            } else {
                console.warn("⚠️ Usuario sin rol en metadata");
            }
        } catch (err) {
            console.error("❌ Error cargando perfil:", err);
        }
    };

    useEffect(() => {
        let isMounted = true;

        // 1. Obtener sesión inicial
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted) return;
            console.log("🔑 Sesión inicial:", session ? "Presente" : "Nula");

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchPerfil(session.user.id);
            }

            setLoading(false);
        });

        // 2. Escuchar cambios de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            console.log("🔄 Evento Auth:", event, session ? "Hay sesión" : "Sin sesión");

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchPerfil(session.user.id);
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
            setLoading(true); // Mostramos loader mientras sale
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setPerfil(null);
            console.log("👋 Sesión cerrada correctamente");
        } catch (err) {
            console.error("❌ Error en signOut:", err);
        } finally {
            setLoading(false); // IMPORTANTE: Asegurar que se quita el loader
        }
    };

    const refreshPerfil = async () => {
        if (user) await fetchPerfil(user.id);
    };

    return (
        <AuthContext.Provider value={{ session, user, perfil, loading, signOut, refreshPerfil }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

