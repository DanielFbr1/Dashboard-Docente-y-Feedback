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
            resolve(RESPUESTAS_SOCRATICAS_MOCK[indiceAleatorio]);
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
        return generarRespuestaMock();
    }
};

/**
 * Registra una interacción en la base de datos (Backend simple).
 * Útil para trazabilidad y analítica docente.
 */
export const registrarInteraccion = async (mensaje: string, respuesta: string, grupoId: number, usuarioId?: string) => {
    try {
        const { supabase } = await import('../lib/supabase');

        // El guardado se hace ahora en el componente para control de estado, 
        // pero centralizamos aquí por si se escala a otros servicios.
        console.log("📝 Log Backend: Guardando interacción para grupo:", grupoId);
    } catch (err) {
        console.error("Error registrando interacción en backend:", err);
    }
};

/**
 * Analiza el estado de un grupo basándose en el historial de chat.
 * Ayuda al profesor a detectar bloqueos sin leer todo el chat.
 */
export const analizarEstadoGrupo = async (historial: Mensaje[]): Promise<{ estado: 'OK' | 'Bloqueado', resumen: string }> => {
    if (historial.length === 0) return { estado: 'OK', resumen: 'Sin actividad inicial.' };

    try {
        const promptSystem = "Eres un analista educativo. Basándote en el historial de chat entre un grupo de alumnos y su mentor IA, determina si el grupo está REALMENTE BLOQUEADO (no avanzan) o si todo fluye OK. Responde en JSON con { \"estado\": \"OK\"/\"Bloqueado\", \"resumen\": \"frase corta de 10 palabras max\" }";

        const messages: GroqMessage[] = [
            { role: 'system', content: promptSystem } as any,
            ...historial.slice(-10).map(m => ({
                role: (m.role === 'assistant' ? 'assistant' : 'user') as any,
                content: m.content
            })),
            { role: 'user', content: "Analiza el estado actual de este grupo." } as any
        ];

        const respuestaRaw = await callGroq(messages);

        // Intentamos parsear la respuesta (la IA a veces mete texto extra)
        try {
            const match = respuestaRaw.match(/\{.*\}/s);
            if (match) {
                return JSON.parse(match[0]);
            }
        } catch (e) {
            console.error("Error parseando análisis IA:", e);
        }

        return {
            estado: respuestaRaw.toLowerCase().includes('bloqueado') ? 'Bloqueado' : 'OK',
            resumen: 'Análisis automatizado completado.'
        };

    } catch (error) {
        console.error("Error en análisis de backend:", error);
        return { estado: 'OK', resumen: 'No se pudo analizar el estado actual.' };
    }
};

