import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, Check, Tag, UserPlus, Radio, Loader2 } from 'lucide-react';
import { Grupo, AlumnoConectado } from '../types';
import { supabase } from '../lib/supabase';

interface ModalCrearGrupoProps {
  onClose: () => void;
  onCrear: (grupo: Omit<Grupo, 'id'>) => void;
  grupoEditando?: Grupo | null;
  proyectoId?: string;
}

const departamentos = [
  { nombre: 'Guion', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '✍️' },
  { nombre: 'Locución', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🎤' },
  { nombre: 'Edición', color: 'bg-green-100 text-green-700 border-green-300', icon: '🎬' },
  { nombre: 'Diseño Gráfico', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🎨' },
  { nombre: 'Vestuario/Arte', color: 'bg-pink-100 text-pink-700 border-pink-300', icon: '👗' },
  { nombre: 'Coordinación', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: '📋' }
];

export function ModalCrearGrupo({ onClose, onCrear, grupoEditando, proyectoId }: ModalCrearGrupoProps) {
  const [nombre, setNombre] = useState(grupoEditando?.nombre || '');
  const [departamento, setDepartamento] = useState(grupoEditando?.departamento || '');
  const [miembros, setMiembros] = useState<string[]>(grupoEditando?.miembros || []);
  const [nuevoMiembro, setNuevoMiembro] = useState('');
  const [alumnosOnline, setAlumnosOnline] = useState<AlumnoConectado[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  useEffect(() => {
    if (proyectoId) {
      fetchAlumnosOnline();
    }
  }, [proyectoId]);

  const fetchAlumnosOnline = async () => {
    setLoadingAlumnos(true);
    try {
      const { data, error } = await supabase
        .from('alumnos_conectados')
        .select('*')
        .eq('proyecto_id', proyectoId);

      if (error) throw error;
      setAlumnosOnline(data || []);
    } catch (err) {
      console.error('Error fetching online students:', err);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const handleAgregarMiembro = () => {
    if (nuevoMiembro.trim() && !miembros.includes(nuevoMiembro.trim())) {
      setMiembros([...miembros, nuevoMiembro.trim()]);
      setNuevoMiembro('');
    }
  };

  const handleToggleMiembroOnline = (nombreAlumno: string) => {
    if (miembros.includes(nombreAlumno)) {
      setMiembros(miembros.filter(m => m !== nombreAlumno));
    } else {
      setMiembros([...miembros, nombreAlumno]);
    }
  };

  const handleEliminarMiembro = (index: number) => {
    setMiembros(miembros.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && departamento && miembros.length > 0) {
      onCrear({
        nombre: nombre.trim(),
        departamento,
        miembros,
        estado: grupoEditando?.estado || 'En progreso',
        progreso: grupoEditando?.progreso || 0,
        interacciones_ia: grupoEditando?.interacciones_ia || 0
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  {grupoEditando ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                </h2>
                <p className="text-blue-100 font-medium italic">Asigna miembros y define su departamento</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/20 rounded-2xl p-2 transition-all">
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Nombre del grupo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
                <Tag className="w-4 h-4 text-blue-500" />
                Nombre del Equipo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Los Locutores del Mañana"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none text-xl font-bold transition-all"
                required
              />
            </div>

            {/* Departamento */}
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
                <Radio className="w-4 h-4 text-purple-500" />
                Departamento / Especialidad
              </label>
              <div className="grid grid-cols-2 gap-2">
                {departamentos.map((dept) => (
                  <button
                    key={dept.nombre}
                    type="button"
                    onClick={() => setDepartamento(dept.nombre)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${departamento === dept.nombre
                      ? `${dept.color} border-current shadow-lg scale-[1.02] font-black`
                      : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200 font-bold'
                      }`}
                  >
                    <span className="text-2xl mr-2">{dept.icon}</span>
                    <span className="text-sm">{dept.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Selección de Alumnos Online */}
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
                <Radio className="w-4 h-4 text-green-500 animate-pulse" />
                Alumnos en la Sala (Online)
              </label>
              <div className="bg-green-50 rounded-3xl p-6 border-2 border-green-100">
                {loadingAlumnos ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                  </div>
                ) : alumnosOnline.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {alumnosOnline.map((alumno) => (
                      <button
                        key={alumno.id}
                        type="button"
                        onClick={() => handleToggleMiembroOnline(alumno.nombre_alumno)}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-bold flex items-center gap-2 ${miembros.includes(alumno.nombre_alumno)
                            ? 'bg-green-600 text-white border-green-600 shadow-md'
                            : 'bg-white text-green-700 border-green-200 hover:border-green-400'
                          }`}
                      >
                        {miembros.includes(alumno.nombre_alumno) && <Check className="w-4 h-4" />}
                        {alumno.nombre_alumno}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-700 text-sm font-medium text-center italic">No hay alumnos conectados con el código ahora mismo.</p>
                )}
                <p className="text-[10px] text-green-600 font-bold uppercase mt-4 text-center tracking-tighter">✨ Haz clic para añadir al grupo instantáneamente</p>
              </div>
            </div>

            {/* Añadir manualmente */}
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
                <UserPlus className="w-4 h-4 text-orange-500" />
                Añadir Manualmente
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevoMiembro}
                  onChange={(e) => setNuevoMiembro(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarMiembro())}
                  placeholder="Nombre del alumno..."
                  className="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 outline-none font-bold"
                />
                <button
                  type="button"
                  onClick={handleAgregarMiembro}
                  className="p-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Lista de Miembros */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Lista Final ({miembros.length})</label>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {miembros.map((miembro, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border-2 border-gray-100 rounded-xl group hover:border-blue-200 transition-all">
                    <span className="font-bold text-gray-700">{miembro}</span>
                    <button type="button" onClick={() => handleEliminarMiembro(index)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {miembros.length === 0 && (
                  <p className="text-center text-gray-400 py-4 italic text-sm">Añade alumnos online o manualmente</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t-2 border-gray-100 bg-gray-50 flex items-center justify-between">
          <button onClick={onClose} className="px-8 py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={!nombre.trim() || !departamento || miembros.length === 0}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-blue-200 hover:scale-105 active:scale-95 disabled:grayscale disabled:scale-100 transition-all flex items-center gap-3"
          >
            <Check className="w-6 h-6" />
            {grupoEditando ? 'Guardar Cambios' : 'Confirmar y Crear Grupo'}
          </button>
        </div>
      </div>
    </div>
  );
}