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
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      light: 'bg-blue-400/20 text-blue-50',
      border: 'border-blue-400/30'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      light: 'bg-emerald-400/20 text-emerald-50',
      border: 'border-emerald-400/30'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      light: 'bg-amber-400/20 text-amber-50',
      border: 'border-amber-400/30'
    },
    red: {
      bg: 'bg-gradient-to-br from-rose-500 to-red-600',
      light: 'bg-rose-400/20 text-rose-50',
      border: 'border-rose-400/30'
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
    <div className={`${styles[color].bg} rounded-[2.5rem] shadow-xl p-8 flex flex-col gap-4 border-2 ${styles[color].border} text-white relative overflow-hidden group hover:scale-[1.02] transition-all`}>
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

      <div className="flex items-center justify-between relative z-10">
        <span className="text-sm font-black uppercase tracking-widest text-white/70">{titulo}</span>
        <div className={`p-3 rounded-2xl ${styles[color].light} backdrop-blur-md`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex flex-col relative z-10">
        <div className="text-5xl font-black tracking-tighter mb-1">{numero}</div>
        <div className="text-sm font-bold text-white/80 italic">{descripcion}</div>
      </div>
    </div>
  );
}