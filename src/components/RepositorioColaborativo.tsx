import { FileText, Video, Music, Image as ImageIcon, Download, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Grupo } from '../types';

interface RepositorioColaborativoProps {
  grupo: Grupo;
  todosLosGrupos: Grupo[];
  esDocente?: boolean;
  mostrarEjemplo?: boolean;
  className?: string; // Permitir estilos extra
}

export interface Recurso {
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

// Recursos de ejemplo
const recursosEjemplo: Recurso[] = [];

export function RepositorioColaborativo({ grupo, mostrarEjemplo = false, className = '' }: RepositorioColaborativoProps) {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [recursoSeleccionado, setRecursoSeleccionado] = useState<Recurso | null>(null);

  useEffect(() => {
    if (mostrarEjemplo) {
      setRecursos(recursosEjemplo);
    } else {
      setRecursos([]); // Aquí iría la carga real desde BD
    }
  }, [mostrarEjemplo]);

  const handleDescargar = (recurso: Recurso) => {
    if (recurso.tipo === 'texto' && recurso.contenido) {
      const blob = new Blob([recurso.contenido], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recurso.titulo}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Descarga iniciada');
    } else if (recurso.url) {
      const a = document.createElement('a');
      a.href = recurso.url;
      a.download = recurso.url.split('/').pop() || 'archivo';
      a.setAttribute('download', '');
      a.click();
      toast.success('Descarga iniciada');
    } else {
      toast.error('No hay archivo para descargar');
    }
  };

  const getTipoIcon = (tipo: Recurso['tipo']) => {
    switch (tipo) {
      case 'texto': return FileText;
      case 'video': return Video;
      case 'audio': return Music;
      case 'imagen': return ImageIcon;
    }
  };

  const getTipoColor = (tipo: Recurso['tipo']) => {
    switch (tipo) {
      case 'texto': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'video': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'audio': return 'bg-green-100 text-green-700 border-green-300';
      case 'imagen': return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Lista de recursos */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
        <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tight uppercase">Recursos compartidos</h3>

        {recursos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recursos.map((recurso) => {
              const TipoIcon = getTipoIcon(recurso.tipo);
              return (
                <div
                  key={recurso.id}
                  className="p-5 border border-slate-200 rounded-2xl hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all cursor-pointer bg-slate-50/50 group"
                  onClick={() => setRecursoSeleccionado(recurso)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${getTipoColor(recurso.tipo)} shrink-0`}>
                      <TipoIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 mb-1 truncate leading-tight group-hover:text-purple-700 transition-colors">{recurso.titulo}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
                          {recurso.grupoNombre.split('–')[1]?.trim() || recurso.grupoNombre}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{recurso.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {recurso.fechaSubida.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all text-xs font-bold uppercase tracking-wider">
                      <Eye className="w-3 h-3" />
                      Ver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50">
            <p className="text-slate-400 font-medium text-sm">Aún no hay recursos compartidos.</p>
          </div>
        )}
      </div>

      {/* Modal de vista de recurso */}
      {recursoSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-8 text-white shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                {(() => {
                  const Icon = getTipoIcon(recursoSeleccionado.tipo);
                  return <Icon size={120} />;
                })()}
              </div>
              <div className="relative z-10 pr-12">
                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 ${getTipoColor(recursoSeleccionado.tipo)}`}>
                  {recursoSeleccionado.departamento}
                </span>
                <h3 className="text-2xl font-black tracking-tight mb-2 leading-tight">{recursoSeleccionado.titulo}</h3>
                <p className="text-slate-400 text-sm font-medium">{recursoSeleccionado.grupoNombre}</p>
              </div>
              <button
                onClick={() => setRecursoSeleccionado(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <p className="text-slate-600 mb-8 font-medium leading-relaxed text-lg">{recursoSeleccionado.descripcion}</p>

              {recursoSeleccionado.tipo === 'texto' && recursoSeleccionado.contenido && (
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-inner">
                  <p className="text-slate-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {recursoSeleccionado.contenido}
                  </p>
                </div>
              )}

              {recursoSeleccionado.tipo === 'imagen' && recursoSeleccionado.url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                  <img
                    src={recursoSeleccionado.url}
                    alt={recursoSeleccionado.titulo}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {recursoSeleccionado.tipo === 'audio' && (
                <div className="bg-slate-50 rounded-3xl p-12 border border-slate-200 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                    <Music className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="max-w-md mx-auto h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                    <div className="w-1/3 h-full bg-purple-500 rounded-full"></div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Audio Preview</p>
                </div>
              )}

              {recursoSeleccionado.tipo === 'video' && (
                <div className="bg-slate-900 rounded-3xl p-12 border border-slate-800 text-center relative overflow-hidden group-video cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pl-1 group-video-hover:scale-110 transition-transform">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="mt-24 text-slate-400 text-xs font-bold uppercase tracking-widest relative z-10">Video Preview</p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                <button
                  onClick={() => handleDescargar(recursoSeleccionado)}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-purple-600 transition-all font-bold uppercase tracking-widest text-xs shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Descargar Archivo
                </button>
                <button
                  onClick={() => setRecursoSeleccionado(null)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
