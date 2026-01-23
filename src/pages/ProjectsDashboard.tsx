import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Proyecto } from '../types';
import { Layout, ArrowRight, Users, Key, Plus, Loader2, Sparkles, LogOut } from 'lucide-react';
import { PROYECTOS_MOCK } from '../data/mockData';

interface ProjectsDashboardProps {
    onSelectProject: (proyecto: Proyecto) => void;
}

export function ProjectsDashboard({ onSelectProject }: ProjectsDashboardProps) {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        fetchProyectos();
    }, []);

    const fetchProyectos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('proyectos')
                .select('*');

            if (error) throw error;
            setProyectos(data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadSamples = async () => {
        if (!confirm('¿Quieres cargar los proyectos de ejemplo? Esto poblará tu base de datos con contenido de prueba.')) return;

        setIsSeeding(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Adaptamos los mock data para insertarlos
            const samples = PROYECTOS_MOCK.map(p => ({
                nombre: p.nombre,
                descripcion: p.descripcion,
                tipo: p.tipo,
                estado: p.estado,
                codigo_sala: p.codigo_sala,
                profesor_id: user?.id
            }));

            const { error } = await supabase
                .from('proyectos')
                .insert(samples);

            if (error) throw error;

            await fetchProyectos();
            alert('¡Proyectos de ejemplo cargados con éxito!');
        } catch (err) {
            console.error('Error seeding samples:', err);
            alert('Hubo un error al cargar los ejemplos.');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <header className="mb-10 max-w-7xl mx-auto border-b border-gray-200 pb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Proyectos</h1>
                        <p className="text-gray-500 mt-1 text-lg">Selecciona un proyecto para gestionar.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Base de Datos Activa</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {proyectos.length > 0 ? proyectos.map((proyecto) => (
                    <div
                        key={proyecto.id}
                        onClick={() => onSelectProject(proyecto)}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col border border-gray-200 cursor-pointer group hover:border-blue-400"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border 
                ${proyecto.estado === 'En curso' ? 'bg-green-50 text-green-700 border-green-200' :
                                    proyecto.estado === 'Finalizado' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {proyecto.estado}
                            </span>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                                <Key className="w-3 h-3" />
                                {proyecto.codigo_sala}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{proyecto.nombre}</h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">{proyecto.descripcion}</p>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="w-4 h-4" />
                                <span>Gestionar grupos</span>
                            </div>
                            <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-200">
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                        <Layout className="w-16 h-16 text-gray-200 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu Dashboard está vacío</h2>
                        <p className="text-gray-500 max-w-md mb-8 px-4 text-lg">
                            Parece que todavía no tienes proyectos en la base de datos real. ¿Quieres empezar con los ejemplos?
                        </p>
                        <button
                            onClick={handleLoadSamples}
                            disabled={isSeeding}
                            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSeeding ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                            )}
                            {isSeeding ? 'Cargando ejemplos...' : 'Cargar proyectos de ejemplo'}
                        </button>
                    </div>
                )}

                {/* Card para Crear Nuevo */}
                {proyectos.length > 0 && (
                    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group min-h-[250px]">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-200 group-hover:border-blue-200">
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Nuevo Proyecto</h3>
                        <p className="text-sm text-gray-500 mt-1">Crear un nuevo espacio real</p>
                    </div>
                )}
            </div>
        </div>
    );
}
