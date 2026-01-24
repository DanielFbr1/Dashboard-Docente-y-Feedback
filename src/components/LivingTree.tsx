import React, { useEffect, useState } from 'react';

interface LivingTreeProps {
    progress: number; // 0 to 100
    health?: number; // 0 to 100 (100 = healthy, <50 = sad)
    size?: number;
}

export function LivingTree({ progress, health = 100, size = 300 }: LivingTreeProps) {
    const [animationState, setAnimationState] = useState(0);

    // Stages based on progress
    // 0-10: Seed
    // 10-40: Sprout / Young Tree
    // 40-70: Mature Tree
    // 70-100: Blossoming / Fruiting

    const isSad = health < 50;
    const leafColor = isSad ? '#8B7355' : '#4ADE80'; // Brownish vs Green
    const trunkColor = '#8B5A2B';
    const fruitColor = isSad ? '#A0522D' : '#F43F5E';

    useEffect(() => {
        // Simple entry animation
        setAnimationState(0);
        const timer = setTimeout(() => setAnimationState(1), 100);
        return () => clearTimeout(timer);
    }, [progress]);

    // Calculate scale for growth animation
    const scale = animationState === 0 ? 0.8 : 1;

    return (
        <div
            className="flex items-center justify-center transition-all duration-1000 ease-out"
            style={{
                width: size,
                height: size,
                filter: isSad ? 'grayscale(0.4) sepia(0.2)' : 'none'
            }}
        >
            <svg
                viewBox="0 0 200 200"
                width="100%"
                height="100%"
                className="overflow-visible transition-transform duration-1000"
                style={{ transform: `scale(${scale})` }}
            >
                {/* Stage 0: Ground */}
                <path d="M20,180 Q100,190 180,180" stroke="#A8A29E" strokeWidth="2" fill="none" opacity="0.5" />

                {/* Stage 1: Seed / Roots (Always visible if progress > 0) */}
                {progress > 0 && (
                    <g className="origin-bottom transition-all duration-1000">
                        {/* Roots */}
                        <path d="M100,180 Q90,195 80,190 M100,180 Q110,195 120,190" stroke="#8B5A2B" strokeWidth="2" fill="none" />
                    </g>
                )}

                {/* Stage 2: Sprout (Progress > 10) */}
                {progress > 10 && progress <= 40 && (
                    <g className="origin-bottom animate-in fade-in zoom-in duration-1000">
                        {/* Trunk */}
                        <path d="M100,180 C100,150 95,140 100,120" stroke={trunkColor} strokeWidth="4" fill="none" strokeLinecap="round" />
                        {/* Leaves */}
                        <path d="M100,120 Q80,100 90,120 M100,120 Q120,100 110,120" stroke={leafColor} strokeWidth="0" fill={leafColor} />
                    </g>
                )}

                {/* Stage 3: Mature Tree (Progress > 40) */}
                {progress > 40 && (
                    <g className="origin-bottom transition-all duration-1000">
                        {/* Trunk */}
                        <path d="M100,180 C100,140 80,100 100,60" stroke={trunkColor} strokeWidth="8" fill="none" strokeLinecap="round" />
                        <path d="M100,120 Q130,100 140,80" stroke={trunkColor} strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M100,100 Q70,90 60,70" stroke={trunkColor} strokeWidth="6" fill="none" strokeLinecap="round" />

                        {/* Foliage */}
                        <circle cx="100" cy="50" r="40" fill={leafColor} opacity="0.9" />
                        <circle cx="140" cy="70" r="30" fill={leafColor} opacity="0.8" />
                        <circle cx="60" cy="60" r="35" fill={leafColor} opacity="0.8" />
                    </g>
                )}

                {/* Stage 4: Fruits (Progress > 80) */}
                {progress > 80 && (
                    <g className="animate-in fade-in duration-1000 delay-500">
                        <circle cx="110" cy="40" r="5" fill={fruitColor} />
                        <circle cx="90" cy="60" r="5" fill={fruitColor} />
                        <circle cx="140" cy="70" r="5" fill={fruitColor} />
                        <circle cx="60" cy="50" r="5" fill={fruitColor} />
                        <circle cx="100" cy="80" r="5" fill={fruitColor} />
                    </g>
                )}
            </svg>
        </div>
    );
}

// Helper to calculate health status text
export const getTreeStatus = (health: number) => {
    if (health >= 80) return "Radiante";
    if (health >= 50) return "Saludable";
    if (health >= 20) return "Necesita agua";
    return "Marchito";
};
