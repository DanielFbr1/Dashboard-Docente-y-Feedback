import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Grupo } from '../types';
import { generarRespuestaIA } from '../services/ai';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

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
  readOnly?: boolean;
  mostrarEjemplo?: boolean;
  proyectoNombre?: string;
}

const mensajesEjemplo: Mensaje[] = [
  {
    id: 'ex-1',
    tipo: 'alumno',
    contenido: '¿Cómo podemos empezar a organizar el podcast sobre cambio climático?',
    categoria: 'Organizativa',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 'ex-2',
    tipo: 'ia',
    contenido: 'Es una gran pregunta. Antes de dividir tareas, ¿habéis pensado qué impacto queréis causar en vuestros oyentes? ¿Qué es lo más importante que deberían aprender?',
    categoria: 'Creativa',
    timestamp: new Date(Date.now() - 3500000)
  },
  {
    id: 'ex-3',
    tipo: 'alumno',
    contenido: 'Queremos que entiendan que reciclar no es suficiente, hay que reducir el consumo.',
    categoria: 'Metacognitiva',
    timestamp: new Date(Date.now() - 3400000)
  },
  {
    id: 'ex-4',
    tipo: 'ia',
    contenido: 'Interesante enfoque. ¿Cómo creéis que podríais estructurar el guion para que ese mensaje sea el corazón del episodio sin que parezca un simple sermón?',
    categoria: 'Creativa',
    timestamp: new Date(Date.now() - 3300000)
  }
];

const preguntasSugeridas = [
  { texto: "¿Por dónde empezamos este proyecto?", categoria: 'Organizativa' as const },
  { texto: "¿Qué pasos deberíamos seguir ahora?", categoria: 'Organizativa' as const },
  { texto: "¿Cómo podemos mejorar nuestra idea?", categoria: 'Creativa' as const },
  { texto: "¿Qué nos falta para completar la tarea?", categoria: 'Metacognitiva' as const }
];

export function MentorChat({ grupo, onNuevoMensaje, readOnly, mostrarEjemplo, proyectoNombre }: ChatIAProps) {
  const { user, perfil } = useAuth();
  const isReadOnly = readOnly || perfil?.rol === 'profesor';
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [categoriaMensaje, setCategoriaMensaje] = useState<Mensaje['categoria']>('Creativa');
  const [escribiendo, setEscribiendo] = useState(false);
  const [loading, setLoading] = useState(true);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  // --- NUEVO: ESTADOS DE VOZ Y ESCRITURA MEJORADOS ---
  const [displayedContent, setDisplayedContent] = useState('');
  const [typingId, setTypingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // CONFIGURACIÓN: Por defecto muteado (true) y chequeo de permisos de Admin (grupo.configuracion)
  // Si config es undefined, asumimos TRUE (permitido) por compatibilidad
  const vozPermitidaAdmin = grupo.configuracion?.voz_activada ?? true;
  const microPermitidoAdmin = grupo.configuracion?.microfono_activado ?? true;

  const [isMuted, setIsMuted] = useState(true); // Solicitud usuario: desactivado por defecto
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Mejor precisión para comandos cortos
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.interimResults = true; // Ver lo que escucha en tiempo real

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Si hay resultado final, lo añadimos
        if (finalTranscript) {
          setInputMensaje((prev) => prev + (prev ? ' ' : '') + finalTranscript);
          setIsListening(false);
        }
        // Podríamos mostrar interimTranscript en algún sitio, pero por ahora simplificamos
        // Para feedback visual inmediato, podríamos usar un placeholder dinámico
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Error de voz:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
    setIsMuted(!isMuted);
  };

  const cleanTextForTTS = (text: string) => {
    return text
      .replace(/[*#_`]/g, '') // Markdown chars
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1F200}-\u{1F2FF}\u{1F004}\u{1F0CF}\u{1F170}\u{1F171}\u{1F17E}\u{1F17F}\u{1F18E}\u{1F191}-\u{1F19A}]/gu, '') // Emojis
      .trim();
  };

  const speakText = (text: string) => {
    if (isMuted || !text) return;
    window.speechSynthesis.cancel();

    const cleanText = cleanTextForTTS(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';

    // Intentar seleccionar una voz "Google" o "Microsoft" que suelen ser más naturales
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v =>
      (v.name.includes('Google') || v.name.includes('Microsoft')) && v.lang.includes('es')
    );

    if (naturalVoice) {
      utterance.voice = naturalVoice;
      // Ajustes sutiles para sonar menos robótico
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Efecto de escritura robusto
  useEffect(() => {
    if (!typingId) return;

    const messageToType = mensajes.find(m => m.id === typingId);
    if (!messageToType || !messageToType.contenido) return;

    const text = messageToType.contenido;
    let i = 0;

    setDisplayedContent('');

    // --- CAMBIO: Hablar AL PRINCIPIO (Simultáneo) ---
    speakText(text);

    const typeChar = () => {
      setDisplayedContent(text.substring(0, i + 1));
      i++;
      scrollToBottom();

      if (i < text.length) {
        const randomSpeed = Math.floor(Math.random() * 15) + 20; // 20-35ms (Rápido para igualar voz fluida)
        setTimeout(typeChar, randomSpeed);
      } else {
        setTypingId(null);
        // Ya no hablamos al final
      }
    };

    setTimeout(typeChar, 100);

  }, [typingId]);
  // ----------------------------------------

  useEffect(() => {
    fetchMensajes();
  }, [grupo.id, mostrarEjemplo]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const fetchMensajes = async () => {
    if (mostrarEjemplo) {
      setMensajes(mensajesEjemplo);
      setLoading(false);
      return;
    }

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
    if (mostrarEjemplo) {
      toast.info("¡Buen intento! Pero esto es solo una demostración interactiva. El chat real estará disponible cuando te unas a un grupo.");
      return;
    }

    const mensajeTexto = texto || inputMensaje.trim();
    if (!mensajeTexto) return;

    const categoriaDetectada = categoria || detectarCategoria(mensajeTexto);

    // 1. Mensaje temporal del alumno (Optimistic Update)
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
      const { error: errorAlumno } = await supabase.from('mensajes_chat').insert([{
        grupo_id: grupo.id,
        usuario_id: user?.id,
        tipo: 'user',
        contenido: mensajeTexto
      }]);

      if (errorAlumno) throw errorAlumno;

      // 3. Obtener respuesta de IA con MEMORIA (Historial completo)
      // Pasamos el historial previo. generarRespuestaIA añadirá el mensajeUsuario al final automáticamente.
      const historialParaIA = mensajes.map(m => ({
        role: (m.tipo === 'ia' ? 'assistant' : 'user') as 'assistant' | 'user' | 'system',
        content: m.contenido
      }));

      const respuestaTexto = await generarRespuestaIA(
        mensajeTexto,
        grupo.nombre, // Nombre del Grupo
        mostrarEjemplo ? 'Proyecto Demo' : (proyectoNombre || 'Proyecto'), // Nombre del Proyecto
        historialParaIA,
        grupo.hitos || [] // Tareas del grupo
      );

      // 4. Guardar mensaje de IA en Base de Datos
      const { error: errorIA } = await supabase.from('mensajes_chat').insert([{
        grupo_id: grupo.id,
        tipo: 'assistant',
        contenido: respuestaTexto
      }]);

      if (errorIA) {
        console.error("Error guardando IA en DB:", errorIA);
      }

      // 5. ACTUALIZAR MÉTRICA: Incrementar interacciones_ia del grupo RPC
      await supabase.rpc('incrementar_interacciones_ia', { grupo_id_param: grupo.id });

      // 6. Mensaje real de IA en local
      const mensajeIA: Mensaje = {
        id: `temp-ia-${Date.now()}`,
        tipo: 'ia',
        contenido: respuestaTexto,
        categoria: categoriaDetectada,
        timestamp: new Date()
      };

      setMensajes((prev) => [...prev, mensajeIA]);
      // TRIGGER TYPEWRITER
      setTypingId(mensajeIA.id);

      if (onNuevoMensaje) {
        onNuevoMensaje(mensajeAlumno);
        onNuevoMensaje(mensajeIA);
      }
    } catch (error) {
      console.error("❌ Error grave en backend de Chat:", error);
      // Podríamos mostrar un error visual al usuario aquí
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
      <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Mentor IA <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded ml-1">v3.4 (Fast)</span></h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SISTEMA SOCRÁTICO ACTIVO</p>
          </div>
        </div>
        {vozPermitidaAdmin && (
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-slate-700 text-slate-400' : 'bg-slate-700 text-white'}`}
            title={isMuted ? "Activar voz" : "Silenciar voz"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>


      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {isReadOnly ? 'Aún no hay mensajes' : '¡Hola! Soy tu Mentor IA'}
            </h4>
            <p className="text-gray-600 mb-6 max-w-md text-sm">
              {isReadOnly
                ? 'El grupo todavía no ha iniciado la conversación con el mentor socrático.'
                : 'Estoy aquí para ayudaros a reflexionar sobre vuestro proyecto. ¿En qué puedo ayudaros hoy?'}
            </p>
            {!isReadOnly && (
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
            )}
          </div>
        ) : (
          /* ... list messages logic ... */
          <>
            {mensajes.map((mensaje) => {
              // Lógica de visualización parcial
              const isTypingThis = typingId === mensaje.id;
              const contentToShow = isTypingThis ? displayedContent : mensaje.contenido;

              return (
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
                      <p className="text-sm leading-relaxed">
                        {contentToShow}
                        {isTypingThis && (
                          <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-blue-500 animate-pulse"></span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            {escribiendo && !typingId && (
              /* ... bounce animation ... */
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

      {/* Input / ReadOnly Banner */}
      <div className="border-t border-gray-100 p-4 bg-white">
        {isReadOnly ? (
          <div className="flex items-center justify-center gap-3 py-2 text-slate-400 italic text-sm">
            <Bot className="w-4 h-4 opacity-50" />
            <span>Modo supervisión: Estás viendo la conversación del grupo</span>
          </div>
        ) : (
          <div className="flex gap-2">
            {speechSupported && microPermitidoAdmin && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${isListening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                title="Dictar pregunta"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <input
              type="text"
              value={inputMensaje}
              onChange={(e) => setInputMensaje(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
              placeholder={isListening ? "Escuchando..." : "Escribe una pregunta al mentor..."}
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
        )}
      </div>
    </div>
  );
}
