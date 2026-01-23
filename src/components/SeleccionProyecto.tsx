import { Radio, Mic, Video, Newspaper, BookOpen, Plus, ArrowRight } from 'lucide-react';

interface TipoProyecto {
  id: string;
  nombre: string;
  descripcion: string;
  icon: any;
  color: string;
  departamentos: string[];
  ejemplo: string;
}

interface SeleccionProyectoProps {
  onSeleccionar: (proyectoId: string) => void;
}

const proyectosDisponibles: TipoProyecto[] = [
  {
    id: 'radio-podcast',
    nombre: 'Radio/Podcast Educativo',
    descripcion: 'Creación de programas de radio o podcast sobre temas educativos',
    icon: Radio,
    color: 'from-blue-600 to-purple-600',
    departamentos: ['Guion', 'Locución', 'Edición', 'Diseño Gráfico', 'Vestuario/Arte'],
    ejemplo: 'Podcast sobre cambio climático, historia, ciencia...'
  },
  {
    id: 'canal-youtube',
    nombre: 'Canal Educativo YouTube',
    descripcion: 'Producción de videos educativos para YouTube',
    icon: Video,
    color: 'from-red-600 to-pink-600',
    departamentos: ['Guion', 'Presentación', 'Grabación', 'Edición', 'Diseño'],
    ejemplo: 'Videos sobre experimentos, tutoriales, documentales...'
  },
  {
    id: 'periodico-digital',
    nombre: 'Periódico Digital Escolar',
    descripcion: 'Creación de un periódico digital con noticias escolares',
    icon: Newspaper,
    color: 'from-green-600 to-teal-600',
    departamentos: ['Redacción', 'Fotografía', 'Diseño', 'Redes Sociales', 'Coordinación'],
    ejemplo: 'Noticias del colegio, entrevistas, reportajes...'
  },
  {
    id: 'proyecto-personalizado',
    nombre: 'Proyecto Personalizado',
    descripcion: 'Define tu propio proyecto ABP con departamentos personalizados',
    icon: Plus,
    color: 'from-purple-600 to-indigo-600',
    departamentos: [],
    ejemplo: 'Crea tu proyecto desde cero con tus propias reglas'
  }
];

export function SeleccionProyecto({ onSeleccionar }: SeleccionProyectoProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Elige tu Proyecto ABP</h1>
          <p className="text-2xl text-white font-medium drop-shadow-md">
            Selecciona el tipo de proyecto que quieres realizar con tu clase
          </p>
        </div>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {proyectosDisponibles.map((proyecto) => {
            const Icon = proyecto.icon;
            return (
              <button
                key={proyecto.id}
                onClick={() => onSeleccionar(proyecto.id)}
                className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 text-left overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${proyecto.color} opacity-10 rounded-bl-full`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${proyecto.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-9 h-9 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{proyecto.nombre}</h2>
                  <p className="text-gray-700 mb-4 font-medium">{proyecto.descripcion}</p>
                  
                  {proyecto.departamentos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Departamentos:</p>
                      <div className="flex flex-wrap gap-2">
                        {proyecto.departamentos.map((dept, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 rounded-xl p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Ejemplo:</span> {proyecto.ejemplo}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                    <span>Seleccionar proyecto</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-white text-sm font-medium drop-shadow-md">
            💡 Puedes crear múltiples proyectos y gestionarlos de forma independiente
          </p>
        </div>
      </div>
    </div>
  );
}
