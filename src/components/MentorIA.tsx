import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { generarRespuestaIA } from '../services/ai';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Mensaje {
    id: string;
    created_at: string;
    grupo_id: string;
    remitente: string;
    contenido: string;
    tipo: 'alumno' | 'ia';
}

interface MentorIAProps {
    grupoId: string;
    proyectoId: string;
    departamento: string;
    miembro: string;
}

export function MentorIA({ grupoId, proyectoId, departamento, miembro }: MentorIAProps) {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Estado para el efecto de escritura
    const [displayedContent, setDisplayedContent] = useState('');
    const [typingId, setTypingId] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchMensajes();
    }, [grupoId]);

    // Efecto de escritura robusto
    useEffect(() => {
        if (!typingId) return;

        const messageToType = mensajes.find(m => m.id === typingId);
        if (!messageToType || !messageToType.contenido) return;

        const text = messageToType.contenido;
        let i = 0;

        // Limpiamos contenido previo por seguridad
        setDisplayedContent('');

        // Velocidad variable para más realismo (entre 10 y 30ms)
        const typeChar = () => {
            setDisplayedContent(text.substring(0, i + 1));
            i++;
            scrollToBottom();

            if (i < text.length) {
                const randomSpeed = Math.floor(Math.random() * 20) + 10;
                setTimeout(typeChar, randomSpeed);
            } else {
                setTypingId(null); // Fin del typing
            }
        };

        // Pequeño delay inicial para asegurar renderizado correcto
        setTimeout(typeChar, 100);

    }, [typingId]);
    // TypingId controla el trigger

    const fetchMensajes = async () => {
        const { data } = await supabase
            .from('mensajes_chat')
            .select('*')
            .eq('grupo_id', grupoId)
            .order('created_at', { ascending: true });

        if (data) {
            setMensajes(data);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setLoading(true);

        try {
            const { data: newMsg } = await supabase
                .from('mensajes_chat')
                .insert([{
                    grupo_id: grupoId,
                    remitente: miembro,
                    contenido: userMsg,
                    tipo: 'alumno'
                }])
                .select()
                .single();

            if (newMsg) setMensajes(prev => [...prev, newMsg]);

            const historial = mensajes.slice(-50).map(m => ({
                role: m.tipo === 'alumno' ? 'user' as const : 'assistant' as const,
                content: m.contenido
            }));

            const respuesta = await generarRespuestaIA(userMsg, departamento, "Proyecto ABP", historial);

            const { data: iaMsg } = await supabase
                .from('mensajes_chat')
                .insert([{
                    grupo_id: grupoId,
                    remitente: 'Mentor IA',
                    contenido: respuesta,
                    tipo: 'ia'
                }])
                .select()
                .single();

            if (iaMsg) {
                // Añadimos el mensaje y luego lanzamos el typing
                setMensajes(prev => [...prev, iaMsg]);
                setTypingId(iaMsg.id); // Esto disparará el efecto
            }

        } catch (error) {
            toast.error('Error con el Mentor IA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col h-[650px]">
            <div className="bg-slate-900 p-8 flex items-center gap-5 text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 backdrop-blur-sm">
                    <Bot className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-black text-xl tracking-tight">MENTOR EXPERTO IA</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                            <span className={`${loading ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75`}></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{loading ? 'Pensando...' : 'En línea v2.1'}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scroll-smooth">
                {mensajes.map((m, i) => {
                    const isIA = m.tipo === 'ia';
                    // Lógica crítica: mostrar contenido parcial SOLO si este mensaje es el que se está escribiendo actualmente.
                    const isTypingThis = typingId === m.id;
                    const contentToShow = isTypingThis ? displayedContent : m.contenido;

                    return (
                        <div key={i} className={`flex ${isIA ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {isIA && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-3 mt-1 shadow-lg shadow-indigo-500/20 shrink-0">
                                    <Sparkles size={14} />
                                </div>
                            )}
                            <div className={`p-5 rounded-[1.5rem] max-w-[85%] text-sm leading-relaxed shadow-sm
                                ${!isIA
                                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20'
                                    : 'bg-white border boundary-slate-100 text-slate-600 rounded-tl-none font-medium'
                                }`}>
                                {contentToShow}
                                {isTypingThis && (
                                    <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-500 animate-pulse"></span>
                                )}
                            </div>
                        </div>
                    );
                })}
                {loading && (
                    <div className="flex justify-start animate-in fade-in zoom-in duration-300">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 mt-1 shrink-0">
                            <Bot size={14} className="text-slate-400" />
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm flex gap-1 items-center">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-3 items-center">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 bg-slate-50 border-0 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    placeholder="Escribe tu duda al mentor..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="bg-slate-900 hover:bg-indigo-600 text-white p-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:hover:bg-slate-900 shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95"
                    disabled={loading || !input.trim()}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
