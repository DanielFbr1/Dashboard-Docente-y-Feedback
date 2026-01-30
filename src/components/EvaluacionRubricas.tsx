import { ClipboardCheck, BookOpen, Target, Download, FileText, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { ListaAlumnos } from './ListaAlumnos';
import { Grupo } from '../types';

interface Criterio {
  nombre: string;
  descripcion: string;
  niveles: {
    insuficiente: { puntos: string; descripcion: string };
    suficiente: { puntos: string; descripcion: string };
    notable: { puntos: string; descripcion: string };
    sobresaliente: { puntos: string; descripcion: string };
  };
}

interface EvaluacionRubricasProps {
  grupos?: Grupo[];
}

export function EvaluacionRubricas({ grupos = [] }: EvaluacionRubricasProps) {
  const [vistaActiva, setVistaActiva] = useState<'rubricas' | 'alumnos'>('rubricas');

  const criterios: Criterio[] = [
    {
      nombre: 'Colaboración y trabajo en equipo',
      descripcion: 'Capacidad para trabajar de forma coordinada, respetar roles y aportar al grupo',
      niveles: {
        insuficiente: {
          puntos: '1-4',
          descripcion: 'Dificultades para colaborar. Participación mínima. No respeta roles ni tiempos del equipo.'
        },
        suficiente: {
          puntos: '5-6',
          descripcion: 'Colabora cuando se le solicita. Respeta roles básicos. Aporta ocasionalmente al grupo.'
        },
        notable: {
          puntos: '7-8',
          descripcion: 'Colabora activamente. Respeta y apoya roles. Aporta ideas y ayuda a resolver conflictos.'
        },
        sobresaliente: {
          puntos: '9-10',
          descripcion: 'Lidera colaboración. Facilita el trabajo del equipo. Aporta soluciones creativas y motiva.'
        }
      }
    },
    {
      nombre: 'Uso crítico de la IA como mentor',
      descripcion: 'Capacidad para usar la IA de forma reflexiva, profundizando en el pensamiento',
      niveles: {
        insuficiente: {
          puntos: '1-4',
          descripcion: 'Apenas usa la IA o busca respuestas directas sin reflexionar sobre las preguntas.'
        },
        suficiente: {
          puntos: '5-6',
          descripcion: 'Usa la IA de forma básica. Responde a las preguntas pero sin profundizar mucho.'
        },
        notable: {
          puntos: '7-8',
          descripcion: 'Usa la IA para pensar mejor. Reflexiona sobre las preguntas y mejora sus ideas.'
        },
        sobresaliente: {
          puntos: '9-10',
          descripcion: 'Aprovecha al máximo la IA. Genera conversaciones profundas y aplica aprendizajes.'
        }
      }
    },
    {
      nombre: 'Calidad del producto final',
      descripcion: 'Creatividad, originalidad, técnica y presentación del producto audiovisual',
      niveles: {
        insuficiente: {
          puntos: '1-4',
          descripcion: 'Producto incompleto o muy básico. Falta creatividad y cuidado en la ejecución.'
        },
        suficiente: {
          puntos: '5-6',
          descripcion: 'Producto completo pero con poca originalidad. Técnica correcta pero sin destacar.'
        },
        notable: {
          puntos: '7-8',
          descripcion: 'Producto bien elaborado, creativo y con buena técnica. Presenta identidad propia.'
        },
        sobresaliente: {
          puntos: '9-10',
          descripcion: 'Producto excelente, muy creativo y profesional. Técnica depurada y resultado impactante.'
        }
      }
    },
    {
      nombre: 'Reflexión sobre el aprendizaje',
      descripcion: 'Capacidad para identificar qué han aprendido y cómo han crecido en el proceso',
      niveles: {
        insuficiente: {
          puntos: '1-4',
          descripcion: 'No reflexiona sobre el proceso. Dificultad para identificar aprendizajes.'
        },
        suficiente: {
          puntos: '5-6',
          descripcion: 'Reflexiona de forma superficial. Identifica algunos aprendizajes básicos.'
        },
        notable: {
          puntos: '7-8',
          descripcion: 'Reflexiona con profundidad. Identifica aprendizajes y áreas de mejora claramente.'
        },
        sobresaliente: {
          puntos: '9-10',
          descripcion: 'Reflexión profunda y metacognitiva. Conecta aprendizajes y propone mejoras concretas.'
        }
      }
    }
  ];

  const instrumentosEvaluacion = [
    {
      titulo: 'Observación directa',
      icon: Target,
      descripcion: 'El docente observa el trabajo diario en clase',
      items: ['Dinámica de grupo', 'Resolución de conflictos', 'Uso de herramientas', 'Interacciones con IA']
    },
    {
      titulo: 'Rúbrica analítica',
      icon: ClipboardCheck,
      descripcion: 'Evaluación detallada por criterios (ver abajo)',
      items: ['4 criterios principales', 'Niveles de 1 a 10', 'Descriptores claros', 'Ponderación equilibrada']
    },
    {
      titulo: 'Autoevaluación del alumnado',
      icon: BookOpen,
      descripcion: 'El grupo reflexiona sobre su propio proceso',
      items: ['Organización del equipo', 'Uso de la IA', 'Satisfacción con resultado', 'Aprendizajes adquiridos']
    },
    {
      titulo: 'Producto final',
      icon: Sparkles,
      descripcion: 'Evaluación del podcast/vídeo educativo',
      items: ['Creatividad y originalidad', 'Técnica (audio/vídeo)', 'Contenido educativo', 'Presentación final']
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Vista de rúbricas (Única vista ahora) */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sistema de evaluación ABP + IA</h2>
            <p className="text-gray-700 mb-4">
              Este sistema de evaluación está diseñado para valorar no solo el producto final, sino todo el proceso de aprendizaje,
              incluyendo cómo el alumnado utiliza la IA como herramienta de pensamiento crítico.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white text-blue-700 text-sm font-medium rounded-full shadow-sm">Evaluación por competencias</span>
              <span className="px-3 py-1 bg-white text-purple-700 text-sm font-medium rounded-full shadow-sm">Metodología socrática</span>
              <span className="px-3 py-1 bg-white text-green-700 text-sm font-medium rounded-full shadow-sm">Autoevaluación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instrumentos de evaluación */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Instrumentos de evaluación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instrumentosEvaluacion.map((instrumento) => {
            const Icon = instrumento.icon;
            return (
              <div key={instrumento.titulo} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="font-semibold text-gray-900">{instrumento.titulo}</div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{instrumento.descripcion}</p>
                <ul className="space-y-1">
                  {instrumento.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rúbrica detallada */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Rúbrica analítica detallada
          </h2>
          <button
            onClick={() => {
              const content = criterios.map(c =>
                `CRITERIO: ${c.nombre}\n${c.descripcion}\n\n` +
                `NIVELES:\n` +
                `- Insuficiente (${c.niveles.insuficiente.puntos}): ${c.niveles.insuficiente.descripcion}\n` +
                `- Suficiente (${c.niveles.suficiente.puntos}): ${c.niveles.suficiente.descripcion}\n` +
                `- Notable (${c.niveles.notable.puntos}): ${c.niveles.notable.descripcion}\n` +
                `- Sobresaliente (${c.niveles.sobresaliente.puntos}): ${c.niveles.sobresaliente.descripcion}\n` +
                `---------------------------------------------------\n`
              ).join('\n');

              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Rubrica_Evaluacion_ABP.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Descargar rúbrica (TXT)
          </button>
        </div>

        <div className="space-y-6">
          {criterios.map((criterio, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-1">{criterio.nombre}</h3>
                <p className="text-sm text-gray-600">{criterio.descripcion}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700 w-1/5">Nivel</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">Descripción</th>
                      <th className="text-center px-5 py-3 text-sm font-semibold text-gray-700 w-24">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full border border-red-300">
                          Insuficiente
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{criterio.niveles.insuficiente.descripcion}</td>
                      <td className="px-5 py-4 text-center font-semibold text-gray-900">{criterio.niveles.insuficiente.puntos}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-yellow-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full border border-yellow-300">
                          Suficiente
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{criterio.niveles.suficiente.descripcion}</td>
                      <td className="px-5 py-4 text-center font-semibold text-gray-900">{criterio.niveles.suficiente.puntos}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-300">
                          Notable
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{criterio.niveles.notable.descripcion}</td>
                      <td className="px-5 py-4 text-center font-semibold text-gray-900">{criterio.niveles.notable.puntos}</td>
                    </tr>
                    <tr className="hover:bg-green-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full border border-green-300">
                          Sobresaliente
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{criterio.niveles.sobresaliente.descripcion}</td>
                      <td className="px-5 py-4 text-center font-semibold text-gray-900">{criterio.niveles.sobresaliente.puntos}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ejemplo práctico */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          Ejemplo de evaluación: Grupo 2 - Locución
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Colaboración y trabajo en equipo</div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-300">
                Notable
              </div>
              <div className="font-semibold text-gray-900">8 puntos</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Uso crítico de la IA como mentor</div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full border border-green-300">
                Sobresaliente
              </div>
              <div className="font-semibold text-gray-900">9 puntos</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Calidad del producto final</div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-300">
                Notable
              </div>
              <div className="font-semibold text-gray-900">8 puntos</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Reflexión sobre el aprendizaje</div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full border border-yellow-300">
                Suficiente
              </div>
              <div className="font-semibold text-gray-900">6 puntos</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Nota final (promedio):</span>
            <span className="text-2xl font-bold text-green-700">7.75 / 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}