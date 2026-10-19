import React from 'react';

interface MongsiliProps {
  volume: number; // 10 to 100 %
  temperature: number; // -10 to 90 °C
  pressure: number; // 1.0 to 5.0 atm
  isCooling: boolean;
  status: 'normal' | 'happy' | 'worried' | 'surprised' | 'cold' | 'hot' | 'crashed';
}

export const Mongsili: React.FC<MongsiliProps> = ({
  volume,
  temperature,
  pressure,
  isCooling,
  status,
}) => {
  // Scale based on volume: 10% -> 0.55x, 50% -> 1.0x, 100% -> 1.45x
  const scale = 0.55 + (volume / 100) * 0.9;

  // Particle speed based on temperature
  // Normal speed 1.5s, Hot speed 0.4s, Cold speed 4s
  const normalizedTemp = Math.max(-10, Math.min(90, temperature));
  const particleAnimDuration = isCooling
    ? 5.0
    : normalizedTemp <= 0
    ? 3.5
    : normalizedTemp >= 60
    ? 0.45
    : 1.5 - ((normalizedTemp - 20) / 70) * 0.9;

  // Color tint based on temperature
  const bodyGradientStart = isCooling || normalizedTemp < 5
    ? '#bae6fd' // very icy light blue
    : normalizedTemp > 50
    ? '#fecdd3' // warm soft reddish pink
    : '#a7f3d0'; // cute mint cyan

  const bodyGradientEnd = isCooling || normalizedTemp < 5
    ? '#38bdf8' // deep frosty blue
    : normalizedTemp > 50
    ? '#f87171' // warm energetic coral
    : '#38bdf8'; // bright sky blue

  return (
    <div
      className="relative flex items-center justify-center transition-transform duration-300 ease-out select-none"
      style={{
        transform: `scale(${scale})`,
        filter: isCooling
          ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.9))'
          : normalizedTemp > 60
          ? 'drop-shadow(0 0 16px rgba(248, 113, 113, 0.8))'
          : 'drop-shadow(0 8px 16px rgba(14, 165, 233, 0.4))',
      }}
    >
      {/* Surrounding Gas Particles simulating kinetic theory */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const radius = 60 + (i % 2) * 15;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none transition-all"
            style={{
              width: `${8 + (i % 3) * 4}px`,
              height: `${8 + (i % 3) * 4}px`,
              backgroundColor: isCooling ? '#e0f2fe' : normalizedTemp > 50 ? '#fed7aa' : '#cffafe',
              border: '1.5px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 0 8px currentColor',
              transform: `translate(${x}px, ${y}px)`,
              animation: `orbit ${particleAnimDuration}s infinite linear`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        );
      })}

      {/* Mongsili SVG Body */}
      <svg
        width="110"
        height="110"
        viewBox="0 0 100 100"
        className="relative z-10 animate-bounce"
        style={{
          animationDuration: isCooling ? '3s' : '1.8s',
        }}
      >
        <defs>
          <radialGradient id="mongsiliGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="45%" stopColor={bodyGradientStart} />
            <stop offset="100%" stopColor={bodyGradientEnd} />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main cloud-like bouncy gas bubble */}
        <path
          d="M 50 12
             C 65 12, 78 20, 84 32
             C 93 36, 96 48, 93 58
             C 95 72, 85 86, 70 88
             C 58 92, 42 92, 30 88
             C 15 86, 5 72, 7 58
             C 4 48, 7 36, 16 32
             C 22 20, 35 12, 50 12 Z"
          fill="url(#mongsiliGrad)"
          stroke="#ffffff"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* Highlights */}
        <ellipse cx="36" cy="28" rx="8" ry="4" fill="#ffffff" opacity="0.6" transform="rotate(-20 36 28)" />
        <circle cx="28" cy="34" r="2.5" fill="#ffffff" opacity="0.5" />

        {/* Cheeks (Blush) */}
        <ellipse cx="27" cy="56" rx="6" ry="3.5" fill="#f43f5e" opacity="0.45" />
        <ellipse cx="73" cy="56" rx="6" ry="3.5" fill="#f43f5e" opacity="0.45" />

        {/* Eyes based on state */}
        {status === 'crashed' ? (
          // Dizzy X eyes
          <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round">
            <line x1="32" y1="44" x2="42" y2="52" />
            <line x1="42" y1="44" x2="32" y2="52" />
            <line x1="58" y1="44" x2="68" y2="52" />
            <line x1="68" y1="44" x2="58" y2="52" />
          </g>
        ) : isCooling || normalizedTemp < 5 ? (
          // Shivering cute eyes
          <g fill="#0369a1">
            <ellipse cx="37" cy="48" rx="4" ry="5" />
            <ellipse cx="63" cy="48" rx="4" ry="5" />
            <circle cx="35" cy="46" r="1.5" fill="#ffffff" />
            <circle cx="61" cy="46" r="1.5" fill="#ffffff" />
          </g>
        ) : normalizedTemp > 60 ? (
          // Energetic excited eyes
          <g fill="#991b1b">
            <circle cx="37" cy="48" r="4.5" />
            <circle cx="63" cy="48" r="4.5" />
            <circle cx="35" cy="46" r="1.8" fill="#ffffff" />
            <circle cx="61" cy="46" r="1.8" fill="#ffffff" />
            {/* Sweat bead */}
            <path d="M 78 35 C 80 39, 82 42, 80 44 C 78 46, 75 44, 76 41 Z" fill="#38bdf8" />
          </g>
        ) : (
          // Normal cute happy eyes
          <g fill="#0f172a">
            <circle cx="37" cy="48" r="4.5" />
            <circle cx="63" cy="48" r="4.5" />
            <circle cx="35" cy="46" r="1.8" fill="#ffffff" />
            <circle cx="61" cy="46" r="1.8" fill="#ffffff" />
            <circle cx="39" cy="50" r="0.9" fill="#ffffff" />
            <circle cx="65" cy="50" r="0.9" fill="#ffffff" />
          </g>
        )}

        {/* Mouth */}
        {status === 'crashed' ? (
          <path d="M 43 66 Q 50 60 57 66" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        ) : isCooling || normalizedTemp < 5 ? (
          // Shivering wavy mouth
          <path d="M 42 64 Q 46 61 50 64 T 58 64" fill="none" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" />
        ) : normalizedTemp > 60 ? (
          // Wide open panting smile
          <path d="M 42 62 Q 50 72 58 62 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
        ) : (
          // Sweet gentle smile
          <path d="M 43 62 Q 50 69 57 62" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Ice crystals when cooled */}
        {isCooling && (
          <g stroke="#ffffff" strokeWidth="1.5" opacity="0.85">
            <line x1="20" y1="20" x2="20" y2="28" />
            <line x1="16" y1="24" x2="24" y2="24" />
            <line x1="80" y1="22" x2="80" y2="30" />
            <line x1="76" y1="26" x2="84" y2="26" />
          </g>
        )}
      </svg>

      {/* Name tag underneath */}
      <div className="absolute -bottom-6 px-2 py-0.5 rounded-full bg-slate-900/80 border border-cyan-400/50 text-[10px] font-bold text-cyan-200 shadow whitespace-nowrap">
        🫧 몽실이
      </div>
    </div>
  );
};
