import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, Check, Trash2, Plus } from 'lucide-react';
import { HitoGrupo } from '../types';
import { toast } from 'sonner';

interface ModalAsignarTareasProps {
    grupoNombre: string;
    faseId: string;
    onClose: () => void;
    onSave: (hitos: Partial<HitoGrupo>[]) => void;
}

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export function ModalAsignarTareas({ grupoNombre, faseId, onClose, onSave }: ModalAsignarTareasProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: `Hola. Soy tu Asistente Docente. ¿Qué tareas quieres asignar al grupo "${grupoNombre}"?` }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hitos, setHitos] = useState<{ titulo: string; descripcion: string }[]>([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- REAL AI INTEGRATION ---
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');

        // Optimistic update
        const newHistory = [...messages, { role: 'user', content: userMsg } as Message];
        setMessages(newHistory);
        setIsTyping(true);

        try {
            // IA Connection
            const historyForAI = newHistory.map(m => ({
                role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
                content: m.content
            }));

            // Generate Response
            const aiResponse = await import('../services/ai').then(m => m.generarChatDocente(userMsg, historyForAI));

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

            // If AI suggests regenerating tasks, we could trigger it automatically, but better to let user decide/click.
        } catch (error) {
            console.error(error);
            toast.error("Error conectando con el asistente");
            setMessages(prev => [...prev, { role: 'ai', content: "Lo siento, tuve un error de conexión." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleGenerateMilestones = async (context: string = "") => {
        setIsTyping(true);
        const { generarTareasDocente } = await import('../services/ai');

        // Use conversation context if no specific context provided
        const promptContext = context || messages.map(m => `[${m.role}] ${m.content}`).join('\n');

        try {
            const newTasksRaw = await generarTareasDocente(promptContext);

            const newHitos = newTasksRaw.map((t: any) => ({
                titulo: t.titulo,
                descripcion: t.descripcion
            }));

            setMessages(prev => [...prev, { role: 'ai', content: "Aquí tienes una propuesta basándome en lo que hemos hablado." }]);
            setHitos(prev => [...prev, ...newHitos]);
            toast.success("Tareas generadas con IA");
        } catch (error) {
            console.error(error);
            toast.error("No se pudieron generar tareas");
        } finally {
            setIsTyping(false);
        }
    };

    const handleRemoveHito = (index: number) => {
        setHitos(hitos.filter((_, i) => i !== index));
    };

    const handleEditHito = (index: number, field: 'titulo' | 'descripcion', value: string) => {
        const newHitos = [...hitos];
        newHitos[index] = { ...newHitos[index], [field]: value };
        setHitos(newHitos);
    };

    const handleSave = () => {
        if (hitos.length === 0) {
            toast.error("Define al menos una tarea");
            return;
        }
        const hitosValidos = hitos.map(h => ({
            ...h,
            id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            fase_id: faseId,
            estado: 'pendiente' as const // Start as Pending for students
        }));
        onSave(hitosValidos);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full h-[85vh] flex overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                    <X className="w-6 h-6" />
                </button>

                {/* Left: Chat */}
                <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50">
                    <div className="p-6 bg-white border-b border-slate-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-800 tracking-tight">Asistente Docente</h2>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Generador de Tareas</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                                    {m.role === 'ai' ? <Bot className="w-4 h-4" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                                </div>
                                <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-600 border border-slate-200 rounded-tl-none'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="text-xs text-slate-400 ml-12">Escribiendo...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                        {messages.length > 1 && (
                            <button
                                onClick={() => handleGenerateMilestones("")}
                                type="button"
                                className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-100"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generar Tareas
                            </button>
                        )}

                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            className="flex gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Instrucciones para la IA..."
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

                {/* Right: Task List */}
                <div className="w-[400px] flex flex-col bg-white">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">Borrador de Tareas</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Para: {grupoNombre}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {hitos.length === 0 ? (
                            <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-2xl">
                                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm font-medium">Usa el chat para generar tareas</p>
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

                        <button
                            onClick={() => setHitos([...hitos, { titulo: 'Nueva Tarea', descripcion: '' }])}
                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        >
                            <Plus className="w-4 h-4" />
                            Añadir Manual
                        </button>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                        <button
                            onClick={handleSave}
                            disabled={hitos.length === 0}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                        >
                            <Check className="w-5 h-5" />
                            Asignar Tareas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
