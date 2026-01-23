import { supabase } from '../lib/supabase';

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
            resolve(RESPUESTAS_SOCRATICAS_MOCK[indiceAleatorio] + " (Modo sin conexión)");
        }, 1000);
    });
};

/**
 * Llama a la Edge Function 'ask-gemini' para obtener respuesta.
 * Ya no exponemos la API KEY en el frontend.
 */
export const generarRespuestaIA = async (mensajeUsuario: string, historial: Mensaje[] = []): Promise<string> => {
    try {
        // Llamada a la Edge Function
        const { data, error } = await supabase.functions.invoke('ask-gemini', {
            body: {
                mensaje: mensajeUsuario,
                historial: historial,
                contexto: "Asignatura: Ciencias / Proyecto: Energías Renovables" // Esto podría venir de props
            }
        });

        if (error) {
            console.error('Error invocando Edge Function:', error);
            // Fallback a mock si falla la función (o no está desplegada)
            return generarRespuestaMock();
        }

        // Si la función devuelve error interno
        if (data.error) {
            console.warn('Error devuelto por Gemini:', data.error);
            return generarRespuestaMock();
        }

        return data.respuesta;

    } catch (error) {
        console.error("Error general en servicio AI:", error);
        return generarRespuestaMock();
    }
};

// Función para guardar (en el futuro) el mensaje en la BD
export const registrarInteraccion = async (mensaje: string, respuesta: string, grupoId: number) => {
    // Aquí iría el insert a 'mensajes_chat' en Supabase
    // const { error } = await supabase.from('mensajes_chat').insert(...)
    console.log("Interacción registrada (Simulado)", { mensaje, respuesta, grupoId });
};
