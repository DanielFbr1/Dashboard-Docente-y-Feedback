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

/**
 * Asistente para el DOCENTE.
 * Actúa como un experto pedagógico en ABP.
 */
export const generarChatDocente = async (mensajeUsuario: string, historial: Mensaje[] = []): Promise<string> => {
    try {
        const promptSystem = `
        Eres un ASISTENTE PEDAGÓGICO experto en ABP.
        Tu usuario es un PROFESOR. Habla con él de tú a tú, como un compañero de trabajo de confianza.
        
        TUS REGLAS DE ORO (SÍGUELAS OBLIGATORIAMENTE):
        1. SÉ MUY BREVE: Máximo 2 o 3 frases por respuesta. ¡Nada de parrafadas!
        2. NATURALIDAD: Usa un tono cercano, directo y profesional.
        3. CONVERSA: No des lecciones. Haz una pregunta corta al final para mantener el diálogo si es necesario.
        4. MÉTODO:
           - Si te piden ideas, da 1 o 2 clave, no una lista gigante.
           - Si el profesor menciona algo técnico (ej: "Radio"), adáptate a eso.
        
        OBJETIVO: Ayudarle a definir tareas sin aburrirle con textos largos.
        `.trim();

        const messages: GroqMessage[] = [
            { role: 'system', content: promptSystem },
            ...historial.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: mensajeUsuario }
        ];

        return await callGroq(messages);
    } catch (error) {
        console.error("Error en Chat Docente:", error);
        return "Disculpa, tengo problemas de conexión. ¿Podrías reformular la pregunta?";
    }
};

/**
 * Genera tareas estructuradas en JSON.
 */
export const generarTareasDocente = async (descripcion: string): Promise<any[]> => {
    try {
        const promptSystem = `
        Eres un generador de tareas JSON para un gestor de proyectos educativos.
        Tu salida debe ser ESTRICTAMENTE un array de objetos JSON válidos.
        
        FORMATO DE SALIDA:
        [
            { "titulo": "Título de la tarea (acción verbal)", "descripcion": "Descripción breve para el alumno (max 15 palabras)" },
            ...
        ]
        
        REGLAS:
        - Genera entre 3 y 5 tareas.
        - Solo JSON puro. Sin markdown, sin explicaciones previas.
        - Tareas accionables y claras.
        `.trim();

        const messages: GroqMessage[] = [
            { role: 'system', content: promptSystem },
            { role: 'user', content: `Genera tareas para: ${descripcion}` }
        ];

        const respuesta = await callGroq(messages);

        // Limpieza básica por si el modelo es charlatán
        const jsonMatch = respuesta.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(respuesta); // Intentar parsear directo

    } catch (error) {
        console.error("Error generando tareas JSON:", error);
        return [
            { titulo: "Revisar objetivos", descripcion: "Tarea generada por defecto tras error de IA." },
            { titulo: "Planificar sesión", descripcion: "Definir los siguientes pasos manualmente." }
        ];
    }
};
