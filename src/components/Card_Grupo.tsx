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
      className="flex flex-col gap-6 p-7 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 relative group overflow-hidden"
    >
      {/* Botones de acción rápidos */}
      {(mostrarBotonEditar || mostrarBotonBorrar) && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
          {mostrarBotonEditar && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
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
              className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all"
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
        <div className="flex justify-between items-start mb-5">
          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-2 ${getEstadoStyles(grupo.estado)}`}>
            {grupo.estado}
          </span>
        </div>

        <h3 className="text-xl font-black text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors tracking-tight uppercase">
          {grupo.nombre}
        </h3>

        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">
          {grupo.departamento}
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Progreso</span>
            <span className="text-slate-600 font-black">{grupo.progreso}%</span>
          </div>
          <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-[2px] border border-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgresoColor(grupo.progreso)}`}
              style={{ width: `${grupo.progreso}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{grupo.miembros.length} Miembros</span>
          </div>
          <div className="flex items-center gap-2 text-blue-500/70">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{grupo.interacciones_ia} Consultas</span>
          </div>
        </div>
      </div>
    </div>
  );
}