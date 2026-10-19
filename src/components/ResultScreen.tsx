import React from 'react';

interface ResultScreenProps {
  isSuccess: boolean;
  nickname: string;
  score: number;
  timeLeft: number;
  correctQuizCount: number;
  failureReason: string | null;
  difficulty: 'easy' | 'hard';
  onRestart: () => void;
  onHome: () => void;
  onOpenRanking: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  isSuccess,
  nickname,
  score,
  timeLeft,
  correctQuizCount,
  failureReason,
  difficulty,
  onRestart,
  onHome,
  onOpenRanking,
}) => {
  return (
    <div
      id="screen-result"
      className="w-full max-w-4xl mx-auto min-h-screen py-8 px-4 flex flex-col items-center justify-center animate-fadeIn text-white select-none"
    >
      {/* Result Status Banner */}
      <div className="text-center mb-6">
        {isSuccess ? (
          <div>
            <div className="text-6xl md:text-7xl mb-3 animate-bounce">🎉</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 drop-shadow-lg">
              연구소 탈출 성공!
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-2">
              축하합니다! <strong>{nickname}</strong> 요원이 기체 과학의 힘으로 연구소를 구했습니다!
            </p>
          </div>
        ) : (
          <div>
            <div className="text-6xl md:text-7xl mb-3 animate-pulse">💥</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-400 to-amber-400 drop-shadow-lg">
              연구소 폭발! (탈출 실패)
            </h1>
            <p className="text-rose-300 text-sm md:text-base mt-2 font-medium">
              {failureReason || '시간 초과 또는 장애물 충돌로 연구소가 과압 폭발했습니다!'}
            </p>
          </div>
        )}
      </div>

      {/* Score Summary Dashboard */}
      <div className="w-full bg-slate-900/80 border-2 border-cyan-500/40 rounded-3xl p-6 backdrop-blur-md shadow-2xl mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">대원 닉네임</span>
            <span className="text-base md:text-lg font-bold text-cyan-300 truncate block">
              {nickname}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {difficulty === 'hard' ? '어려움 모드' : '쉬움 모드'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">최종 획득 점수</span>
            <span className="text-xl md:text-2xl font-black font-mono text-amber-400">
              {score.toLocaleString()} 점
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">남은 구출 시간</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400">
              ⏱️ {timeLeft} 초
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">맞힌 퀴즈 수</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-cyan-400">
              ✅ {correctQuizCount} / 3 개
            </span>
          </div>
        </div>
      </div>

      {/* 3 Science Summary Educational Cards */}
      <div className="w-full mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📚</span>
          <h2 className="text-lg md:text-xl font-bold text-cyan-300">
            오늘 실전에서 배운 중학 기체의 성질 3가지
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 보일 법칙 */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Boyle's Law
                </span>
                <span className="text-2xl">🎈</span>
              </div>
              <h3 className="text-base font-bold text-amber-200 mb-2">
                보일 법칙 (압력과 부피)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>온도가 일정할 때</strong> 기체의 부피는 압력에 <strong>반비례</strong>합니다.
              </p>
              <div className="my-3 p-2.5 rounded-xl bg-slate-800/80 border border-amber-500/30 text-center font-mono text-xs text-amber-300 font-bold">
                P₁V₁ = P₂V₂ (일정)
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                • 압력 2배 ↑ ➔ 부피 1/2배 ↓<br />
                • 입자 사이 거리가 가까워져 좁은 틈 통과 가능!<br />
                • 산에 가면 과자 봉지가 부푸는 원리
              </p>
            </div>
          </div>

          {/* Card 2: 샤를 법칙 */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Charles's Law
                </span>
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-base font-bold text-rose-200 mb-2">
                샤를 법칙 (온도와 부피)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>압력이 일정할 때</strong> 온도가 높아지면 기체의 부피는 <strong>비례</strong>하여 증가합니다.
              </p>
              <div className="my-3 p-2.5 rounded-xl bg-slate-800/80 border border-rose-500/30 text-center font-mono text-xs text-rose-300 font-bold">
                V ∝ T (온도 ↑ ➔ 부피 ↑)
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                • 온도 상승 ➔ 기체 입자 운동 활발<br />
                • 부피 팽창으로 밀도 감소 ➔ 위로 상승 기류!<br />
                • 찌그러진 탁구공을 뜨거운 물에 넣으면 펴지는 원리
              </p>
            </div>
          </div>

          {/* Card 3: 확산 현상 & 냉각 */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Diffusion & Cooling
                </span>
                <span className="text-2xl">❄️</span>
              </div>
              <h3 className="text-base font-bold text-cyan-200 mb-2">
                기체의 확산과 냉각
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                기체 입자는 <strong>스스로 모든 방향으로 끊임없이 운동</strong>하며 퍼져나갑니다.
              </p>
              <div className="my-3 p-2.5 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-center font-mono text-xs text-cyan-300 font-bold">
                온도 ↓ ➔ 입자 속도 ↓ ➔ 확산 둔화
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                • 온도가 높을수록, 분자 질량이 작을수록 빠름<br />
                • 냉각 스킬로 온도를 낮추면 독가스 확산 차단<br />
                • 향수 냄새가 방 안 전체로 퍼지는 원리
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        <button
          onClick={onRestart}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>🔄</span>
          <span>다시 도전하기</span>
        </button>

        <button
          onClick={onOpenRanking}
          className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-amber-400/50 shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>🏆</span>
          <span>랭킹 보기</span>
        </button>

        <button
          onClick={onHome}
          className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm border border-slate-700 shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>🏠</span>
          <span>처음 화면으로</span>
        </button>
      </div>
    </div>
  );
};
