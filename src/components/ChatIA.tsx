import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Grupo } from '../types';
import { generarRespuestaIA } from '../services/ai';

interface Mensaje {
  id: string;
  tipo: 'alumno' | 'ia';
  contenido: string;
  categoria: 'Metacognitiva' | 'Técnica' | 'Organizativa' | 'Creativa';
  timestamp: Date;
}

interface ChatIAProps {
  grupo: Grupo;
  onNuevoMensaje?: (mensaje: Mensaje) => void;
}

// Respuestas de la IA según categorías
const respuestasIA = {
  Metacognitiva: [
    "¿Por qué crees que esa estrategia funcionaría mejor en este caso?",
    "¿Qué has aprendido del proceso hasta ahora?",
    "¿Cómo sabrás que has logrado tu objetivo?",
    "Interesante reflexión. ¿Qué te hace pensar de esa manera?",
    "¿Qué dificultades has encontrado y cómo las has superado?"
  ],
  Técnica: [
    "Para eso, podríais investigar herramientas como Audacity (gratuito) o GarageBand. ¿Qué características necesitáis específicamente?",
    "Hay varias opciones gratuitas: Canva para diseño, GIMP para edición de imágenes. ¿Habéis probado alguna?",
    "Esa técnica se puede lograr con edición básica. ¿Habéis buscado tutoriales sobre cómo hacerlo?",
    "Buena pregunta. Primero pensad: ¿qué necesitáis hacer exactamente? Luego podemos buscar la herramienta adecuada.",
    "Existen recursos gratuitos online. ¿Qué tal si investigáis 2-3 opciones y comparáis sus ventajas?"
  ],
  Organizativa: [
    "¿Qué habilidades tiene cada miembro del equipo? ¿Cómo podríais aprovecharlas?",
    "¿Habéis pensado en crear un calendario con hitos y responsables?",
    "¿Qué pasaría si asignáis roles rotativos para que todos experimenten diferentes tareas?",
    "Cuando hay conflictos, ¿habéis probado a hablar abiertamente como equipo sobre lo que cada uno necesita?",
    "¿Y si hacéis reuniones breves diarias de 5 minutos para sincronizaros?"
  ],
  Creativa: [
    "¿Qué os sorprendería encontrar en un proyecto como este? ¿Podríais incluirlo?",
    "Pensad en vuestros podcasts/vídeos favoritos. ¿Qué los hace especiales?",
    "¿Cómo podríais darle un giro original a este tema?",
    "Excelente idea. ¿Qué pasaría si lo lleváis un paso más allá?",
    "¿Qué formatos o estilos diferentes podríais explorar?"
  ]
};

// Preguntas iniciales sugeridas
const preguntasSugeridas = [
  { texto: "¿Cómo podemos enganchar a nuestra audiencia desde el inicio?", categoria: 'Creativa' as const },
  { texto: "¿Qué herramientas necesitamos para editar audio?", categoria: 'Técnica' as const },
  { texto: "¿Cómo dividimos el trabajo entre nosotros?", categoria: 'Organizativa' as const },
  { texto: "¿Qué hemos aprendido hasta ahora del proyecto?", categoria: 'Metacognitiva' as const }
];

export function ChatIA({ grupo, onNuevoMensaje }: ChatIAProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [categoriaMensaje, setCategoriaMensaje] = useState<Mensaje['categoria']>('Creativa');
  const [escribiendo, setEscribiendo] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const detectarCategoria = (texto: string): Mensaje['categoria'] => {
    const textoLower = texto.toLowerCase();

    if (textoLower.includes('cómo') && (textoLower.includes('siento') || textoLower.includes('pienso') || textoLower.includes('aprendido') || textoLower.includes('proceso'))) {
      return 'Metacognitiva';
    }
    if (textoLower.includes('herramienta') || textoLower.includes('programa') || textoLower.includes('técnica') || textoLower.includes('cómo hacer')) {
      return 'Técnica';
    }
    if (textoLower.includes('dividir') || textoLower.includes('organizar') || textoLower.includes('repartir') || textoLower.includes('equipo')) {
      return 'Organizativa';
    }
    return 'Creativa';
  };

  const obtenerRespuestaIA = (categoria: Mensaje['categoria']): string => {
    const respuestas = respuestasIA[categoria];
    return respuestas[Math.floor(Math.random() * respuestas.length)];
  };

  const enviarMensaje = async (texto?: string, categoria?: Mensaje['categoria']) => {
    const mensajeTexto = texto || inputMensaje.trim();
    if (!mensajeTexto) return;

    const categoriaDetectada = categoria || detectarCategoria(mensajeTexto);

    // Mensaje del alumno
    const mensajeAlumno: Mensaje = {
      id: Date.now().toString(),
      tipo: 'alumno',
      contenido: mensajeTexto,
      categoria: categoriaDetectada,
      timestamp: new Date()
    };

    setMensajes((prev: Mensaje[]) => [...prev, mensajeAlumno]);
    setInputMensaje('');
    setEscribiendo(true);

    try {
      const respuestaTexto = await generarRespuestaIA(mensajeTexto); // Use the service

      const mensajeIA: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        contenido: respuestaTexto,
        categoria: categoriaDetectada,
        timestamp: new Date()
      };

      setMensajes((prev: Mensaje[]) => [...prev, mensajeIA]);

      // Notificar nuevo mensaje si hay callback
      if (onNuevoMensaje) {
        onNuevoMensaje(mensajeAlumno);
        onNuevoMensaje(mensajeIA);
      }
    } catch (error) {
      console.error("Error al obtener respuesta IA", error);
    } finally {
      setEscribiendo(false);
    }
  };

  const getTipoColor = (tipo: Mensaje['categoria']) => {
    switch (tipo) {
      case 'Metacognitiva':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Técnica':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Organizativa':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Creativa':
        return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">Mentor IA</h3>
            <p className="text-xs text-blue-100">Chat interactivo para {grupo.nombre}</p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">¡Hola! Soy tu Mentor IA</h4>
            <p className="text-gray-600 mb-6 max-w-md">
              Estoy aquí para ayudaros con preguntas reflexivas y también respuestas directas cuando las necesitéis.
              ¿En qué puedo ayudaros hoy?
            </p>

            <div className="w-full max-w-md">
              <p className="text-sm font-medium text-gray-700 mb-3">Preguntas sugeridas:</p>
              <div className="grid grid-cols-1 gap-2">
                {preguntasSugeridas.map((pregunta, index) => (
                  <button
                    key={index}
                    onClick={() => enviarMensaje(pregunta.texto, pregunta.categoria)}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm"
                  >
                    {pregunta.texto}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`mb-4 ${mensaje.tipo === 'alumno' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div className={`max-w-[80%] ${mensaje.tipo === 'alumno' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {mensaje.tipo === 'ia' && <Bot className="w-4 h-4 text-gray-600" />}
                    <span className="text-xs font-medium text-gray-600">
                      {mensaje.tipo === 'ia' ? 'Mentor IA' : 'Tú'}
                    </span>
                    {mensaje.tipo === 'alumno' && <User className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${mensaje.tipo === 'alumno'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'
                      }`}
                  >
                    {mensaje.contenido}
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${getTipoColor(mensaje.categoria)}`}>
                      {mensaje.categoria}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {escribiendo && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Mentor IA</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-gray-200 text-gray-900 rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={mensajesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2 mb-2">
          {(['Metacognitiva', 'Técnica', 'Organizativa', 'Creativa'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaMensaje(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${categoriaMensaje === cat
                ? getTipoColor(cat)
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMensaje}
            onChange={(e) => setInputMensaje(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={escribiendo}
          />
          <button
            onClick={() => enviarMensaje()}
            disabled={!inputMensaje.trim() || escribiendo}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
