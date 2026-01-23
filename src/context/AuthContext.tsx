import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface GuestUser {
    nombre: string;
    clase: string;
    grupo: string;
    proyectoId: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    guestUser: GuestUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    setGuestUser: (user: GuestUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    guestUser: null,
    loading: true,
    signOut: async () => { },
    setGuestUser: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar guest de localStorage
        const savedGuest = localStorage.getItem('guest_user');
        if (savedGuest) {
            setGuestUser(JSON.parse(savedGuest));
        }

        // 1. Obtener sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 2. Escuchar cambios de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSetGuestUser = (user: GuestUser | null) => {
        setGuestUser(user);
        if (user) {
            localStorage.setItem('guest_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('guest_user');
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        handleSetGuestUser(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, guestUser, loading, signOut, setGuestUser: handleSetGuestUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
