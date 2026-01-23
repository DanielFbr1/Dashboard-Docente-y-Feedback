import { Users, Search, UserCheck, Eye } from 'lucide-react';
import { useState } from 'react';
import { Grupo } from '../App';
import { PerfilAlumno } from './PerfilAlumno';

interface ListaAlumnosProps {
  grupos: Grupo[];
}

interface AlumnoConGrupo {
  nombre: string;
  grupo: string;
  departamento: string;
  grupoId: number;
  grupoCompleto: Grupo;
}

export function ListaAlumnos({ grupos }: ListaAlumnosProps) {
  const [busqueda, setBusqueda] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<AlumnoConGrupo | null>(null);

  // Crear lista de todos los alumnos con su grupo
  const todosLosAlumnos: AlumnoConGrupo[] = grupos.flatMap(grupo =>
    grupo.miembros.map(miembro => ({
      nombre: miembro,
      grupo: grupo.nombre,
      departamento: grupo.departamento,
      grupoId: grupo.id,
      grupoCompleto: grupo
    }))
  );

  // Ordenar alfabéticamente
  const alumnosOrdenados = todosLosAlumnos.sort((a, b) => 
    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  );

  // Filtrar por búsqueda
  const alumnosFiltrados = alumnosOrdenados.filter(alumno =>
    alumno.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    alumno.grupo.toLowerCase().includes(busqueda.toLowerCase()) ||
    alumno.departamento.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getDepartamentoColor = (departamento: string) => {
    const colores: { [key: string]: string } = {
      'Guion': 'bg-purple-100 text-purple-700 border-purple-300',
      'Locución': 'bg-blue-100 text-blue-700 border-blue-300',
      'Edición': 'bg-green-100 text-green-700 border-green-300',
      'Diseño Gráfico': 'bg-orange-100 text-orange-700 border-orange-300',
      'Vestuario/Arte': 'bg-pink-100 text-pink-700 border-pink-300',
      'Coordinación': 'bg-indigo-100 text-indigo-700 border-indigo-300'
    };
    return colores[departamento] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <>
      {alumnoSeleccionado && (
        <PerfilAlumno
          alumno={alumnoSeleccionado.nombre}
          grupo={alumnoSeleccionado.grupoCompleto}
          onClose={() => setAlumnoSeleccionado(null)}
        />
      )}

      <div className="flex flex-col gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Lista completa de alumnado</h2>
              <p className="text-gray-700 mb-4">
                Aquí puedes ver todos los alumnos registrados en el proyecto, organizados alfabéticamente 
                con su grupo y departamento asignado.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700"><strong>{todosLosAlumnos.length}</strong> alumnos totales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-gray-700"><strong>{grupos.length}</strong> grupos formados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, grupo o departamento..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tabla de alumnos */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Nombre del alumno/a
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Grupo
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Departamento
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {alumnosFiltrados.length > 0 ? (
                  alumnosFiltrados.map((alumno, index) => (
                    <tr 
                      key={`${alumno.grupoId}-${alumno.nombre}`}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{alumno.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{alumno.grupo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDepartamentoColor(alumno.departamento)}`}>
                          {alumno.departamento}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setAlumnoSeleccionado(alumno)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Ver perfil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-600 font-medium">No se encontraron resultados</p>
                        <p className="text-sm text-gray-500">
                          {busqueda ? 'Intenta con otros términos de búsqueda' : 'No hay alumnos registrados'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen estadístico */}
        {alumnosFiltrados.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              Mostrando <strong className="text-gray-900">{alumnosFiltrados.length}</strong> de{' '}
              <strong className="text-gray-900">{todosLosAlumnos.length}</strong> alumnos
              {busqueda && (
                <span className="ml-2">
                  • Filtrado por: <strong className="text-blue-600">"{busqueda}"</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}