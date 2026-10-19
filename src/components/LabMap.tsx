import React from 'react';
import { Mongsili } from './Mongsili';

interface LabMapProps {
  stageIndex: number; // 0 to 4 (corresponding to 5 stages)
  distance: number; // 0 to 100% progress inside current stage
  volume: number;
  temperature: number;
  pressure: number;
  isCooling: boolean;
  status: 'normal' | 'happy' | 'worried' | 'surprised' | 'cold' | 'hot' | 'crashed';
  stageNotice: string | null;
  valveClicks: number;
  onTurnValve: () => void;
  canTurnValve: boolean;
}

export const LabMap: React.FC<LabMapProps> = ({
  stageIndex,
  distance,
  volume,
  temperature,
  pressure,
  isCooling,
  status,
  stageNotice,
  valveClicks,
  onTurnValve,
  canTurnValve,
}) => {
  // Vertical position (bottom %) based on temperature (-10 to 90 °C)
  // -10°C -> 18%, 20°C -> 42%, 90°C -> 74%
  const clampedTemp = Math.max(-10, Math.min(90, temperature));
  const mongsiliBottomPercent = 18 + ((clampedTemp + 10) / 100) * 56;

  // Background offset based on distance
  const bgTranslate = -(distance * 3);

  return (
    <div className="relative w-full h-[320px] md:h-[380px] bg-gradient-to-b from-[#06151a] via-[#0b242c] to-[#040e11] rounded-2xl border-2 border-cyan-500/40 shadow-2xl overflow-hidden select-none">
      {/* Laboratory Ceiling Pipes & Lights */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-slate-900 to-transparent flex items-center justify-between px-6 z-10 pointer-events-none">
        {/* Warning siren beacon */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-600 animate-ping" />
          <span className="text-[11px] font-mono tracking-widest text-red-400 font-bold uppercase animate-pulse">
            🚨 SYSTEM OVERPRESSURE ALERT
          </span>
        </div>
        <div className="text-[11px] font-mono text-cyan-400/80">
          ZONE 0{stageIndex + 1}: {
            stageIndex === 0 ? '압축 압력 회랑 (보일 구간)' :
            stageIndex === 1 ? '열기류 굴뚝 배기구 (샤를 구간)' :
            stageIndex === 2 ? '오염 가스 확산 챔버 (확산 구간)' :
            stageIndex === 3 ? '중앙 보안 퀴즈 관문' : '메인 압력 제어 밸브실'
          }
        </div>
      </div>

      {/* Grid Pattern and Pipes in Background */}
      <div
        className="absolute inset-0 opacity-20 transition-transform duration-200 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: `translateX(${bgTranslate % 40}px)`,
        }}
      />

      {/* Lab Corridor Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 via-slate-900 to-cyan-950/60 border-t-2 border-cyan-500/50 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400 font-mono">LAB SECTOR CORRIDOR</span>
        </div>
        {/* Distance progress indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
          <span>장애물 도달:</span>
          <div className="w-28 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, distance)}%` }}
            />
          </div>
          <span>{Math.round(distance)}%</span>
        </div>
      </div>

      {/* Stage-specific obstacles scrolling in from the right */}
      {/* The obstacle sits at X position determined by distance: from 100% to ~25% (where Mongsili is) */}
      {stageIndex === 0 && (
        // Stage 1: 좁은 틈 (Narrow Gap)
        <div
          className="absolute top-10 bottom-10 w-28 transition-all duration-200 z-10 flex flex-col justify-between pointer-events-none"
          style={{
            left: `${Math.max(25, 95 - (distance / 100) * 70)}%`,
          }}
        >
          {/* Top Hydraulic Press Block */}
          <div className="w-full bg-gradient-to-b from-amber-600 via-amber-700 to-slate-900 border-x-4 border-b-4 border-amber-400 rounded-b-xl shadow-lg flex flex-col items-center justify-end pb-2 h-[35%]">
            <span className="text-[10px] font-bold text-amber-200 tracking-wider">▲ 압축기</span>
            <div className="w-full h-3 bg-amber-400/30 stripes animate-pulse" />
          </div>

          {/* Center Gap Label */}
          <div className="w-full text-center py-1">
            <div className="inline-block px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400 text-[10px] text-amber-300 font-bold">
              좁은 틈 (부피 35% 이하)
            </div>
          </div>

          {/* Bottom Hydraulic Press Block */}
          <div className="w-full bg-gradient-to-t from-amber-600 via-amber-700 to-slate-900 border-x-4 border-t-4 border-amber-400 rounded-t-xl shadow-lg flex flex-col items-center justify-start pt-2 h-[35%]">
            <div className="w-full h-3 bg-amber-400/30 stripes animate-pulse mb-1" />
            <span className="text-[10px] font-bold text-amber-200 tracking-wider">▼ 압축기</span>
          </div>
        </div>
      )}

      {stageIndex === 1 && (
        // Stage 2: 높은 굴뚝 / 상승 환기구
        <div
          className="absolute top-10 bottom-10 w-32 transition-all duration-200 z-10 pointer-events-none"
          style={{
            left: `${Math.max(25, 95 - (distance / 100) * 70)}%`,
          }}
        >
          {/* High Top Vent Opening */}
          <div className="absolute top-0 left-0 right-0 h-16 border-2 border-emerald-400 bg-emerald-950/40 rounded-lg flex items-center justify-center">
            <span className="text-[11px] font-bold text-emerald-300 animate-pulse">
              🌀 배기구 (고온 상승 통로)
            </span>
          </div>

          {/* Tall Barrier below the vent */}
          <div className="absolute top-20 bottom-0 left-2 right-2 bg-gradient-to-t from-slate-950 via-slate-800 to-slate-700 border-2 border-rose-500/70 rounded-t-xl flex flex-col items-center justify-center p-3 shadow-2xl">
            <div className="text-2xl mb-1">🧱</div>
            <span className="text-xs font-bold text-rose-300 text-center leading-tight">
              차단 방화벽
            </span>
            <span className="text-[10px] text-amber-200 text-center mt-2 bg-slate-900/80 px-2 py-1 rounded">
              온도 60°C↑ 필요 (샤를의 법칙)
            </span>
          </div>
        </div>
      )}

      {stageIndex === 2 && (
        // Stage 3: 독가스 확산 지대 (Toxic Gas Diffusion Zone)
        <div
          className="absolute top-10 bottom-10 w-44 transition-all duration-200 z-10 pointer-events-none overflow-hidden rounded-xl border border-purple-500/40 bg-purple-950/30 backdrop-blur-xs"
          style={{
            left: `${Math.max(25, 95 - (distance / 100) * 70)}%`,
          }}
        >
          {/* Swirling toxic gas particles */}
          <div className="absolute inset-0 flex flex-wrap gap-3 p-2 items-center justify-around opacity-80">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="text-lg animate-ping"
                style={{
                  animationDuration: isCooling || temperature < 5 ? '4s' : '0.8s',
                  animationDelay: `${(i * 0.15)}s`,
                }}
              >
                ☣️
              </span>
            ))}
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="px-2 py-1 bg-purple-900/90 text-[10px] font-bold text-purple-200 rounded border border-purple-400 shadow">
              독가스 확산 지대 (냉각/저온 필요)
            </span>
          </div>
        </div>
      )}

      {stageIndex === 3 && (
        // Stage 4: 퀴즈 관문 게이트
        <div
          className="absolute top-10 bottom-10 w-28 transition-all duration-200 z-10 pointer-events-none flex flex-col items-center justify-center"
          style={{
            left: `${Math.max(25, 95 - (distance / 100) * 70)}%`,
          }}
        >
          <div className="w-full h-full bg-cyan-950/70 border-2 border-cyan-400 rounded-xl flex flex-col items-center justify-center p-3 shadow-2xl backdrop-blur-sm">
            <span className="text-3xl mb-1 animate-bounce">🔐</span>
            <span className="text-xs font-bold text-cyan-200 text-center">
              보안 퀴즈 관문
            </span>
            <span className="text-[10px] text-cyan-300/80 mt-1 text-center">
              암호 해제 3문제
            </span>
          </div>
        </div>
      )}

      {stageIndex === 4 && (
        // Stage 5: 중앙 제어 밸브실
        <div
          className="absolute top-10 bottom-10 right-6 w-52 z-20 flex flex-col items-center justify-center p-4 bg-slate-900/90 border-2 border-rose-500 rounded-2xl shadow-2xl backdrop-blur-md"
        >
          <span className="text-xs font-bold text-rose-400 mb-2 uppercase tracking-wider">
            중앙 긴급 밸브
          </span>

          {/* Rotating Industrial Valve */}
          <div
            className="relative cursor-pointer transition-transform duration-150 active:scale-95 hover:scale-105"
            onClick={onTurnValve}
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className="drop-shadow-lg"
              style={{
                transform: `rotate(${valveClicks * 36}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* Outer Red Ring */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e11d48" strokeWidth="10" />
              {/* Inner Spokes */}
              <line x1="50" y1="8" x2="50" y2="92" stroke="#be123c" strokeWidth="8" strokeLinecap="round" />
              <line x1="8" y1="50" x2="92" y2="50" stroke="#be123c" strokeWidth="8" strokeLinecap="round" />
              <line x1="20" y1="20" x2="80" y2="80" stroke="#be123c" strokeWidth="6" strokeLinecap="round" />
              <line x1="80" y1="20" x2="20" y2="80" stroke="#be123c" strokeWidth="6" strokeLinecap="round" />
              {/* Center Hub */}
              <circle cx="50" cy="50" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
              <circle cx="50" cy="50" r="6" fill="#1e293b" />
            </svg>
          </div>

          {/* Valve Click Progress Counter */}
          <div className="w-full mt-3">
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span>밸브 개방률:</span>
              <span className="font-bold text-rose-400">{valveClicks}/10 회</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-rose-500/40">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-150"
                style={{ width: `${(valveClicks / 10) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={onTurnValve}
            disabled={!canTurnValve}
            className="mt-3 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🔄</span>
            <span>밸브 돌리기! (연타)</span>
          </button>
        </div>
      )}

      {/* Mongsili Character in Map */}
      <div
        className="absolute z-20 transition-all duration-300 ease-out pointer-events-none"
        style={{
          left: '22%',
          bottom: `${mongsiliBottomPercent}%`,
          transform: 'translate(-50%, 50%)',
        }}
      >
        <Mongsili
          volume={volume}
          temperature={temperature}
          pressure={pressure}
          isCooling={isCooling}
          status={status}
        />
      </div>

      {/* Altitude Indicator Line */}
      <div
        className="absolute left-4 z-15 pointer-events-none flex items-center gap-1.5 transition-all duration-300"
        style={{
          bottom: `${mongsiliBottomPercent}%`,
          transform: 'translateY(50%)',
        }}
      >
        <div className="w-3 h-0.5 bg-cyan-400" />
        <span className="text-[10px] font-mono text-cyan-300 bg-slate-900/80 px-1 py-0.5 rounded border border-cyan-500/40">
          고도 {Math.round(mongsiliBottomPercent)}%
        </span>
      </div>

      {/* Stage notice banner when obstacle passed or hint */}
      {stageNotice && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900/90 border-2 border-amber-400 shadow-2xl backdrop-blur-md animate-bounce text-center max-w-[90%]">
          <p className="text-xs md:text-sm font-bold text-amber-300 leading-snug">
            {stageNotice}
          </p>
        </div>
      )}
    </div>
  );
};
