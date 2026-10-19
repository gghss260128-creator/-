import React, { useState, useEffect } from 'react';
import { QuizItem } from '../data/quizData';
import { soundManager } from '../utils/sound';

interface QuizModalProps {
  questions: QuizItem[];
  currentIndex: number; // 0, 1, 2
  difficulty: 'easy' | 'hard';
  timeLeft: number;
  onCorrect: (quizIndex: number) => void;
  onWrong: (quizIndex: number, retryCount: number) => void;
  onFailExplode: (reason: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  questions,
  currentIndex,
  difficulty,
  timeLeft,
  onCorrect,
  onWrong,
  onFailExplode,
}) => {
  const currentQuiz = questions[currentIndex];
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    message: string;
  } | null>(null);
  const [wrongCount, setWrongCount] = useState<number>(0);

  // Shuffle options whenever the current question changes
  useEffect(() => {
    if (!currentQuiz) return;
    const opts = [...currentQuiz.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(opts);
    setSelectedOption(null);
    setFeedback(null);
    setWrongCount(0);
  }, [currentIndex, currentQuiz]);

  if (!currentQuiz) return null;

  const handleSelect = (option: string) => {
    if (feedback) return; // Prevent clicking while feedback is displayed
    setSelectedOption(option);
    const isCorrect = option === currentQuiz.answer;

    if (isCorrect) {
      soundManager.playCorrect();
      setFeedback({
        isCorrect: true,
        message: '🎉 정답입니다! 뛰어난 과학 지식이에요!',
        explanation: currentQuiz.explanation,
      });

      setTimeout(() => {
        onCorrect(currentIndex);
      }, 1400);
    } else {
      soundManager.playWrong();
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);

      if (difficulty === 'easy') {
        setFeedback({
          isCorrect: false,
          message: '❌ 아쉬워요! (시간 -3초 차감)',
          explanation: currentQuiz.explanation,
        });

        setTimeout(() => {
          onWrong(currentIndex, newWrongCount);
        }, 1800);
      } else {
        // Hard difficulty
        if (newWrongCount >= 3) {
          setFeedback({
            isCorrect: false,
            message: '💥 3회 연속 오답으로 시스템 폭발!',
            explanation: currentQuiz.explanation,
          });
          setTimeout(() => {
            onFailExplode(`퀴즈 3회 오답으로 보안 시스템이 연구소를 긴급 폭파했습니다! (정답: ${currentQuiz.answer})`);
          }, 1500);
        } else {
          setFeedback({
            isCorrect: false,
            message: `❌ 오답! (시간 -5초, 다시 도전 기회 ${3 - newWrongCount}회 남음)`,
            explanation: currentQuiz.explanation,
          });

          setTimeout(() => {
            onWrong(currentIndex, newWrongCount);
            setFeedback(null);
            setSelectedOption(null);
          }, 1800);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-2 border-cyan-400 rounded-3xl p-6 shadow-2xl relative text-white">
        {/* Header with timer and question counter */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400">
              문제 {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentQuiz.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
            <span className={timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}>
              ⏱️ {timeLeft}초
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="my-5 min-h-[64px] flex items-center">
          <h3 className="text-base md:text-lg font-bold text-slate-100 leading-relaxed">
            Q{currentQuiz.id}. {currentQuiz.question}
          </h3>
        </div>

        {/* 4 Choices */}
        <div className="space-y-2.5">
          {shuffledOptions.map((opt, idx) => {
            const isChosen = selectedOption === opt;
            let btnStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200';

            if (feedback && isChosen) {
              btnStyle = feedback.isCorrect
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/40'
                : 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/40';
            } else if (feedback && opt === currentQuiz.answer && !feedback.isCorrect) {
              btnStyle = 'bg-emerald-800/80 border-emerald-400 text-emerald-200';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={feedback !== null}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs md:text-sm font-medium flex items-start gap-3 cursor-pointer ${btnStyle}`}
              >
                <span className="w-6 h-6 rounded-full bg-slate-900/60 border border-current flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                  {idx + 1}
                </span>
                <span className="leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Panel */}
        {feedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs md:text-sm animate-fadeIn ${
              feedback.isCorrect
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span>{feedback.message}</span>
            </div>
            <p className="text-[12px] opacity-90 leading-relaxed font-sans">
              💡 {feedback.explanation}
            </p>
          </div>
        )}

        {/* Difficulty Notice */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {difficulty === 'easy'
              ? '🟢 쉬움 모드: 오답 시 해설 후 통과 (-3초)'
              : '🔴 어려움 모드: 오답 시 재도전 (-5초, 3회 오답 시 폭발)'}
          </span>
          <span className="text-cyan-400 font-mono">기체 분자 구출 작전</span>
        </div>
      </div>
    </div>
  );
};
