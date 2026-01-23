
import { DashboardDocente } from '../components/DashboardDocente';
import { TutorialInteractivo } from '../components/TutorialInteractivo';
import { Grupo, Proyecto } from '../types';
import { useState } from 'react';
import { PASOS_TUTORIAL } from '../data/mockData';

interface ProjectDetailProps {
    proyecto: Proyecto;
    onSelectGrupo: (grupo: Grupo) => void;
    onBack: () => void;
}

export function ProjectDetail({ proyecto, onSelectGrupo, onBack }: ProjectDetailProps) {
    // Estado local para los grupos (inicializado con los del proyecto)
    const [localGrupos, setLocalGrupos] = useState<Grupo[]>(proyecto.grupos);
    const [currentSection, setCurrentSection] = useState<import('../types').DashboardSection>('resumen');

    // Estado del tutorial: Persistente usando localStorage por proyecto
    const tutorialKey = `tutorial_seen_${proyecto.id}`;
    const [showTutorial, setShowTutorial] = useState(() => {
        return !localStorage.getItem(tutorialKey);
    });

    const handleTutorialComplete = () => {
        localStorage.setItem(tutorialKey, 'true');
        setShowTutorial(false);
    };

    const handleCrearGrupo = (nuevoGrupo: Omit<Grupo, 'id'>) => {
        const id = localGrupos.length > 0 ? Math.max(...localGrupos.map(g => g.id)) + 1 : 1;
        setLocalGrupos([...localGrupos, { ...nuevoGrupo, id }]);
    };

    const handleEditarGrupo = (id: number, grupoEditado: Omit<Grupo, 'id'>) => {
        setLocalGrupos(localGrupos.map(g => g.id === id ? { ...grupoEditado, id } : g));
    };

    const handleEliminarGrupo = (id: number) => {
        setLocalGrupos(localGrupos.filter(g => g.id !== id));
    };

    const handleLimpiarDatos = () => {
        setLocalGrupos([]);
    };

    const handleCargarEjemplo = () => {
        // Recargar los del proyecto original o los mock si está vacío
        import('../data/mockData').then(mod => {
            setLocalGrupos(proyecto.grupos.length > 0 ? proyecto.grupos : mod.GRUPOS_MOCK);
        });
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
