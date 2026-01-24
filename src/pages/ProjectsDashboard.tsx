import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Proyecto } from '../types';
import { Layout, ArrowRight, Users, Key, Plus, Loader2, Sparkles, LogOut, RefreshCw, Trash2, Folder, BookOpen, GraduationCap, School } from 'lucide-react';
import { PROYECTOS_MOCK } from '../data/mockData';
import { ModalCrearProyecto } from '../components/ModalCrearProyecto';

interface ProjectsDashboardProps {
    onSelectProject: (proyecto: Proyecto) => void;
}

export function ProjectsDashboard({ onSelectProject }: ProjectsDashboardProps) {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [showModalProyecto, setShowModalProyecto] = useState(false);

    useEffect(() => {
        fetchProyectos();
    }, []);

    const fetchProyectos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('proyectos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProyectos(data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCrearProyecto = async (nuevoProyecto: Omit<Proyecto, 'id' | 'grupos'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('proyectos')
                .insert([{ ...nuevoProyecto, created_by: user?.id }]);

            if (error) throw error;
            await fetchProyectos();
        } catch (err: any) {
            console.error('Error creating project:', err);
            alert(`Error al crear el proyecto: ${err.message || 'Error desconocido'}`);
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent, id: string, nombre: string) => {
        e.stopPropagation();
        if (!confirm(`¿Estás seguro de que quieres eliminar el proyecto "${nombre}"? Esta acción no se puede deshacer.`)) return;

        try {
            const { error } = await supabase
                .from('proyectos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProyectos(proyectos.filter(p => p.id !== id));
        } catch (err: any) {
            console.error('Error deleting project:', err);
            alert(`Error al eliminar el proyecto: ${err.message}`);
        }
    };

    const handleLoadSamples = async () => {
        if (!confirm('¿Quieres cargar los proyectos de ejemplo? Esto poblará tu base de datos con contenido de prueba.')) return;

        setIsSeeding(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            for (const p of PROYECTOS_MOCK) {
                const { data: projectData, error: projectError } = await supabase
                    .from('proyectos')
                    .insert([{
                        nombre: p.nombre,
                        descripcion: p.descripcion,
                        tipo: p.tipo,
                        estado: p.estado,
                        codigo_sala: p.codigo_sala,
                        clase: p.clase || '5.º Primaria - A',
                        created_by: user.id,
                        fases: p.fases
                    }])
                    .select()
                    .single();

                if (projectError) throw projectError;

                if (p.grupos && p.grupos.length > 0) {
                    const groupsToInsert = p.grupos.map(g => ({
                        nombre: g.nombre,
                        departamento: g.departamento,
                        miembros: g.miembros,
                        progreso: g.progreso,
                        estado: g.estado,
                        interacciones_ia: g.interacciones_ia,
                        proyecto_id: projectData.id
                    }));

                    const { error: groupError } = await supabase
                        .from('grupos')
                        .insert(groupsToInsert);

                    if (groupError) console.error('Error seeding groups for project:', projectData.nombre, groupError);
                }
            }

            await fetchProyectos();
            alert('¡Proyectos y grupos de ejemplo cargados con éxito!');
        } catch (err: any) {
            console.error('Error seeding samples:', err);
            alert(`Hubo un error al cargar los ejemplos: ${err.message}`);
        } finally {
            setIsSeeding(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const proyectosPorClase = proyectos.reduce((acc, p) => {
        const clase = p.clase || 'Sin Clase';
        if (!acc[clase]) acc[clase] = [];
        acc[clase].push(p);
        return acc;
    }, {} as Record<string, Proyecto[]>);

    const getClaseColor = (clase: string) => {
        if (clase.includes('5.º')) return 'from-blue-600 to-indigo-700';
        if (clase.includes('6.º')) return 'from-purple-600 to-pink-700';
        return 'from-gray-600 to-slate-700';
    };

    const getClaseIcon = (clase: string) => {
        if (clase.includes('5.º')) return <School className="w-6 h-6" />;
        if (clase.includes('6.º')) return <GraduationCap className="w-6 h-6" />;
        return <Folder className="w-6 h-6" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-bold animate-pulse">Cargando tus proyectos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <header className="mb-12 max-w-7xl mx-auto">
                <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-200">
                            <Layout className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Mis Proyectos</h1>
                            <p className="text-slate-500 font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Dashboard Docente • {proyectos.length} proyectos activos
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchProyectos}
                            className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-2xl transition-all group"
                            title="Refrescar"
                        >
                            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        </button>
                        <button
                            onClick={() => setShowModalProyecto(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-6 h-6" />
                            <span>Nuevo Proyecto</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-4 bg-red-50 text-red-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-16">
                {proyectos.length > 0 ? (
                    Object.entries(proyectosPorClase).map(([clase, proyectosClase]) => (
                        <section key={clase} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-gradient-to-br ${getClaseColor(clase)} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                    {getClaseIcon(clase)}
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{clase}</h2>
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{proyectosClase.length} {proyectosClase.length === 1 ? 'PROYECTO' : 'PROYECTOS'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {proyectosClase.map((proyecto) => (
                                    <div
                                        key={proyecto.id}
                                        onClick={() => onSelectProject(proyecto)}
                                        className="group relative bg-white rounded-[2rem] p-8 flex flex-col border-2 border-transparent hover:border-blue-500/20 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden"
                                    >
                                        {/* Decoración de fondo */}
                                        <div className={`absolute -right-4 -top-4 w-32 h-32 bg-gradient-to-br ${getClaseColor(clase)} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-tighter
                                                ${proyecto.estado === 'En curso' ? 'bg-emerald-50 text-emerald-600' :
                                                    proyecto.estado === 'Finalizado' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                                                {proyecto.estado}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeleteProject(e, proyecto.id, proyecto.nombre)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4 relative z-10">
                                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-tight">{proyecto.nombre}</h3>
                                        </div>

                                        <p className="text-slate-500 font-medium text-sm mb-8 line-clamp-2 leading-relaxed relative z-10">{proyecto.descripcion}</p>

                                        <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                                            <Users className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Gestionar</span>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Key className="w-3 h-3" />
                                                {proyecto.codigo_sala}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center shadow-inner">
                        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                            <Sparkles className="w-16 h-16 text-slate-200" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Tu Dashboard está listo</h2>
                        <p className="text-slate-500 max-w-md mb-12 text-xl font-medium leading-relaxed">
                            No tienes proyectos todavía. Comienza creando uno real o carga los ejemplos de demostración.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleLoadSamples}
                                disabled={isSeeding}
                                className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSeeding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />}
                                {isSeeding ? 'Cargando ejemplos...' : 'Cargar proyectos de ejemplo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showModalProyecto && (
                <ModalCrearProyecto
                    onClose={() => setShowModalProyecto(false)}
                    onCrear={handleCrearProyecto}
                />
            )}
        </div>
    );
}

