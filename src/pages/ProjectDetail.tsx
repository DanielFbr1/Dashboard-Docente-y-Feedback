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
}

export function ProjectDetail({ proyecto, onSelectGrupo, onBack }: ProjectDetailProps) {
    const [localGrupos, setLocalGrupos] = useState<Grupo[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState<import('../types').DashboardSection>('resumen');

    // Estado del tutorial
    const tutorialKey = `tutorial_seen_${proyecto.id}`;
    const [showTutorial, setShowTutorial] = useState(() => {
        return !localStorage.getItem(tutorialKey);
    });

    useEffect(() => {
        fetchGrupos();
    }, [proyecto.id]);

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
        localStorage.setItem(tutorialKey, 'true');
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

    const handleEditarGrupo = async (id: number, grupoEditado: Omit<Grupo, 'id'>) => {
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

    const handleEliminarGrupo = async (id: number) => {
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
        if (!confirm('¿Borrar todos los grupos del proyecto?')) return;
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
        const gruposEjemplo = GRUPOS_MOCK.map(g => ({
            nombre: g.nombre,
            departamento: g.departamento,
            progreso: g.progreso,
            estado: g.estado,
            interacciones_ia: g.interaccionesIA,
            miembros: g.miembros,
            proyecto_id: proyecto.id
        }));

        try {
            const { data, error } = await supabase
                .from('grupos')
                .insert(gruposEjemplo)
                .select();
            if (error) throw error;
            if (data) setLocalGrupos([...localGrupos, ...data]);
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
                proyectoActual={{
                    id: proyecto.id,
                    nombre: proyecto.nombre,
                    tipo: proyecto.tipo,
                    codigoSala: proyecto.codigoSala
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
