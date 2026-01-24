import React, { useMemo } from 'react';

interface LivingTreeProps {
    progress: number; // 0 to 100
    health?: number; // 0 to 100
    size?: number;
}

export function LivingTree({ progress, health = 100, size = 300 }: LivingTreeProps) {
    const isSad = health < 50;

    // Configuración de colores
    const colors = {
        trunk: isSad ? '#5D4037' : '#5D4037',
        bark: isSad ? '#4E342E' : '#3E2723',
        leafPrimary: isSad ? '#8D6E63' : '#22C55E',
        leafSecondary: isSad ? '#795548' : '#16a34a',
        glow: isSad ? 'none' : '#4ade8055',
        firefly: '#fbbf24',
        fruit: '#f43f5e'
    };

    // Generar partículas (luciérnagas) estáticas pero con animación CSS
    const fireflies = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            cx: 50 + Math.random() * 100,
            cy: 40 + Math.random() * 80,
            delay: Math.random() * 3,
            duration: 2 + Math.random() * 2
        }));
    }, []);

    return (
        <div
            className="flex items-center justify-center relative select-none"
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 200 200"
                width="100%"
                height="100%"
                className="overflow-visible"
            >
                <defs>
                    <radialGradient id="treeGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4ade8022" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>

                    <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors.bark} />
                        <stop offset="50%" stopColor={colors.trunk} />
                        <stop offset="100%" stopColor={colors.bark} />
                    </linearGradient>

                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="1" dy="1" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Resplandor de fondo si está sano */}
                {!isSad && progress > 30 && (
                    <circle cx="100" cy="100" r="80" fill="url(#treeGlow)" className="animate-pulse" />
                )}

                {/* Suelo */}
                <ellipse cx="100" cy="185" rx="70" ry="10" fill="#E5E7EB" opacity="0.4" />

                {/* ETAPA 1: SEMILLA (0-10%) */}
                {progress >= 0 && (
                    <g transform="translate(100, 185)">
                        <circle r={progress < 10 ? 4 : 2} fill="#A8A29E" className="transition-all duration-1000" />
                        {progress > 5 && (
                            <path d="M-2,0 Q0,-10 2,0" fill={colors.leafPrimary} className="animate-bounce" />
                        )}
                    </g>
                )}

                {/* TRONCO PRINCIPAL (Crece de 10% a 100%) */}
                {progress > 10 && (
                    <g filter="url(#shadow)">
                        {/* Tronco que se ensancha y alarga */}
                        <path
                            d={`M100,185 L100,${185 - (progress * 1.2)}`}
                            stroke="url(#trunkGradient)"
                            strokeWidth={Math.min(12, 4 + progress / 10)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />

                        {/* Ramificaciones según progreso */}
                        {progress > 30 && (
                            <g className="animate-in fade-in duration-700">
                                <path d="M100,150 Q130,130 140,110" stroke={colors.trunk} strokeWidth={Math.min(8, progress / 8)} fill="none" strokeLinecap="round" />
                                <path d="M100,130 Q70,110 60,90" stroke={colors.trunk} strokeWidth={Math.min(8, progress / 8)} fill="none" strokeLinecap="round" />
                            </g>
                        )}

                        {progress > 60 && (
                            <g className="animate-in fade-in duration-700">
                                <path d="M140,110 Q160,100 170,80" stroke={colors.trunk} strokeWidth="4" fill="none" strokeLinecap="round" />
                                <path d="M60,90 Q40,80 30,60" stroke={colors.trunk} strokeWidth="4" fill="none" strokeLinecap="round" />
                                <path d="M100,100 L100,60" stroke={colors.trunk} strokeWidth="6" fill="none" strokeLinecap="round" />
                            </g>
                        )}
                    </g>
                )}

                {/* FOLLAJE (Aparece y crece) */}
                {progress > 40 && (
                    <g className="transition-all duration-1000">
                        {/* Masas de hojas con gradientes y sombras */}
                        <circle cx="100" cy={185 - progress} r={progress / 3} fill={colors.leafPrimary} opacity="0.8" className="transition-all duration-1000" />

                        {progress > 50 && (
                            <>
                                <circle cx="140" cy="110" r={progress / 4} fill={colors.leafSecondary} opacity="0.7" className="animate-pulse" />
                                <circle cx="60" cy="90" r={progress / 4} fill={colors.leafSecondary} opacity="0.7" className="animate-pulse" />
                            </>
                        )}

                        {progress > 80 && (
                            <g>
                                <circle cx="100" cy="50" r="40" fill={colors.leafPrimary} opacity="0.9" />
                                <circle cx="150" cy="70" r="25" fill={colors.leafSecondary} opacity="0.8" />
                                <circle cx="50" cy="65" r="30" fill={colors.leafSecondary} opacity="0.8" />
                            </g>
                        )}
                    </g>
                )}

                {/* DETALLES ESPECTACULARES: FRUTOS Y LUCIÉRNAGAS */}
                {progress > 85 && !isSad && (
                    <g>
                        {/* Frutos brillantes */}
                        <circle cx="100" cy="60" r="4" fill={colors.fruit} className="animate-bounce" />
                        <circle cx="130" cy="80" r="4" fill={colors.fruit} />
                        <circle cx="70" cy="70" r="4" fill={colors.fruit} />

                        {/* Luciérnagas */}
                        {fireflies.map((f) => (
                            <circle
                                key={f.id}
                                cx={f.cx}
                                cy={f.cy}
                                r="1.5"
                                fill={colors.firefly}
                                className="animate-pulse"
                                style={{
                                    animationDelay: `${f.delay}s`,
                                    animationDuration: `${f.duration}s`
                                }}
                            />
                        ))}
                    </g>
                )}

                {/* Flores al 100% */}
                {progress >= 100 && !isSad && (
                    <g className="animate-in fade-in duration-1000">
                        <path d="M100,20 Q105,10 110,20 Q115,30 100,40 Q85,30 90,20 Q95,10 100,20" fill="#FDE68A" />
                        <circle cx="100" cy="25" r="3" fill="#F59E0B" />
                    </g>
                )}
            </svg>

            {/* Etiqueta de Porcentaje Flotante */}
            <div className="absolute bottom-4 bg-white/80 backdrop-blur-md border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black text-slate-600 shadow-sm uppercase tracking-widest">
                {progress.toFixed(0)}% Progreso
            </div>
        </div>
    );
}

export const getTreeStatus = (health: number) => {
    if (health >= 80) return "Radiante";
    if (health >= 50) return "Saludable";
    if (health >= 20) return "Necesita atención";
    return "Marchito";
};
