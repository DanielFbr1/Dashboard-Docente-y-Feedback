import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { Grupo } from '../types';
import { generarRespuestaIA } from '../services/ai';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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

const preguntasSugeridas = [
  { texto: "¿Cómo podemos enganchar a nuestra audiencia desde el inicio?", categoria: 'Creativa' as const },
  { texto: "¿Qué herramientas necesitamos para editar audio?", categoria: 'Técnica' as const },
  { texto: "¿Cómo dividimos el trabajo entre nosotros?", categoria: 'Organizativa' as const },
  { texto: "¿Qué hemos aprendido hasta ahora del proyecto?", categoria: 'Metacognitiva' as const }
];

export function ChatIA({ grupo, onNuevoMensaje }: ChatIAProps) {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [categoriaMensaje, setCategoriaMensaje] = useState<Mensaje['categoria']>('Creativa');
  const [escribiendo, setEscribiendo] = useState(false);
  const [loading, setLoading] = useState(true);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMensajes();
  }, [grupo.id]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const fetchMensajes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mensajes_chat')
        .select('*')
        .eq('grupo_id', grupo.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const adaptiveMessages: Mensaje[] = (data || []).map(m => ({
        id: m.id.toString(),
        tipo: m.tipo === 'assistant' ? 'ia' : 'alumno',
        contenido: m.contenido,
        categoria: 'Creativa', // Default if not in DB
        timestamp: new Date(m.created_at)
      }));

      setMensajes(adaptiveMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectarCategoria = (texto: string): Mensaje['categoria'] => {
    const textoLower = texto.toLowerCase();
    if (textoLower.includes('cómo') && (textoLower.includes('siento') || textoLower.includes('pienso') || textoLower.includes('aprendido'))) return 'Metacognitiva';
    if (textoLower.includes('herramienta') || textoLower.includes('programa') || textoLower.includes('técnica')) return 'Técnica';
    if (textoLower.includes('dividir') || textoLower.includes('organizar') || textoLower.includes('repartir')) return 'Organizativa';
    return 'Creativa';
  };

  const enviarMensaje = async (texto?: string, categoria?: Mensaje['categoria']) => {
    const mensajeTexto = texto || inputMensaje.trim();
    if (!mensajeTexto) return;

    const categoriaDetectada = categoria || detectarCategoria(mensajeTexto);

    // 1. Guardar mensaje del alumno en local
    const mensajeAlumno: Mensaje = {
      id: `temp-${Date.now()}`,
      tipo: 'alumno',
      contenido: mensajeTexto,
      categoria: categoriaDetectada,
      timestamp: new Date()
    };

    setMensajes((prev) => [...prev, mensajeAlumno]);
    setInputMensaje('');
    setEscribiendo(true);

    try {
      // 2. Guardar en Base de Datos (Alumno)
      await supabase.from('mensajes_chat').insert([{
        grupo_id: grupo.id,
        usuario_id: user?.id,
        tipo: 'user',
        contenido: mensajeTexto
      }]);

      // 3. Obtener respuesta de IA
      const respuestaTexto = await generarRespuestaIA(mensajeTexto, mensajes.map(m => ({
        role: m.tipo === 'ia' ? 'assistant' : 'user',
        content: m.contenido
      })));

      // 4. Guardar mensaje de IA en local
      const mensajeIA: Mensaje = {
        id: `temp-ia-${Date.now()}`,
        tipo: 'ia',
        contenido: respuestaTexto,
        categoria: categoriaDetectada,
        timestamp: new Date()
      };

      setMensajes((prev) => [...prev, mensajeIA]);

      // 5. Guardar en Base de Datos (IA)
      await supabase.from('mensajes_chat').insert([{
        grupo_id: grupo.id,
        tipo: 'assistant',
        contenido: respuestaTexto
      }]);

      if (onNuevoMensaje) {
        onNuevoMensaje(mensajeAlumno);
        onNuevoMensaje(mensajeIA);
      }
    } catch (error) {
      console.error("Error al procesar el chat", error);
    } finally {
      setEscribiendo(false);
    }
  };

  const getTipoColor = (tipo: Mensaje['categoria']) => {
    switch (tipo) {
      case 'Metacognitiva': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Técnica': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Organizativa': return 'bg-green-100 text-green-700 border-green-300';
      case 'Creativa': return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[600px] items-center justify-center bg-white border-2 border-gray-200 rounded-lg">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-gray-500 text-sm">Cargando chat socrático...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Mentor IA</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SISTEMA SOCRÁTICO ACTIVO</p>
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
            <p className="text-gray-600 mb-6 max-w-md text-sm">
              Estoy aquí para ayudaros a reflexionar sobre vuestro proyecto. ¿En qué puedo ayudaros hoy?
            </p>
            <div className="w-full max-w-md">
              <div className="grid grid-cols-1 gap-2">
                {preguntasSugeridas.map((pregunta, index) => (
                  <button
                    key={index}
                    onClick={() => enviarMensaje(pregunta.texto, pregunta.categoria)}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-xs text-gray-700 shadow-sm"
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
                <div className={`max-w-[85%] ${mensaje.tipo === 'alumno' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {mensaje.tipo === 'ia' && <Bot className="w-4 h-4 text-gray-600" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {mensaje.tipo === 'ia' ? 'Mentor IA' : 'Estudiante'}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl ${mensaje.tipo === 'alumno'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none shadow-sm'
                      }`}
                  >
                    <p className="text-sm leading-relaxed">{mensaje.contenido}</p>
                  </div>
                </div>
              </div>
            ))}
            {escribiendo && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4 text-gray-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mentor IA</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-900 rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
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
      <div className="border-t border-gray-100 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMensaje}
            onChange={(e) => setInputMensaje(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
            placeholder="Escribe una pregunta al mentor..."
            className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={escribiendo}
          />
          <button
            onClick={() => enviarMensaje()}
            disabled={!inputMensaje.trim() || escribiendo}
            className="w-12 h-12 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
