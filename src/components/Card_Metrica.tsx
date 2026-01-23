import { Users, MessageSquare, Target, AlertCircle, LucideIcon } from 'lucide-react';

interface CardMetricaProps {
  titulo: string;
  numero: string | number;
  descripcion: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  icon?: LucideIcon;
}

export function Card_Metrica({ titulo, numero, descripcion, color = 'blue', icon }: CardMetricaProps) {
  const styles = {
    blue: { border: 'border-l-4 border-blue-500', icon: 'bg-blue-50 text-blue-600' },
    green: { border: 'border-l-4 border-green-500', icon: 'bg-green-50 text-green-600' },
    yellow: { border: 'border-l-4 border-yellow-500', icon: 'bg-yellow-50 text-yellow-600' },
    red: { border: 'border-l-4 border-red-500', icon: 'bg-red-50 text-red-600' },
  };

  const getDefaultIcon = () => {
    if (icon) return icon;
    switch (color) {
      case 'blue': return Users;
      case 'green': return MessageSquare;
      case 'yellow': return Target;
      case 'red': return AlertCircle;
      default: return Users;
    }
  };

  const Icon = getDefaultIcon();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col gap-2 ${styles[color].border}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{titulo}</span>
        <div className={`p-2 rounded-md ${styles[color].icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{numero}</div>
      <div className="text-xs text-gray-400">{descripcion}</div>
    </div>
  );
}