import { Edit2, Trash2, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { Grupo } from '../types';

interface CardGrupoProps {
  grupo: Grupo;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  mostrarBotonEditar?: boolean;
  mostrarBotonBorrar?: boolean;
}

export function Card_Grupo({ grupo, onClick, onEdit, onDelete, mostrarBotonEditar = false, mostrarBotonBorrar = false }: CardGrupoProps) {
  const getEstadoStyles = (estado: Grupo['estado']) => {
    switch (estado) {
      case 'Completado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'Casi terminado':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
      case 'En progreso':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'Bloqueado':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20';
    }
  };

  const getProgresoColor = (progreso: number) => {
    if (progreso >= 100) return 'bg-emerald-500';
    if (progreso >= 50) return 'bg-blue-500';
    if (progreso >= 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div
      className="flex flex-col gap-6 p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-2 border-transparent hover:border-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 relative group overflow-hidden"
    >
      {/* Botones de acción rápidos */}
      {(mostrarBotonEditar || mostrarBotonBorrar) && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0 z-20">
          {mostrarBotonEditar && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-3 bg-white shadow-lg border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:scale-110 transition-all"
              title="Editar grupo"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {mostrarBotonBorrar && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-3 bg-white shadow-lg border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 hover:scale-110 transition-all"
              title="Eliminar grupo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div
        onClick={onClick}
        className="cursor-pointer relative z-10 h-full flex flex-col"
      >
        <div className="flex justify-between items-start mb-6">
          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border-2 ${getEstadoStyles(grupo.estado)}`}>
            {grupo.estado}
          </span>
          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
          {grupo.nombre}
        </h3>

        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 italic">
          {grupo.departamento}
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-widest">
            <span>Progreso del equipo</span>
            <span className="text-slate-900">{grupo.progreso}%</span>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-[2px]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-inner ${getProgresoColor(grupo.progreso)}`}
              style={{ width: `${grupo.progreso}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-slate-500">
            <Users className="w-4 h-4" />
            <span className="text-xs font-black tracking-widest">{grupo.miembros.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl text-blue-600">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-black tracking-widest">{grupo.interacciones_ia}</span>
          </div>
        </div>
      </div>
    </div>
  );
}