import { LogOut, Heart, Activity, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function DashboardFamilia() {
    const { perfil, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-rose-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-rose-100 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-100 p-2 rounded-xl">
                            <Heart className="w-6 h-6 text-rose-600" />
                        </div>
                        <h1 className="text-xl font-black text-rose-900 tracking-tight">Portal Familiar</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{perfil?.nombre}</p>
                            <p className="text-xs text-rose-500 font-bold uppercase tracking-widest">Familia</p>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="p-2 hover:bg-rose-50 rounded-xl text-rose-400 hover:text-rose-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-100 text-center space-y-4">
                    <div className="mx-auto w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                        <Activity className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">¡Hola, familia!</h2>
                    <p className="text-gray-600 font-medium text-lg max-w-lg mx-auto">
                        Estamos preparando un espacio exclusivo para que podáis seguir el progreso de vuestros hijos, ver sus proyectos y comunicaros con el centro.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg font-bold text-sm">
                        <Calendar className="w-4 h-4" />
                        Próximamente disponible
                    </div>
                </div>
            </main>
        </div>
    );
}
