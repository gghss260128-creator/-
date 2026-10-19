import React from 'react';

export interface RankingEntry {
  id: string;
  name: string;
  score: number;
  difficulty: 'easy' | 'hard';
  timeLeft: number;
  date: string;
  isSuccess: boolean;
}

interface RankingModalProps {
  onClose: () => void;
  onClear: () => void;
  rankings: RankingEntry[];
}

export const RankingModal: React.FC<RankingModalProps> = ({ onClose, onClear, rankings }) => {
  const sorted = [...rankings].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-lg md:text-xl font-bold text-amber-300">
              명예의 전당 (연구소 구출 랭킹)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer border border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Ranking List */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1">
          {sorted.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <span className="text-3xl block mb-2">🎈</span>
              아직 등록된 구출 기록이 없습니다.
              <br />
              첫 번째 영웅이 되어보세요!
            </div>
          ) : (
            sorted.map((item, idx) => {
              const medal =
                idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-400/50 text-amber-200'
                      : idx === 1
                      ? 'bg-slate-300/10 border-slate-300/40 text-slate-200'
                      : idx === 2
                      ? 'bg-amber-800/20 border-amber-700/40 text-amber-100'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-sm">{medal}</span>
                    <div>
                      <p className="font-bold flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            item.difficulty === 'hard'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.difficulty === 'hard' ? '어려움' : '쉬움'}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        남은 시간: {item.timeLeft}초 | {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold font-mono text-amber-300">
                      {item.score.toLocaleString()}점
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {item.isSuccess ? '탈출 성공' : '폭발'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <button
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors underline cursor-pointer"
          >
            기록 초기화
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-600 cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
