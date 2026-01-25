import { useState, useRef } from 'react';
import { Upload, FileText, Video, Music, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Grupo } from '../types';
import { X } from 'lucide-react';

interface Recurso {
    id: string;
    grupoId: number;
    grupoNombre: string;
    departamento: string;
    tipo: 'texto' | 'video' | 'audio' | 'imagen';
    titulo: string;
    descripcion: string;
    url?: string;
    contenido?: string;
    fechaSubida: Date;
}

interface ModalSubirRecursoProps {
    grupo: Grupo;
    onClose: () => void;
    onSuccess: (nuevoRecurso: Recurso) => void;
}

export function ModalSubirRecurso({ grupo, onClose, onSuccess }: ModalSubirRecursoProps) {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [contenidoTexto, setContenidoTexto] = useState('');
    const [archivo, setArchivo] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getTipoPermitido = (departamento: string): Recurso['tipo'] => {
        if (departamento.includes('Guion') || departamento.includes('Coordinación')) return 'texto';
        if (departamento.includes('Locución')) return 'audio';
        if (departamento.includes('Edición')) return 'video';
        if (departamento.includes('Diseño') || departamento.includes('Arte')) return 'imagen';
        return 'texto';
    };

    const getTipoIcon = (tipo: Recurso['tipo']) => {
        switch (tipo) {
            case 'texto': return FileText;
            case 'video': return Video;
            case 'audio': return Music;
            case 'imagen': return ImageIcon;
        }
    };

    const tipoPermitido = getTipoPermitido(grupo.departamento);
    const Icon = getTipoIcon(tipoPermitido);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArchivo(e.target.files[0]);
        }
    };

    const handleSubirRecurso = () => {
        if (!titulo || !descripcion) {
            toast.error('Completa el título y la descripción');
            return;
        }

        if (tipoPermitido !== 'texto' && !archivo) {
            toast.error('Debes seleccionar un archivo');
            return;
        }

        if (tipoPermitido === 'texto' && !contenidoTexto) {
            toast.error('Debes escribir el contenido');
            return;
        }

        const nuevoRecurso: Recurso = {
            id: Date.now().toString(),
            grupoId: typeof grupo.id === 'string' ? parseInt(grupo.id) : grupo.id, // Fallback conversion
            grupoNombre: grupo.nombre,
            departamento: grupo.departamento,
            tipo: tipoPermitido,
            titulo,
            descripcion,
            fechaSubida: new Date(),
            url: archivo ? URL.createObjectURL(archivo) : undefined,
            contenido: tipoPermitido === 'texto' ? contenidoTexto : undefined
        };

        onSuccess(nuevoRecurso);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Subir Aportación</h3>
                        <p className="text-sm text-slate-500 font-medium">Departamento: <span className="text-purple-600">{grupo.departamento}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Título del recurso
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder={`Ej: ${tipoPermitido === 'texto' ? 'Guion episodio 1' : tipoPermitido === 'audio' ? 'Locución introducción' : 'Archivo final'}`}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-700"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Describe brevemente tu aportación para tus compañeros..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-700 resize-none"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            {tipoPermitido === 'texto' ? 'Contenido' : 'Archivo'}
                        </label>
                        {tipoPermitido === 'texto' ? (
                            <textarea
                                value={contenidoTexto}
                                onChange={(e) => setContenidoTexto(e.target.value)}
                                placeholder="Escribe o pega tu texto aquí..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono text-sm resize-none"
                                rows={6}
                            />
                        ) : (
                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer group ${archivo ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200'}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept={tipoPermitido === 'audio' ? 'audio/*' : tipoPermitido === 'video' ? 'video/*' : 'image/*'}
                                />
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${archivo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <p className="text-slate-700 font-bold mb-1">
                                    {archivo ? archivo.name : 'Haz clic o arrastra tu archivo aquí'}
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-purple-500 transition-colors">
                                    {tipoPermitido === 'audio' ? 'MP3, WAV (max 50MB)' :
                                        tipoPermitido === 'video' ? 'MP4, MOV (max 100MB)' :
                                            'JPG, PNG, SVG (max 10MB)'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubirRecurso}
                            className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-purple-600 transition-all shadow-lg hover:shadow-purple-200"
                        >
                            Publicar Recurso
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
