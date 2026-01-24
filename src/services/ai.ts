import { callGroq, GroqMessage } from './groq';

// Interfaz para mensajes (adaptada a lo que podría necesitar la UI)
export interface Mensaje {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const RESPUESTAS_MOCK = [
    "¡Buena idea! 🌟 Pensad también: ¿cómo encaja esto con lo que están haciendo los otros equipos? ¿Creeis que les gustará?",
    "¡Muy interesante! Antes de lanzaros, ¿habéis comprobado si el equipo de Diseño necesita saber esto? Recordad que trabajamos todos juntos.",
    "¡Genial! 🚀 Si hacéis eso, ¿haréis el trabajo más fácil o más difícil para el siguiente grupo? ¡La colaboración es la clave!",
    "¡Me gusta vuestra energía! ¿Estáis seguros de que esto sigue el tema principal del proyecto? Hablemos un momento sobre ello."
];

// Fallback Mock Function (Client-side failover)
const generarRespuestaMock = async (): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const indiceAleatorio = Math.floor(Math.random() * RESPUESTAS_MOCK.length);
            resolve(RESPUESTAS_MOCK[indiceAleatorio]);
        }, 1000);
    });
};

/**
 * Obtiene respuesta de Groq AI.
 */
export const generarRespuestaIA = async (mensajeUsuario: string, departamento: string, contexto: string, historial: Mensaje[] = []): Promise<string> => {
    try {
        const promptSystem = `
        Eres un PROFESOR de primaria (8-12 años) guiando un PROYECTO COLABORATIVO (ABP) llamado "${contexto}".
        Estás hablando con el equipo de "${departamento}". SU TRABAJO ES SOLO UNA PIEZA DEL PUZZLE.
        
        TUS REGLAS DE ORO:
        1. CONCIENCIA DE GRUPO: Recuérdales a menudo que lo que hacen afecta a los demás equipos. ¡No están solos!
        2. SÉ BREVE Y CONVERSA: Respuestas cortas (max 3 frases). Haz preguntas para que ellos piensen.
        3. PARA NIÑOS SIEMPRE:
           - Usa emojis 🌟 para ser amigable.
           - Vocabulario SENCILLO (como si hablaras con un niño de 9 años).
           - NUNCA uses palabras complicadas o corporativas.
        4. MÉTODO:
           - Paso A: Valida su idea.
           - Paso B: CONÉCTALO con el resto del proyecto o haz una pregunta para guiarles.
        
        EJEMPLO 1 (Conexión):
        Alumno: "Ya tenemos el guion."
        Tú: "¡Fantástico! 📜 ¿Habéis hablado con el equipo de 'Locución' para ver si les parece fácil de leer? Recordad que ellos tendrán que grabarlo."
        
        EJEMPLO 2 (Guía):
        Alumno: "No sabemos qué dibujar."
        Tú: "Pensad en el tema general del proyecto: ${contexto}. 🎨 ¿Qué imagen se os viene a la cabeza al pensar en eso? ¿Algo colorido o más serio?"
        `.trim();

        // Adaptar historial al formato de Groq
        const messages: GroqMessage[] = [
            { role: 'system', content: promptSystem },
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

