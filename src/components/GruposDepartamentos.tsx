import { Users, Palette, Mic, Film, PenTool, Shirt, Search, Layout } from 'lucide-react';
import { useState } from 'react';
import { Grupo } from '../types';
import { Card_Grupo } from './Card_Grupo';
import { ModalCrearGrupo } from './ModalCrearGrupo';

interface GruposDepartamentosProps {
  grupos: Grupo[];
  onSelectGrupo: (grupo: Grupo) => void;
  onEditarGrupo: (id: number | string, grupo: Omit<Grupo, 'id'>) => void;
  onEliminarGrupo: (id: number | string) => void;
  proyectoId?: string;
}

const departamentos = [
  { nombre: 'Guion', icon: PenTool, style: 'bg-purple-50 border-purple-200 text-purple-700', desc: 'Narrativa y creación' },
  { nombre: 'Locución', icon: Mic, style: 'bg-blue-50 border-blue-200 text-blue-700', desc: 'Voz y presentación' },
  { nombre: 'Edición', icon: Film, style: 'bg-emerald-50 border-emerald-200 text-emerald-700', desc: 'Montaje y post-producción' },
  { nombre: 'Diseño Gráfico', icon: Palette, style: 'bg-orange-50 border-orange-200 text-orange-700', desc: 'Identidad y visuales' },
  { nombre: 'Vestuario/Arte', icon: Shirt, style: 'bg-rose-50 border-rose-200 text-rose-700', desc: 'Escenografía y arte' },
  { nombre: 'Coordinación', icon: Layout, style: 'bg-slate-50 border-slate-200 text-slate-700', desc: 'Gestión y control' },
];

export function GruposDepartamentos({ grupos, onSelectGrupo, onEditarGrupo, onEliminarGrupo, proyectoId }: GruposDepartamentosProps) {
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);

  if (grupos.length === 0) return null;

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
          grupoEditando={grupoEditando}
          proyectoId={proyectoId}
        />
      )}

      <div className="flex flex-col gap-12 pb-12">
        {/* Resumen de departamentos */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-2xl text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Departamentos</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {departamentos.map((dept) => {
              const Icon = dept.icon;
              const gruposDept = grupos.filter(g => g.departamento === dept.nombre);

              return (
                <div
                  key={dept.nombre}
                  className={`${dept.style} rounded-[2rem] p-6 border-2 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-white/50 rounded-lg">
                      <Icon className="w-4 h-4 opacity-70" />
                    </div>
                    <div className="font-black text-xs uppercase tracking-tighter truncate">{dept.nombre}</div>
                  </div>

                  <div className="flex items-end justify-between leading-none">
                    <div className="text-3xl font-black">{gruposDept.length}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">EQUIPOS</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Grupos por departamento */}
        <div className="space-y-16">
          {departamentos.map((dept) => {
            const gruposDept = grupos.filter(g => g.departamento === dept.nombre);
            if (gruposDept.length === 0) return null;

            const Icon = dept.icon;
            return (
              <section key={dept.nombre} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl ${dept.style} border-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{dept.nombre}</h3>
                    <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">{dept.desc}</p>
                  </div>
                  <div className="flex-1 h-[2px] bg-slate-100 ml-4"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {gruposDept.map((grupo) => (
                    <Card_Grupo
                      key={grupo.id}
                      grupo={grupo}
                      onClick={() => onSelectGrupo(grupo)}
                      onEdit={() => setGrupoEditando(grupo)}
                      onDelete={() => { if (confirm(`¿Eliminar "${grupo.nombre}"?`)) onEliminarGrupo(grupo.id); }}
                      mostrarBotonEditar={true}
                      mostrarBotonBorrar={true}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}