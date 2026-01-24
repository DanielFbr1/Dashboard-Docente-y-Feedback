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

    const getClaseStyles = (clase: string) => {
        if (clase.includes('5.º')) return {
            header: 'bg-blue-50 border-blue-200 text-blue-700',
            bg: 'bg-blue-500',
            light: 'bg-blue-50'
        };
        if (clase.includes('6.º')) return {
            header: 'bg-purple-50 border-purple-200 text-purple-700',
            bg: 'bg-purple-500',
            light: 'bg-purple-50'
        };
        return {
            header: 'bg-slate-50 border-slate-200 text-slate-700',
            bg: 'bg-slate-500',
            light: 'bg-slate-50'
        };
    };

    const getClaseIcon = (clase: string) => {
        if (clase.includes('5.º')) return <School className="w-5 h-5" />;
        if (clase.includes('6.º')) return <GraduationCap className="w-5 h-5" />;
        return <Folder className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Cargando proyectos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdff] p-8 font-sans">
            <header className="mb-12 max-w-7xl mx-auto">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-100/50">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border-2 border-blue-100">
                            <Layout className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Mis Proyectos</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Dashboard Activo • {proyectos.length} proyectos
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchProyectos}
                            className="p-3.5 bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowModalProyecto(true)}
                            className="flex items-center gap-3 px-7 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Nuevo</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-3.5 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-20">
                {proyectos.length > 0 ? (
                    Object.entries(proyectosPorClase).map(([clase, proyectosClase]) => (
                        <section key={clase} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${getClaseStyles(clase).header}`}>
                                    {getClaseIcon(clase)}
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{clase}</h2>
                                <div className="h-[2px] flex-1 bg-slate-100 ml-4"></div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{proyectosClase.length} {proyectosClase.length === 1 ? 'PROYECTO' : 'PROYECTOS'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {proyectosClase.map((proyecto) => (
                                    <div
                                        key={proyecto.id}
                                        onClick={() => onSelectProject(proyecto)}
                                        className="group relative bg-white rounded-[2.5rem] p-9 flex flex-col border-2 border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-8 relative z-10">
                                            <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border-2
                                                ${proyecto.estado === 'En curso' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    proyecto.estado === 'Finalizado' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {proyecto.estado}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeleteProject(e, proyecto.id, proyecto.nombre)}
                                                className="p-2.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-2 mb-6 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                    <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-tight uppercase">{proyecto.nombre}</h3>
                                            </div>
                                            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest opacity-70 ml-12">{proyecto.tipo}</p>
                                        </div>

                                        <p className="text-slate-500 font-medium text-sm mb-10 line-clamp-2 leading-relaxed relative z-10 ml-12">{proyecto.descripcion}</p>

                                        <div className="mt-auto pt-8 border-t border-slate-50 flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-9 h-9 rounded-full border-4 border-white bg-slate-50 flex items-center justify-center text-slate-300">
                                                            <Users className="w-4 h-4" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 font-black text-[10px] text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors tracking-widest uppercase">
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
                    <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border-2 border-slate-100">
                            <Sparkles className="w-10 h-10 text-slate-200" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Tu Dashboard está listo</h2>
                        <p className="text-slate-400 max-w-sm mb-12 text-sm font-bold uppercase tracking-widest leading-loose">
                            Comienza creando tu primer proyecto real para trabajar con tus alumnos.
                        </p>
                        <button
                            onClick={handleLoadSamples}
                            disabled={isSeeding}
                            className="flex items-center gap-4 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                            {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-white" />}
                            {isSeeding ? 'Cargando...' : 'Cargar ejemplos'}
                        </button>
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

