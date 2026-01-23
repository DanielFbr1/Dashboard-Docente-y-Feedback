import { ArrowLeft } from 'lucide-react';
import { Grupo } from '../App';
import { Mensaje_Alumno } from './Mensaje_Alumno';
import { Mensaje_IA } from './Mensaje_IA';

interface FeedbackAlumnoIAProps {
  grupo: Grupo;
  onBack: () => void;
}

interface Mensaje {
  tipo: 'alumno' | 'ia';
  contenido: string;
  categoria: 'Metacognitiva' | 'Técnica' | 'Organizativa' | 'Creativa';
}

interface Criterio {
  nombre: string;
  niveles: {
    insuficiente: boolean;
    suficiente: boolean;
    notable: boolean;
    sobresaliente: boolean;
  };
}

export function FeedbackAlumnoIA({ grupo, onBack }: FeedbackAlumnoIAProps) {
  const mensajes: Mensaje[] = [
    {
      tipo: 'alumno',
      contenido: '¿Cómo podemos empezar nuestro guion para enganchar a la audiencia?',
      categoria: 'Creativa'
    },
    {
      tipo: 'ia',
      contenido: '¿Qué emoción quieres que sientan en los primeros segundos? ¿Conoces algún programa que te haya enganchado desde el inicio?',
      categoria: 'Creativa'
    },
    {
      tipo: 'alumno',
      contenido: 'Queremos sorprenderlos. Hemos visto programas que empiezan con una pregunta interesante.',
      categoria: 'Creativa'
    },
    {
      tipo: 'ia',
      contenido: 'Excelente observación. Una buena forma de enganchar es empezar con una pregunta intrigante o un dato sorprendente. Por ejemplo: "¿Sabías que..." o "¿Qué pasaría si...?". ¿Sobre qué tema vais a hablar?',
      categoria: 'Creativa'
    },
    {
      tipo: 'alumno',
      contenido: '¿Cómo dividimos el trabajo entre los miembros del equipo?',
      categoria: 'Organizativa'
    },
    {
      tipo: 'ia',
      contenido: '¿Qué habilidades tiene cada uno de vosotros? ¿Cómo podríais aprovechar lo que cada persona hace mejor? Pensad en roles como: investigador, redactor, revisor...',
      categoria: 'Organizativa'
    },
    {
      tipo: 'alumno',
      contenido: '¿Qué programa usamos para editar el audio?',
      categoria: 'Técnica'
    },
    {
      tipo: 'ia',
      contenido: 'Para editar audio en educación, Audacity es una excelente opción: es gratuito, fácil de usar y muy completo. También podéis probar GarageBand si usáis Mac. ¿Qué necesitáis hacer exactamente: cortar, mezclar, añadir efectos?',
      categoria: 'Técnica'
    }
  ];

  const criterios: Criterio[] = [
    {
      nombre: 'Colaboración',
      niveles: { insuficiente: false, suficiente: false, notable: true, sobresaliente: false }
    },
    {
      nombre: 'Uso crítico de la IA',
      niveles: { insuficiente: false, suficiente: false, notable: false, sobresaliente: true }
    },
    {
      nombre: 'Calidad del producto',
      niveles: { insuficiente: false, suficiente: false, notable: true, sobresaliente: false }
    },
    {
      nombre: 'Reflexión',
      niveles: { insuficiente: false, suficiente: true, notable: false, sobresaliente: false }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a detalle del grupo</span>
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-4">{grupo.nombre}</h1>
      </header>

      {/* Content */}
      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Historial de interacción */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Interacción alumno–IA</h2>
            
            <div className="flex flex-col max-h-[600px] overflow-y-auto pr-2">
              {mensajes.map((mensaje, index) => (
                mensaje.tipo === 'alumno' ? (
                  <Mensaje_Alumno 
                    key={index}
                    mensaje={mensaje.contenido}
                    tipo={mensaje.categoria}
                  />
                ) : (
                  <Mensaje_IA 
                    key={index}
                    mensaje={mensaje.contenido}
                    tipo={mensaje.categoria}
                  />
                )
              ))}
            </div>
          </div>

          {/* Columna derecha: Evaluación y reflexión */}
          <div className="flex flex-col gap-6">
            {/* Rúbrica del grupo */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rúbrica del grupo</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 pr-4 font-medium text-gray-700">Criterio</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-700">Insuf.</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-700">Suf.</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-700">Not.</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-700">Sobr.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criterios.map((criterio, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 pr-4 text-gray-900">{criterio.nombre}</td>
                        <td className="py-3 px-2 text-center">
                          {criterio.niveles.insuficiente && (
                            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto"></div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {criterio.niveles.suficiente && (
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto"></div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {criterio.niveles.notable && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto"></div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {criterio.niveles.sobresaliente && (
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Autoevaluación del alumnado */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Autoevaluación del alumnado</h2>
              
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Nos hemos organizado bien</span>
                    <span className="font-medium">8/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value="8" 
                    readOnly
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Hemos usado la IA para pensar mejor</span>
                    <span className="font-medium">9/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value="9" 
                    readOnly
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Estamos satisfechos con nuestro resultado</span>
                    <span className="font-medium">7/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value="7" 
                    readOnly
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Comentarios del docente */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Comentarios del docente</h2>
              
              <textarea 
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe tus comentarios aquí..."
                defaultValue="Excelente trabajo en equipo. Han sabido aprovechar las preguntas de la IA para profundizar en su proceso creativo. Destacan en el uso crítico de la tecnología. Sugiero trabajar más en la fase de reflexión final para documentar mejor su aprendizaje."
                readOnly
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}