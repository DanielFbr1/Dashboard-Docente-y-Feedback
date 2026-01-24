
export interface GroqMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const callGroq = async (messages: GroqMessage[]): Promise<string> => {
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY no configurada en las variables de entorno.');
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `Eres un Mentor IA experto en Aprendizaje Basado en Proyectos (ABP). 
                        Tu objetivo es actuar como un mentor socrático para alumnos de Primaria y Secundaria.
                        
                        REGLAS CRÍTICAS:
                        1. NO des la respuesta directamente. Haz preguntas que les inviten a pensar.
                        2. Sé animador, positivo y cercano (usa un lenguaje adecuado para niños/adolescentes).
                        3. Enfócate en el proceso, la colaboración y la creatividad.
                        4. Si te preguntan algo técnico, guía su investigación en lugar de darles el manual.
                        5. Mantén las respuestas breves y estructuradas (usa negritas para enfatizar conceptos clave).`
                    },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error en la petición a Groq');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Groq API Error:', error);
        throw error;
    }
};
