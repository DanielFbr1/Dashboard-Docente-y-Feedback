import { Edit2, Trash2 } from 'lucide-react';
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
  const getEstadoColor = (estado: Grupo['estado']) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Casi terminado':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'En progreso':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Bloqueado':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div
      className="flex flex-col gap-4 p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all relative group"
    >
      {(mostrarBotonEditar || mostrarBotonBorrar) && (
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {mostrarBotonEditar && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
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
              className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors"
              title="Eliminar grupo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-gray-900 leading-tight">{grupo.nombre}</h3>
        </div>

        <div className="text-sm text-gray-500 mb-3">
          {grupo.departamento}
        </div>

        <div className="mb-4">
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getEstadoColor(grupo.estado)}`}>
            {grupo.estado}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progreso</span>
            <span>{grupo.progreso}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${grupo.progreso}%` }}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Interacciones IA</span>
          <span className="font-mono text-gray-600">
            {grupo.interaccionesIA}
          </span>
        </div>
      </div>
    </div>
  );
}