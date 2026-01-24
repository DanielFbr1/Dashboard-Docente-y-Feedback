import { User, LogOut, Award, MessageSquare, Users, TrendingUp, Share2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Grupo } from '../types';
import { supabase } from '../lib/supabase';
import { ChatIA } from './ChatIA';
import { RepositorioColaborativo } from './RepositorioColaborativo';

interface DashboardAlumnoProps {
  alumno: {
    nombre: string;
    clase: string;
    grupo: string; // Este es el Código de Sala
  };
  onLogout: () => void;
}

export function DashboardAlumno({ alumno, onLogout }: DashboardAlumnoProps) {
  const [vistaActiva, setVistaActiva] = useState<'perfil' | 'grupo' | 'chat' | 'progreso' | 'compartir'>('grupo');
  const [grupoReal, setGrupoReal] = useState<Grupo | null>(null);
  const [todosLosGrupos, setTodosLosGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatosAlumno();
  }, []);

  const fetchDatosAlumno = async () => {
    try {
      setLoading(true);
      // 1. Buscar el proyecto por código de sala
      const { data: proyecto, error: errorProyecto } = await supabase
        .from('proyectos')
        .select('id')
        .eq('codigo_sala', alumno.grupo)
        .single();

      if (errorProyecto || !proyecto) throw new Error('Proyecto no encontrado');

      // 2. Buscar todos los grupos de ese proyecto
      const { data: grupos, error: errorGrupos } = await supabase
        .from('grupos')
        .select('*')
        .eq('proyecto_id', proyecto.id);

      if (errorGrupos) throw errorGrupos;
      setTodosLosGrupos(grupos || []);

      // 3. Identificar el grupo del alumno por su nombre en los miembros
      const miGrupo = (grupos || []).find(g =>
        g.miembros.some((m: string) => m.toLowerCase().includes(alumno.nombre.toLowerCase()))
      );

      if (miGrupo) {
        setGrupoReal(miGrupo);
      } else {
        // Si no se encuentra, usamos el primero por defecto (demo/failover)
        setGrupoReal(grupos?.[0] || null);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Evaluación simulada del alumno (esto podría venir de la BD también en el futuro)
  const evaluacionAlumno = [
    { criterio: 'Colaboración y trabajo en equipo', puntos: 8, nivel: 'Notable' },
    { criterio: 'Uso crítico de la IA', puntos: 9, nivel: 'Sobresaliente' },
    { criterio: 'Aportación al producto', puntos: 8, nivel: 'Notable' },
    { criterio: 'Reflexión metacognitiva', puntos: 6, nivel: 'Suficiente' }
  ];

  const notaMedia = evaluacionAlumno.reduce((sum, e) => sum + e.puntos, 0) / evaluacionAlumno.length;

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Sobresaliente': return 'bg-emerald-500 text-white';
      case 'Notable': return 'bg-blue-500 text-white';
      case 'Suficiente': return 'bg-amber-500 text-white';
      default: return 'bg-rose-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Cargando tu espacio de trabajo...</p>
        </div>
      </div>
    );
  }

  if (!grupoReal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ups, parece que no estás asignado aún</h1>
          <p className="text-gray-600 mb-6">Pide a tu profesor/a que te añada a un equipo para empezar.</p>
          <button onClick={onLogout} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold">Volver al login</button>
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
                {alumno.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">¡Hola, {alumno.nombre.split(' ')[0]}!</h1>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{alumno.clase} • {grupoReal.nombre}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
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
                <span>Mi evaluación</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {vistaActiva === 'perfil' && (
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
                      {Math.floor((grupoReal.interacciones_ia || 0) / (grupoReal.miembros?.length || 1))}
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
                    <div className="text-3xl font-bold">{grupoReal.progreso}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">Progreso grupo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluación por criterios */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight uppercase">Tu evaluación</h2>
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

        {vistaActiva === 'grupo' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{grupoReal.nombre}</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{grupoReal.departamento}</p>
                </div>
                <span className={`px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-full border-2 ${grupoReal.estado === 'Casi terminado' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  grupoReal.estado === 'En progreso' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    grupoReal.estado === 'Bloqueado' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                  {grupoReal.estado}
                </span>
              </div>

              <div className="mb-10">
                <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                  <span>Progreso del equipo</span>
                  <span className="text-slate-800">{grupoReal.progreso}%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${grupoReal.progreso}%` }}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Compañeros de equipo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grupoReal.miembros.map((miembro: string, index: number) => (
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

        {vistaActiva === 'compartir' && (
          <RepositorioColaborativo grupo={grupoReal} todosLosGrupos={todosLosGrupos} />
        )}

        {vistaActiva === 'progreso' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight uppercase">Progreso de la sesión</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todosLosGrupos.map((grupo) => (
                  <div
                    key={grupo.id}
                    className={`p-6 rounded-2xl border-2 transition-all ${grupo.id === grupoReal.id
                      ? 'bg-purple-50 border-purple-200 ring-4 ring-purple-600/5'
                      : 'bg-white border-slate-100'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-start flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 tracking-tight">{grupo.nombre}</h3>
                          {grupo.id === grupoReal.id && (
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                              TU EQUIPO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{grupo.departamento}</span>
                      </div>
                      <span className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-full border ${grupo.estado === 'Casi terminado' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        grupo.estado === 'En progreso' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          grupo.estado === 'Bloqueado' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {grupo.estado}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] mb-2 font-black text-slate-500 uppercase tracking-widest">
                      <span>Progreso</span>
                      <span>{grupo.progreso}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${grupo.id === grupoReal.id ? 'bg-purple-600' : 'bg-slate-300'}`}
                        style={{ width: `${grupo.progreso}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {vistaActiva === 'chat' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 min-h-[600px]">
            <ChatIA grupo={grupoReal} />
          </div>
        )}
      </main>
    </div>
  );
}