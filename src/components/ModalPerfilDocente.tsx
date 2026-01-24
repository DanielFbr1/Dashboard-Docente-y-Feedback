import { X, User, FolderOpen, Mail, GraduationCap } from 'lucide-react';
import { Proyecto, Grupo } from '../types';

interface ModalPerfilDocenteProps {
    onClose: () => void;
    proyectos: Proyecto[];
    email: string;
    nombre: string;
}

export function ModalPerfilDocente({ onClose, proyectos, email, nombre }: ModalPerfilDocenteProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header Profile */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-blue-600">
                            <GraduationCap className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-1">{nombre || 'Profesor/a'}</h2>
                        <div className="flex items-center gap-2 opacity-90 font-medium bg-blue-700/50 px-3 py-1 rounded-full text-sm">
                            <Mail className="w-4 h-4" />
                            {email}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 bg-gray-50 flex-1 overflow-y-auto">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        Proyectos Activos ({proyectos.length})
                    </h3>

                    <div className="space-y-4">
                        {proyectos.length > 0 ? proyectos.map(p => (
                            <div key={p.id} className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{p.nombre}</h4>
                                    <p className="text-sm text-gray-500 font-medium">{p.tipo} • Sala: <span className="text-blue-600 font-black">{p.codigo_sala}</span></p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${p.estado === 'En curso' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {p.estado}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-400 italic font-medium">
                                No tienes proyectos activos.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-gray-100 text-center">
                    <div className="text-xs text-center text-gray-400 font-bold uppercase tracking-widest">
                        Membresía PRO Activa
                    </div>
                </div>
            </div>
        </div>
    );
}
