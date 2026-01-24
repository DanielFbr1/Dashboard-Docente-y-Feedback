import { Users, MessageSquare, Target, AlertCircle, LucideIcon } from 'lucide-react';

interface CardMetricaProps {
  titulo: string;
  numero: string | number;
  descripcion: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  icon?: LucideIcon;
}

export function Card_Metrica({ titulo, numero, descripcion, color = 'blue', icon }: CardMetricaProps) {
  const styles = {
    blue: { iconBg: 'bg-blue-50', iconText: 'text-blue-500' },
    green: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-500' },
    yellow: { iconBg: 'bg-amber-50', iconText: 'text-amber-500' },
    red: { iconBg: 'bg-rose-50', iconText: 'text-rose-500' },
    purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-500' }
  };

  // Map incoming colors to a slightly more specific palette if needed, 
  // but keep it flexible. The image shows blue, green, purple, orange/red.
  const colorMap: Record<string, keyof typeof styles> = {
    blue: 'blue',
    green: 'green',
    yellow: 'yellow',
    red: 'red',
    purple: 'purple'
  };

  const currentStyle = styles[colorMap[color] || 'blue'];

  const getDefaultIcon = () => {
    if (icon) return icon;
    switch (color) {
      case 'blue': return Users;
      case 'green': return MessageSquare;
      case 'yellow': return Target;
      case 'red': return AlertCircle;
      case 'purple': return Users; // Default for purple if not specified
      default: return Users;
    }
  };

  const Icon = getDefaultIcon();

  return (
    <div className="bg-white border border-slate-200 rounded-[1.25rem] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${currentStyle.iconBg} ${currentStyle.iconText}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-slate-500">{titulo}</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-4xl font-bold text-slate-900 leading-none">{numero}</div>
        <div className="text-xs font-medium text-slate-400">{descripcion}</div>
      </div>
    </div>
  );
}