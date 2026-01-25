import { User, LogOut, Award, MessageSquare, Users, TrendingUp, Share2, Loader2, CircleHelp, Sparkles, Upload, Globe, ChevronDown, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Grupo } from '../types';
import { supabase } from '../lib/supabase';
import { ChatIA } from './ChatIA';
import { RepositorioColaborativo } from './RepositorioColaborativo';
import { ModalSubirRecurso } from './ModalSubirRecurso';
import { TutorialInteractivo } from './TutorialInteractivo';
import { PASOS_TUTORIAL_ALUMNO } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { UnirseClaseScreen } from './UnirseClaseScreen';
import { ModalUnirseClase } from './ModalUnirseClase';
import { Key } from 'lucide-react';
import { RoadmapView } from './RoadmapView';
import { LivingTree } from './LivingTree';
import { PROYECTOS_MOCK } from '../data/mockData';
import { HitoGrupo } from '../types';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DashboardAlumnoProps {
  alumno: {
    id: string;
    nombre: string;
    rol: 'profesor' | 'alumno';
    clase?: string;
    grupo_id?: number;
    proyecto_id?: string;
    codigo_sala?: string;
  };
  onLogout: () => void;
}

export function DashboardAlumno({ alumno, onLogout }: DashboardAlumnoProps) {
  // 4 Pestañas: 'grupo' | 'comunidad' | 'chat' | 'perfil'
  const [vistaActiva, setVistaActiva] = useState<'grupo' | 'comunidad' | 'chat' | 'perfil'>('grupo');

  useEffect(() => { console.log("Dashboard Alumno: Multi-Class Update Active"); }, []);

  const [grupoReal, setGrupoReal] = useState<Grupo | null>(null);
  const [todosLosGrupos, setTodosLosGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [modalUnirseOpen, setModalUnirseOpen] = useState(false);
  const [modalSubirRecursoOpen, setModalSubirRecursoOpen] = useState(false);
  const [modalProponerOpen, setModalProponerOpen] = useState(false);
  const [faseParaProponer, setFaseParaProponer] = useState<any>(null);

  // Estado del tutorial para Alumnos
  const [tutorialActivo, setTutorialActivo] = useState(() => {
    const isNew = localStorage.getItem('isNewStudent') === 'true';
    const seen = localStorage.getItem(`tutorial_alumno_seen_${alumno.id}`) === 'true';
    return isNew && !seen;
  });

  const [showExample, setShowExample] = useState(() => {
    return localStorage.getItem('isNewStudent') === 'true';
  });

  useEffect(() => {
    fetchDatosAlumno();
  }, [alumno.id]);

  const tutorialKey = `tutorial_alumno_seen_${alumno.id}`;

  const grupoEjemplo: Grupo = {
    id: 999,
    nombre: 'Beta Test Team',
    departamento: 'Investigación',
    estado: 'Casi terminado',
    progreso: 85,
    interacciones_ia: 42,
    miembros: [alumno.nombre || 'Tú', 'Sofía', 'Marco', 'Elena'],
    proyecto_id: 'demo'
  };

  const grupoDisplay = showExample ? grupoEjemplo : grupoReal;

  const evaluacionEjemplo = [
    { criterio: 'Colaboración y trabajo en equipo', puntos: 8, nivel: 'Notable' },
    { criterio: 'Uso crítico de la IA', puntos: 9, nivel: 'Sobresaliente' },
    { criterio: 'Aportación al producto', puntos: 8, nivel: 'Notable' },
    { criterio: 'Reflexión metacognitiva', puntos: 6, nivel: 'Suficiente' }
  ];

  const evaluacionAlumno = showExample ? evaluacionEjemplo : [];

  const fetchDatosAlumno = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      let targetProjectId = alumno.proyecto_id;
      let roomCode = alumno.codigo_sala || '';

      if (!targetProjectId && roomCode) {
        const { data: proyecto, error: errorProyecto } = await supabase
          .from('proyectos')
          .select('id, nombre')
          .eq('codigo_sala', roomCode)
          .single();

        if (errorProyecto || !proyecto) {
          setErrorStatus('CODIGO_INVALIDO');
          return;
        }
        targetProjectId = proyecto.id;
      }

      if (!targetProjectId) {
        setLoading(false);
        return;
      }

      // Sync History logic
      if (alumno.id && targetProjectId && roomCode) {
        const { data: projDetails } = await supabase.from('proyectos').select('nombre').eq('id', targetProjectId).single();
        if (projDetails) {
          const historyKey = `student_classes_history_${alumno.id}`;
          const historyStr = localStorage.getItem(historyKey);
          let history = historyStr ? JSON.parse(historyStr) : [];
          if (!history.some((h: any) => h.id === targetProjectId)) {
            history.push({
              id: targetProjectId,
              nombre: projDetails.nombre,
              codigo: roomCode,
              lastAccessed: Date.now()
            });
            localStorage.setItem(historyKey, JSON.stringify(history));
          }
        }
      }

      const { data: grupos, error: errorGrupos } = await supabase
        .from('grupos')
        .select('*')
        .eq('proyecto_id', targetProjectId);

      if (errorGrupos) throw errorGrupos;
      setTodosLosGrupos(grupos || []);

      const normalizar = (t: string) => (t || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const nombreAlumnoNorm = normalizar(alumno.nombre);

      const miGrupo = (grupos || []).find(g =>
        g.miembros?.some((m: string) => normalizar(m).includes(nombreAlumnoNorm))
      );

      if (miGrupo) {
        setGrupoReal(miGrupo);
      } else if (grupos && grupos.length > 0) {
        setGrupoReal(grupos[0]);
      } else {
        const placeholderGrupo: Grupo = {
          id: 0,
          nombre: 'Sin Equipo Asignado',
          departamento: 'General',
          estado: 'Pendiente',
          progreso: 0,
          interacciones_ia: 0,
          miembros: [alumno.nombre],
          proyecto_id: targetProjectId
        };
        setGrupoReal(placeholderGrupo);
        setTodosLosGrupos([]);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setErrorStatus('ERROR_TECNICO');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchClass = async (classData: any) => {
    setLoading(true);
    try {
      // Update user profile to point to the selected class
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          codigo_sala: classData.codigo,
          proyecto_id: classData.id
        }
      });
      if (updateError) throw updateError;

      // Sync public profile as well
      await supabase.from('profiles').update({
        codigo_sala: classData.codigo,
        proyecto_id: classData.id
      }).eq('id', alumno.id);

      toast.success(`Cambiando a clase: ${classData.nombre}`);
      // Force reload data by triggering re-fetch via auth state change/reload or just calling fetch
      // But fetch relies on props `alumno`. `alumno` comes from `App` which watches `user`.
      // Modifying auth metadata should trigger `useAuth` update eventually, but might be slow.
      // A hard reload is simplest for "Session" changes, or we can just `window.location.reload()`.
      window.location.reload();

    } catch (error) {
      console.error("Error switching class", error);
      toast.error("Error al cambiar de clase");
      setLoading(false);
    }
  };

  const handleTutorialComplete = () => {
    localStorage.setItem(tutorialKey, 'true');
    setTutorialActivo(false);
  };

  useEffect(() => {
    if (!grupoReal || !alumno) return;
    const channel = supabase.channel(`room:${grupoReal.proyecto_id}`)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: alumno.id,
            nombre: alumno.nombre,
            online_at: new Date().toISOString(),
          });
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, [grupoReal, alumno]);

  const notaMedia = evaluacionAlumno.length > 0
    ? evaluacionAlumno.reduce((sum, e) => sum + e.puntos, 0) / evaluacionAlumno.length
    : 0;

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Sobresaliente': return 'bg-emerald-500 text-white';
      case 'Notable': return 'bg-blue-500 text-white';
      case 'Suficiente': return 'bg-amber-500 text-white';
      default: return 'bg-rose-500 text-white';
    }
  };

  const handleJoinSuccess = async () => {
    setShowExample(false);
    localStorage.removeItem('isNewStudent');
    await fetchDatosAlumno();
    setLoading(false);
  };

  useEffect(() => {
    if (!alumno.proyecto_id && !alumno.codigo_sala && !loading && !showExample) {
      setModalUnirseOpen(true);
    }
  }, [alumno.proyecto_id, alumno.codigo_sala, loading, showExample]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Iniciando sesión segura...</p>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="min-h-screen bg-[#fcfdff] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Error de carga</h2>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm">Recargar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdff]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">
                {(alumno.nombre || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">¡Hola, {(alumno.nombre || 'Alumno').split(' ')[0]}!</h1>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{alumno.clase || 'Clase'} • {grupoDisplay?.nombre || 'Mi grupo'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* CODE BADGE */}
              {/* CODE BADGE - Polished */}
              {alumno.codigo_sala && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Código</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-indigo-700 tracking-wider text-sm">{alumno.codigo_sala}</span>
                  </div>
                </div>
              )}

              {/* CLASS SWITCHER */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm border border-transparent hover:border-indigo-100">
                    <History className="w-4 h-4" />
                    <span className="hidden sm:inline">Mis Clases</span>
                    <ChevronDown className="w-3 h-3 opacity-50 stroke-[3px]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-2 rounded-2xl border-slate-200 shadow-xl bg-white z-[100]">
                  <DropdownMenuLabel className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400">Historial de Clases</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  {(() => {
                    const historyKey = `student_classes_history_${alumno.id}`;
                    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
                    if (history.length === 0) return <div className="px-4 py-8 text-xs text-slate-400 text-center italic">No hay historial reciente</div>;

                    return history.map((h: any) => {
                      const isActive = alumno.proyecto_id === h.id;
                      return (
                        <DropdownMenuItem
                          key={h.id}
                          onClick={() => handleSwitchClass(h)}
                          className={`rounded-xl p-3 mb-1 cursor-pointer transition-all ${isActive ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50 border border-transparent"}`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${isActive ? "bg-indigo-600 text-white" : "bg-white border border-slate-100 text-slate-400"}`}>
                              {h.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col flex-1">
                              <span className={`text-sm font-bold ${isActive ? "text-indigo-900" : "text-slate-700"}`}>{h.nombre}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">COD: {h.codigo}</span>
                                {isActive && <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1">● Activo</span>}
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    });
                  })()}
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={() => setModalUnirseOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all font-bold text-sm"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Unirse a Clase</span>
              </button>
              <button
                onClick={() => setTutorialActivo(true)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <CircleHelp className="w-5 h-5" />
              </button>
              <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - 4 Pestañas */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-2">
            <button
              onClick={() => setVistaActiva('grupo')}
              className={`px-8 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'grupo'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Mi grupo</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('comunidad')}
              className={`px-8 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'comunidad'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Todos los grupos</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('chat')}
              className={`px-8 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'chat'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Mentor IA</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('perfil')}
              className={`px-8 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'perfil'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Mis notas</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {showExample && (
          <div className="bg-indigo-600 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            {/* ... Demo Banner styles ... */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30"><Sparkles className="w-6 h-6" /></div>
                <div><h3 className="text-xl font-black uppercase tracking-tight">Modo Demostración</h3><p className="text-indigo-100 text-sm font-medium">Visualiza cómo sería trabajar en equipo real.</p></div>
              </div>
              <button onClick={() => setModalUnirseOpen(true)} className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg">Unirse a clase</button>
            </div>
          </div>
        )}

        {/* VISTA MI GRUPO (Split 50/50 + Roadmap Vertical completo abajo) */}
        {vistaActiva === 'grupo' && grupoDisplay && (
          <div className="space-y-6">
            {grupoDisplay.id === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-200 text-center px-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">¡Bienvenido a la clase!</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                  Todavía no tienes un equipo asignado. Espera a que tu profesor te incluya en uno para comenzar.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Esperando asignación...
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                  {/* COLUMNA 1: Tarjeta de Grupo */}
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none mb-2">{grupoDisplay.nombre}</h2>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{grupoDisplay.departamento}</p>
                          </div>
                          <button
                            onClick={() => setModalSubirRecursoOpen(true)}
                            className="bg-slate-900 text-white w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all group"
                            title="Subir aportación"
                          >
                            <Upload className="w-6 h-6 group-hover:text-purple-400 transition-colors" />
                          </button>
                        </div>

                        <div className="mb-8">
                          <span className={`px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-full border-2 ${grupoDisplay.estado === 'Casi terminado' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            grupoDisplay.estado === 'En progreso' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              grupoDisplay.estado === 'Bloqueado' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>
                            {grupoDisplay.estado}
                          </span>
                        </div>

                        <div className="mb-8">
                          <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                            <span>Progreso del equipo</span>
                            <span className="text-slate-800">{grupoDisplay.progreso}%</span>
                          </div>
                          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                              style={{ width: `${grupoDisplay.progreso}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Compañeros</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {(grupoDisplay.miembros || []).map((miembro: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xs">
                                {miembro.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-700 text-xs tracking-tight truncate">{miembro}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA 2: Árbol de Progreso */}
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[400px]">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-4 z-10 w-full text-center">Nuestro Árbol</h2>
                    <div className="relative z-10 transform scale-100">
                      <LivingTree progress={grupoDisplay.progreso || 0} health={100} size={280} />
                    </div>
                    <div className="mt-8 flex gap-8 text-center">
                      <div>
                        <div className="text-2xl font-black text-slate-800">{grupoDisplay.progreso}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Crecimiento</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ROW 2: Roadmap Completo (Sin Scroll Horizontal) */}
                <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-200">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 px-2">Tareas</h3>

                  {(!grupoReal?.hitos || grupoReal.hitos.length === 0) ? (
                    <div className="text-center py-12 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 mb-2">¡Comienza tu Aventura!</h3>
                      <p className="text-slate-500 mb-6 max-w-md mx-auto">Tu mapa está vacío. Utiliza la IA para definir los logros y tareas clave de tu proyecto.</p>
                    </div>
                  ) : (
                    <RoadmapView
                      fases={(todosLosGrupos.length > 0 && alumno.proyecto_id) ? (PROYECTOS_MOCK.find(p => p.id === alumno.proyecto_id)?.fases || PROYECTOS_MOCK[0]?.fases || []) : []}
                      hitosGrupo={grupoReal?.hitos || []}
                      onToggleHito={async (faseId, hitoTitulo, currentStatus) => {
                        if (!grupoReal) return;

                        let nextStatus: HitoGrupo['estado'] | null = null;
                        if (currentStatus === 'pendiente' || currentStatus === 'propuesto' || currentStatus === 'rechazado') nextStatus = 'en_progreso';
                        else if (currentStatus === 'en_progreso') nextStatus = 'revision';

                        if (!nextStatus) return; // No action for other states

                        try {
                          const updatedHitos = (grupoReal.hitos || []).map(h =>
                            (h.fase_id === faseId && h.titulo === hitoTitulo)
                              ? { ...h, estado: nextStatus }
                              : h
                          ) as HitoGrupo[];

                          // Optimistic Update
                          setGrupoReal({ ...grupoReal, hitos: updatedHitos });

                          // DB Update
                          const { error } = await supabase
                            .from('grupos')
                            .update({ hitos: updatedHitos })
                            .eq('id', grupoReal.id);

                          if (error) throw error;

                          const msg = nextStatus === 'en_progreso' ? "¡Tarea iniciada! 🚀" : "¡Enviada a revisión! 📨";
                          toast.success(msg);
                        } catch (err) {
                          console.error("Error updating milestone:", err);
                          toast.error("Error al actualizar la tarea");
                        }
                      }}
                      onProposeMilestones={(faseId) => {
                        const fases = (todosLosGrupos.length > 0 && alumno.proyecto_id) ? (PROYECTOS_MOCK.find(p => p.id === alumno.proyecto_id)?.fases || PROYECTOS_MOCK[0]?.fases || []) : [];
                        const fase = fases.find(f => f.id === faseId);
                        if (fase) {
                          setFaseParaProponer(fase);
                          setModalProponerOpen(true);
                        }
                      }}
                      layout="compact-grid"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}


        {/* VISTA TODOS LOS GRUPOS (NUEVA: Comunidad con detalles) */}
        {
          vistaActiva === 'comunidad' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* 1. Árbol Global */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-4 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-indigo-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Progreso Global de la Clase</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-4 leading-none">Jardín Colaborativo</h2>
                    <p className="text-indigo-200 max-w-lg text-lg leading-relaxed">
                      Así es como vuestro esfuerzo conjunto hace crecer el proyecto global. Cada hito de cada grupo cuenta.
                    </p>
                  </div>
                  <div className="shrink-0 bg-white/5 rounded-full p-8 backdrop-blur-sm border border-white/10">
                    <LivingTree
                      progress={todosLosGrupos.reduce((acc, g) => acc + g.progreso, 0) / (todosLosGrupos.length || 1)}
                      health={100}
                      size={200}
                      isDark
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Lista de Progreso de Otros Grupos (DETALLADA) */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 h-fit">
                  <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Equipos en Misión</h3>
                  <div className="space-y-6">
                    {todosLosGrupos.map((g, idx) => {
                      // Calcular hitos pendientes (Mock logic: fases del proyecto)
                      const proyecto = PROYECTOS_MOCK.find(p => p.id === g.proyecto_id) || PROYECTOS_MOCK[0];
                      const hitosTotales = proyecto.fases.flatMap(f => f.hitos || []);
                      // Asumimos que los hitos en g.hitos están completados/aprobados
                      const hitosCompletadosLabels = (g.hitos || []).filter(h => h.estado === 'aprobado').map(h => h.titulo);
                      const hitosPendientes = hitosTotales.filter(h => !hitosCompletadosLabels.includes(h)).slice(0, 3); // Mostrar max 3

                      return (
                        <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-bold text-slate-700 text-sm">{g.nombre}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{g.departamento}</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">
                              {g.progreso}%
                            </div>
                          </div>

                          {/* Miembros mini */}
                          <div className="flex -space-x-2 mb-4 overflow-hidden py-1 pl-1">
                            {g.miembros?.map((m, i) => (
                              <div key={i} title={m} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-800 uppercase ring-1 ring-slate-100">
                                {m.charAt(0)}
                              </div>
                            ))}
                          </div>

                          {/* Hitos pendientes */}
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Trabajando en:</p>
                            {(() => {
                              // Logic: Show actual incomplete tasks (assignments)
                              const activeTasks = (g.hitos || []).filter(h => h.estado !== 'aprobado');
                              // If no custom tasks, maybe show defaults from mock?
                              // User rejected "examples", so let's stick to real data or "Sin tareas".
                              // If activeTasks is empty and progress < 100, they might be using defaults but we don't have them in 'g'.
                              // We'll show activeTasks if they exist.

                              if (activeTasks.length > 0) {
                                return activeTasks.slice(0, 3).map((h, i) => (
                                  <div key={i} className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${h.estado === 'revision' ? 'bg-amber-400 animate-pulse' :
                                        h.estado === 'en_progreso' ? 'bg-indigo-400' : 'bg-slate-300'
                                      }`}></div>
                                    <span className="text-[10px] font-medium text-slate-500 truncate" title={h.titulo}>{h.titulo}</span>
                                  </div>
                                ));
                              }

                              if (g.progreso === 100) return <div className="text-[10px] font-medium text-emerald-500">¡Proyecto Completado!</div>;
                              return <div className="text-[10px] font-medium text-slate-400 italic">Planificando próximas tareas...</div>;
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Repositorio Compartido */}
                <div className="lg:col-span-2">
                  <RepositorioColaborativo
                    grupo={grupoReal || grupoEjemplo} // Solo para contexto de permisos
                    todosLosGrupos={todosLosGrupos}
                    mostrarEjemplo={showExample}
                  />
                </div>
              </div>
            </div>
          )
        }

        {/* VISTA MENTOR IA */}
        {
          vistaActiva === 'chat' && grupoDisplay && (
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200 min-h-[600px]">
              <ChatIA grupo={grupoDisplay} mostrarEjemplo={showExample} />
            </div>
          )
        }

        {/* VISTA MIS NOTAS (Revertido a solo notas) */}
        {
          vistaActiva === 'perfil' && grupoDisplay && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2rem] p-6 shadow-lg text-white">
                  <div className="text-3xl font-bold">{notaMedia.toFixed(1)}</div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-90">Nota media</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-[2rem] p-6 shadow-lg text-white">
                  <div className="text-3xl font-bold">{Math.floor((grupoDisplay.interacciones_ia || 0) / (grupoDisplay.miembros?.length || 1))}</div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-90">Preguntas IA</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-[2rem] p-6 shadow-lg text-white">
                  <div className="text-3xl font-bold">{grupoDisplay.progreso}%</div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-90">Progreso Global</div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight uppercase">Tus notas</h2>
                <div className="space-y-6">
                  {evaluacionAlumno.map((item, index) => (
                    <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-700 uppercase tracking-widest text-xs">{item.criterio}</span>
                        <span className="font-black text-slate-900">{item.puntos}/10</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800" style={{ width: `${item.puntos * 10}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* YA NO HAY REPOSITORIO AQUÍ */}
            </div>
          )
        }
      </main >

      {tutorialActivo && (
        <TutorialInteractivo
          pasos={PASOS_TUTORIAL_ALUMNO}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialComplete}
          onStepChange={(index) => {
            const paso = PASOS_TUTORIAL_ALUMNO[index];
            if (paso.vista) {
              // Mapeo de la vista del tutorial a la vista interna del componente
              const targetView = paso.vista === 'notas' ? 'perfil' : paso.vista;
              setVistaActiva(targetView as 'grupo' | 'comunidad' | 'chat' | 'perfil');
            }
          }}
        />
      )}
      {modalUnirseOpen && <ModalUnirseClase onClose={() => setModalUnirseOpen(false)} onJoinSuccess={handleJoinSuccess} />}

      {
        modalSubirRecursoOpen && grupoDisplay && (
          <ModalSubirRecurso
            grupo={grupoDisplay}
            onClose={() => setModalSubirRecursoOpen(false)}
            onSuccess={() => { toast.success("Recurso subido con éxito"); }}
          />
        )
      }

      {
        modalProponerOpen && faseParaProponer && (
          <ModalProponerHitos
            fase={faseParaProponer}
            onClose={() => setModalProponerOpen(false)}
            onSubmit={async (nuevosHitos) => {
              if (grupoReal) {
                try {
                  const updatedHitos = [...(grupoReal.hitos || []), ...nuevosHitos] as HitoGrupo[];

                  // Optimistic update
                  setGrupoReal({ ...grupoReal, hitos: updatedHitos });

                  // DB Update
                  const { error } = await supabase
                    .from('grupos')
                    .update({ hitos: updatedHitos })
                    .eq('id', grupoReal.id);

                  if (error) throw error;

                  toast.success("Propuesta enviada al profesor correctamente");
                  setModalProponerOpen(false);
                } catch (error) {
                  console.error("Error saving milestones:", error);
                  toast.error("Error al guardar la propuesta. Inténtalo de nuevo.");
                }
              }
            }}
          />
        )
      }
    </div >
  );
}
// Dashboard Alumno Component