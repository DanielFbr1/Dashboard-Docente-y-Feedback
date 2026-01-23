import { Copy, Users, Check, RefreshCw, QrCode } from 'lucide-react';
import { useState } from 'react';

interface SistemaCodigoSalaProps {
  codigoSala?: string;
}

export function SistemaCodigoSala({ codigoSala = 'ABCD-1234' }: SistemaCodigoSalaProps) {
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoSala);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Código grande con MEJOR CONTRASTE */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-4 border-blue-300">
        <div className="text-center">
          <p className="text-gray-900 text-lg font-bold mb-6 tracking-wide">CÓDIGO DE ACCESO AL PROYECTO</p>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 mb-6">
            <div className="text-7xl font-bold text-white tracking-widest font-mono drop-shadow-lg">
              {codigoSala}
            </div>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={copiarCodigo}
              className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-bold shadow-lg text-xl"
            >
              {copiado ? (
                <>
                  <Check className="w-7 h-7" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-7 h-7" />
                  Copiar código
                </>
              )}
            </button>
            <button className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors font-bold shadow-lg text-xl">
              <QrCode className="w-7 h-7" />
              Ver QR
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
        <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
          <span className="text-2xl">💡</span>
          ¿Cómo funciona?
        </h4>
        <div className="space-y-2 text-gray-700 font-medium">
          <p className="text-sm">• Los alumnos deben introducir este código al iniciar sesión</p>
          <p className="text-sm">• Solo necesitan su nombre y el código de acceso</p>
          <p className="text-sm">• Una vez conectados aparecerán en "Alumnos en línea"</p>
          <p className="text-sm">• Podrás asignarlos a grupos desde ahí</p>
        </div>
      </div>
    </div>
  );
}