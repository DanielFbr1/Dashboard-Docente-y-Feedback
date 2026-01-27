import { LogOut, User } from 'lucide-react';
import { Perfil } from '../context/AuthContext';

interface DashboardFamiliaProps {
    familia: Perfil;
    onLogout: () => void;
}

export function DashboardFamilia({ familia, onLogout }: DashboardFamiliaProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900">Portal Familiar</h1>
                            <p className="text-xs text-slate-500 font-medium">Bienvenido, {familia.nombre}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-rose-600"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-rose-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Panel en Construcción</h2>
                    <p className="text-slate-600 mb-6">
                        Próximamente podrás ver aquí el progreso y las actividades de tus hijos.
                        Estamos preparando nuevas funcionalidades para conectar a las familias con el aprendizaje ABP.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                        🚧 Funcionalidad en desarrollo
                    </div>
                </div>
            </main>
        </div>
    );
}
