import { callGroq, GroqMessage } from './groq';

// Interfaz para mensajes (adaptada a lo que podría necesitar la UI)
export interface Mensaje {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const RESPUESTAS_SOCRATICAS_MOCK = [
    "Interesante punto de vista. ¿Cómo podrías relacionar esto con el objetivo principal de tu proyecto?",
    "Entiendo lo que propones. ¿Has considerado qué impacto tendría esto en la audiencia a la que te diriges?",
    "Es una buena idea inicial. ¿Qué otros recursos crees que necesitarías para llevarla a cabo?",
    "Bien. Si tuvieras que explicar esto a alguien que no sabe nada del tema, ¿cómo lo harías?"
];

// Fallback Mock Function (Client-side failover)
const generarRespuestaMock = async (): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const indiceAleatorio = Math.floor(Math.random() * RESPUESTAS_SOCRATICAS_MOCK.length);
            resolve(RESPUESTAS_SOCRATICAS_MOCK[indiceAleatorio] + " (Modo Mentor Local - Sin API Key en Vercel)");
        }, 1000);
    });
};

/**
 * Obtiene respuesta de Groq AI.
 */
export const generarRespuestaIA = async (mensajeUsuario: string, historial: Mensaje[] = []): Promise<string> => {
    try {
        // Adaptar historial al formato de Groq
        const messages: GroqMessage[] = [
            ...historial.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: mensajeUsuario }
        ];

        // Llamada directa a Groq
        const respuesta = await callGroq(messages);
        return respuesta;

    } catch (error: any) {
        console.error("Error general en servicio AI con Groq:", error);
        alert("DEBUG AI: Fallo en la llamada a Groq. Motivo: " + (error.message || "Error desconocido"));
        return generarRespuestaMock();
    }
};

// Función para guardar (en el futuro) el mensaje en la BD
export const registrarInteraccion = async (mensaje: string, respuesta: string, grupoId: number) => {
    // Aquí iría el insert a 'mensajes_chat' en Supabase
    // const { error } = await supabase.from('mensajes_chat').insert(...)
    console.log("Interacción registrada (Simulado)", { mensaje, respuesta, grupoId });
};
