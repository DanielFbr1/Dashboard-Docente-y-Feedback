import { User, LogOut, Award, MessageSquare, Users, TrendingUp, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Grupo } from '../types';
import { GRUPOS_MOCK } from '../data/mockData';
import { ChatIA } from './ChatIA';
import { RepositorioColaborativo } from './RepositorioColaborativo';

interface DashboardAlumnoProps {
  alumno: {
    nombre: string;
    clase: string;
    grupo: string;
  };
  onLogout: () => void;
}

export function DashboardAlumno({ alumno, onLogout }: DashboardAlumnoProps) {
  const [vistaActiva, setVistaActiva] = useState<'perfil' | 'grupo' | 'chat' | 'progreso' | 'compartir'>('perfil');

  // Buscar el grupo del alumno en los datos de ejemplo
  const grupoAlumno = GRUPOS_MOCK.find(g => g.nombre === alumno.grupo) || GRUPOS_MOCK[0];

  // Evaluación simulada del alumno
  const evaluacionAlumno = [
    { criterio: 'Colaboración y trabajo en equipo', puntos: 8, nivel: 'Notable' },
    { criterio: 'Uso crítico de la IA', puntos: 9, nivel: 'Sobresaliente' },
    { criterio: 'Aportación al producto', puntos: 8, nivel: 'Notable' },
    { criterio: 'Reflexión metacognitiva', puntos: 6, nivel: 'Suficiente' }
  ];

  const notaMedia = evaluacionAlumno.reduce((sum, e) => sum + e.puntos, 0) / evaluacionAlumno.length;

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Sobresaliente':
        return 'bg-green-500 text-white';
      case 'Notable':
        return 'bg-blue-500 text-white';
      case 'Suficiente':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-red-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {alumno.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">¡Hola, {alumno.nombre.split(' ')[0]}!</h1>
                <p className="text-sm text-gray-700 font-medium">{alumno.clase} - {alumno.grupo}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            <button
              onClick={() => setVistaActiva('perfil')}
              className={`px-6 py-4 font-medium transition-all border-b-2 ${vistaActiva === 'perfil'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Mi evaluación</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('grupo')}
              className={`px-6 py-4 font-medium transition-all border-b-2 ${vistaActiva === 'grupo'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Mi grupo</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('compartir')}
              className={`px-6 py-4 font-medium transition-all border-b-2 ${vistaActiva === 'compartir'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                <span>Compartir trabajo</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('progreso')}
              className={`px-6 py-4 font-medium transition-all border-b-2 ${vistaActiva === 'progreso'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Progreso grupos</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('chat')}
              className={`px-6 py-4 font-medium transition-all border-b-2 ${vistaActiva === 'chat'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Mentor IA</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {vistaActiva === 'perfil' && (
          <div className="flex flex-col gap-6">
            {/* Estadísticas personales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-3xl font-bold">{notaMedia.toFixed(1)}</div>
                    <div className="text-sm opacity-90">Nota media</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-3xl font-bold">
                      {Math.floor(grupoAlumno.interacciones_ia / grupoAlumno.miembros.length)}
                    </div>
                    <div className="text-sm opacity-90">Preguntas a IA</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-3xl font-bold">{grupoAlumno.progreso}%</div>
                    <div className="text-sm opacity-90">Progreso grupo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluación por criterios */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tu evaluación</h2>
              <div className="space-y-6">
                {evaluacionAlumno.map((item, index) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{item.criterio}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-5 py-2 text-sm font-bold rounded-xl shadow-md ${getNivelColor(item.nivel)}`}>
                          {item.nivel}
                        </span>
                        <div className="text-3xl font-bold text-gray-900">
                          {item.puntos}
                          <span className="text-xl text-gray-500 font-medium">/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all ${item.nivel === 'Sobresaliente' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            item.nivel === 'Notable' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                              item.nivel === 'Suficiente' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-red-500 to-pink-600'
                          }`}
                        style={{ width: `${(item.puntos / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Áreas de mejora
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">•</span>
                  <span className="font-medium">Sigue usando el Mentor IA para hacer preguntas reflexivas - ¡lo estás haciendo genial!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">•</span>
                  <span className="font-medium">Intenta documentar mejor tu proceso de aprendizaje en cada fase del proyecto</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">•</span>
                  <span className="font-medium">Comparte más tus ideas creativas durante las sesiones de trabajo en grupo</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {vistaActiva === 'grupo' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{grupoAlumno.nombre}</h2>
                  <p className="text-gray-600">{grupoAlumno.departamento}</p>
                </div>
                <span className={`px-4 py-2 font-semibold rounded-lg ${grupoAlumno.estado === 'Casi terminado' ? 'bg-blue-500 text-white' :
                    grupoAlumno.estado === 'En progreso' ? 'bg-yellow-500 text-white' :
                      grupoAlumno.estado === 'Bloqueado' ? 'bg-red-500 text-white' :
                        'bg-green-500 text-white'
                  }`}>
                  {grupoAlumno.estado}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2 font-medium text-gray-700">
                  <span>Progreso del proyecto</span>
                  <span>{grupoAlumno.progreso}%</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${grupoAlumno.progreso}%` }}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Compañeros de grupo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grupoAlumno.miembros.map((miembro, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {miembro.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{miembro}</span>
                      {miembro === alumno.nombre && (
                        <span className="ml-auto px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Tú
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'compartir' && (
          <RepositorioColaborativo grupo={grupoAlumno} todosLosGrupos={GRUPOS_MOCK} />
        )}

        {vistaActiva === 'progreso' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Progreso de todos los grupos</h2>
              <div className="space-y-4">
                {GRUPOS_MOCK.map((grupo) => (
                  <div
                    key={grupo.id}
                    className={`p-4 rounded-xl border-2 transition-all ${grupo.nombre === alumno.grupo
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">{grupo.nombre}</h3>
                        {grupo.nombre === alumno.grupo && (
                          <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                            TU GRUPO
                          </span>
                        )}
                      </div>
                      <span className={`px-3 py-1 font-semibold text-sm rounded-lg ${grupo.estado === 'Casi terminado' ? 'bg-blue-500 text-white' :
                          grupo.estado === 'En progreso' ? 'bg-yellow-500 text-white' :
                            grupo.estado === 'Bloqueado' ? 'bg-red-500 text-white' :
                              'bg-green-500 text-white'
                        }`}>
                        {grupo.estado}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2 font-medium text-gray-700">
                      <span>{grupo.departamento}</span>
                      <span>{grupo.progreso}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${grupo.progreso}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'chat' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <ChatIA grupo={grupoAlumno} />
          </div>
        )}
      </main>
    </div>
  );
}