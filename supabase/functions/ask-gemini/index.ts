import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Respuestas de fallback si Gemini falla
const RESPUESTAS_FALLBACK = [
    "¡Interesante pregunta! 🤔 ¿Qué ideas has pensado tú hasta ahora?",
    "Buen punto. ¿Cómo crees que esto se relaciona con el objetivo de tu proyecto?",
    "¿Has considerado qué pasaría si...? Piensa en las consecuencias.",
    "Excelente. ¿Podrías explicarme tu razonamiento con más detalle?",
    "¿Qué recursos necesitarías para llevar esa idea a cabo?",
    "Interesante enfoque. ¿Cómo lo explicarías a alguien que no sabe del tema?",
    "¿Qué desafíos anticipas con esa solución? 🎯",
    "Bien pensado. ¿Cómo verificarías que funciona correctamente?"
]

function getFallbackResponse(): string {
    const index = Math.floor(Math.random() * RESPUESTAS_FALLBACK.length)
    return RESPUESTAS_FALLBACK[index] + " (Modo mentor local)"
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { mensaje, historial, contexto } = await req.json()

        // 🔍 DEBUG: Verificar si la API key se está cargando
        console.log('🔍 DEBUG - API Key presente:', GEMINI_API_KEY ? 'SÍ (primeros 10 chars: ' + GEMINI_API_KEY.substring(0, 10) + '...)' : 'NO')
        console.log('🔍 DEBUG - Longitud de la key:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 0)

        // Si no hay API key, usar fallback directamente
        if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
            console.warn('⚠️ GEMINI_API_KEY no configurada, usando fallback')
            return new Response(
                JSON.stringify({ respuesta: getFallbackResponse() }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const systemPrompt = `Eres un SÓCRATES MODERNO y AMIGABLE.
Tu objetivo es ayudar a alumnos de primaria/secundaria a PENSAR, no darles las respuestas.

CONTEXTO ACTUAL:
${contexto || 'Proyecto escolar general'}

REGLAS:
1. NUNCA des la respuesta directa.
2. Haz preguntas guía que lleven al alumno a la solución.
3. Sé breve y estimulante (máximo 2-3 frases).
4. Usa emojis ocasionalmente.
5. Si el alumno está muy bloqueado, da una pista más clara, pero sin resolverlo todo.
6. Ajusta tu tono a niños de 10-12 años.`

        const contents = [
            {
                role: "user",
                parts: [{ text: systemPrompt }]
            },
            ...historial.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            {
                role: "user",
                parts: [{ text: mensaje }]
            }
        ]

        console.log('📡 Llamando a Gemini API...')
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('❌ Error Gemini API:', response.status, data.error?.message || JSON.stringify(data))
            // Usar fallback si Gemini falla
            return new Response(
                JSON.stringify({ respuesta: getFallbackResponse() }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('✅ Respuesta de Gemini recibida correctamente')
        const reply = data.candidates[0].content.parts[0].text

        return new Response(
            JSON.stringify({ respuesta: reply }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('❌ Error general:', error)
        // Fallback en caso de cualquier error
        return new Response(
            JSON.stringify({ respuesta: getFallbackResponse() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
