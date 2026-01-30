import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, Check, Tag, UserPlus, Radio, Loader2 } from 'lucide-react';
import { Grupo, AlumnoConectado } from '../types';
import { supabase } from '../lib/supabase';

interface ModalCrearGrupoProps {
  onClose: () => void;
  onCrear: (grupo: Omit<Grupo, 'id'>) => void;
  grupoEditando?: Grupo | null;
  proyectoId?: string;
  codigoSala?: string;
}

const departamentos = [
  { nombre: 'Guion', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '✍️' },
  { nombre: 'Locución', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🎤' },
  { nombre: 'Edición', color: 'bg-green-100 text-green-700 border-green-300', icon: '🎬' },
  { nombre: 'Diseño Gráfico', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🎨' },
  { nombre: 'Vestuario/Arte', color: 'bg-pink-100 text-pink-700 border-pink-300', icon: '👗' },
  { nombre: 'Coordinación', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: '📋' }
];

export function ModalCrearGrupo({ onClose, onCrear, grupoEditando, proyectoId, codigoSala }: ModalCrearGrupoProps) {
  const [nombre, setNombre] = useState(grupoEditando?.nombre || '');
  const [descripcion, setDescripcion] = useState(grupoEditando?.descripcion || '');
  const [miembros, setMiembros] = useState<string[]>(grupoEditando?.miembros || []);
  const [nuevoMiembro, setNuevoMiembro] = useState('');
  const [alumnosClase, setAlumnosClase] = useState<any[]>([]); // Usamos any[] para simplificar la transición de AlumnoConectado a Perfil
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  useEffect(() => {
    if (codigoSala) {
      fetchAlumnosClase();
    }
  }, [codigoSala]);

  const fetchAlumnosClase = async () => {
    setLoadingAlumnos(true);
    try {
      // Ahora buscamos a todos los alumnos registrados en este proyecto (por código de sala)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, rol')
        .eq('codigo_sala', codigoSala)
        .eq('rol', 'alumno');

      if (error) throw error;
      setAlumnosClase(data || []);
    } catch (err) {
      console.error('Error fetching class students:', err);
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
    if (nombre.trim() && miembros.length > 0) {
      onCrear({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        miembros,
        estado: grupoEditando?.estado || 'En progreso',
        progreso: grupoEditando?.progreso || 0,
        interacciones_ia: grupoEditando?.interacciones_ia || 0
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
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
                <p className="text-blue-100 font-medium italic">Define los detalles y miembros del equipo</p>
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Nombre del Grupo / Proyecto
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="Ej: Equipo Alpha..."
                autoFocus
              />
            </div>

            {/* Descripción del Grupo (Opcional) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium min-h-[100px] resize-none"
                placeholder="Breve descripción de los objetivos del grupo..."
              />
            </div>
          </div>

          <div className="space-y-8">
            {/* Selección de Alumnos Registrados */}
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
                <Users className="w-4 h-4 text-emerald-500" />
                Alumnos Registrados en la Clase
              </label>
              <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-100">
                {loadingAlumnos ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  </div>
                ) : alumnosClase.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {alumnosClase.map((alumno: any) => (
                      <button
                        key={alumno.id}
                        type="button"
                        onClick={() => handleToggleMiembroOnline(alumno.nombre)}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-bold flex items-center gap-2 ${miembros.includes(alumno.nombre)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                          : 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400'
                          }`}
                      >
                        {miembros.includes(alumno.nombre) && <Check className="w-4 h-4" />}
                        {alumno.nombre}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-700 text-sm font-medium text-center italic">No hay alumnos registrados con el código todavía.</p>
                )}
                <p className="text-[10px] text-emerald-600 font-bold uppercase mt-4 text-center tracking-tighter">✨ Haz clic para añadir al grupo</p>
              </div>
            </div>

            {/* Añadir manualmente ELIMINADO */}

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
        </form >

        {/* Footer */}
        < div className="p-8 border-t-2 border-gray-100 bg-gray-50 flex items-center justify-between" >
          <button onClick={onClose} className="px-8 py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={!nombre.trim() || miembros.length === 0}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-blue-200 hover:scale-105 active:scale-95 disabled:grayscale disabled:scale-100 transition-all flex items-center gap-3"
          >
            <Check className="w-6 h-6" />
            {grupoEditando ? 'Guardar Cambios' : 'Confirmar y Crear Grupo'}
          </button>
        </div >
      </div >
    </div >
  );
}