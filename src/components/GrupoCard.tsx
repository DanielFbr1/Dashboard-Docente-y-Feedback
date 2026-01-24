import { Users, TrendingUp, AlertCircle, CheckCircle2, MoreVertical, MessageSquare, ExternalLink } from 'lucide-react';
import { Grupo } from '../types';
import { cn } from '../lib/utils';

interface Props {
    grupo: Grupo;
    onVerAlumno: (nombre: string) => void;
    onCambiarEstado: (nuevoEstado: Grupo['estado']) => void;
}

export function GrupoCard({ grupo, onVerAlumno, onCambiarEstado }: Props) {
    const getEstadoColor = (estado: Grupo['estado']) => {
        switch (estado) {
            case 'Bloqueado': return 'bg-rose-50 border-rose-100 text-rose-600';
            case 'En progreso': return 'bg-indigo-50 border-indigo-100 text-indigo-600';
            case 'Completado': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
            default: return 'bg-slate-50 border-slate-100 text-slate-600';
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
            <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{grupo.nombre}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{grupo.departamento}</p>
                    </div>
                    <div className={cn("px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest", getEstadoColor(grupo.estado))}>
                        {grupo.estado}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Progreso</p>
                        <p className="text-lg font-black text-indigo-600">{grupo.progreso}%</p>
                    </div>
                    <div className="h-4 w-full bg-slate-50 rounded-full border border-slate-100 p-1">
                        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${grupo.progreso}%` }} />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {grupo.miembros.map((miembro) => (
                        <span key={miembro} className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-700">{miembro}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
