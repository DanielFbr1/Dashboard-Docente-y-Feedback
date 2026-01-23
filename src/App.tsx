import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ProjectsDashboard } from './pages/ProjectsDashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { GroupDetail } from './pages/GroupDetail';
import { DashboardAlumno } from './components/DashboardAlumno';
import { Proyecto, Grupo } from './types';

function AppContent() {
  const { user, guestUser, loading, setGuestUser } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'projects' | 'project-detail' | 'group-detail'>('projects');
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Iniciando sesión segura...</p>
        </div>
      </div>
    );
  }

  // Si es un alumno (invitado/guest)
  if (guestUser) {
    return (
      <DashboardAlumno
        alumno={guestUser}
        onLogout={() => setGuestUser(null)}
      />
    );
  }

  // Si no hay usuario ni invitado
  if (!user) {
    return <LoginPage />;
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
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
