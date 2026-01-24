import { Users, Palette, Mic, Film, PenTool, Shirt, Search, Layout } from 'lucide-react';
import { useState } from 'react';
import { Grupo } from '../types';
import { Card_Grupo } from './Card_Grupo';
import { ModalCrearGrupo } from './ModalCrearGrupo';

interface GruposDepartamentosProps {
  grupos: Grupo[];
  onSelectGrupo: (grupo: Grupo) => void;
  onEditarGrupo: (id: number, grupo: Omit<Grupo, 'id'>) => void;
  onEliminarGrupo: (id: number) => void;
  proyectoId?: string;
}

const departamentos = [
  { nombre: 'Guion', icon: PenTool, color: 'from-purple-500 to-indigo-600', light: 'bg-purple-50 text-purple-700' , desc: 'Narrativa y creación' },
  { nombre: 'Locución', icon: Mic, color: 'from-blue-500 to-cyan-600', light: 'bg-blue-50 text-blue-700', desc: 'Voz y presentación' },
  { nombre: 'Edición', icon: Film, color: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 text-emerald-700', desc: 'Montaje y post-producción' },
  { nombre: 'Diseño Gráfico', icon: Palette, color: 'from-orange-500 to-amber-600', light: 'bg-orange-50 text-orange-700', desc: 'Identidad y visuales' },
  { nombre: 'Vestuario/Arte', icon: Shirt, color: 'from-rose-500 to-pink-600', light: 'bg-rose-50 text-rose-700', desc: 'Escenografía y arte' },
  { nombre: 'Coordinación', icon: Layout, color: 'from-slate-600 to-slate-800', light: 'bg-slate-50 text-slate-700', desc: 'Gestión y control' },
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

      <div className="flex flex-col gap-16 pb-12">
        {/* Resumen de departamentos */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Departamentos</h2>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen estadístico</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {departamentos.map((dept) => {
              const Icon = dept.icon;
              const gruposDept = grupos.filter(g => g.departamento === dept.nombre);
              
              return (
                <div 
                    key={dept.nombre} 
                    className={`bg-gradient-to-br ${dept.color} rounded-[2rem] p-6 text-white shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group`}
                >
                  <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-black text-sm uppercase tracking-tighter truncate">{dept.nombre}</div>
                  </div>
                  
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                        <div className="text-4xl font-black tracking-tighter">{gruposDept.length}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">Equipos</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Grupos por departamento */}
        <div className="space-y-20">
            {departamentos.map((dept) => {
            const gruposDept = grupos.filter(g => g.departamento === dept.nombre);
            if (gruposDept.length === 0) return null;
            
            const Icon = dept.icon;
            return (
                <section key={dept.nombre} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`p-4 bg-gradient-to-br ${dept.color} rounded-2xl text-white shadow-lg`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{dept.nombre}</h3>
                            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">{dept.desc}</p>
                        </div>
                        <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-200 to-transparent ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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