import { Upload, FileText, Video, Music, Image as ImageIcon, Download, Eye } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Grupo } from '../types';

interface RepositorioColaborativoProps {
  grupo: Grupo;
  todosLosGrupos: Grupo[];
  esDocente?: boolean;
}

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

// Recursos de ejemplo
const recursosEjemplo: Recurso[] = [
  {
    id: '1',
    grupoId: 1,
    grupoNombre: 'Grupo 1 – Guion',
    departamento: 'Guion',
    tipo: 'texto',
    titulo: 'Guion: Episodio 1 - El Cambio Climático',
    descripcion: 'Primer borrador del guion para nuestro episodio sobre el cambio climático',
    contenido: 'Introducción: ¿Sabías que la temperatura global ha aumentado 1.1°C desde 1880? En este episodio exploramos...',
    fechaSubida: new Date('2024-01-15')
  },
  {
    id: '2',
    grupoId: 2,
    grupoNombre: 'Grupo 2 – Locución',
    departamento: 'Locución',
    tipo: 'audio',
    titulo: 'Prueba de locución - Introducción',
    descripcion: 'Grabación de prueba para la introducción del podcast',
    url: 'https://example.com/audio.mp3',
    fechaSubida: new Date('2024-01-16')
  },
  {
    id: '3',
    grupoId: 4,
    grupoNombre: 'Grupo 4 – Diseño Gráfico',
    departamento: 'Diseño Gráfico',
    tipo: 'imagen',
    titulo: 'Logo del Podcast',
    descripcion: 'Propuesta de logo para el podcast educativo',
    url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
    fechaSubida: new Date('2024-01-17')
  }
];

export function RepositorioColaborativo({ grupo, todosLosGrupos, esDocente = false }: RepositorioColaborativoProps) {
  const [recursos, setRecursos] = useState<Recurso[]>(recursosEjemplo);
  const [mostrarSubir, setMostrarSubir] = useState(false);
  const [recursoSeleccionado, setRecursoSeleccionado] = useState<Recurso | null>(null);

  // Estados para el formulario de subida
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contenidoTexto, setContenidoTexto] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const tipoPermitido = getTipoPermitido(grupo.departamento);

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
      grupoId: grupo.id as number, // Asumimos id numérico o conversión segura
      grupoNombre: grupo.nombre,
      departamento: grupo.departamento,
      tipo: tipoPermitido,
      titulo,
      descripcion,
      fechaSubida: new Date(),
      url: archivo ? URL.createObjectURL(archivo) : undefined,
      contenido: tipoPermitido === 'texto' ? contenidoTexto : undefined
    };

    setRecursos([nuevoRecurso, ...recursos]);
    toast.success('Recurso publicado con éxito');
    setMostrarSubir(false);

    // Reset form
    setTitulo('');
    setDescripcion('');
    setContenidoTexto('');
    setArchivo(null);
  };

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
      a.setAttribute('download', ''); // Forzar descarga si es posible
      a.click();
      toast.success('Descarga iniciada');
    } else {
      toast.error('No hay archivo para descargar');
    }
  };

  const getTipoIcon = (tipo: Recurso['tipo']) => {
    switch (tipo) {
      case 'texto':
        return FileText;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'imagen':
        return ImageIcon;
    }
  };

  const getTipoColor = (tipo: Recurso['tipo']) => {
    switch (tipo) {
      case 'texto':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'video':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'audio':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'imagen':
        return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  const getTipoPermitido = (departamento: string): Recurso['tipo'] => {
    if (departamento.includes('Guion') || departamento.includes('Coordinación')) return 'texto';
    if (departamento.includes('Locución')) return 'audio';
    if (departamento.includes('Edición')) return 'video';
    if (departamento.includes('Diseño')) return 'imagen';
    if (departamento.includes('Vestuario') || departamento.includes('Arte')) return 'imagen';
    return 'texto';
  };

  const tipoPermitido = getTipoPermitido(grupo.departamento);
  const Icon = getTipoIcon(tipoPermitido);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Repositorio Colaborativo</h2>
        <p className="text-blue-100">
          Comparte y explora el trabajo de todos los grupos del proyecto
        </p>
      </div>

      {/* Subir recurso - Solo visible para alumnos */}
      {!esDocente && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tu aportación</h3>
              <p className="text-sm text-gray-600">
                Como grupo de {grupo.departamento}, puedes compartir: <strong>{tipoPermitido === 'texto' ? 'Textos/Guiones' : tipoPermitido === 'audio' ? 'Audios' : tipoPermitido === 'video' ? 'Videos' : 'Imágenes/Diseños'}</strong>
              </p>
            </div>
            <button
              onClick={() => setMostrarSubir(!mostrarSubir)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg"
            >
              <Upload className="w-5 h-5" />
              Subir {tipoPermitido === 'texto' ? 'texto' : tipoPermitido}
            </button>
          </div>

          {mostrarSubir && (
            <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título del recurso
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder={`Ej: ${tipoPermitido === 'texto' ? 'Guion episodio 1' : tipoPermitido === 'audio' ? 'Locución introducción' : tipoPermitido === 'video' ? 'Video final editado' : 'Diseño de portada'}`}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente tu aportación..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {tipoPermitido === 'texto' ? 'Contenido del texto' : 'Archivo'}
                  </label>
                  {tipoPermitido === 'texto' ? (
                    <textarea
                      value={contenidoTexto}
                      onChange={(e) => setContenidoTexto(e.target.value)}
                      placeholder="Escribe o pega tu texto aquí..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                      rows={6}
                    />
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer ${archivo ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept={tipoPermitido === 'audio' ? 'audio/*' : tipoPermitido === 'video' ? 'video/*' : 'image/*'}
                      />
                      <Icon className={`w-12 h-12 mx-auto mb-3 ${archivo ? 'text-green-500' : 'text-gray-400'}`} />
                      <p className="text-gray-600 font-medium">
                        {archivo ? `Archivo seleccionado: ${archivo.name}` : 'Haz clic para seleccionar o arrastra tu archivo aquí'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {tipoPermitido === 'audio' ? 'MP3, WAV (max 50MB)' :
                          tipoPermitido === 'video' ? 'MP4, MOV (max 100MB)' :
                            'JPG, PNG, SVG (max 10MB)'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMostrarSubir(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubirRecurso}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de recursos */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recursos compartidos por todos los grupos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recursos.map((recurso) => {
            const TipoIcon = getTipoIcon(recurso.tipo);
            return (
              <div
                key={recurso.id}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setRecursoSeleccionado(recurso)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-3 rounded-lg ${getTipoColor(recurso.tipo)}`}>
                    <TipoIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{recurso.titulo}</h4>
                    <p className="text-xs text-gray-600 mb-2">{recurso.grupoNombre}</p>
                    <p className="text-sm text-gray-700">{recurso.descripcion}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {recurso.fechaSubida.toLocaleDateString('es-ES')}
                  </span>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de vista de recurso */}
      {recursoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">{recursoSeleccionado.titulo}</h3>
                <button
                  onClick={() => setRecursoSeleccionado(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <p className="text-blue-100">{recursoSeleccionado.grupoNombre} - {recursoSeleccionado.departamento}</p>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">{recursoSeleccionado.descripcion}</p>

              {recursoSeleccionado.tipo === 'texto' && recursoSeleccionado.contenido && (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap font-mono text-sm">
                    {recursoSeleccionado.contenido}
                  </p>
                </div>
              )}

              {recursoSeleccionado.tipo === 'imagen' && recursoSeleccionado.url && (
                <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={recursoSeleccionado.url}
                    alt={recursoSeleccionado.titulo}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {recursoSeleccionado.tipo === 'audio' && (
                <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 text-center">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Reproductor de audio</p>
                  <div className="bg-gray-200 rounded-lg h-12 flex items-center justify-center">
                    <span className="text-gray-500">🎵 Audio demo</span>
                  </div>
                </div>
              )}

              {recursoSeleccionado.tipo === 'video' && (
                <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 text-center">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Reproductor de video</p>
                  <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                    <span className="text-gray-500">🎬 Video demo</span>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDescargar(recursoSeleccionado)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Descargar {recursoSeleccionado.tipo === 'texto' ? 'PDF (Demo)' : ''}
                </button>
                <button
                  onClick={() => setRecursoSeleccionado(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
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
