import { Settings, ChevronDown, LayoutDashboard, Users, MessageSquare, ClipboardCheck, Plus, HelpCircle, Key, FolderOpen, Share2, LogOut } from 'lucide-react';
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
import { Grupo, DashboardSection, ProyectoActivo } from '../types';

interface DashboardDocenteProps {
  onSelectGrupo: (grupo: Grupo) => void;
  currentSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  grupos: Grupo[];
  mostrandoEjemplo: boolean;
  onCargarEjemplo: () => void;
  onLimpiarDatos: () => void;
  onCrearGrupo: (grupo: Omit<Grupo, 'id'>) => void;
  onEditarGrupo: (id: number, grupo: Omit<Grupo, 'id'>) => void;
  onEliminarGrupo: (id: number) => void;
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

  const totalInteracciones = grupos.reduce((sum, g) => sum + g.interacciones_ia, 0);
  const hitosCompletados = grupos.reduce((sum, g) => sum + Math.floor(g.progreso / 20), 0);
  const gruposBloqueados = grupos.filter(g => g.estado === 'Bloqueado').length;

  const handleLogout = () => {
    if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 uppercase-none">
      {/* Modal crear grupo */}
      {modalCrearGrupoAbierto && (
        <ModalCrearGrupo
          onClose={() => setModalCrearGrupoAbierto(false)}
          onCrear={onCrearGrupo}
          grupoEditando={grupoEditando}
          proyectoId={proyectoActual?.id}
        />
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
            <ListaAlumnosEnLinea />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onIniciarTutorial}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold group"
          >
            <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
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
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1 text-center">Clave de Clase</label>
                <div className="relative group">
                  <select
                    value={proyectoActual?.clase || ''}
                    onChange={(e) => onClaseChange(e.target.value)}
                    className="appearance-none bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>📌 Seleccionar Clase</option>
                    <option value="5.º Primaria - A">5.º Primaria - A</option>
                    <option value="5.º Primaria - B">5.º Primaria - B</option>
                    <option value="6.º Primaria - A">6.º Primaria - A</option>
                    <option value="6.º Primaria - B">6.º Primaria - B</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                </div>
              </div>

              <button
                onClick={() => setMostrarCodigoSala(!mostrarCodigoSala)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md hover:shadow-lg"
              >
                <Key className="w-4 h-4" />
                Mostrar código de clase
              </button>

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
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">P</div>
                      <div>
                        <div className="text-sm font-black text-gray-900 leading-tight">Profesor/a</div>
                        <div className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-tighter">Membresía Pro</div>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors rounded-xl font-medium">
                        <Users className="w-4 h-4 text-gray-400" />
                        Perfil de usuario
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors rounded-xl font-medium">
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
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 mt-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Proyecto Activo</div>
                <div className="font-black text-gray-900 text-lg leading-tight">{proyectoActual.nombre}</div>
                <div className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1">Código: {proyectoActual.codigo_sala}</div>
              </div>
              <button
                onClick={onCambiarProyecto}
                className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm font-bold shadow-sm"
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
                <GruposDepartamentos grupos={grupos} onSelectGrupo={onSelectGrupo} onEditarGrupo={onEditarGrupo} onEliminarGrupo={onEliminarGrupo} />
              </div>
            )}

            {currentSection === 'interacciones' && <InteraccionesIA grupos={grupos} onSelectGrupo={onSelectGrupo} />}

            {currentSection === 'trabajo-compartido' && (
              <RepositorioColaborativo
                grupo={{ id: 0, nombre: 'Docente', departamento: 'Coordinación', miembros: [], progreso: 0, estado: 'En progreso', interacciones_ia: 0 }}
                todosLosGrupos={grupos}
                esDocente={true}
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