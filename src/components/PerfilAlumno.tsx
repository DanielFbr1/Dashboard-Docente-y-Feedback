import { X, Award, TrendingUp, MessageSquare, Target, Brain, CheckCircle2, AlertCircle, Trophy, Star, Calendar, Clock, Flame, Users, FileText, Lightbulb, Pencil, Save, Loader2 } from 'lucide-react';
import { Grupo } from '../types';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface PerfilAlumnoProps {
  alumno: string;
  grupo: Grupo;
  onClose: () => void;
}

interface EvaluacionIndividual {
  criterio: string;
  nivel: 'Insuficiente' | 'Suficiente' | 'Notable' | 'Sobresaliente';
  puntos: number;
  comentario: string;
}

interface ActividadReciente {
  fecha: string;
  tipo: 'pregunta_ia' | 'aportacion' | 'colaboracion';
  descripcion: string;
}

const CRITERIOS_DEFAULT: EvaluacionIndividual[] = [
  { criterio: 'Colaboración y trabajo en equipo', nivel: 'Suficiente', puntos: 5, comentario: '' },
  { criterio: 'Uso crítico de la IA', nivel: 'Suficiente', puntos: 5, comentario: '' },
  { criterio: 'Aportación al producto', nivel: 'Suficiente', puntos: 5, comentario: '' },
  { criterio: 'Reflexión metacognitiva', nivel: 'Suficiente', puntos: 5, comentario: '' }
];

export function PerfilAlumno({ alumno, grupo, onClose }: PerfilAlumnoProps) {
  const [asistenciaStats, setAsistenciaStats] = useState({ present: 0, total: 0, percentage: 100 });
  const [loading, setLoading] = useState(true);
  const [evaluacion, setEvaluacion] = useState<EvaluacionIndividual[]>(CRITERIOS_DEFAULT);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvaluacion();
    fetchAsistenciaData();
  }, [alumno, grupo.id]);

  const fetchAsistenciaData = async () => {
    try {
      // 1. Total días que se ha pasado lista en este proyecto
      // (Contamos fechas únicas en la tabla asistencia para este proyecto)
      // Nota: Esto asume que si se pasó lista, hay al menos una entrada.
      // Una query aproximada es contar distinct fecha.
      // Supabase no tiene count distinct fácil en JS client directo sin RPC, pero podemos hacer:
      // .select('fecha', { count: 'exact', head: false }).eq('proyecto_id', grupo.proyecto_id).csv() -> manual unique en cliente
      // O rpc. Vamos a intentar traer todas las fechas únicas (lightweight).

      const { data: allFechas } = await supabase
        .from('asistencia')
        .select('fecha')
        .eq('proyecto_id', grupo.proyecto_id);

      const uniqueDays = new Set(allFechas?.map(f => f.fecha)).size;

      // 2. Días que el alumno estuvo presente
      const { count: presentCount } = await supabase
        .from('asistencia')
        .select('*', { count: 'exact', head: true })
        .eq('proyecto_id', grupo.proyecto_id)
        .eq('alumno_nombre', alumno)
        .eq('presente', true);

      const pCount = presentCount || 0;
      const total = uniqueDays || 1; // Avoid div by 0

      setAsistenciaStats({
        present: pCount,
        total: uniqueDays,
        percentage: Math.round((pCount / total) * 100)
      });
    } catch (e) {
      console.error("Error fetching asistencia:", e);
    }
  };

  const fetchEvaluacion = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('alumno_nombre', alumno)
        .eq('proyecto_id', grupo.proyecto_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching evaluation:', error);
      }

      if (data && data.criterios) {
        setEvaluacion(data.criterios);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const notaFinal = evaluacion.reduce((sum, e) => sum + e.puntos, 0) / evaluacion.length;

      const payload = {
        alumno_nombre: alumno,
        proyecto_id: grupo.proyecto_id,
        grupo_id: grupo.id,
        criterios: evaluacion,
        nota_final: notaFinal,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('evaluaciones')
        .upsert(payload, { onConflict: 'alumno_nombre, proyecto_id' });

      if (error) throw error;
      toast.success('Evaluación guardada correctamente');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Error al guardar la evaluación');
    } finally {
      setSaving(false);
    }
  };

  const updateCriterio = (index: number, field: keyof EvaluacionIndividual, value: any) => {
    const newEval = [...evaluacion];
    newEval[index] = { ...newEval[index], [field]: value };

    if (field === 'puntos') {
      const p = Number(value);
      let n: EvaluacionIndividual['nivel'] = 'Insuficiente';
      if (p >= 9) n = 'Sobresaliente';
      else if (p >= 7) n = 'Notable';
      else if (p >= 5) n = 'Suficiente';
      newEval[index].nivel = n;
    }
    setEvaluacion(newEval);
  };

  // Conversión de minutos a Horas (Real)
  const horasReales = grupo.tiempo_uso_minutos
    ? (grupo.tiempo_uso_minutos / 60).toFixed(1)
    : "0.0";

  const notaMedia = evaluacion.length > 0
    ? evaluacion.reduce((sum, e) => sum + Number(e.puntos || 0), 0) / evaluacion.length
    : 0;

  const getNivelColor = (nivel: EvaluacionIndividual['nivel']) => {
    switch (nivel) {
      case 'Sobresaliente': return 'bg-green-600 text-white';
      case 'Notable': return 'bg-blue-600 text-white';
      case 'Suficiente': return 'bg-yellow-600 text-white';
      case 'Insuficiente': return 'bg-red-600 text-white';
    }
  };

  const getBarColor = (nivel: EvaluacionIndividual['nivel']) => {
    switch (nivel) {
      case 'Sobresaliente': return 'bg-green-600';
      case 'Notable': return 'bg-blue-600';
      case 'Suficiente': return 'bg-yellow-600';
      case 'Insuficiente': return 'bg-red-600';
    }
  };

  const getNivelIcon = (nivel: EvaluacionIndividual['nivel']) => {
    switch (nivel) {
      case 'Sobresaliente': return <Trophy className="w-4 h-4" />;
      case 'Notable': return <CheckCircle2 className="w-4 h-4" />;
      case 'Suficiente': return <Star className="w-4 h-4" />;
      case 'Insuficiente': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDepartamentoColor = (departamento: string) => {
    const colores: { [key: string]: string } = {
      'Guion': 'from-purple-600 to-purple-800',
      'Locución': 'from-blue-600 to-blue-800',
      'Edición': 'from-green-600 to-green-800',
      'Diseño Gráfico': 'from-orange-600 to-orange-800',
      'Vestuario/Arte': 'from-pink-600 to-pink-800',
      'Coordinación': 'from-indigo-600 to-indigo-800'
    };
    return colores[departamento] || 'from-gray-600 to-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100">
        {/* Header Mejorado Compacto */}
        <div className={`bg-gradient-to-r ${getDepartamentoColor('General')} text-white relative overflow-hidden shrink-0`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl"></div>

          <div className="relative z-10 px-6 py-5 flex items-center justify-between gap-4">
            {/* Info Principal */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg text-3xl font-black border-2 border-white/20 shrink-0">
                <span className={`bg-gradient-to-br ${getDepartamentoColor('General')} bg-clip-text text-transparent`}>
                  {alumno.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black drop-shadow-sm tracking-tight leading-none mb-1">{alumno}</h2>
                <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {grupo.nombre}</span>
                  <span>•</span>
                  <span>General</span>
                </div>
              </div>
            </div>

            {/* Nota Media (Movida arriba y compactada) */}
            <div className="flex items-center gap-6">
              <div className="bg-white/10 rounded-2xl px-5 py-2 backdrop-blur-md border border-white/20 shadow-lg flex flex-col items-center justify-center min-w-[100px]">
                <div className="text-white/70 text-[9px] font-black uppercase tracking-widest">Nota Media</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tighter shadow-black drop-shadow-md">{notaMedia.toFixed(1)}</span>
                  <span className="text-xs font-bold opacity-60">/10</span>
                </div>
              </div>

              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm text-white border border-white/10 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fc]">
          <div className="max-w-4xl mx-auto flex flex-col gap-10">

            {/* Estadísticas Filtradas (Solo lo importante) */}
            <section>
              <h3 className="text-lg font-black text-slate-800 mb-5 uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> Rendimiento Clave
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Asistencia Real */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-5 hover:scale-[1.02] transition-transform">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-4xl font-black text-slate-900">{asistenciaStats.percentage}%</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asistencia ({asistenciaStats.present}/{asistenciaStats.total})</div>
                  </div>
                </div>

                {/* Preguntas IA */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-5 hover:scale-[1.02] transition-transform">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-4xl font-black text-slate-900">{Math.floor(grupo.interacciones_ia / Math.max(1, grupo.miembros.length))}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultas IA</div>
                  </div>
                </div>

                {/* Horas Trabajo Real */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-5 hover:scale-[1.02] transition-transform">
                  <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 shrink-0">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-4xl font-black text-slate-900">{horasReales}h</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiempo Invertido</div>
                  </div>
                </div>

              </div>
            </section>


            {/* Evaluación por criterios con MEJOR CONTRASTE */}
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Evaluación por criterios
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors font-bold text-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Evaluar
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setIsEditing(false); fetchEvaluacion(); }}
                      className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm"
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm shadow-lg shadow-blue-200"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar Notas
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {evaluacion.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 mr-6">
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">{item.criterio}</h4>

                        {isEditing ? (
                          <textarea
                            value={item.comentario}
                            onChange={(e) => updateCriterio(index, 'comentario', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Escribe un comentario observacional..."
                            rows={2}
                          />
                        ) : (
                          <p className="text-gray-700 font-medium text-base">{item.comentario || <span className="italic text-gray-400">Sin comentarios...</span>}</p>
                        )}
                      </div>

                      <div className="text-right flex flex-col items-end gap-3 min-w-[120px]">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl shadow-md ${getNivelColor(item.nivel)}`}>
                          {getNivelIcon(item.nivel)}
                          {item.nivel}
                        </span>

                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              className="w-16 text-3xl font-bold text-gray-900 text-right bg-transparent border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                              value={item.puntos}
                              onChange={(e) => updateCriterio(index, 'puntos', e.target.value)}
                            />
                            <span className="text-xl text-gray-600 font-semibold">/10</span>
                          </div>
                        ) : (
                          <div className="text-4xl font-bold text-gray-900">
                            {item.puntos}
                            <span className="text-xl text-gray-600 font-semibold">/10</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getBarColor(item.nivel)}`}
                        style={{ width: `${(item.puntos / 10) * 100}%` }}
                      />
                    </div>
                    {isEditing && (
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={item.puntos}
                        onChange={(e) => updateCriterio(index, 'puntos', e.target.value)}
                        className="w-full mt-2 accent-blue-600 cursor-pointer"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Indicadores de progreso del grupo */}
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Progreso del grupo
              </h3>
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-gray-900">Progreso general</span>
                  <span className="font-bold text-gray-900">{grupo.progreso}%</span>
                </div>
                <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all"
                    style={{ width: `${grupo.progreso}%` }}
                  />
                </div>
              </div>
              <p className="text-gray-700 font-medium">
                El grupo está avanzando bien. Estado actual: <strong className="text-gray-900">{grupo.estado}</strong>
              </p>
            </div>

            {/* Recomendaciones con MEJOR CONTRASTE */}
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-orange-300">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                Áreas de mejora y recomendaciones
              </h3>
              <div className="space-y-3">
                <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <p className="font-semibold text-gray-900 flex items-start gap-3 text-base">
                    <span className="text-2xl">💡</span>
                    <span>Profundizar en la reflexión metacognitiva: documentar más detalladamente el proceso de aprendizaje</span>
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <p className="font-semibold text-gray-900 flex items-start gap-3 text-base">
                    <span className="text-2xl">⭐</span>
                    <span>Continuar aprovechando la IA para hacer preguntas reflexivas - está teniendo muy buenos resultados</span>
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <p className="font-semibold text-gray-900 flex items-start gap-3 text-base">
                    <span className="text-2xl">🚀</span>
                    <span>Compartir más sus ideas creativas con el grupo durante las sesiones de trabajo</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-5 border-t-2 border-gray-300">
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Cerrar perfil
          </button>
        </div>
      </div>
    </div>
  );
}