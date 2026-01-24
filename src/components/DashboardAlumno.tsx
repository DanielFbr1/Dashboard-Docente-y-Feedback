import { User, LogOut, Award, MessageSquare, Users, TrendingUp, Share2, Loader2, CircleHelp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Grupo } from '../types';
import { supabase } from '../lib/supabase';
import { ChatIA } from './ChatIA';
import { RepositorioColaborativo } from './RepositorioColaborativo';
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
  const [vistaActiva, setVistaActiva] = useState<'perfil' | 'grupo' | 'chat' | 'progreso' | 'compartir'>('grupo');
  const [grupoReal, setGrupoReal] = useState<Grupo | null>(null);
  const [todosLosGrupos, setTodosLosGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [modalUnirseOpen, setModalUnirseOpen] = useState(false);

  // Estado del tutorial para Alumnos
  // Mostrar SOLO si acaba de registrarse (isNewStudent)
  const [showTutorial, setShowTutorial] = useState(() => {
    const isNewStudent = localStorage.getItem('isNewStudent') === 'true';
    if (isNewStudent) {
      localStorage.removeItem('isNewStudent');
      return true; // Mostrar tutorial
    }
    return false;
  });

  // Estado para el Ejemplo Completo (se muestra mientras el tutorial está activo o el usuario es nuevo)
  const [showExample, setShowExample] = useState(showTutorial);

  // Sincronizar ejemplo con tutorial (si se cierra tutorial, quitamos ejemplo - OPCIONAL, según petición)
  useEffect(() => {
    // El usuario pidió: "desaparezca conforme van pasando" -> "y tambien desaparezca"
    // Lo vinculamos a showTutorial para que al cerrarlo (completar o saltar) se limpie.
    if (!showTutorial) {
      setShowExample(false);
    }
  }, [showTutorial]);


  useEffect(() => {
    fetchDatosAlumno();
  }, [alumno.id]);

  // Clave para marcar como visto (aunque usamos la lógica de creación de cuenta principalmente)
  const tutorialKey = `tutorial_alumno_seen_${alumno.id}`;

  // Ejemplo de Grupo para el tutorial
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

  // Grupo a mostrar: Real o Ejemplo
  const grupoDisplay = showExample ? grupoEjemplo : grupoReal;

  // ... (fetchDatosAlumno logic remains same, not touching it yet)

  // ... (handleTutorialComplete logic remains same)

  // ... (Realtime effect remains same)

  // Evaluación simulada del alumno (Solo visible en Modo Ejemplo)
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

      console.log("🔍 Iniciando carga de datos para alumno:", alumno.nombre);

      let targetProjectId = alumno.proyecto_id;
      let roomCode = alumno.codigo_sala || '';

      if (!targetProjectId && roomCode) {
        console.log("📡 Buscando proyecto por código:", roomCode);

        const { data: proyecto, error: errorProyecto } = await supabase
          .from('proyectos')
          .select('id, nombre')
          .eq('codigo_sala', roomCode)
          .single();

        if (errorProyecto || !proyecto) {
          console.error("❌ Proyecto no encontrado por código:", roomCode, errorProyecto);
          setErrorStatus('CODIGO_INVALIDO');
          return;
        }
        targetProjectId = proyecto.id;
      }

      if (!targetProjectId) {
        console.log("ℹ️ Alumno sin proyecto asignado. Mostrando estado vacío.");
        // No es error, simplemente no tiene grupo.
        setLoading(false);
        return;
      }

      console.log("✅ Proyecto identificado:", targetProjectId);

      // 2. Buscar todos los grupos de ese proyecto
      const { data: grupos, error: errorGrupos } = await supabase
        .from('grupos')
        .select('*')
        .eq('proyecto_id', targetProjectId);

      if (errorGrupos) {
        console.error("❌ Error al obtener grupos:", errorGrupos);
        throw errorGrupos;
      }
      setTodosLosGrupos(grupos || []);

      // 3. Identificar el grupo del alumno por su nombre en los miembros
      // Normalizamos nombres para evitar fallos por tildes o espacios extras
      const normalizar = (t: string) => (t || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const nombreAlumnoNorm = normalizar(alumno.nombre);

      const miGrupo = (grupos || []).find(g =>
        g.miembros?.some((m: string) => normalizar(m).includes(nombreAlumnoNorm))
      );

      if (miGrupo) {
        setGrupoReal(miGrupo);
      } else if (grupos && grupos.length > 0) {
        // Si hay grupos pero no aparece en ninguno, le asignamos el primero como failover
        setGrupoReal(grupos[0]);
      } else {
        // CASO CRÍTICO: El proyecto no tiene grupos creados aún.
        // Creamos un grupo placeholder para que el alumno no se quede bloqueado.
        const placeholderGrupo: Grupo = {
          id: 0,
          nombre: 'Equipo de Bienvenida',
          departamento: 'Pendiente',
          estado: 'En progreso',
          progreso: 0,
          interacciones_ia: 0,
          miembros: [alumno.nombre],
          proyecto_id: targetProjectId
        };
        setGrupoReal(placeholderGrupo);
        setTodosLosGrupos([placeholderGrupo]);
        // No bloqueamos con errorStatus para que pueda entrar al tutorial
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setErrorStatus('ERROR_TECNICO');
    } finally {
      setLoading(false);
    }
  };

  const handleTutorialComplete = () => {
    localStorage.setItem(tutorialKey, 'true');
    setShowTutorial(false);
  };

  // 4. Conexión Realtime y Presencia
  useEffect(() => {
    if (!grupoReal || !alumno) return;

    const channel = supabase.channel(`room:${grupoReal.proyecto_id}`)
      .on('presence', { event: 'sync' }, () => {
        // Aquí podríamos recibir el estado global si quisiéramos
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: alumno.id,
            nombre: alumno.nombre,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [grupoReal, alumno]);

  // Evaluación simulada del alumno (esto podría venir de la BD también en el futuro)
  // Se calcula nota media solo si hay evaluación
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
    // Recargar datos tras unirse
    await fetchDatosAlumno();
    setLoading(false);
  };

  // Si no hay código ni proyecto, mostramos el modal para unirse a clase automáticamente,
  // pero NO bloqueamos la vista principal.
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
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-100">
            <CircleHelp className="w-10 h-10 text-rose-500" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">
            {errorStatus === 'CODIGO_INVALIDO' ? 'Código no encontrado' : 'Error de carga'}
          </h2>

          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            {errorStatus === 'CODIGO_INVALIDO'
              ? 'El código de sala que tienes asignado ya no existe. Posiblemente el proyecto haya sido borrado.'
              : 'Ha habido un problema al conectar con el servidor o cargar tu perfil.'}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-lg"
            >
              Reintentar Limpiando
            </button>
            <button
              onClick={onLogout}
              className="w-full py-4 bg-white text-slate-400 rounded-2xl font-bold uppercase tracking-widest text-xs hover:text-slate-600 transition-all"
            >
              Cerrar sesión
            </button>
          </div>
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
              <button
                onClick={() => setModalUnirseOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all font-bold text-sm"
                title="Unirse a otra clase"
              >
                <Key className="w-4 h-4" />
                <span>Unirse a clase</span>
              </button>
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="Mostrar tutorial"
              >
                <CircleHelp className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - REORDENADA (Evaluación al final) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-2">
            <button
              onClick={() => setVistaActiva('grupo')}
              className={`px-6 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'grupo'
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
              onClick={() => setVistaActiva('compartir')}
              className={`px-6 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'compartir'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('progreso')}
              className={`px-6 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'progreso'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Progreso</span>
              </div>
            </button>
            <button
              onClick={() => setVistaActiva('chat')}
              className={`px-6 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'chat'
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
              className={`px-6 py-5 font-bold text-xs uppercase tracking-widest transition-all border-b-[3px] ${vistaActiva === 'perfil'
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
        {!grupoDisplay && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-700 font-medium mb-6 flex justify-between items-center">
            <span>No estás asignado a ninguna clase o grupo todavía.</span>
            <button
              onClick={() => setModalUnirseOpen(true)}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-bold transition-colors"
            >
              Unirse a una clase
            </button>
          </div>
        )}

        {vistaActiva === 'perfil' && grupoDisplay && (
          <div className="flex flex-col gap-6">
            {/* Estadísticas personales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg shadow-emerald-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-3xl font-bold">{notaMedia.toFixed(1)}</div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-90">Nota media</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-lg shadow-blue-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-3xl font-bold">
                      {Math.floor((grupoDisplay.interacciones_ia || 0) / (grupoDisplay.miembros?.length || 1))}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">Preguntas a IA</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg shadow-purple-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-3xl font-bold">{grupoDisplay.progreso}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">Progreso grupo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluación por criterios */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight uppercase">Tus notas</h2>
              <div className="space-y-6">
                {evaluacionAlumno.map((item, index) => (
                  <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-widest">{item.criterio}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm ${getNivelColor(item.nivel)}`}>
                          {item.nivel}
                        </span>
                        <div className="text-3xl font-black text-slate-800">
                          {item.puntos}
                          <span className="text-xl text-slate-400 font-medium ml-1">/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-1000 ${item.nivel === 'Sobresaliente' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                          item.nivel === 'Notable' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                            item.nivel === 'Suficiente' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                              'bg-gradient-to-r from-rose-500 to-pink-600'
                          }`}
                        style={{ width: `${(item.puntos / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-widest">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                Áreas de mejora
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0"></div>
                  <span className="text-sm font-medium text-slate-600">Sigue usando el Mentor IA para hacer preguntas reflexivas - ¡lo estás haciendo genial!</span>
                </li>
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                  <span className="text-sm font-medium text-slate-600">Intenta documentar mejor tu proceso de aprendizaje en cada fase del proyecto</span>
                </li>
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-500 shrink-0"></div>
                  <span className="text-sm font-medium text-slate-600">Comparte más tus ideas creativas durante las sesiones de trabajo en grupo</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {vistaActiva === 'grupo' && grupoDisplay && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{grupoDisplay.nombre}</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{grupoDisplay.departamento}</p>
                </div>
                <span className={`px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-full border-2 ${grupoDisplay.estado === 'Casi terminado' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  grupoDisplay.estado === 'En progreso' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    grupoDisplay.estado === 'Bloqueado' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                  {grupoDisplay.estado}
                </span>
              </div>

              <div className="mb-10">
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

              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Compañeros de equipo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(grupoDisplay.miembros || []).map((miembro: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-colors">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-purple-600 font-bold shadow-sm">
                        {miembro.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700 text-sm tracking-tight">{miembro}</span>
                      {miembro.toLowerCase().includes(alumno.nombre.toLowerCase()) && (
                        <span className="ml-auto px-2 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                          Tú
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'compartir' && grupoDisplay && (
          <RepositorioColaborativo grupo={grupoDisplay} todosLosGrupos={todosLosGrupos} />
        )}

        {vistaActiva === 'progreso' && grupoDisplay && (
          <div className="flex flex-col gap-8">

            {/* 1. Living Tree Visualization */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>

              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-2 z-10">Nuestro Árbol de Proyecto</h2>
              <p className="text-sm text-slate-500 font-medium mb-8 z-10 text-center max-w-lg">
                Este árbol representa vuestro esfuerzo. Completad hitos para hacerlo crecer y trabajad regularmente para mantenerlo sano.
              </p>

              <div className="relative z-10 mb-8">
                <LivingTree
                  progress={grupoDisplay.progreso || 0}
                  health={100} // Default health for now 
                  size={280}
                />
              </div>

              <div className="flex gap-8 text-center bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-2xl font-black text-slate-800">{grupoDisplay.progreso}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Crecimiento</div>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">Radiante</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado de salud</div>
                </div>
              </div>
            </div>

            {/* 2. Interactive Roadmap */}
            <div className="bg-slate-50 rounded-3xl p-1 border border-slate-200">
              <RoadmapView
                fases={
                  // Buscar las fases del proyecto actual. Si no hay (ej. mock), usamos las del mock p1
                  (todosLosGrupos.length > 0 && alumno.proyecto_id)
                    ? (PROYECTOS_MOCK.find(p => p.id === alumno.proyecto_id)?.fases || (PROYECTOS_MOCK[0]?.fases || []))
                    : (PROYECTOS_MOCK[0]?.fases || [])
                }
                hitosGrupo={grupoReal?.hitos || []}
                onToggleHito={async (faseId, hitoTitulo, currentEstado) => {
                  if (!grupoReal || !alumno) return;

                  try {
                    // Preparamos el nuevo estado del hito
                    const nuevoHito: HitoGrupo = {
                      id: `${faseId}_${hitoTitulo.replace(/\s+/g, '_')}`,
                      fase_id: faseId,
                      titulo: hitoTitulo,
                      estado: 'revision'
                    };

                    // Obtenemos los hitos actuales y actualizamos/añadimos
                    const hitosActuales = [...(grupoReal.hitos || [])];
                    const index = hitosActuales.findIndex(h => h.fase_id === faseId && h.titulo === hitoTitulo);

                    if (index >= 0) {
                      hitosActuales[index] = nuevoHito;
                    } else {
                      hitosActuales.push(nuevoHito);
                    }

                    // Guardamos en Supabase
                    const { error } = await supabase
                      .from('grupos')
                      .update({ hitos: hitosActuales })
                      .eq('id', grupoReal.id);

                    if (error) throw error;

                    // Actualizamos estado local para feedback instantáneo
                    const grupoActualizado = { ...grupoReal, hitos: hitosActuales };
                    setGrupoReal(grupoActualizado);

                    toast.success("¡Hito enviado a revisión! El profesor lo verá pronto.");
                  } catch (err: any) {
                    console.error("Error al actualizar hito:", err);
                    toast.error("No se pudo enviar el hito: " + err.message);
                  }
                }}
              />
            </div>
          </div>
        )}

        {vistaActiva === 'chat' && grupoDisplay && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 min-h-[600px]">
            <ChatIA grupo={grupoDisplay} />
          </div>
        )}
      </main>

      {/* Tutorial Interactivo */}
      {showTutorial && (
        <TutorialInteractivo
          pasos={PASOS_TUTORIAL_ALUMNO}
          onComplete={handleTutorialComplete}
          onSkip={() => setShowTutorial(false)}
        />
      )}

      {/* Modal Unirse a Clase */}
      {modalUnirseOpen && (
        <ModalUnirseClase
          onClose={() => setModalUnirseOpen(false)}
          onJoinSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
}