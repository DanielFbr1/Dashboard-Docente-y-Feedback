import React from 'react';
import {
    TrendingUp,
    Users,
    MessageSquare,
    CheckCircle,
    Clock,
    Target,
    BarChart3,
    Activity
} from 'lucide-react';
import { cn } from './ui/utils';

export interface DashboardMetrics {
    activeProjects: number;
    totalStudents: number;
    interactions: number;
    avgProgress: number;
}

export function AnalyticsDashboard({ metrics }: { metrics?: DashboardMetrics }) {
    const stats = [
        {
            title: 'Proyectos Activos',
            value: metrics ? metrics.activeProjects.toString() : '0',
            change: '+2 este mes',
            icon: Activity,
            color: 'from-blue-500 to-cyan-500',
            trend: 'up'
        },
        {
            title: 'Estudiantes',
            value: metrics ? metrics.totalStudents.toString() : '0',
            change: '+5 inscritos',
            icon: Users,
            color: 'from-purple-500 to-pink-500',
            trend: 'up'
        },
        {
            title: 'Interacciones IA',
            value: metrics ? metrics.interactions.toString() : '0',
            change: '+12% desde ayer',
            icon: MessageSquare,
            color: 'from-emerald-500 to-green-500',
            trend: 'up'
        },
        {
            title: 'Progreso Promedio',
            value: metrics ? `${Math.round(metrics.avgProgress)}%` : '0%',
            change: '+8% esta semana',
            icon: CheckCircle,
            color: 'from-amber-500 to-orange-500',
            trend: 'up'
        },
        {
            title: 'Tiempo Promedio',
            value: '3.2h',
            change: '-15% de mejora',
            icon: Clock,
            color: 'from-indigo-500 to-violet-500',
            trend: 'down'
        },
        {
            title: 'Objetivos Alcanzados',
            value: '75%',
            change: '5 de 8 objetivos',
            icon: Target,
            color: 'from-rose-500 to-pink-500',
            trend: 'up'
        }
    ];
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Analítica del Aula</h2>
                    <p className="text-muted-foreground">Métricas de rendimiento y participación</p>
                </div>
                <div className="flex items-center gap-2">
                    <select className="px-4 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option>Esta semana</option>
                        <option>Este mes</option>
                        <option>Este trimestre</option>
                    </select>
                    <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium">
                        <BarChart3 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={cn(
                                "glass rounded-[2rem] border border-border/50 p-6",
                                "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300",
                                "animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
                            )}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">{stat.title}</p>
                                    <p className="text-4xl font-black mb-2 tracking-tighter text-slate-800">
                                        {stat.value}
                                    </p>
                                    <div className={cn(
                                        "flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md w-fit",
                                        stat.trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                                    )}>
                                        <TrendingUp className={cn(
                                            "w-3 h-3",
                                            stat.trend === 'down' && 'rotate-180'
                                        )} />
                                        {stat.change}
                                    </div>
                                </div>

                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform group-hover:rotate-6",
                                    "bg-gradient-to-br text-white",
                                    stat.color
                                )}>
                                    <Icon className="w-7 h-7" />
                                </div>
                            </div>

                            {/* Mini progress bar */}
                            <div className="mt-6">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
                                            stat.color
                                        )}
                                        style={{
                                            width: '0%',
                                            animation: 'growWidth 1.5s ease-out forwards',
                                            animationDelay: `${index * 150 + 200}ms`
                                        }}
                                    />
                                    <style>{`
                                        @keyframes growWidth {
                                            from { width: 0%; }
                                            to { width: ${parseInt(stat.value) > 100 ? 100 : parseInt(stat.value)}%; }
                                        }
                                    `}</style>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Engagement Chart */}
            <div className="glass rounded-2xl border border-border/50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold">Participación por Departamento</h3>
                        <p className="text-sm text-muted-foreground">Interacciones IA en los últimos 7 días</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {[
                            { label: 'Ciencias', color: 'bg-blue-500' },
                            { label: 'Matemáticas', color: 'bg-purple-500' },
                            { label: 'Historia', color: 'bg-emerald-500' },
                            { label: 'Arte', color: 'bg-amber-500' }
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                <span className="text-sm">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart visualization */}
                <div className="h-64 flex items-end gap-4 mt-8">
                    {[65, 85, 45, 75, 90, 55, 80].map((value, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                            <div className="relative w-full h-full flex items-end">
                                <div
                                    className={cn(
                                        "w-full rounded-t-xl transition-all duration-500 group-hover:opacity-90 relative overflow-hidden",
                                        index % 4 === 0 ? "bg-blue-500" :
                                            index % 4 === 1 ? "bg-purple-500" :
                                                index % 4 === 2 ? "bg-emerald-500" : "bg-amber-500"
                                    )}
                                    style={{
                                        height: '0%',
                                        animation: `growHeight 1s ease-out ${index * 0.1}s forwards`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400 mt-3 group-hover:text-slate-600 transition-colors">
                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                            </span>
                        </div>
                    ))}
                    <style>{`
                        @keyframes growHeight {
                            from { height: 0%; }
                            to { height: var(--target-height); }
                        }
                    `}</style>
                    {/* Inject dynamic styles for animation targets */}
                    {[65, 85, 45, 75, 90, 55, 80].map((val, i) => (
                        <style key={i}>{`
                           .flex-1:nth-child(${i + 1}) .rounded-t-xl { --target-height: ${val}%; }
                         `}</style>
                    ))}
                </div>
            </div>
        </div>
    );
}
