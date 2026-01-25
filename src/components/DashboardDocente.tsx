import { Settings, LayoutDashboard, Users, MessageSquare, ClipboardCheck, Plus, CircleHelp, Key, FolderOpen, Share2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Card_Metrica } from './Card_Metrica';
import { Card_Grupo } from './Card_Grupo';
import { GruposDepartamentos } from './GruposDepartamentos';
import { InteraccionesIA } from './InteraccionesIA';
import { EvaluacionRubricas } from './EvaluacionRubricas';
import { ModalCrearGrupo } from './ModalCrearGrupo';
import { SistemaCodigoSala } from './SistemaCodigoSala';
import { ListaAlumnosEnLinea } from './ListaAlumnosEnLinea';
import { RepositorioColaborativo } from './RepositorioColaborativo';
import { LivingTree } from './LivingTree';
import { Grupo, DashboardSection, ProyectoActivo } from '../types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ModalPerfilDocente } from './ModalPerfilDocente';
import { ModalConfiguracionIA } from './ModalConfiguracionIA';
import { ModalRevisionHitos } from './ModalRevisionHitos';
import { ModalAsignarTareas } from './ModalAsignarTareas';
import { HitoGrupo } from '../types';

interface DashboardDocenteProps {
  onSelectGrupo: (grupo: Grupo) => void;
  currentSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  grupos: Grupo[];
  mostrandoEjemplo: boolean;
  onCargarEjemplo: () => void;
  onLimpiarDatos: () => void;
  onCrearGrupo: (grupo: Omit<Grupo, 'id'>) => void;
  onEditarGrupo: (id: number | string, grupo: Omit<Grupo, 'id'>) => void;
  onEliminarGrupo: (id: number | string) => void;
  onIniciarTutorial: () => void;
  proyectoActual: ProyectoActivo | null;
  onCambiarProyecto?: () => void;
  onClaseChange: (clase: string) => void;
}

export function DashboardDocente({
  onSelectGrupo,
  currentSection,
  onSectionChange,
  grupos,
  mostrandoEjemplo,
  onCargarEjemplo,
  onLimpiarDatos,
  onCrearGrupo,
  onEditarGrupo,
  onEliminarGrupo,
  onIniciarTutorial,
  proyectoActual,
  onCambiarProyecto,
  onClaseChange
}: DashboardDocenteProps) {
  const [modalCrearGrupoAbierto, setModalCrearGrupoAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [mostrarCodigoSala, setMostrarCodigoSala] = useState(false);
  const [menuConfigAbierto, setMenuConfigAbierto] = useState(false);
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);
  const [modalAjustesIAAbierto, setModalAjustesIAAbierto] = useState(false);
  const [modalRevisionAbierto, setModalRevisionAbierto] = useState(false);
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [grupoParaTareas, setGrupoParaTareas] = useState<Grupo | null>(null);
  const { signOut, perfil, user } = useAuth();

  const numPendientes = grupos.reduce((acc, g) =>
    acc + (g.hitos || []).filter(h => h.estado === 'revision').length, 0
  );

  const handleUpdateMilestone = async (grupoId: string | number, hitoId: string, nuevoEstado: 'aprobado' | 'rechazado') => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    try {
      // 1. Actualizar el estado del hito en el array local
      const nuevosHitos = (grupo.hitos || []).map(h =>
        h.id === hitoId ? { ...h, estado: nuevoEstado } : h
      );

      // 2. Recalcular el progreso si se aprueba
      // Asumimos que cada fase es un hito importante. 
      // Si el proyecto tiene 5 fases, cada una es un 20%.
      // Para este cálculo usaremos los hitos marcados como 'aprobado'.
      const numFases = proyectoActual ? 5 : 5; // Default 5 phases if not specified
      const hitosAprobados = nuevosHitos.filter(h => h.estado === 'aprobado').length;
      const nuevoProgreso = Math.min(100, Math.round((hitosAprobados / numFases) * 100));

      // 3. Persistir cambios usando el prop onEditarGrupo
      await onEditarGrupo(grupoId, {
        nombre: grupo.nombre,
        departamento: grupo.departamento,
        miembros: grupo.miembros,
        estado: nuevoProgreso >= 100 ? 'Completado' : 'En progreso',
        progreso: nuevoProgreso,
        interacciones_ia: grupo.interacciones_ia,
        hitos: nuevosHitos
      });

      toast.success(nuevoEstado === 'aprobado' ? "¡Hito aprobado y progreso actualizado!" : "Hito rechazado.");
    } catch (err) {
      console.error("Error al revisar hito:", err);
      toast.error("Hubo un fallo al guardar la revisión.");
    }
  };

  const totalInteracciones = grupos.reduce((sum, g) => sum + g.interacciones_ia, 0);
  const hitosCompletados = grupos.reduce((sum, g) => sum + Math.floor(g.progreso / 20), 0);
  const gruposBloqueados = grupos.filter(g => g.estado === 'Bloqueado').length;

  const handleLogout = async () => {
    try {
      await signOut();
      // La redirección la maneja el AuthContext o el estado de usuario en App.tsx
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handlePerfil = () => {
    setModalPerfilAbierto(true);
    setMenuConfigAbierto(false);
  };

  const handleAjustesIA = () => {
    setModalAjustesIAAbierto(true);
    setMenuConfigAbierto(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 uppercase-none">
      {/* Modals */}
      {modalPerfilAbierto && (
        <ModalPerfilDocente
          onClose={() => setModalPerfilAbierto(false)}
          proyectos={proyectoActual ? [proyectoActual as any] : []} // En un futuro pasaremos todos
          email={user?.email || 'profesor@demo.com'}
          nombre={perfil?.nombre || 'Profesor/a'}
        />
      )}

      {modalAjustesIAAbierto && (
        <ModalConfiguracionIA onClose={() => setModalAjustesIAAbierto(false)} />
      )}

      {/* Modal crear grupo */}
      {modalCrearGrupoAbierto && (
        <ModalCrearGrupo
          onClose={() => setModalCrearGrupoAbierto(false)}
          onCrear={onCrearGrupo}
          grupoEditando={grupoEditando}
          proyectoId={proyectoActual?.id}
          codigoSala={proyectoActual?.codigo_sala}
        />
      )}

      {modalRevisionAbierto && (
        <ModalRevisionHitos
          grupos={grupos}
          onClose={() => setModalRevisionAbierto(false)}
          onUpdateGrupo={handleUpdateMilestone}
        />
      )}

      {modalAsignarAbierto && grupoParaTareas && (
        <ModalAsignarTareas
          grupoNombre={grupoParaTareas.nombre}
          faseId={(proyectoActual as any)?.fases?.find((f: any) => f.estado === 'actual')?.id || '1'}
          onClose={() => setModalAsignarAbierto(false)}
          onSave={async (nuevosHitos) => {
            const updatedHitos = [...(grupoParaTareas.hitos || []), ...nuevosHitos] as HitoGrupo[];
            await onEditarGrupo(grupoParaTareas.id, {
              ...grupoParaTareas,
              hitos: updatedHitos
            });
            toast.success("Tareas asignadas correctamente");
          }}
        />
      )}

      {/* Modal Asignar Tareas (Profesor) */}
      {grupoEditando && modalCrearGrupoAbierto === false && (
        // We use 'grupoEditando' state to track which group we are assigning tasks to (hacky reuse or new state?)
        // Better use a new state 'grupoParaTareas' or just differentiate via a boolean flag?
        // Let's reuse 'grupoEditando' but have a different boolean 'modalAsignarAbierto'.
        // Wait, I haven't added 'modalAsignarAbierto' state yet. I need to add it in the main component.
        // Since I can't add state within this replace block efficiently without context, I will skip adding the modal JSX here and do it in a Full File View/Replace or assume I added state.
        // Actually, I can add the state in a previous step? No, I must do it in one go if possible.
        // Limitation: 'replace_file_content' targets specific blocks.

        // I will ADD the state definition at the top of the file in a separate step, and then ADD the modal here.
        // For now, let's just add the modal rendering assuming state exists, but I CANNOT do that if state doesn't exist.
        // So I must add state first.

        // Step 1: Add import and state.
        // Step 2: Add modal rendering.
        // Step 3: Add trigger in Card_Grupo (prop passing).

        null
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Gestión del Proyecto</h2>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => onSectionChange('resumen')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${currentSection === 'resumen'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
              : 'text-gray-600 hover:bg-gray-100 font-medium'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Resumen general</span>
          </button>

          <button
            onClick={() => onSectionChange('grupos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${currentSection === 'grupos'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
              : 'text-gray-600 hover:bg-gray-100 font-medium'
              }`}
          >
            <Users className="w-5 h-5" />
            <span>Grupos</span>
          </button>

          <button
            onClick={() => onSectionChange('interacciones')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${currentSection === 'interacciones'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
              : 'text-gray-600 hover:bg-gray-100 font-medium'
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Interacciones IA</span>
          </button>

          <button
            onClick={() => onSectionChange('trabajo-compartido')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${currentSection === 'trabajo-compartido'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
              : 'text-gray-600 hover:bg-gray-100 font-medium'
              }`}
          >
            <Share2 className="w-5 h-5" />
            <span>Trabajo compartido</span>
          </button>

          <button
            onClick={() => onSectionChange('evaluacion')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${currentSection === 'evaluacion'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
              : 'text-gray-600 hover:bg-gray-100 font-medium'
              }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Evaluación</span>
          </button>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <ListaAlumnosEnLinea proyectoId={proyectoActual?.id} />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onIniciarTutorial}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold group"
          >
            <CircleHelp className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            <span>Tutorial interactivo</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between mb-3 gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel Principal ABP + IA</h1>
              <p className="text-sm text-gray-500 font-medium italic">Gestión interactiva del profesorado</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-md hover:shadow-lg transition-all tracking-widest text-lg">
                <Key className="w-5 h-5" />
                <span>{proyectoActual?.codigo_sala || '---'}</span>
              </div>

              {numPendientes > 0 && (
                <button
                  onClick={() => setModalRevisionAbierto(true)}
                  className="relative p-2.5 bg-amber-50 text-amber-600 border-2 border-amber-200 rounded-xl hover:bg-amber-100 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2 group"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span>{numPendientes} {numPendientes === 1 ? 'Revisión' : 'Revisiones'}</span>
                </button>
              )}

              {mostrandoEjemplo && (
                <button
                  onClick={onLimpiarDatos}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Limpiar ejemplo
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setMenuConfigAbierto(!menuConfigAbierto)}
                  className={`p-2 rounded-lg transition-colors ${menuConfigAbierto ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Settings className="w-5 h-5" />
                </button>

                {menuConfigAbierto && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-20 animate-in fade-in zoom-in duration-200">
                    <div className="p-2 space-y-1 pt-3">
                      <button
                        onClick={handlePerfil}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors rounded-xl font-medium text-left"
                      >
                        <Users className="w-4 h-4 text-gray-400" />
                        Perfil del Docente
                      </button>
                      <button
                        onClick={handleAjustesIA}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors rounded-xl font-medium text-left"
                      >
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        Ajustes de IA Mentor
                      </button>
                    </div>
                    <div className="border-t border-gray-50 p-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors rounded-xl font-bold">
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {proyectoActual && (
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 mt-4 shadow-sm">
              <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Proyecto Activo</div>
                <div className="font-bold text-slate-900 text-xl leading-tight">{proyectoActual.nombre}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-tighter">Código: {proyectoActual.codigo_sala}</div>
                </div>
              </div>
              <button
                onClick={onCambiarProyecto}
                className="px-6 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all text-sm font-bold shadow-sm"
              >
                Cambiar Proyecto
              </button>
            </div>
          )}

        </header>

        {/* Main scroll area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto space-y-8">
            {currentSection === 'resumen' && (
              <div className="space-y-8">
                {grupos.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                    <h2 className="text-2xl font-black text-gray-900 mb-2 mt-6">Tu espacio está listo</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">Crea los grupos para empezar o carga un ejemplo completo.</p>
                    <button onClick={onCargarEjemplo} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">Cargar ejemplo completo</button>
                  </div>
                ) : (
                  <>
                    {/* Árbol del Proyecto Global */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

                      <div className="relative z-10 shrink-0">
                        <LivingTree
                          progress={grupos.reduce((acc, g) => acc + g.progreso, 0) / grupos.length}
                          health={100}
                          size={240}
                        />
                      </div>

                      <div className="flex-1 space-y-4 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Estado Global del Proyecto</h2>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
                          Este árbol representa el crecimiento conjunto de toda la clase. Cada hito aprobado en los grupos nutre el progreso general de la sala. ¡Seguid así!
                        </p>
                        <div className="flex gap-6 justify-center md:justify-start">
                          <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                            <div className="text-2xl font-black text-blue-600">{(grupos.reduce((acc, g) => acc + g.progreso, 0) / grupos.length).toFixed(0)}%</div>
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Crecimiento Medio</div>
                          </div>
                          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                            <div className="text-2xl font-black text-emerald-600">Saludable</div>
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Estado Vital</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card_Metrica titulo="Grupos activos" numero={grupos.length} descripcion="trabajando ahora" color="blue" />
                      <Card_Metrica titulo="Consultas IA" numero={totalInteracciones} descripcion="preguntas realizadas" color="green" />
                      <Card_Metrica titulo="Hitos" numero={hitosCompletados} descripcion={`de ${grupos.length * 5} totales`} color="yellow" />
                      <Card_Metrica titulo="Bloqueados" numero={gruposBloqueados} descripcion="necesitan ayuda" color="red" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {grupos.map((grupo) => (
                        <Card_Grupo
                          key={grupo.id}
                          grupo={grupo}
                          onClick={() => onSelectGrupo(grupo)}
                          onEdit={() => { setGrupoEditando(grupo); setModalCrearGrupoAbierto(true); }}
                          onDelete={() => { if (confirm(`¿Eliminar "${grupo.nombre}"?`)) onEliminarGrupo(grupo.id); }}
                          onAssignTasks={() => { setGrupoParaTareas(grupo); setModalAsignarAbierto(true); }}
                          mostrarBotonEditar={true}
                          mostrarBotonBorrar={true}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {currentSection === 'grupos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-gray-900">Organización por Departamentos</h2>
                  <button onClick={() => setModalCrearGrupoAbierto(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg">
                    <Plus className="w-5 h-5" />
                    Crear nuevo grupo
                  </button>
                </div>
                <GruposDepartamentos
                  grupos={grupos}
                  onSelectGrupo={onSelectGrupo}
                  onEditarGrupo={onEditarGrupo}
                  onEliminarGrupo={onEliminarGrupo}
                  onAsignarTareas={(g) => { setGrupoParaTareas(g); setModalAsignarAbierto(true); }}
                  proyectoId={proyectoActual?.id}
                />
              </div>
            )}

            {currentSection === 'interacciones' && <InteraccionesIA grupos={grupos} onSelectGrupo={onSelectGrupo} />}

            {currentSection === 'trabajo-compartido' && (
              <RepositorioColaborativo
                grupo={{ id: 0, nombre: 'Docente', departamento: 'Coordinación', miembros: [], progreso: 0, estado: 'En progreso', interacciones_ia: 0 }}
                todosLosGrupos={grupos}
                esDocente={true}
                mostrarEjemplo={mostrandoEjemplo}
              />
            )}

            {currentSection === 'evaluacion' && <EvaluacionRubricas grupos={grupos} />}
          </div>
        </div>
      </div>

      {/* Modal código sala */}
      {mostrarCodigoSala && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b-2 border-gray-100">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Código de Clase</h3>
              <button onClick={() => setMostrarCodigoSala(false)} className="text-gray-400 hover:text-red-500 font-black text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-10">
              <SistemaCodigoSala codigoSala={proyectoActual?.codigo_sala} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}