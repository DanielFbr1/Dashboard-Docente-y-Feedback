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
    sessionRole: 'profesor' | 'alumno' | null;
    sessionRoomCode: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
    setSessionRole: (rol: 'profesor' | 'alumno' | null, roomCode?: string) => void;
    refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    perfil: null,
    sessionRole: null,
    sessionRoomCode: null,
    loading: true,
    signOut: async () => { },
    setSessionRole: () => { },
    refreshPerfil: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [sessionRole, setSessionRole] = useState<'profesor' | 'alumno' | null>(() => {
        return localStorage.getItem('session_rol') as any;
    });
    const [sessionRoomCode, setSessionRoomCode] = useState<string | null>(() => {
        return localStorage.getItem('session_room_code');
    });
    const [loading, setLoading] = useState(true);

    const fetchPerfil = (user: User) => {
        try {
            console.log("👤 Analizando metadata para:", user.id);
            const metadata = user.user_metadata;

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

                // Si no hay rol de sesión forzado, usamos el del perfil
                if (!localStorage.getItem('session_rol')) {
                    handleSetSessionRole(metadata.rol, metadata.codigo_sala);
                }

                console.log("✅ Perfil recuperado del metadata:", metadata.rol);
            } else {
                console.warn("⚠️ Usuario sin rol en metadata - Defaulting to teacher");
                const defaultPerfil: Perfil = {
                    id: user.id,
                    nombre: user.email?.split('@')[0] || 'Profesor',
                    rol: 'profesor'
                };
                setPerfil(defaultPerfil);
                if (!localStorage.getItem('session_rol')) {
                    handleSetSessionRole('profesor');
                }
            }
        } catch (err) {
            console.error("❌ Error analizando perfil:", err);
        }
    };

    const handleSetSessionRole = (rol: 'profesor' | 'alumno' | null, roomCode?: string) => {
        setSessionRole(rol);
        if (rol) localStorage.setItem('session_rol', rol);
        else localStorage.removeItem('session_rol');

        if (roomCode) {
            setSessionRoomCode(roomCode);
            localStorage.setItem('session_room_code', roomCode);
        } else if (!rol) {
            setSessionRoomCode(null);
            localStorage.removeItem('session_room_code');
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
                    fetchPerfil(session.user);
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

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchPerfil(session.user);
            } else {
                setPerfil(null);
                handleSetSessionRole(null);
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
            handleSetSessionRole(null);
            console.log("👋 Sesión cerrada correctamente");
        } catch (err) {
            console.error("❌ Error en signOut:", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshPerfil = async () => {
        if (user) fetchPerfil(user);
    };

    return (
        <AuthContext.Provider value={{ session, user, perfil, sessionRole, sessionRoomCode, loading, signOut, setSessionRole: handleSetSessionRole, refreshPerfil }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

