import { X, Award, TrendingUp, MessageSquare, Target, Brain, CheckCircle2, AlertCircle, Trophy, Star, Calendar, Clock, Flame, Users, FileText, Lightbulb } from 'lucide-react';
import { Grupo } from '../App';

interface PerfilAlumnoProps {
  alumno: string;
  grupo: Grupo;
  onClose: () => void;
}

interface EvaluacionIndividual {
  criterio: string;
  nivel: 'Insuficiente' | 'Suficiente' | 'Notable' | 'Sobresaliente';
  puntos: number;
  comentario: string;
}

interface ActividadReciente {
  fecha: string;
  tipo: 'pregunta_ia' | 'aportacion' | 'colaboracion';
  descripcion: string;
}

export function PerfilAlumno({ alumno, grupo, onClose }: PerfilAlumnoProps) {
  // Datos simulados de evaluación individual
  const evaluacion: EvaluacionIndividual[] = [
    {
      criterio: 'Colaboración y trabajo en equipo',
      nivel: 'Notable',
      puntos: 8,
      comentario: 'Participa activamente en las discusiones del grupo y ayuda a sus compañeros.'
    },
    {
      criterio: 'Uso crítico de la IA',
      nivel: 'Sobresaliente',
      puntos: 9,
      comentario: 'Hace preguntas reflexivas y profundas. Aprovecha muy bien el mentor IA.'
    },
    {
      criterio: 'Aportación al producto',
      nivel: 'Notable',
      puntos: 8,
      comentario: 'Sus contribuciones son creativas y de calidad.'
    },
    {
      criterio: 'Reflexión metacognitiva',
      nivel: 'Suficiente',
      puntos: 6,
      comentario: 'Puede profundizar más en la reflexión sobre su propio aprendizaje.'
    }
  ];

  // Datos adicionales
  const actividadReciente: ActividadReciente[] = [
    { fecha: 'Hace 2 horas', tipo: 'pregunta_ia', descripcion: 'Consultó al mentor IA sobre técnicas de narración' },
    { fecha: 'Ayer', tipo: 'aportacion', descripcion: 'Subió el primer borrador del guion' },
    { fecha: 'Hace 2 días', tipo: 'colaboracion', descripcion: 'Ayudó a un compañero con la estructura del proyecto' },
  ];

  const estadisticas = {
    asistencia: 95,
    participacion: 87,
    racha: 7,
    entregas: { completadas: 8, totales: 10 },
    preguntasIA: Math.floor(grupo.interaccionesIA / grupo.miembros.length),
    horasTrabajo: 12.5
  };

  const notaMedia = evaluacion.reduce((sum, e) => sum + e.puntos, 0) / evaluacion.length;

  const getNivelColor = (nivel: EvaluacionIndividual['nivel']) => {
    switch (nivel) {
      case 'Sobresaliente':
        return 'bg-green-600 text-white';
      case 'Notable':
        return 'bg-blue-600 text-white';
      case 'Suficiente':
        return 'bg-yellow-600 text-white';
      case 'Insuficiente':
        return 'bg-red-600 text-white';
    }
  };

  const getBarColor = (nivel: EvaluacionIndividual['nivel']) => {
    switch (nivel) {
      case 'Sobresaliente':
        return 'bg-green-600';
      case 'Notable':
        return 'bg-blue-600';
      case 'Suficiente':
        return 'bg-yellow-600';
      case 'Insuficiente':
        return 'bg-red-600';
    }
  };

  const getNivelIcon = (nivel: EvaluacionIndividual['nivel']) => {
    switch (nivel) {
      case 'Sobresaliente':
        return <Trophy className="w-4 h-4" />;
      case 'Notable':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Suficiente':
        return <Star className="w-4 h-4" />;
      case 'Insuficiente':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDepartamentoColor = (departamento: string) => {
    const colores: { [key: string]: string } = {
      'Guion': 'from-purple-600 to-purple-800',
      'Locución': 'from-blue-600 to-blue-800',
      'Edición': 'from-green-600 to-green-800',
      'Diseño Gráfico': 'from-orange-600 to-orange-800',
      'Vestuario/Arte': 'from-pink-600 to-pink-800',
      'Coordinación': 'from-indigo-600 to-indigo-800'
    };
    return colores[departamento] || 'from-gray-600 to-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getDepartamentoColor(grupo.departamento)} p-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-2xl text-6xl font-black border-4 border-white">
                  <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {alumno.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">{alumno}</h2>
                  <p className="text-white text-opacity-90 text-lg font-medium">Perfil de evaluación individual</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-bold backdrop-blur-sm">
                      {grupo.nombre}
                    </span>
                    <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-bold backdrop-blur-sm">
                      {grupo.departamento}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-2xl p-3 transition-all"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Nota media destacada */}
            <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-md border-2 border-white border-opacity-30 shadow-xl inline-block">
              <div className="text-white text-opacity-90 text-sm mb-1 font-semibold">NOTA MEDIA ACTUAL</div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold drop-shadow-lg">{notaMedia.toFixed(1)}</span>
                <span className="text-3xl font-semibold opacity-80">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="flex flex-col gap-8">
            {/* Estadísticas destacadas con MEJOR CONTRASTE */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Estadísticas generales</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{estadisticas.asistencia}%</div>
                  <div className="text-sm font-semibold text-gray-700">Asistencia</div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{estadisticas.participacion}%</div>
                  <div className="text-sm font-semibold text-gray-700">Participación</div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{estadisticas.racha}</div>
                  <div className="text-sm font-semibold text-gray-700">Días racha</div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{estadisticas.preguntasIA}</div>
                  <div className="text-sm font-semibold text-gray-700">Preguntas IA</div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{estadisticas.entregas.completadas}/{estadisticas.entregas.totales}</div>
                  <div className="text-sm font-semibold text-gray-700">Entregas</div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{estadisticas.horasTrabajo}h</div>
                  <div className="text-sm font-semibold text-gray-700">Horas trabajo</div>
                </div>
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Actividad reciente
              </h3>
              <div className="space-y-3">
                {actividadReciente.map((actividad, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      actividad.tipo === 'pregunta_ia' ? 'bg-purple-600' :
                      actividad.tipo === 'aportacion' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {actividad.tipo === 'pregunta_ia' ? <Brain className="w-5 h-5 text-white" /> :
                       actividad.tipo === 'aportacion' ? <FileText className="w-5 h-5 text-white" /> :
                       <Users className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{actividad.descripcion}</p>
                      <p className="text-sm text-gray-600 font-medium mt-1">{actividad.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluación por criterios con MEJOR CONTRASTE */}
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Evaluación por criterios
              </h3>

              <div className="space-y-5">
                {evaluacion.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">{item.criterio}</h4>
                        <p className="text-gray-700 font-medium text-base">{item.comentario}</p>
                      </div>
                      <div className="ml-6 text-right flex flex-col items-end gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl shadow-md ${getNivelColor(item.nivel)}`}>
                          {getNivelIcon(item.nivel)}
                          {item.nivel}
                        </span>
                        <div className="text-4xl font-bold text-gray-900">
                          {item.puntos}
                          <span className="text-xl text-gray-600 font-semibold">/10</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getBarColor(item.nivel)}`}
                        style={{ width: `${(item.puntos / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicadores de progreso del grupo */}
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Progreso del grupo
              </h3>
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-gray-900">Progreso general</span>
                  <span className="font-bold text-gray-900">{grupo.progreso}%</span>
                </div>
                <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all"
                    style={{ width: `${grupo.progreso}%` }}
                  />
                </div>
              </div>
              <p className="text-gray-700 font-medium">
                El grupo está avanzando bien. Estado actual: <strong className="text-gray-900">{grupo.estado}</strong>
              </p>
            </div>

            {/* Recomendaciones con MEJOR CONTRASTE */}
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-orange-300">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                Áreas de mejora y recomendaciones
              </h3>
              <div className="space-y-3">
                <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <p className="font-semibold text-gray-900 flex items-start gap-3 text-base">
                    <span className="text-2xl">💡</span>
                    <span>Profundizar en la reflexión metacognitiva: documentar más detalladamente el proceso de aprendizaje</span>
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <p className="font-semibold text-gray-900 flex items-start gap-3 text-base">
                    <span className="text-2xl">⭐</span>
                    <span>Continuar aprovechando la IA para hacer preguntas reflexivas - está teniendo muy buenos resultados</span>
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <p className="font-semibold text-gray-900 flex items-start gap-3 text-base">
                    <span className="text-2xl">🚀</span>
                    <span>Compartir más sus ideas creativas con el grupo durante las sesiones de trabajo</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-5 border-t-2 border-gray-300">
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Cerrar perfil
          </button>
        </div>
      </div>
    </div>
  );
}