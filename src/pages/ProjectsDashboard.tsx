
import { useState } from 'react';
import { PROYECTOS_MOCK } from '../data/mockData';
import { Proyecto } from '../types';
import { Layout, ArrowRight, Users, Key, Plus } from 'lucide-react';

interface ProjectsDashboardProps {
    onSelectProject: (proyecto: Proyecto) => void;
}

export function ProjectsDashboard({ onSelectProject }: ProjectsDashboardProps) {
    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <header className="mb-10 max-w-7xl mx-auto border-b border-gray-200 pb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Proyectos</h1>
                        <p className="text-gray-500 mt-1 text-lg">Selecciona un proyecto para gestionar.</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Conectado</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {PROYECTOS_MOCK.map((proyecto) => (
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
                                {proyecto.codigoSala}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{proyecto.nombre}</h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">{proyecto.descripcion}</p>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="w-4 h-4" />
                                <span>{proyecto.grupos.length} grupos</span>
                            </div>
                            <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-200">
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </div>
                    </div>
                ))}

                {/* Card para Crear Nuevo */}
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group min-h-[250px]">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-200 group-hover:border-blue-200">
                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Nuevo Proyecto</h3>
                    <p className="text-sm text-gray-500 mt-1">Crear un nuevo espacio</p>
                </div>
            </div>
        </div>
    );
}
