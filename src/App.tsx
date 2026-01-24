import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ProjectsDashboard } from './pages/ProjectsDashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { GroupDetail } from './pages/GroupDetail';
import { DashboardAlumno } from './components/DashboardAlumno';
import { Proyecto, Grupo } from './types';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, perfil, loading, signOut } = useAuth();

  // Efecto para "Limpieza de Emergencia" si la pantalla se queda en blanco
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
      console.log("🧹 Limpieza de emergencia activada...");
      localStorage.clear();
      supabase.auth.signOut().then(() => {
        window.location.href = window.location.origin;
      });
    }
  }, []);
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

  // Si no hay usuario, mostramos login
  if (!user) {
    return <LoginPage />;
  }

  // Si es un alumno identificado
  if (perfil && perfil.rol === 'alumno') {
    return (
      <DashboardAlumno
        alumno={perfil}
        onLogout={signOut}
      />
    );
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
          onSwitchProject={setSelectedProject}
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
