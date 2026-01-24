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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchMensajes();
    }, [grupoId]);

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    const fetchMensajes = async () => {
        const { data } = await supabase
            .from('mensajes_chat')
            .select('*')
            .eq('grupo_id', grupoId)
            .order('created_at', { ascending: true });

        if (data) setMensajes(data);
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

            if (iaMsg) setMensajes(prev => [...prev, iaMsg]);

        } catch (error) {
            toast.error('Error con el Mentor IA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-900 p-6 flex items-center gap-4 text-white">
                <Bot />
                <div><h3 className="font-black">MENTOR EXPERTO IA</h3></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {mensajes.map((m, i) => (
                    <div key={i} className={`p-4 rounded-2xl ${m.tipo === 'alumno' ? 'bg-indigo-600 text-white ml-auto max-w-[80%]' : 'bg-white border text-slate-700 max-w-[80%]'}`}>
                        {m.contenido}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Pregunta algo..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white p-3 rounded-xl disabled:opacity-50"
                    disabled={loading}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
