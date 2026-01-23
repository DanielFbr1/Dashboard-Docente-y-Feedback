import { Settings, ChevronDown, LayoutDashboard, Users, MessageSquare, ClipboardCheck, Plus, HelpCircle, Key, FolderOpen, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Card_Metrica } from './Card_Metrica';
import { Card_Grupo } from './Card_Grupo';
import { GruposDepartamentos } from './GruposDepartamentos';
import { InteraccionesIA } from './InteraccionesIA';
import { EvaluacionRubricas } from './EvaluacionRubricas';
import { EjemploSeccion } from './EjemploSeccion';
import { EstadoVacio } from './EstadoVacio';
import { ModalCrearGrupo } from './ModalCrearGrupo';
import { SistemaCodigoSala } from './SistemaCodigoSala';
import { ListaAlumnosEnLinea } from './ListaAlumnosEnLinea';
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
  onCambiarProyecto
}: DashboardDocenteProps) {
  const [modalCrearGrupoAbierto, setModalCrearGrupoAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [mostrarCodigoSala, setMostrarCodigoSala] = useState(false);

  const totalInteracciones = grupos.reduce((sum, g) => sum + g.interacciones_ia, 0);
  const hitosCompletados = grupos.reduce((sum, g) => sum + Math.floor(g.progreso / 20), 0);
  const gruposBloqueados = grupos.filter(g => g.estado === 'Bloqueado').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Modal crear grupo */}
      {modalCrearGrupoAbierto && (
        <ModalCrearGrupo
          onClose={() => setModalCrearGrupoAbierto(false)}
          onCrear={onCrearGrupo}
          grupoEditando={grupoEditando}
        />
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Navegación</h2>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => onSectionChange('resumen')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${currentSection === 'resumen'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Resumen general</span>
          </button>

          <button
            onClick={() => onSectionChange('grupos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${currentSection === 'grupos'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Users className="w-5 h-5" />
            <span>Grupos</span>
          </button>

          <button
            onClick={() => onSectionChange('interacciones')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${currentSection === 'interacciones'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Interacciones IA</span>
          </button>

          <button
            id="nav-trabajo-compartido"
            onClick={() => onSectionChange('trabajo-compartido')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${currentSection === 'trabajo-compartido'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Share2 className="w-5 h-5" />
            <span>Trabajo compartido</span>
          </button>

          <button
            id="nav-evaluacion"
            onClick={() => onSectionChange('evaluacion')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${currentSection === 'evaluacion'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Evaluación</span>
          </button>

          <div className="mt-6 pt-4 border-t border-gray-200">
            {/* NUEVA SECCIÓN: Alumnos en línea */}
            <ListaAlumnosEnLinea />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onIniciarTutorial}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Tutorial interactivo</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-gray-900">Panel del proyecto ABP + IA</h1>
              <p className="text-sm text-gray-500">5.º y 6.º de Primaria</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setMostrarCodigoSala(!mostrarCodigoSala)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Key className="w-5 h-5" />
                Código de sala
              </button>

              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Selecciona tu clase</option>
                  <option>5.ºA</option>
                  <option>5.ºB</option>
                  <option>6.ºA</option>
                  <option>6.ºB</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {mostrandoEjemplo && (
                <button
                  onClick={onLimpiarDatos}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Limpiar ejemplo
                </button>
              )}

              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info del proyecto actual */}
          {proyectoActual && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{proyectoActual.nombre}</div>
                <div className="text-xs text-gray-600">Código: {proyectoActual.codigo_sala}</div>
              </div>
              <button
                onClick={onCambiarProyecto}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Cambiar proyecto
              </button>
            </div>
          )}
        </header>

        {/* Modal de código de sala */}
        {mostrarCodigoSala && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
              {/* Header fijo */}
              <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-white rounded-t-3xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Sistema de Código de Sala</h3>
                  <p className="text-sm text-gray-600 mt-1">Gestiona el acceso al proyecto</p>
                </div>
                <button
                  onClick={() => setMostrarCodigoSala(false)}
                  className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Cerrar"
                >
                  <span className="text-3xl leading-none">×</span>
                </button>
              </div>

              {/* Contenido con scroll */}
              <div className="flex-1 overflow-y-auto p-6">
                <SistemaCodigoSala codigoSala={proyectoActual?.codigo_sala} />
              </div>

              {/* Footer fijo */}
              <div className="p-6 border-t-2 border-gray-200 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={() => {
                    if (window.confirm('¿Quieres cerrar este proyecto y volver a la selección de proyectos? (Se guardará tu progreso)')) {
                      window.location.reload();
                    }
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-800 hover:to-black transition-all font-bold text-lg shadow-lg"
                >
                  🏠 Cerrar proyecto y volver al inicio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 p-8">
          {currentSection === 'resumen' && (
            <div className="flex flex-col gap-6">
              {grupos.length === 0 ? (
                <EstadoVacio
                  titulo="No hay grupos creados aún"
                  descripcion="Crea tus primeros grupos o carga un ejemplo para ver cómo funciona el panel"
                  onCargarEjemplo={onCargarEjemplo}
                  textoBoton="Cargar ejemplo completo"
                />
              ) : (
                <>
                  {/* Metrics cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card_Metrica
                      titulo="Grupos activos"
                      numero={grupos.length}
                      descripcion="grupos trabajando en el proyecto"
                      color="blue"
                    />
                    <Card_Metrica
                      titulo="Interacciones con la IA"
                      numero={totalInteracciones}
                      descripcion="preguntas realizadas esta semana"
                      color="green"
                    />
                    <Card_Metrica
                      titulo="Hitos completados"
                      numero={hitosCompletados}
                      descripcion={`de ${grupos.length * 5} hitos totales del proyecto`}
                      color="yellow"
                    />
                    <Card_Metrica
                      titulo="Grupos bloqueados"
                      numero={gruposBloqueados}
                      descripcion="necesitan atención del docente"
                      color="red"
                    />
                  </div>

                  {/* Groups grid */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Grupos del proyecto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grupos.map((grupo) => (
                        <Card_Grupo
                          key={grupo.id}
                          grupo={grupo}
                          onClick={() => onSelectGrupo(grupo)}
                          onEdit={() => {
                            setGrupoEditando(grupo);
                            setModalCrearGrupoAbierto(true);
                          }}
                          onDelete={() => {
                            if (confirm(`¿Estás seguro de que quieres eliminar el grupo "${grupo.nombre}"?`)) {
                              onEliminarGrupo(grupo.id);
                            }
                          }}
                          mostrarBotonEditar={true}
                          mostrarBotonBorrar={true}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <EjemploSeccion>
                <div className="prose max-w-none">
                  <h4 className="text-gray-900 font-semibold mb-3">Caso práctico: Proyecto "Radio Escolar del Futuro"</h4>
                  <p className="text-gray-700 text-sm mb-4">
                    La clase de 6ºA está creando una radio escolar sobre temas científicos. Han formado 6 grupos:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2 mb-4">
                    <li><strong>Grupo Guion:</strong> Investiga y escribe contenidos sobre cambio climático</li>
                    <li><strong>Grupo Locución:</strong> Practica técnicas de voz y presentación</li>
                    <li><strong>Grupo Edición:</strong> Aprende a usar Audacity para post-producción</li>
                    <li><strong>Grupo Diseño:</strong> Crea la identidad visual y promociones</li>
                    <li><strong>Grupo Vestuario:</strong> Diseña el set para vídeos promocionales</li>
                  </ul>
                  <p className="text-gray-700 text-sm">
                    La IA mentor puede hacer preguntas como: "¿Por qué es importante este tema para vuestra audiencia?"
                    pero también dar respuestas directas cuando necesiten información específica.
                  </p>
                </div>
              </EjemploSeccion>
            </div>
          )}

          {currentSection === 'grupos' && (
            <div className="flex flex-col gap-6">
              {/* Botón crear grupo */}
              <div className="flex justify-end">
                <button
                  onClick={() => setModalCrearGrupoAbierto(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Crear nuevo grupo
                </button>
              </div>

              {grupos.length === 0 ? (
                <EstadoVacio
                  titulo="No hay grupos organizados"
                  descripcion="Organiza a tu alumnado en grupos por departamentos para comenzar el proyecto"
                  onCargarEjemplo={onCargarEjemplo}
                  textoBoton="Ver ejemplo de organización"
                />
              ) : (
                <GruposDepartamentos
                  grupos={grupos}
                  onSelectGrupo={onSelectGrupo}
                  onEditarGrupo={onEditarGrupo}
                  onEliminarGrupo={onEliminarGrupo}
                />
              )}

              <EjemploSeccion>
                <div className="prose max-w-none">
                  <h4 className="text-gray-900 font-semibold mb-3">Ejemplo de organización: Proyecto "Podcast Histórico"</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <div className="font-medium text-gray-900 mb-2">🎭 Departamento Guion (2 grupos)</div>
                      <p className="text-sm text-gray-600 mb-2">Investigan la Guerra Civil y escriben episodios narrativos</p>
                      <div className="text-xs text-gray-500">
                        <strong>Grupo A:</strong> María, Pedro, Ana, Luis<br />
                        <strong>Grupo B:</strong> Carmen, Diego, Laura, Pablo
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <div className="font-medium text-gray-900 mb-2">🎤 Departamento Locución (1 grupo)</div>
                      <p className="text-sm text-gray-600 mb-2">Graban las narraciones con diferentes voces y personajes</p>
                      <div className="text-xs text-gray-500">
                        <strong>Grupo C:</strong> Sofía, Javier, Isabel, Miguel
                      </div>
                    </div>
                  </div>
                </div>
              </EjemploSeccion>
            </div>
          )}

          {currentSection === 'interacciones' && (
            <div className="flex flex-col gap-6">
              {grupos.length === 0 || totalInteracciones === 0 ? (
                <EstadoVacio
                  titulo="No hay interacciones registradas"
                  descripcion="Las interacciones con la IA se registrarán aquí cuando los grupos comiencen a usar el mentor"
                  onCargarEjemplo={onCargarEjemplo}
                  textoBoton="Ver ejemplo de interacciones"
                />
              ) : (
                <InteraccionesIA grupos={grupos} onSelectGrupo={onSelectGrupo} />
              )}

              <EjemploSeccion>
                <div className="prose max-w-none">
                  <h4 className="text-gray-900 font-semibold mb-3">Ejemplo de interacciones con la IA Mentor</h4>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                    <p className="text-sm text-blue-900">
                      <strong>💡 Funcionamiento de la IA:</strong> El mentor puede usar preguntas socráticas para fomentar
                      el pensamiento crítico ("¿Qué pasaría si...?", "¿Por qué creéis que...?") pero también proporcionar
                      respuestas directas cuando el alumnado necesite información específica o esté bloqueado. El equilibrio
                      entre preguntas y respuestas se adapta al contexto de cada interacción.
                    </p>
                  </div>
                </div>
              </EjemploSeccion>
            </div>
          )}

          {currentSection === 'trabajo-compartido' && (
            <div className="flex flex-col gap-6">
              <EstadoVacio
                titulo="Repositorio de Trabajo Compartido"
                descripcion="Aquí podrás ver y gestionar los recursos compartidos entre los diferentes grupos del proyecto. Esta funcionalidad permite que los departamentos colaboren entre sí."
                textoBoton="Subir nuevo recurso"
                onCargarEjemplo={() => alert('Funcionalidad de subida en desarrollo')}
              />
            </div>
          )}

          {currentSection === 'evaluacion' && (
            <EvaluacionRubricas grupos={grupos} />
          )}
        </main>
      </div>
    </div>
  );
}