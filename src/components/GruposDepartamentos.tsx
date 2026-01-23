import { Users, Palette, Mic, Film, PenTool, Shirt } from 'lucide-react';
import { useState } from 'react';
import { Grupo } from '../App';
import { Card_Grupo } from './Card_Grupo';
import { ModalCrearGrupo } from './ModalCrearGrupo';

interface GruposDepartamentosProps {
  grupos: Grupo[];
  onSelectGrupo: (grupo: Grupo) => void;
  onEditarGrupo: (id: number, grupo: Omit<Grupo, 'id'>) => void;
  onEliminarGrupo: (id: number) => void;
}

const departamentos = [
  { nombre: 'Guion', icon: PenTool, color: 'bg-purple-100 text-purple-700 border-purple-300', descripcion: 'Creación de contenido y narrativa' },
  { nombre: 'Locución', icon: Mic, color: 'bg-blue-100 text-blue-700 border-blue-300', descripcion: 'Grabación de voz y presentación' },
  { nombre: 'Edición', icon: Film, color: 'bg-green-100 text-green-700 border-green-300', descripcion: 'Post-producción y montaje' },
  { nombre: 'Diseño Gráfico', icon: Palette, color: 'bg-orange-100 text-orange-700 border-orange-300', descripcion: 'Identidad visual y gráficos' },
  { nombre: 'Vestuario/Arte', icon: Shirt, color: 'bg-pink-100 text-pink-700 border-pink-300', descripcion: 'Vestuario, escenografía y arte' },
];

export function GruposDepartamentos({ grupos, onSelectGrupo, onEditarGrupo, onEliminarGrupo }: GruposDepartamentosProps) {
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);

  if (grupos.length === 0) {
    return null; // El estado vacío se maneja en el Dashboard
  }

  const handleEditarGrupo = (grupo: Grupo) => {
    setGrupoEditando(grupo);
  };

  const handleGuardarEdicion = (grupoEditado: Omit<Grupo, 'id'>) => {
    if (grupoEditando) {
      onEditarGrupo(grupoEditando.id, grupoEditado);
      setGrupoEditando(null);
    }
  };

  return (
    <>
      {grupoEditando && (
        <ModalCrearGrupo
          onClose={() => setGrupoEditando(null)}
          onCrear={handleGuardarEdicion}
          grupoEditar={grupoEditando}
        />
      )}

      <div className="flex flex-col gap-8">
        {/* Resumen de departamentos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Departamentos del proyecto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {departamentos.map((dept) => {
              const Icon = dept.icon;
              const gruposDept = grupos.filter(g => g.departamento === dept.nombre);
              return (
                <div key={dept.nombre} className={`p-4 rounded-lg border ${dept.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <div className="font-semibold">{dept.nombre}</div>
                  </div>
                  <div className="text-xs mb-3">{dept.descripcion}</div>
                  <div className="text-2xl font-bold">{gruposDept.length}</div>
                  <div className="text-xs mt-1">grupos activos</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grupos por departamento */}
        {departamentos.map((dept) => {
          const gruposDept = grupos.filter(g => g.departamento === dept.nombre);
          if (gruposDept.length === 0) return null;
          
          const Icon = dept.icon;
          return (
            <div key={dept.nombre}>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {dept.nombre}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gruposDept.map((grupo) => (
                  <Card_Grupo
                    key={grupo.id}
                    grupo={grupo}
                    onClick={() => onSelectGrupo(grupo)}
                    onEdit={() => handleEditarGrupo(grupo)}
                    mostrarBotonEditar={true}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}