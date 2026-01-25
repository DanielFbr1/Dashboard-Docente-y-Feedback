import { DashboardDocente } from '../components/DashboardDocente';
import { TutorialInteractivo } from '../components/TutorialInteractivo';
import { Grupo, Proyecto } from '../types';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PASOS_TUTORIAL, GRUPOS_MOCK } from '../data/mockData';

interface ProjectDetailProps {
    proyecto: Proyecto;
    onSelectGrupo: (grupo: Grupo) => void;
    onBack: () => void;
    onSwitchProject: (proyecto: Proyecto) => void;
}

export function ProjectDetail({ proyecto, onSelectGrupo, onBack, onSwitchProject }: ProjectDetailProps) {
    const [localGrupos, setLocalGrupos] = useState<Grupo[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState<import('../types').DashboardSection>('resumen');

    // Estado del tutorial: Mostrar SOLO si acaba de registrarse (isNewTeacher)
    // O si nunca lo ha visto y queremos forzarlo (opcional, pero el usuario pidió solo al registrarse)
    const [showTutorial, setShowTutorial] = useState(() => {
        const isNewTeacher = localStorage.getItem('isNewTeacher') === 'true';
        if (isNewTeacher) {
            // Es nuevo registro, mostramos y limpiamos la marca de "nuevo"
            // (La marca de "visto" se pondrá cuando lo termine o cierre)
            localStorage.removeItem('isNewTeacher');
            return true;
        }
        return false;
    });

    useEffect(() => {
        fetchGrupos();

        // Realtime Subscription
        const channel = supabase.channel(`project_groups_${proyecto.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'grupos',
                    filter: `proyecto_id=eq.${proyecto.id}`
                },
                (payload) => {
                    console.log('Cambio detectado en grupos:', payload);
                    fetchGrupos(); // Simple re-fetch strategy for consistency
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [proyecto.id]);

    const handleClaseChange = async (nuevaClase: string) => {
        try {
            const { data, error } = await supabase
                .from('proyectos')
                .select('*')
                .eq('clase', nuevaClase)
                .single();

            if (error || !data) {
                if (confirm(`No hay ningún proyecto creado para la clase ${nuevaClase}. ¿Quieres crear uno nuevo?`)) {
                    onBack(); // Volver al dashboard para crear uno
                }
                return;
            }

            // Cambiar al proyecto encontrado
            onSwitchProject(data);
        } catch (err) {
            console.error('Error switching class:', err);
        }
    };

    const fetchGrupos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('grupos')
                .select('*')
                .eq('proyecto_id', proyecto.id);
            if (error) throw error;
            setLocalGrupos(data || []);
        } catch (err) {
            console.error('Error fetching groups:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTutorialComplete = () => {
        // Marcamos como visto por si acaso queremos usarlo en el futuro
        localStorage.setItem('tutorial_docente_seen', 'true');
        setShowTutorial(false);
    };

    const handleCrearGrupo = async (nuevoGrupo: Omit<Grupo, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('grupos')
                .insert([{ ...nuevoGrupo, proyecto_id: proyecto.id }])
                .select();
            if (error) throw error;
            if (data) setLocalGrupos([...localGrupos, data[0]]);
        } catch (err) {
            console.error('Error creating group:', err);
        }
    };

    const handleEditarGrupo = async (id: number | string, grupoEditado: Omit<Grupo, 'id'>) => {
        try {
            const { error } = await supabase
                .from('grupos')
                .update(grupoEditado)
                .eq('id', id);
            if (error) throw error;
            setLocalGrupos(localGrupos.map(g => g.id === id ? { ...grupoEditado, id } : g));
        } catch (err) {
            console.error('Error editing group:', err);
        }
    };

    const handleEliminarGrupo = async (id: number | string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este grupo?')) return;
        try {
            const { error } = await supabase
                .from('grupos')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setLocalGrupos(localGrupos.filter(g => g.id !== id));
        } catch (err) {
            console.error('Error deleting group:', err);
        }
    };

    const handleLimpiarDatos = async () => {
        try {
            const { error } = await supabase
                .from('grupos')
                .delete()
                .eq('proyecto_id', proyecto.id);
            if (error) throw error;
            setLocalGrupos([]);
        } catch (err) {
            console.error('Error clearing groups:', err);
        }
    };

    const handleCargarEjemplo = async () => {
        const HITOS_POR_DEPTO: Record<string, any[]> = {
            'Guion': [
                { id: 'h1', titulo: 'Definir tema del programa', estado: 'aprobado', fase_id: 'f1' },
                { id: 'h2', titulo: 'Redactar escaleta', estado: 'en_progreso', fase_id: 'f1' },
                { id: 'h3', titulo: 'Escribir guion literario', estado: 'pendiente', fase_id: 'f1' }
            ],
            'Locución': [
                { id: 'h1', titulo: 'Pruebas de micrófono', estado: 'aprobado', fase_id: 'f2' },
                { id: 'h2', titulo: 'Ensayo de lectura', estado: 'revision', fase_id: 'f2' },
                { id: 'h3', titulo: 'Grabación Bloque 1', estado: 'pendiente', fase_id: 'f2' }
            ],
            'Edición': [
                { id: 'h1', titulo: 'Selección de músicas', estado: 'aprobado', fase_id: 'f3' },
                { id: 'h2', titulo: 'Montaje preliminar', estado: 'bloqueado', fase_id: 'f3', comentario_docente: 'Faltan los derechos de autor' },
                { id: 'h3', titulo: 'Masterización final', estado: 'pendiente', fase_id: 'f3' }
            ]
        };

        const gruposEjemplo = GRUPOS_MOCK.map(g => ({
            nombre: g.nombre,
            departamento: g.departamento,
            progreso: g.progreso,
            estado: g.estado,
            interacciones_ia: 3, // Empezamos con algunas interacciones
            miembros: g.miembros,
            proyecto_id: proyecto.id,
            hitos: HITOS_POR_DEPTO[g.departamento] || [] // Insertamos hitos JSON
        }));

        try {
            // 1. Insertar Grupos con Hitos
            const { data: gruposCreados, error } = await supabase
                .from('grupos')
                .insert(gruposEjemplo)
                .select();

            if (error) throw error;

            if (gruposCreados) {
                // 2. Insertar Mensajes de Chat para cada grupo
                const mensajesParaInsertar = gruposCreados.flatMap(grupo => [
                    {
                        grupo_id: grupo.id,
                        tipo: 'user', // Alumno
                        contenido: `Hola Mentor, somos el equipo de ${grupo.departamento}. ¿Por dónde nos recomiendas empezar?`,
                        created_at: new Date(Date.now() - 3600000).toISOString()
                    },
                    {
                        grupo_id: grupo.id,
                        tipo: 'assistant', // IA
                        contenido: `¡Hola equipo de ${grupo.departamento}! Me alegra saludaros. Para arrancar con fuerza, ¿habéis revisado los requisitos de la fase actual? Es clave tener eso claro antes de dividir tareas.`,
                        created_at: new Date(Date.now() - 3500000).toISOString()
                    },
                    {
                        grupo_id: grupo.id,
                        tipo: 'user', // Alumno
                        contenido: 'Sí, ya lo hemos mirado. Vamos a empezar repartiendo roles.',
                        created_at: new Date(Date.now() - 3400000).toISOString()
                    }
                ]);

                const { error: errorChat } = await supabase
                    .from('mensajes_chat')
                    .insert(mensajesParaInsertar);

                if (errorChat) console.error("Error creating chat examples:", errorChat);

                setLocalGrupos([...localGrupos, ...gruposCreados]);
            }
        } catch (err) {
            console.error('Error loading example groups:', err);
        }
    };

    return (
        <div className="relative">
            <DashboardDocente
                onSelectGrupo={onSelectGrupo}
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                grupos={localGrupos}
                mostrandoEjemplo={localGrupos.length > 0}
                onCargarEjemplo={handleCargarEjemplo}
                onLimpiarDatos={handleLimpiarDatos}
                onCrearGrupo={handleCrearGrupo}
                onEditarGrupo={handleEditarGrupo}
                onEliminarGrupo={handleEliminarGrupo}
                onIniciarTutorial={() => setShowTutorial(true)}
                onCambiarProyecto={onBack}
                onClaseChange={handleClaseChange}
                proyectoActual={{
                    id: proyecto.id,
                    nombre: proyecto.nombre,
                    tipo: proyecto.tipo,
                    codigo_sala: proyecto.codigo_sala,
                    clase: proyecto.clase,
                    fases: proyecto.fases
                }}
            />

            {showTutorial && (
                <TutorialInteractivo
                    pasos={PASOS_TUTORIAL}
                    onComplete={handleTutorialComplete}
                    onSkip={handleTutorialComplete}
                />
            )}
        </div>
    );
}
