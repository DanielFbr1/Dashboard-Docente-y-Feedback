import { useState } from 'react';
import { User, GraduationCap, ArrowRight, BookOpen, Brain } from 'lucide-react';

interface LoginProps {
  onLogin: (tipo: 'profesor' | 'alumno', datos: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [tipoUsuario, setTipoUsuario] = useState<'profesor' | 'alumno' | null>(null);
  const [nombre, setNombre] = useState('');
  const [clase, setClase] = useState('');
  const [grupo, setGrupo] = useState('');
  const [password, setPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoUsuario === 'profesor') {
      // Contraseña fija para profesor (en producción esto debería ser seguro)
      if (password !== 'profesor123') {
        setErrorPassword(true);
        return;
      }
      onLogin('profesor', { nombre, clase });
    } else if (tipoUsuario === 'alumno') {
      onLogin('alumno', { nombre, clase, grupo });
    }
  };

  if (!tipoUsuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <Brain className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Panel ABP + IA</h1>
            <p className="text-2xl text-white font-medium drop-shadow-md">Aprendizaje Basado en Proyectos con Inteligencia Artificial</p>
            <div className="mt-6 flex justify-center gap-4">
              <span className="px-5 py-2.5 bg-white bg-opacity-90 backdrop-blur-md rounded-full text-indigo-900 text-sm font-bold shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                5.º y 6.º de Primaria
              </span>
              <span className="px-5 py-2.5 bg-white bg-opacity-90 backdrop-blur-md rounded-full text-indigo-900 text-sm font-bold shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Metodología socrática
              </span>
            </div>
          </div>

          {/* Selector de tipo de usuario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profesor */}
            <button
              onClick={() => setTipoUsuario('profesor')}
              className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 opacity-10 rounded-bl-full"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-9 h-9 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">Soy Profesor/a</h2>
                <p className="text-gray-700 mb-6 font-medium">
                  Accede al panel completo de gestión para monitorizar grupos, evaluar y configurar el proyecto ABP.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span>Gestión de grupos y departamentos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span>Seguimiento de interacciones IA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span>Sistema de evaluación y rúbricas</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                  <span>Acceder como profesor</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>

            {/* Alumno */}
            <button
              onClick={() => setTipoUsuario('alumno')}
              className="group relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 rounded-bl-full"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <User className="w-9 h-9 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">Soy Alumno/a</h2>
                <p className="text-gray-700 mb-6 font-medium">
                  Accede a tu espacio personal para ver tu grupo, evaluación y chat con el Mentor IA.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span>Tu perfil y evaluación personal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span>Información de tu grupo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span>Chat con Mentor IA</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all">
                  <span>Acceder como alumno</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-2 text-white text-sm font-medium drop-shadow-md">
              <BookOpen className="w-4 h-4" />
              <span>Trabajo de Fin de Grado - Proyecto Educativo ABP + IA</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de login
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header del formulario */}
          <div className={`p-8 text-white ${tipoUsuario === 'profesor'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
            : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => {
                  setTipoUsuario(null);
                  setErrorPassword(false);
                }}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                {tipoUsuario === 'profesor' ? (
                  <GraduationCap className="w-7 h-7" />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold">
              {tipoUsuario === 'profesor' ? 'Acceso Docente' : 'Acceso Alumno'}
            </h2>
            <p className="text-sm opacity-90 mt-1">Introduce tus datos para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={tipoUsuario === 'profesor' ? 'Ej: María García López' : 'Ej: Ana Martínez'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium placeholder-gray-500"
                  required
                />
              </div>

              {tipoUsuario === 'profesor' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorPassword(false);
                      }}
                      placeholder="Introduce la contraseña de acceso"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium placeholder-gray-500 ${errorPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      required
                    />
                    {errorPassword && (
                      <p className="text-red-600 text-sm mt-2 font-medium">Contraseña incorrecta. Usa: profesor123</p>
                    )}
                    <p className="text-xs text-gray-700 mt-2 font-medium">💡 Para demo, usa: profesor123</p>
                  </div>
                </>
              )}

              {tipoUsuario === 'alumno' && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Código de sala
                  </label>
                  <input
                    type="text"
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value.toUpperCase())}
                    placeholder="Ej: ABCD-1234"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-2xl tracking-wider text-gray-900 font-bold placeholder-gray-400"
                    maxLength={9}
                    required
                  />
                  <p className="text-xs text-gray-700 mt-2 text-center font-medium">
                    💡 Introduce el código que te dio tu profesor/a
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`w-full mt-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 ${tipoUsuario === 'profesor'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
            >
              <span>Iniciar sesión</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}