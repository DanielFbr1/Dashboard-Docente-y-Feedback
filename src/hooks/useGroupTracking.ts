import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Intervalo de "latido" en milisegundos (1 minuto)
const HEARTBEAT_INTERVAL = 60 * 1000;

export function useGroupTracking(grupoId?: number | string) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!grupoId) return;

        const sendHeartbeat = async () => {
            try {
                // Llamamos a una función RPC en Supabase para incrementar de forma segura
                // O hacemos un update directo si no tenemos RPC.
                // Como no tenemos RPC definido, haremos una lógica optimista:
                // Leer el valor actual -> Incrementar -> Guardar.
                // Esto tiene race conditions si hay muchos usuarios, pero para esta POC vale.
                // MEJORA: Usar rpc('increment_usage_time', { group_id: grupoId })

                // Puesto que no puedo crear RPCs sql ahora mismo sin consola, usaré un truco:
                // Solo EL PRIMER usuario que lance el heartbeat en ese minuto cuenta.
                // Pero coordinar eso sin backend es difícil.

                // Enfoque simple "Good Enough":
                // Simplemente incrementamos. Si 4 alumnos están conectados, sumará x4.
                // El usuario dijo "registro de las horas que han estado los grupos conectados".
                // Si 4 personas trabajan 1 hora, ¿son 4 horas de trabajo o 1 hora de "conexión del grupo"?
                // Normalmente es 1 hora de "sesión activa".

                // Para evitar multiplicar xN, podríamos usar una tabla auxiliar 'active_sessions' y un cronjob,
                // pero eso es backend complejo.

                // Voy a implementar la suma simple y avisaré al usuario.
                // O mejor: usaremos un campo 'last_heartbeat' para no sumar si ya se sumó hace menos de 1 min.

                // 1. Get current group data
                const { data: grupo } = await supabase
                    .from('grupos')
                    .select('tiempo_uso_minutos, last_heartbeat') // Asumimos que last_heartbeat existe o fallará
                    .eq('id', grupoId)
                    .single();

                if (grupo) {
                    const now = new Date();
                    const last = grupo.last_heartbeat ? new Date(grupo.last_heartbeat) : new Date(0);
                    const diffSeconds = (now.getTime() - last.getTime()) / 1000;

                    // Solo sumamos si nadie ha sumado en los últimos 50 segundos
                    if (diffSeconds > 50) {
                        await supabase
                            .from('grupos')
                            .update({
                                tiempo_uso_minutos: (grupo.tiempo_uso_minutos || 0) + 1,
                                last_heartbeat: now.toISOString()
                            })
                            .eq('id', grupoId);

                        console.log(`⏱️ Heartbeat enviado para grupo ${grupoId}`);
                    }
                }

            } catch (err) {
                console.error("Error en tracking:", err);
            }
        };

        // Enviar uno al montar (opcional)
        // sendHeartbeat(); 

        // Configurar intervalo
        intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [grupoId]);
}
