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
    blue: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: 'bg-blue-100 text-blue-600',
      label: 'text-blue-500'
    },
    green: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: 'bg-emerald-100 text-emerald-600',
      label: 'text-emerald-500'
    },
    yellow: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: 'bg-amber-100 text-amber-600',
      label: 'text-amber-500'
    },
    red: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: 'bg-rose-100 text-rose-600',
      label: 'text-rose-500'
    },
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
    <div className={`${styles[color].container} rounded-[2rem] border-2 p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all group`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-black uppercase tracking-widest ${styles[color].label}`}>{titulo}</span>
        <div className={`p-2.5 rounded-xl ${styles[color].icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-4xl font-black tracking-tight">{numero}</div>
        <div className="text-sm font-bold opacity-60 italic">{descripcion}</div>
      </div>
    </div>
  );
}