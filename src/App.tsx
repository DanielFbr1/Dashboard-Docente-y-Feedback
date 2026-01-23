import { useState } from 'react';
import { DashboardAlumno } from './components/DashboardAlumno';
import { FeedbackAlumnoIA } from './components/FeedbackAlumnoIA';
import { Login } from './components/Login';
import { ProjectsDashboard } from './pages/ProjectsDashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { GroupDetail } from './pages/GroupDetail';
import { Proyecto, Grupo } from './types';

// Datos de ejemplo para que el docente pueda ver cómo funciona
export const EJEMPLO_GRUPOS: Grupo[] = [
  {
    id: 1,
    nombre: 'Grupo 1 – Guion',
    departamento: 'Guion',
    estado: 'En progreso',
    progreso: 60,
    interaccionesIA: 12,
    miembros: ['Ana García', 'Carlos López', 'María Fernández', 'Pedro Martínez']
  },
  {
    id: 2,
    nombre: 'Grupo 2 – Locución',
    departamento: 'Locución',
    estado: 'Casi terminado',
    progreso: 85,
    interaccionesIA: 18,
    miembros: ['Laura Sánchez', 'Diego Torres', 'Sofia Ruiz', 'Javier Gómez']
  },
  {
    id: 3,
    nombre: 'Grupo 3 – Edición',
    departamento: 'Edición',
    estado: 'Bloqueado',
    progreso: 35,
    interaccionesIA: 8,
    miembros: ['Elena Jiménez', 'Pablo Moreno', 'Carmen Díaz', 'Luis Romero']
  },
  {
    id: 4,
    nombre: 'Grupo 4 – Diseño Gráfico',
    departamento: 'Diseño Gráfico',
    estado: 'En progreso',
    progreso: 70,
    interaccionesIA: 15,
    miembros: ['Isabel Vargas', 'Miguel Herrera', 'Lucía Castro', 'Antonio Ramos']
  },
  {
    id: 5,
    nombre: 'Grupo 5 – Vestuario/Arte',
    departamento: 'Vestuario/Arte',
    estado: 'Casi terminado',
    progreso: 90,
    interaccionesIA: 22,
    miembros: ['Beatriz Ortiz', 'Raúl Silva', 'Cristina Molina', 'Alberto Vega']
  },
  {
    id: 6,
    nombre: 'Grupo 6 – Coordinación',
    departamento: 'Guion',
    estado: 'En progreso',
    progreso: 55,
    interaccionesIA: 20,
    miembros: ['Marta Delgado', 'Daniel Navarro', 'Paula Guerrero', 'Sergio Méndez']
  }
];

export default function App() {
  const [usuarioActual, setUsuarioActual] = useState<{
    tipo: 'profesor' | 'alumno';
    datos: any;
  } | null>(null);

  const [currentScreen, setCurrentScreen] = useState<'projects' | 'project-detail' | 'group-detail' | 'feedback'>('projects');
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);

  const handleLogin = (tipo: 'profesor' | 'alumno', datos: any) => {
    setUsuarioActual({ tipo, datos });
  };

  const handleSelectProject = (proyecto: Proyecto) => {
    setSelectedProject(proyecto);
    setCurrentScreen('project-detail');
  };

  const handleSelectGrupo = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setCurrentScreen('group-detail');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setCurrentScreen('projects');
  };

  const handleBackToProjectDetail = () => {
    setSelectedGrupo(null);
    setCurrentScreen('project-detail');
  };

  // Si no hay usuario logueado, mostrar login
  if (!usuarioActual) {
    return <Login onLogin={handleLogin} />;
  }

  // Vista de alumno (mantener lógica existente o simplificar, por ahora mantenemos DashboardAlumno si no hay cambios requeridos específicos, pero el request pedía foco en la gestión ABP)
  if (usuarioActual.tipo === 'alumno') {
    return <DashboardAlumno alumno={usuarioActual.datos} onLogout={() => setUsuarioActual(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'projects' && (
        <ProjectsDashboard onSelectProject={handleSelectProject} />
      )}

      {currentScreen === 'project-detail' && selectedProject && (
        <ProjectDetail
          proyecto={selectedProject}
          onSelectGrupo={handleSelectGrupo}
          onBack={handleBackToProjects}
        />
      )}

      {currentScreen === 'group-detail' && selectedGrupo && (
        <GroupDetail
          grupo={selectedGrupo}
          onBack={handleBackToProjectDetail}
          onViewFeedback={() => setCurrentScreen('feedback')}
        />
      )}

      {currentScreen === 'feedback' && selectedGrupo && (
        <FeedbackAlumnoIA
          grupo={selectedGrupo}
          onBack={() => setCurrentScreen('group-detail')}
        />
      )}
    </div>
  );
}
