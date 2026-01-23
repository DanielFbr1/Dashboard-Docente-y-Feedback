import { useState } from 'react';
import { X, Plus, Trash2, Users, Check, Tag, UserPlus } from 'lucide-react';
import { Grupo } from '../types';

interface ModalCrearGrupoProps {
  onClose: () => void;
  onCrear: (grupo: Omit<Grupo, 'id'>) => void;
  grupoEditando?: Grupo | null;
}

const departamentos = [
  { nombre: 'Guion', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '✍️' },
  { nombre: 'Locución', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🎤' },
  { nombre: 'Edición', color: 'bg-green-100 text-green-700 border-green-300', icon: '🎬' },
  { nombre: 'Diseño Gráfico', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🎨' },
  { nombre: 'Vestuario/Arte', color: 'bg-pink-100 text-pink-700 border-pink-300', icon: '👗' },
  { nombre: 'Coordinación', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: '📋' }
];

export function ModalCrearGrupo({ onClose, onCrear, grupoEditando }: ModalCrearGrupoProps) {
  const [nombre, setNombre] = useState(grupoEditando?.nombre || '');
  const [departamento, setDepartamento] = useState(grupoEditando?.departamento || '');
  const [miembros, setMiembros] = useState<string[]>(grupoEditando?.miembros || []);
  const [nuevoMiembro, setNuevoMiembro] = useState('');

  const handleAgregarMiembro = () => {
    if (nuevoMiembro.trim() && !miembros.includes(nuevoMiembro.trim())) {
      setMiembros([...miembros, nuevoMiembro.trim()]);
      setNuevoMiembro('');
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
        interaccionesIA: grupoEditando?.interaccionesIA || 0
      });
      onClose();
    }
  };

  const deptSeleccionado = departamentos.find(d => d.nombre === departamento);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {grupoEditando ? 'Editar grupo' : 'Crear nuevo grupo'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {grupoEditando ? 'Modifica la información del grupo' : 'Organiza a tu alumnado en grupos de trabajo'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">
            {/* Nombre del grupo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Tag className="w-4 h-4" />
                Nombre del grupo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Los Guionistas Creativos"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-2">💡 Usa un nombre creativo que identifique al equipo</p>
            </div>

            {/* Departamento - Grid de tarjetas */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Tag className="w-4 h-4" />
                Selecciona el departamento
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {departamentos.map((dept) => (
                  <button
                    key={dept.nombre}
                    type="button"
                    onClick={() => setDepartamento(dept.nombre)}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${departamento === dept.nombre
                      ? `${dept.color} border-current shadow-lg scale-105`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {departamento === dept.nombre && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-3xl mb-2">{dept.icon}</div>
                    <div className={`font-semibold text-sm ${departamento === dept.nombre ? '' : 'text-gray-700'}`}>
                      {dept.nombre}
                    </div>
                  </button>
                ))}
              </div>
              {!departamento && (
                <p className="text-xs text-red-500 mt-2">⚠️ Debes seleccionar un departamento</p>
              )}
            </div>

            {/* Miembros del grupo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <UserPlus className="w-4 h-4" />
                Miembros del grupo
              </label>

              {/* Input para añadir miembro con mejor diseño */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoMiembro}
                    onChange={(e) => setNuevoMiembro(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarMiembro())}
                    placeholder="Nombre completo del alumno/a"
                    className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAgregarMiembro}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Añadir
                  </button>
                </div>
                <p className="text-xs text-blue-700 mt-2">💡 Presiona Enter o clic en "Añadir" para agregar al alumno/a</p>
              </div>

              {/* Lista de miembros mejorada */}
              {miembros.length > 0 ? (
                <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {miembros.length < 3 ? '⚠️ Recomendado: 3-5 miembros por grupo' :
                          miembros.length > 5 ? '⚠️ Grupo grande: mejor dividir en 2 grupos' :
                            '✅ Tamaño ideal de grupo'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {miembros.map((miembro, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {miembro.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{miembro}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEliminarMiembro(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No hay miembros añadidos</p>
                  <p className="text-sm text-gray-500">Añade al menos un alumno/a para continuar</p>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer con botones */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {nombre && departamento && miembros.length > 0 ? (
              <span className="text-green-600 font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                ¡Listo para crear!
              </span>
            ) : (
              <span>Completa todos los campos requeridos</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nombre.trim() || !departamento || miembros.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              {grupoEditando ? 'Guardar cambios' : 'Crear grupo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}