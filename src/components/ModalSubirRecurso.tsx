import { useState, useRef } from 'react';
import { Upload, FileText, Video, Music, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Grupo } from '../types';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { Recurso } from '../types';

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
    const [uploading, setUploading] = useState(false);
    // Nuevo estado para el tipo seleccionado
    const [tipoSeleccionado, setTipoSeleccionado] = useState<Recurso['tipo']>('texto');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const TiposDisponibles: { id: Recurso['tipo']; label: string; icon: any; color: string }[] = [
        { id: 'texto', label: 'Texto / Documento', icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' },
        { id: 'audio', label: 'Audio / Locución', icon: Music, color: 'text-green-600 bg-green-50 border-green-200' },
        { id: 'video', label: 'Video / Edición', icon: Video, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { id: 'imagen', label: 'Imagen / Diseño', icon: ImageIcon, color: 'text-orange-600 bg-orange-50 border-orange-200' }
    ];

    const Icon = TiposDisponibles.find(t => t.id === tipoSeleccionado)?.icon || FileText;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArchivo(e.target.files[0]);
        }
    };

    const handleSubirRecurso = async () => {
        if (!titulo.trim() || !descripcion.trim()) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        // Logic update: Texto type can now have EITHER contentTexto OR archivo
        if (tipoSeleccionado === 'texto') {
            if (!contenidoTexto.trim() && !archivo) {
                toast.error('Debes escribir contenido o subir un documento');
                return;
            }
        } else {
            // Other types MUST have a file
            if (!archivo) {
                toast.error('Debes seleccionar un archivo');
                return;
            }
        }

        setUploading(true);
        try {
            let mediaUrl = '';

            // 1. Subir al Storage (si aplica)
            if (archivo) {
                const fileExt = archivo.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${grupo.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('recursos')
                    .upload(filePath, archivo);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('recursos')
                    .getPublicUrl(filePath);

                mediaUrl = data.publicUrl;
            }

            // 2. Insertar en Base de Datos
            const user = (await supabase.auth.getUser()).data.user;
            const { data, error } = await supabase
                .from('recursos')
                .insert([{
                    grupo_id: typeof grupo.id === 'string' ? parseInt(grupo.id) : grupo.id,
                    grupo_nombre: grupo.nombre,
                    // departamento: removed
                    tipo: tipoSeleccionado,
                    titulo,
                    descripcion,
                    url: mediaUrl || undefined,
                    contenido: tipoSeleccionado === 'texto' ? contenidoTexto : undefined,
                    usuario_id: user?.id
                }])
                .select()
                .single();

            if (error) throw error;

            // Adaptar respuesta al tipo Recurso local
            const nuevoRecurso: Recurso = {
                id: data.id,
                grupoId: data.grupo_id,
                grupoNombre: data.grupo_nombre,
                // departamento: removed
                tipo: data.tipo,
                titulo: data.titulo,
                descripcion: data.descripcion,
                fechaSubida: new Date(data.created_at),
                url: data.url,
                contenido: data.contenido
            };

            toast.success('Recurso publicado con éxito');
            onSuccess(nuevoRecurso);
            onClose();

        } catch (error: any) {
            console.error('Error al subir recurso:', error);
            toast.error(`Error: ${error.message || 'No se pudo subir el recurso'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Subir Aportación</h3>
                        <p className="text-sm text-slate-500 font-medium">Comparte tu trabajo con el equipo</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">

                    {/* SMART UPLOAD ZONE (Auto-Detect) */}
                    {!archivo && (
                        <div className="mb-6">
                            <div
                                className="border-3 border-dashed border-indigo-100 bg-indigo-50/30 rounded-3xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group relative overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setArchivo(file);

                                            // Auto-Detect Type
                                            const ext = file.name.split('.').pop()?.toLowerCase();
                                            if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) {
                                                setTipoSeleccionado('audio');
                                                toast.info("🎙️ Detectado: Audio");
                                            } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
                                                setTipoSeleccionado('video');
                                                toast.info("🎬 Detectado: Video");
                                            } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
                                                setTipoSeleccionado('imagen');
                                                toast.info("🖼️ Detectado: Imagen");
                                            } else {
                                                setTipoSeleccionado('texto');
                                                toast.info("📄 Detectado: Documento");
                                                setContenidoTexto(''); // Ensure text is clear if switching to file mode
                                            }
                                        }
                                    }}
                                />
                                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-black text-slate-700 mb-1">Subida Rápida Inteligente</h4>
                                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">
                                    Arrastra cualquier archivo o haz clic.
                                    <br /><span className="text-[10px] uppercase tracking-widest text-indigo-400">Detectamos el tipo automáticamente</span>
                                </p>
                            </div>

                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-slate-100"></div>
                                <span className="flex-shrink-0 mx-4 text-[10px] text-slate-300 font-black uppercase tracking-widest">O selecciona manualmente</span>
                                <div className="flex-grow border-t border-slate-100"></div>
                            </div>
                        </div>
                    )}
                    {/* Selector de Tipo */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                            ¿Qué vas a subir?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {TiposDisponibles.map((tipo) => {
                                const TIcon = tipo.icon;
                                const isSelected = tipoSeleccionado === tipo.id;
                                return (
                                    <button
                                        key={tipo.id}
                                        onClick={() => {
                                            setTipoSeleccionado(tipo.id);
                                            setArchivo(null); // Limpiar archivo al cambiar tipo
                                            setContenidoTexto('');
                                        }}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isSelected
                                            ? `border-purple-500 bg-purple-50 shadow-md ${tipo.color.split(' ')[0]}`
                                            : 'border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <TIcon className={`w-6 h-6 ${isSelected ? 'scale-110' : 'scale-100'} transition-transform`} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">{tipo.label.split(' / ')[0]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Título del recurso
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder={`Ej: ${tipoSeleccionado === 'texto' ? 'Guion episodio 1' : tipoSeleccionado === 'audio' ? 'Locución introducción' : 'Archivo final'}`}
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
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            {tipoSeleccionado === 'texto' ? 'Contenido (Escribe o Sube un Archivo)' : 'Archivo'}
                        </label>

                        {tipoSeleccionado === 'texto' ? (
                            <div className="space-y-4">
                                {/* Option A: Write Text */}
                                <textarea
                                    value={contenidoTexto}
                                    onChange={(e) => {
                                        setContenidoTexto(e.target.value);
                                        if (e.target.value) setArchivo(null); // Clear file if writing text
                                    }}
                                    placeholder="Escribe tu texto aquí..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono text-sm resize-none"
                                    rows={4}
                                />

                                <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest py-2">
                                    — O —
                                </div>

                                {/* Option B: Upload File (PDF/Doc) */}
                                <div
                                    className={`border-2 border-dashed rounded-2xl p-6 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer group ${archivo ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200'}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={(e) => {
                                            handleFileChange(e);
                                            if (e.target.files?.[0]) setContenidoTexto(''); // Clear text if uploading file
                                        }}
                                        accept=".pdf,.doc,.docx,.txt"
                                    />
                                    <div className="flex items-center justify-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${archivo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:text-purple-500'}`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-slate-700 font-bold text-sm">
                                                {archivo ? archivo.name : 'Subir documento (PDF, Word, TXT)'}
                                            </p>
                                            {!archivo && <p className="text-[10px] text-slate-400">Haz clic para buscar</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                    accept={tipoSeleccionado === 'audio' ? 'audio/*' : tipoSeleccionado === 'video' ? 'video/*' : 'image/*'}
                                />
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${archivo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <p className="text-slate-700 font-bold mb-1">
                                    {archivo ? archivo.name : 'Haz clic o arrastra tu archivo aquí'}
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-purple-500 transition-colors">
                                    {tipoSeleccionado === 'audio' ? 'MP3, WAV (max 50MB)' :
                                        tipoSeleccionado === 'video' ? 'MP4, MOV (max 100MB)' :
                                            'JPG, PNG, SVG (max 10MB)'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            disabled={uploading}
                            className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubirRecurso}
                            disabled={uploading}
                            className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-purple-600 transition-all shadow-lg hover:shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Publicando...
                                </>
                            ) : (
                                'Publicar Recurso'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
