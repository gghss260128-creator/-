import React from 'react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-2 border-cyan-400 rounded-3xl p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            <h2 className="text-lg md:text-xl font-bold text-cyan-300">
              게임 방법 & 기체의 과학 원리
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer border border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Story Summary */}
        <div className="my-4 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs md:text-sm text-cyan-100 leading-relaxed">
          <p className="font-bold text-cyan-300 mb-1">📖 스토리</p>
          밀폐된 기체 연구소의 압력이 급상승해 60초 뒤 폭발합니다! 귀여운 기체 분자 <strong>몽실이</strong>의 부피, 온도, 압력을 과학 법칙에 맞게 조절해 5개 관문을 통과하고 <strong>중앙 제어 밸브</strong>를 잠가 연구소를 구해주세요!
        </div>

        {/* 5 Controller Buttons & Shortcuts */}
        <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-1.5">
          <span>🎮</span> 조작법 및 단축키 안내
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2.5">
            <span className="px-2 py-1 rounded bg-slate-900 font-mono font-bold text-amber-400 border border-amber-500/40 shrink-0">
              W / ↑
            </span>
            <div>
              <p className="font-bold text-slate-100">[압력 높이기 ↑]</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                압력을 높여 몽실이의 부피를 줄입니다 (보일 법칙: 좁은 틈 통과용).
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2.5">
            <span className="px-2 py-1 rounded bg-slate-900 font-mono font-bold text-amber-400 border border-amber-500/40 shrink-0">
              S / ↓
            </span>
            <div>
              <p className="font-bold text-slate-100">[압력 낮추기 ↓]</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                압력을 낮추어 몽실이의 부피를 팽창시킵니다.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2.5">
            <span className="px-2 py-1 rounded bg-slate-900 font-mono font-bold text-rose-400 border border-rose-500/40 shrink-0">
              D / →
            </span>
            <div>
              <p className="font-bold text-slate-100">[온도 높이기 ↑]</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                온도를 높여 입자 운동을 촉진하고 부력으로 위로 상승합니다 (샤를 법칙: 굴뚝 통과용).
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2.5">
            <span className="px-2 py-1 rounded bg-slate-900 font-mono font-bold text-cyan-400 border border-cyan-500/40 shrink-0">
              A / ←
            </span>
            <div>
              <p className="font-bold text-slate-100">[온도 낮추기 ↓]</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                온도를 낮추어 입자 운동을 차분하게 줄이고 아래로 하강합니다.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2.5">
            <span className="px-2 py-1 rounded bg-slate-900 font-mono font-bold text-cyan-300 border border-cyan-500/40 shrink-0">
              Space
            </span>
            <div>
              <p className="font-bold text-slate-100">[❄️ 냉각 스킬] & [밸브 돌리기]</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                순간적으로 기온을 급랭시켜 독가스 확산을 멈춥니다! 최종 5구간에서는 밸브를 돌립니다.
              </p>
            </div>
          </div>
        </div>

        {/* 5 Stages Guide */}
        <h3 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
          <span>🗺️</span> 5개 탈출 구간 과학 규칙
        </h3>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">구간 1</span>
              <strong className="text-slate-200">좁은 압축 회랑</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              위아래 압축기가 좁은 틈을 만들고 있습니다. <strong>압력을 3 atm 이상으로 높여 부피를 35% 이하로 축소</strong>해야 무사 통과합니다. (보일 법칙: P↑ → V↓)
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">구간 2</span>
              <strong className="text-slate-200">높은 열기류 굴뚝 환기구</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              높은 방화벽 위쪽 천장에만 환기구가 열려 있습니다. <strong>온도를 60°C 이상으로 가열</strong>해 기체 부피를 키우고 상승 기류를 타서 위로 올라가세요. (샤를 법칙: T↑ → V↑, 부력 상승)
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">구간 3</span>
              <strong className="text-slate-200">독가스 확산 지대</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              누출된 유독 가스 입자가 맹렬하게 퍼져나갑니다. <strong>온도를 5°C 이하로 낮추거나 [❄️ 냉각 스킬]</strong>을 발동해 입자의 확산 속도를 둔화시켜 안전하게 통과하세요. (확산: 온도↓ → 입자 속도↓)
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">구간 4</span>
              <strong className="text-slate-200">중앙 보안 퀴즈 관문</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              중앙 밸브실에 들어가기 전 기체 과학 퀴즈 3문제를 해결해야 합니다. 퀴즈를 푸는 중에도 메인 제한시간이 흐르니 신속하고 정확하게 맞춰보세요!
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold text-[10px]">구간 5</span>
              <strong className="text-slate-200">중앙 제어 밸브 (최종 탈출)</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              중앙 밸브를 <strong>10번 빠르게 연타(클릭 또는 스페이스바)</strong>하여 연구소 내부 과압을 방출하고 폭발 카운트다운을 정지시키세요!
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            확인했습니다! 연구소 구출하러 가기
          </button>
        </div>
      </div>
    </div>
  );
};
