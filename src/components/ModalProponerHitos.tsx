import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, Plus, Trash2, Bot, User as UserIcon, Check } from 'lucide-react';
import { HitoGrupo, ProyectoFase } from '../types';
import { toast } from 'sonner';

interface ModalProponerHitosProps {
    fase: ProyectoFase;
    onClose: () => void;
    onSubmit: (hitos: Partial<HitoGrupo>[]) => void;
}

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export function ModalProponerHitos({ fase, onClose, onSubmit }: ModalProponerHitosProps) {
    // Modo: 'chat' | 'review'
    const [viewMode, setViewMode] = useState<'chat' | 'review'>('chat');

    // Chat State
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: `Hola, soy tu Mentor IA. Vamos a definir los hitos para la fase "${fase.nombre}". ¿Qué tenéis pensado hacer?` }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Hitos State (Extracted)
    const [hitos, setHitos] = useState<{ titulo: string; descripcion: string }[]>([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        // Mock AI Response (Conversation Only)
        setTimeout(() => {
            let aiResponse = "";
            const lowerInput = userMsg.toLowerCase();

            // Conversational Logic
            if (lowerInput.includes("hola") || lowerInput.includes("buenas")) {
                aiResponse = "¡Hola! Contadme, ¿qué tenéis en mente para esta fase?";
            } else if (lowerInput.includes("gracias")) {
                aiResponse = "¡A vosotros! ¿Necesitáis ayuda con algo más?";
            } else if (lowerInput.includes("podcast") || lowerInput.includes("audio")) {
                aiResponse = "El formato audio es genial. ¿Tenéis pensado hacerlo tipo entrevista o narrativo?";
            } else if (lowerInput.includes("video")) {
                aiResponse = "Video implica imagen y sonido. ¿Vais a grabar con móvil o cámara?";
            } else if (lowerInput.includes("investig")) {
                aiResponse = "¿Sobre qué fuentes vais a investigar? ¿Artículos, entrevistas...?";
            } else if (lowerInput.includes("listo") || lowerInput.includes("ok") || lowerInput.includes("ya")) {
                aiResponse = "Perfecto. Si lo veis claro, dadle al botón 'Extraer Hitos' y prepararé la lista.";
            } else {
                aiResponse = "Entiendo. Seguid dándome detalles para que pueda ayudaros mejor.";
            }

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
            setIsTyping(false);
        }, 1000);
    };

    const handleGenerateMilestones = () => {
        setIsTyping(true);
        setTimeout(() => {
            // Mock Extraction Logic (Based on last few messages context ideally, but here simulated)
            const newHitos = [
                { titulo: "Definición del Concepto", descripcion: "Redactar en un párrafo la idea central." },
                { titulo: "Asignación de Roles", descripcion: "Quién hará de líder, secretario, etc." },
                { titulo: "Búsqueda de Recursos", descripcion: "Localizar 3 fuentes de información fiables." }
            ];

            setMessages(prev => [...prev, { role: 'ai', content: "¡Hecho! He extraído estos hitos de nuestra conversación. Revisadlos a la derecha." }]);
            setHitos(prev => [...prev, ...newHitos]);
            setIsTyping(false);
            toast.success("Hitos generados desde la conversación");
        }, 1500);
    };

    const handleRemoveHito = (index: number) => {
        setHitos(hitos.filter((_, i) => i !== index));
    };

    const handleEditHito = (index: number, field: 'titulo' | 'descripcion', value: string) => {
        const newHitos = [...hitos];
        newHitos[index] = { ...newHitos[index], [field]: value };
        setHitos(newHitos);
    };

    const handleSubmit = () => {
        if (hitos.length === 0) {
            toast.error("Debes definir al menos un hito");
            return;
        }
        const hitosValidos = hitos.map(h => ({
            ...h,
            fase_id: fase.id,
            estado: 'propuesto' as const
        }));
        onSubmit(hitosValidos);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full h-[85vh] flex overflow-hidden relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left: Chat */}
                <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50">
                    <div className="p-6 bg-white border-b border-slate-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-800 tracking-tight">Mentor IA</h2>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Ayudante de Planificación</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                                    {m.role === 'ai' ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-600 border border-slate-200 rounded-tl-none'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                        {/* Generation Trigger */}
                        {messages.length > 2 && (
                            <button
                                onClick={handleGenerateMilestones}
                                type="button"
                                className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-100"
                            >
                                <Sparkles className="w-4 h-4" />
                                Extraer Hitos del Chat
                            </button>
                        )}

                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            className="flex gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe al mentor..."
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all shadow-md"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Extracted Milestones */}
                <div className="w-[400px] flex flex-col bg-white">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">Borrador de Hitos</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Sugeridos por la IA</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {hitos.length === 0 ? (
                            <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-2xl">
                                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm font-medium">Habla con el mentor para generar hitos automáticamente.</p>
                            </div>
                        ) : (
                            hitos.map((hito, index) => (
                                <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                    <div className="mt-2 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <input
                                            value={hito.titulo}
                                            onChange={(e) => handleEditHito(index, 'titulo', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-sm px-1 py-0.5"
                                        />
                                        <textarea
                                            value={hito.descripcion}
                                            onChange={(e) => handleEditHito(index, 'descripcion', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none text-xs text-slate-500 leading-snug px-1 py-0.5 resize-none"
                                            rows={2}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveHito(index)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors mt-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}

                        {hitos.length > 0 && (
                            <button
                                onClick={() => setHitos([...hitos, { titulo: 'Nuevo Hito Manual', descripcion: 'Descripción...' }])}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                            >
                                <Plus className="w-4 h-4" />
                                Añadir Manualmente
                            </button>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                        <button
                            onClick={handleSubmit}
                            disabled={hitos.length === 0}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                        >
                            <Check className="w-5 h-5" />
                            Enviar a Revisión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
