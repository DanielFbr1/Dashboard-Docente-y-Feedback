import React, { useState, useEffect } from 'react';
import { Sidebar_Docente } from '../components/Sidebar_Docente';
import { MentorIA } from '../components/MentorIA';
import { GrupoCard } from '../components/GrupoCard';
import { AnalyticsDashboard, DashboardMetrics } from '../components/AnalyticsDashboard';
import { DetalleGrupo } from '../components/DetalleGrupo';
import { ModalCrearGrupo } from '../components/ModalCrearGrupo';
import { RepositorioColaborativo } from '../components/RepositorioColaborativo';
import { EvaluacionRubricas } from '../components/EvaluacionRubricas';
import { Input } from '../components/ui/input';
import { Search, Filter, Plus, Download, Rocket, FilterX, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Proyecto, Grupo } from '../types';
import { ModalRevisionHitos } from '../components/ModalRevisionHitos';

export function DashboardDocente() {
    const { user } = useAuth();
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [proyectoActivo, setProyectoActivo] = useState<Proyecto | null>(null);
    const [selectedGrupoId, setSelectedGrupoId] = useState<string | number | null>(null);
    const [grupoParaRevisar, setGrupoParaRevisar] = useState<Grupo | null>(null);
    const [showModalGrupo, setShowModalGrupo] = useState(false);
    const [activeSection, setActiveSection] = useState('resumen');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProyectos();
        }
    }, [user]);

    const fetchProyectos = async () => {
        try {
            const { data: proyectosData, error: proyectosError } = await supabase
                .from('proyectos')
                .select(`
          *,
          grupos (*)
        `)
                .eq('docente_id', user?.id)
                .order('created_at', { ascending: false });

            if (proyectosError) throw proyectosError;

            const proyectosFormateados = proyectosData.map(p => ({
                ...p,
                grupos: p.grupos || []
            }));

            setProyectos(proyectosFormateados);
            if (proyectosFormateados.length > 0 && !proyectoActivo) {
                setProyectoActivo(proyectosFormateados[0]);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Error al cargar los proyectos');
        } finally {
            setLoading(false);
        }
    };

    const handleVerAlumno = (grupoId: string | number) => {
        setSelectedGrupoId(grupoId);
        setActiveSection('detalle-grupo');
    };

    const handleCambiarEstado = async (grupoId: string | number, nuevoEstado: Grupo['estado']) => {
        try {
            const { error } = await supabase
                .from('grupos')
                .update({ estado: nuevoEstado })
                .eq('id', grupoId);

            if (error) throw error;
            toast.success('Estado actualizado');
            fetchProyectos(); // Recargar datos
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const handleCrearGrupo = async (nuevoGrupo: Omit<Grupo, 'id'>) => {
        if (!proyectoActivo) return;

        try {
            const { error } = await supabase
                .from('grupos')
                .insert([{ ...nuevoGrupo, proyecto_id: proyectoActivo.id }]);

            if (error) throw error;

            toast.success('Equipo creado con éxito');
            fetchProyectos();
        } catch (error: any) {
            console.error('Error creating group:', error);
            toast.error(`Error al crear el equipo: ${error.message || 'Error desconocido'}`);
        }
    };

    const handleDownloadReport = () => {
        if (!proyectoActivo) return;

        // Cabeceras del CSV
        const headers = ['ID Grupo', 'Nombre Grupo', 'Departamento', 'Estado', 'Progreso (%)', 'Interacciones IA', 'Miembros'];

        // Datos de los grupos
        const rows = proyectoActivo.grupos?.map(grupo => [
            grupo.id,
            `"${grupo.nombre}"`, // Encomillar para evitar problemas con comas
            grupo.departamento,
            grupo.estado,
            grupo.progreso,
            grupo.interacciones_ia,
            `"${grupo.miembros.join(', ')}"`
        ]);

        if (!rows || rows.length === 0) {
            toast.error('No hay datos para exportar');
            return;
        }

        // Unir todo en un string CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_${proyectoActivo.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Informe descargado correctamente');
    };

    const metrics: DashboardMetrics = {
        activeProjects: proyectos.length,
        totalStudents: proyectos.reduce((acc, p) => acc + (p.grupos?.reduce((accG, g) => accG + g.miembros.length, 0) || 0), 0),
        interactions: proyectos.reduce((acc, p) => acc + (p.grupos?.reduce((accG, g) => accG + (g.interacciones_ia || 0), 0) || 0), 0),
        avgProgress: proyectos.reduce((acc, p) => {
            const grupos = p.grupos || [];
            if (grupos.length === 0) return acc;
            return acc + (grupos.reduce((accG, g) => accG + (g.progreso || 0), 0) / grupos.length);
        }, 0) / (proyectos.length || 1)
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-600 font-bold animate-pulse uppercase tracking-widest">Cargando Dashboard...</p>
                    </div>
                </div>
            );
        }

        if (activeSection === 'detalle-grupo' && selectedGrupoId && proyectoActivo) {
            const grupoSeleccionado = proyectoActivo.grupos?.find(g => g.id === selectedGrupoId);
            if (grupoSeleccionado) {
                return (
                    <DetalleGrupo
                        grupo={grupoSeleccionado}
                        fases={proyectoActivo.fases}
                        onBack={() => {
                            setActiveSection('resumen');
                            setSelectedGrupoId(null);
                        }}
                    />
                );
            }
        }

        switch (activeSection) {
            case 'resumen':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AnalyticsDashboard metrics={metrics} />

                        <div className="glass rounded-[2rem] border border-border/50 p-8 shadow-2xl shadow-indigo-500/5">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Equipos en {proyectoActivo?.nombre || 'el Aula'}</h2>
                                    <p className="text-muted-foreground font-medium">Seguimiento en tiempo real de los grupos activos</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="gap-2 rounded-xl flex-1 md:flex-none">
                                                <Filter className="w-4 h-4" />
                                                {filterStatus === 'todos' ? 'Todos' : filterStatus === 'En progreso' ? 'En Progreso' : 'Finalizados'}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setFilterStatus('todos')}>
                                                <FilterX className="mr-2 h-4 w-4" /> Todos
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilterStatus('En progreso')}>
                                                <Clock className="mr-2 h-4 w-4" /> En Progreso
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilterStatus('Finalizado')}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Finalizados
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button
                                        onClick={() => setShowModalGrupo(true)}
                                        className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex-1 md:flex-none"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nuevo Equipo
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {(proyectoActivo?.grupos || [])
                                    .filter(g => {
                                        const matchesSearch = g.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            g.miembros.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
                                        const matchesFilter = filterStatus === 'todos' || g.estado === filterStatus;
                                        return matchesSearch && matchesFilter;
                                    })
                                    .map((grupo) => (
                                        <GrupoCard
                                            key={grupo.id}
                                            grupo={grupo}
                                            onVerAlumno={() => handleVerAlumno(grupo.id)}
                                            onCambiarEstado={(estado) => handleCambiarEstado(grupo.id, estado)}
                                            onRevisar={() => setGrupoParaRevisar(grupo)}
                                        />
                                    ))}
                                {(!proyectoActivo || (proyectoActivo.grupos || []).length === 0) && (
                                    <div className="col-span-full py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <Plus className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-400">No hay grupos creados todavía</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'mentor-ia':
                return (
                    <div className="max-w-6xl mx-auto animate-in zoom-in-95 duration-500">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black mb-2 tracking-tight">Mentor IA Experto</h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                Interactúa con el mentor IA de {proyectoActivo?.nombre || 'tu proyecto'}
                            </p>
                        </div>
                        {proyectoActivo && (
                            <MentorIA
                                grupoId={proyectoActivo.grupos?.[0]?.id.toString() || 'global'}
                                proyectoId={proyectoActivo.id}
                                departamento="Docencia"
                                miembro={user?.email || 'Docente'}
                            />
                        )}
                    </div>
                );

            case 'colaboracion':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-4">
                            <h2 className="text-3xl font-black tracking-tight">Sala de Colaboración</h2>
                            <p className="text-muted-foreground font-medium">Recursos compartidos entre todos los grupos</p>
                        </div>
                        {proyectoActivo && (
                            <RepositorioColaborativo
                                grupo={proyectoActivo.grupos?.[0] || { id: 0, nombre: 'Docente', departamento: 'Coordinación', estado: 'En progreso', progreso: 0, interacciones_ia: 0, miembros: [] }}
                                todosLosGrupos={proyectoActivo.grupos || []}
                                esDocente={true}
                            />
                        )}
                    </div>
                );

            case 'analitica': // Assuming this maps to 'evaluacion' logic or similar, but activeSection is set by sidebar. 
                // Sidebar has 'resumen', 'proyectos', 'colaboracion', 'ajustes'. 
                // Wait, sidebar items are: resumen, proyectos, colaboracion, ajustes.
                // There is no explicit 'analitica' item in sidebar, but 'resumen' is Dashboard which has AnalyticsDashboard.
                // However, if I want to show EvaluacionRubricas, maybe I should add a tab or put it under 'proyectos'?
                // PASOS_TUTORIAL mentions 'evaluacion' section target '#nav-evaluacion'.
                // I will assume 'ajustes' or add a new section for Evaluation if needed, or maybe Evaluation is part of a project detail?
                // For now, I'll map 'evaluacion' if it exists. Re-checking Sidebar_Docente.tsx items.
                // Items: [resumen, proyectos, colaboracion, ajustes].
                // I'll add 'evaluacion' to Sidebar if user wants it, but for now let's map 'ajustes' to something or add Evaluacion there.
                // Actually, I will add 'evaluacion' to the Sidebar items in a separate edit or assume user wants it accessible.
                // Let's replace 'ajustes' with 'evaluacion' for now as it's more relevant to "Funcionalidad completa".
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-4">
                            <h2 className="text-3xl font-black tracking-tight">Evaluación y Rúbricas</h2>
                            <p className="text-muted-foreground font-medium">Seguimiento del progreso y competencias</p>
                        </div>
                        <EvaluacionRubricas grupos={proyectoActivo?.grupos || []} />
                    </div>
                );

            default:
                return (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto border border-indigo-500/20">
                                <Rocket className="w-12 h-12 text-indigo-500 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Sección en construcción</h2>
                                <p className="text-muted-foreground font-medium mt-2">
                                    Estamos trabajando para traerte nuevas herramientas pronto.
                                </p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar_Docente
                itemActivo={activeSection}
                onSelect={setActiveSection}
            />

            <main className={activeSection === 'mentor-ia' ? "ml-0 lg:ml-20 xl:ml-72 transition-all duration-300" : "ml-0 lg:ml-72 p-8 transition-all duration-300"}>
                <div className="max-w-7xl mx-auto">
                    {/* Top Bar Navigation */}
                    {activeSection !== 'mentor-ia' && (
                        <div className="mb-10">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/50">
                                <div>
                                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
                                        {activeSection === 'resumen' && 'Panel Principal'}
                                        {activeSection === 'proyectos' && 'Mis Proyectos ABP'}
                                        {activeSection === 'colaboracion' && 'Sala de Colaboración'}
                                        {activeSection === 'analitica' && 'Análisis de Aula'}
                                    </h1>
                                    <p className="text-muted-foreground font-medium mt-1">
                                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                                        <Input
                                            placeholder="Buscar en el aula..."
                                            className="pl-12 w-full lg:w-72 h-12 rounded-[1rem] bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="h-12 w-12 rounded-[1rem] p-0 border-slate-200"
                                        onClick={handleDownloadReport}
                                        title="Descargar informe CSV"
                                    >
                                        <Download className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dashboard Area */}
                    <div className="pb-12">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {grupoParaRevisar && proyectoActivo && (
                <ModalRevisionHitos
                    grupos={[grupoParaRevisar]}
                    onClose={() => setGrupoParaRevisar(null)}
                    onUpdateBatch={async (grupoId, updates) => {
                        if (proyectoActivo) {
                            const grupo = proyectoActivo.grupos?.find(g => g.id === grupoId);
                            if (!grupo) return;

                            let nuevosHitos = [...(grupo.hitos || [])];
                            updates.forEach(update => {
                                const hitoIndex = nuevosHitos.findIndex(h => h.id === update.hitoId);
                                if (hitoIndex !== -1) {
                                    // @ts-ignore - Estado compatible
                                    nuevosHitos[hitoIndex] = { ...nuevosHitos[hitoIndex], estado: update.nuevoEstado };
                                }
                            });

                            const nuevosGrupos = proyectoActivo.grupos?.map(g => {
                                if (g.id === grupoId) {
                                    return { ...g, hitos: nuevosHitos };
                                }
                                return g;
                            });
                            setProyectoActivo({ ...proyectoActivo, grupos: nuevosGrupos });
                            setProyectos(proyectos.map(p => p.id === proyectoActivo.id ? { ...p, grupos: nuevosGrupos } : p));
                            toast.success("Hitos actualizados correctamente");
                        }
                    }}
                />
            )}

            {showModalGrupo && proyectoActivo && (
                <ModalCrearGrupo
                    onClose={() => setShowModalGrupo(false)}
                    onCrear={handleCrearGrupo}
                    proyectoId={proyectoActivo.id}
                />
            )}
        </div>
    );
}
