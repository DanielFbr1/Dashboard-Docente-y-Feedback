import { BarChart3, FolderOpen, Users, Settings, LogOut, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar_Docente({ itemActivo, onSelect }: { itemActivo: string; onSelect: (id: string) => void }) {
    const { signOut } = useAuth();

    const items = [
        { id: 'resumen', label: 'Dashboard', icon: BarChart3 },
        { id: 'proyectos', label: 'Proyectos', icon: FolderOpen },
        { id: 'colaboracion', label: 'Sala', icon: Users },
        { id: 'analitica', label: 'Evaluación', icon: ClipboardCheck },
        { id: 'ajustes', label: 'Ajustes', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r p-6 flex flex-col gap-4 z-50">
            <div className="mb-8 px-2">
                <h1 className="font-black text-xl text-slate-900">ABP SMART</h1>
            </div>

            {items.map(i => (
                <button
                    key={i.id}
                    onClick={() => onSelect(i.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${itemActivo === i.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <i.icon size={20} /> {i.label}
                </button>
            ))}

            <button
                onClick={() => signOut()}
                className="mt-auto flex items-center gap-3 p-3 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-all"
            >
                <LogOut size={20} /> Salir
            </button>
        </aside>
    );
}
