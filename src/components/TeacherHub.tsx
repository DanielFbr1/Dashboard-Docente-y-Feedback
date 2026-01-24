import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Proyecto } from '../types';
import { Loader2, Plus, School, Users, FolderOpen, ArrowRight, LayoutGrid, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TeacherHubProps {
    onSelectProject: (proyecto: Proyecto) => void;
    onLogout: () => void;
}

export function TeacherHub({ onSelectProject, onLogout }: TeacherHubProps) {
    const { user } = useAuth();
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros seleccionados
    const [selectedColegio, setSelectedColegio] = useState<string | null>(null);
    const [selectedClase, setSelectedClase] = useState<string | null>(null);

    useEffect(() => {
        fetchProyectos();
    }, []);

    const fetchProyectos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('proyectos')
                .select('*')
                .eq('creador_id', user?.id); // Solo proyectos del profesor

            if (error) throw error;
            setProyectos(data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    // 1. Obtener lista única de colegios
    const colegios = Array.from(new Set(proyectos.map(p => p.colegio || 'Sin asignar').filter(Boolean)));

    // 2. Obtener lista única de clases para el colegio seleccionado
    const clases = selectedColegio
        ? Array.from(new Set(proyectos
            .filter(p => (p.colegio || 'Sin asignar') === selectedColegio)
            .map(p => p.clase || 'Sin clase')
            .filter(Boolean)))
        : [];

    // 3. Obtener proyectos filtrados
    const proyectosFiltrados = selectedColegio && selectedClase
        ? proyectos.filter(p => (p.colegio || 'Sin asignar') === selectedColegio && (p.clase || 'Sin clase') === selectedClase)
        : [];

    const handleCrearProyecto = () => {
        // En un futuro, abrirá el modal pasándole el colegio/clase preseleccionados si los hay
        alert('Funcionalidad de crear proyecto próximamente (se adaptará a la nueva estructura)');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">Centro de Docentes</h1>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Selecciona tu espacio de trabajo</h2>
                    <p className="text-slate-500 font-medium">Navega por tus colegios y clases para encontrar tus proyectos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Paso 1: Colegio */}
                    <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px]">1</div>
                            Colegio
                        </div>
                        <div className="space-y-2">
                            {colegios.length > 0 ? colegios.map(col => (
                                <button
                                    key={col}
                                    onClick={() => { setSelectedColegio(col); setSelectedClase(null); }}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 group ${selectedColegio === col
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200'
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl ${selectedColegio === col ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                                        <School className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold">{col}</span>
                                    {selectedColegio === col && <ArrowRight className="w-4 h-4 ml-auto" />}
                                </button>
                            )) : (
                                <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400 font-medium">No hay colegios aún.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Paso 2: Clase */}
                    <div className={`space-y-4 transition-all duration-500 ${!selectedColegio ? 'opacity-30 pointer-events-none grayscale' : 'animate-in slide-in-from-left-4'}`}>
                        <div className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-[10px]">2</div>
                            Clase
                        </div>
                        <div className="space-y-2">
                            {clases.length > 0 ? clases.map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => setSelectedClase(cls)}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 group ${selectedClase === cls
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-200'
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-purple-200 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl ${selectedClase === cls ? 'bg-white/20' : 'bg-purple-50 text-purple-600'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold">{cls}</span>
                                    {selectedClase === cls && <ArrowRight className="w-4 h-4 ml-auto" />}
                                </button>
                            )) : selectedColegio && (
                                <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400 font-medium">No hay clases en este colegio.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Paso 3: Proyectos */}
                    <div className={`space-y-4 transition-all duration-500 ${!selectedClase ? 'opacity-30 pointer-events-none grayscale' : 'animate-in slide-in-from-left-4'}`}>
                        <div className="flex items-center justify-between text-sm font-black text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">3</div>
                                Proyectos
                            </div>
                            <button onClick={handleCrearProyecto} className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Nuevo
                            </button>
                        </div>
                        <div className="space-y-3">
                            {proyectosFiltrados.length > 0 ? proyectosFiltrados.map(proy => (
                                <button
                                    key={proy.id}
                                    onClick={() => onSelectProject(proy)}
                                    className="w-full p-5 rounded-2xl bg-white border-2 border-slate-100 hover:border-emerald-400 hover:shadow-lg transition-all text-left group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-[3rem] -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                                <FolderOpen className="w-5 h-5" />
                                            </div>
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${proy.estado === 'En curso' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>{proy.estado}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{proy.nombre}</h3>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2">{proy.descripcion}</p>
                                    </div>
                                </button>
                            )) : selectedClase && (
                                <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400 font-medium">No hay proyectos activos.</p>
                                    <button onClick={handleCrearProyecto} className="mt-2 text-blue-600 font-bold text-xs uppercase tracking-wide hover:underline">Crear uno nuevo</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
