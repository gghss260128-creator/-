import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from './utils/sound';
import { LabMap } from './components/LabMap';
import { QuizModal } from './components/QuizModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { RankingModal, RankingEntry } from './components/RankingModal';
import { ResultScreen } from './components/ResultScreen';
import { QUIZ_BANK, QuizItem } from './data/quizData';
import { downloadStandaloneHtml } from './utils/exportHtml';

type ScreenType = 'start' | 'game' | 'result';
type MongsiliStatus = 'normal' | 'happy' | 'worried' | 'surprised' | 'cold' | 'hot' | 'crashed';

export default function App() {
  // Screen management
  const [screen, setScreen] = useState<ScreenType>('start');

  // Player configuration
  const [nickname, setNickname] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showRanking, setShowRanking] = useState<boolean>(false);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);

  // Simulation State Variables
  const [temperature, setTemperature] = useState<number>(20); // -10 to 90 °C
  const [pressure, setPressure] = useState<number>(2.0); // 1.0 to 5.0 atm
  const [volume, setVolume] = useState<number>(50); // 10 to 100 %
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [stageIndex, setStageIndex] = useState<number>(0); // 0 to 4 (5 stages)
  const [lives, setLives] = useState<number>(3); // 3 for easy, 1 for hard
  const [distance, setDistance] = useState<number>(0); // 0 to 100% in current stage
  const [valveClicks, setValveClicks] = useState<number>(0); // 0 to 10

  // Skill Cooling
  const [isCooling, setIsCooling] = useState<boolean>(false);
  const [coolingCooldown, setCoolingCooldown] = useState<number>(0); // 0 to 8s

  // Mongsili facial and physical reaction
  const [mongsiliStatus, setMongsiliStatus] = useState<MongsiliStatus>('normal');
  const [stageNotice, setStageNotice] = useState<string | null>(null);

  // Quiz state
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [activeQuizSet, setActiveQuizSet] = useState<QuizItem[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [correctQuizCount, setCorrectQuizCount] = useState<number>(0);

  // Result state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  // Refs for loop management
  const gameLoopRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());
  const alarmIntervalRef = useRef<number | null>(null);

  // Load rankings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gas_rescue_rankings');
      if (stored) {
        setRankings(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
  }, []);

  const saveRanking = (entry: RankingEntry) => {
    try {
      const updated = [entry, ...rankings].slice(0, 30);
      setRankings(updated);
      localStorage.setItem('gas_rescue_rankings', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRankings = () => {
    setRankings([]);
    try {
      localStorage.removeItem('gas_rescue_rankings');
    } catch {
      // ignore
    }
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (next) soundManager.playClick();
  };

  // Gas state calculation based on Boyle & Charles Laws
  // Base condition: T0 = 20°C (293.15K), P0 = 2.0 atm -> Volume = 50%
  // V = 50 * (P0 / P) * (T_K / T0_K)
  const calculateVolume = useCallback((p: number, t: number) => {
    const kelvin = t + 273.15;
    const baseKelvin = 20 + 273.15;
    const rawV = 50 * (2.0 / p) * (kelvin / baseKelvin);
    return Math.max(10, Math.min(100, Math.round(rawV)));
  }, []);

  // Update volume when pressure or temperature changes
  useEffect(() => {
    setVolume(calculateVolume(pressure, temperature));
  }, [pressure, temperature, calculateVolume]);

  // Dynamic Mongsili expression
  useEffect(() => {
    if (isCooling || temperature < 5) {
      setMongsiliStatus('cold');
    } else if (temperature > 60) {
      setMongsiliStatus('hot');
    } else if (pressure >= 4.0) {
      setMongsiliStatus('worried');
    } else {
      setMongsiliStatus('normal');
    }
  }, [temperature, pressure, isCooling]);

  // Pressure controls
  const handlePressureChange = useCallback((delta: number) => {
    setPressure((prev) => {
      const next = Math.max(1.0, Math.min(5.0, Number((prev + delta).toFixed(1))));
      soundManager.playPressure(delta > 0);
      return next;
    });
  }, []);

  // Temperature controls
  const handleTempChange = useCallback((delta: number) => {
    setTemperature((prev) => {
      const next = Math.max(-10, Math.min(90, prev + delta));
      soundManager.playTemp(delta > 0);
      return next;
    });
  }, []);

  // Activate Cooling Skill
  const handleActivateCooling = useCallback(() => {
    if (coolingCooldown > 0 || isCooling) return;
    setIsCooling(true);
    setCoolingCooldown(8);
    setTemperature(-10);
    soundManager.playCooling();

    // Revert cooling after 4 seconds
    setTimeout(() => {
      setIsCooling(false);
    }, 4000);
  }, [coolingCooldown, isCooling]);

  // Turn Valve in Stage 5
  const handleTurnValve = useCallback(() => {
    if (stageIndex !== 4) return;
    soundManager.playValve();
    setValveClicks((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        // Disarmed! Success!
        handleGameWin();
      }
      return next;
    });
  }, [stageIndex]);

  // Global Keyboard shortcuts (WASD & Arrows & Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game' || quizActive) return;

      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePressureChange(0.5);
      } else if (key === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        handlePressureChange(-0.5);
      } else if (key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleTempChange(10);
      } else if (key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleTempChange(-10);
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (stageIndex === 4) {
          handleTurnValve();
        } else {
          handleActivateCooling();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, quizActive, stageIndex, handlePressureChange, handleTempChange, handleActivateCooling, handleTurnValve]);

  // Start new game session
  const handleStartGame = () => {
    soundManager.playClick();
    const finalNick = nickname.trim() || '익명의 기체';
    setNickname(finalNick);
    setScore(0);
    setTimeLeft(60);
    setStageIndex(0);
    setDistance(0);
    setPressure(2.0);
    setTemperature(20);
    setVolume(50);
    setLives(difficulty === 'easy' ? 3 : 1);
    setValveClicks(0);
    setIsCooling(false);
    setCoolingCooldown(0);
    setCorrectQuizCount(0);
    setFailureReason(null);
    setStageNotice('구간 1: 좁은 틈이 다가옵니다! 압력을 높여 부피를 줄이세요!');
    setTimeout(() => setStageNotice(null), 3500);

    // Pick 3 random quizzes from bank
    const shuffled = [...QUIZ_BANK].sort(() => Math.random() - 0.5);
    setActiveQuizSet(shuffled.slice(0, 3));
    setQuizIndex(0);
    setQuizActive(false);

    setScreen('game');
    lastTickTimeRef.current = Date.now();
  };

  // Game Over (Fail)
  const handleGameOver = useCallback((reason: string) => {
    soundManager.playExplosion();
    setFailureReason(reason);
    setIsSuccess(false);
    setMongsiliStatus('crashed');

    const entry: RankingEntry = {
      id: Date.now().toString(),
      name: nickname.trim() || '익명의 기체',
      score,
      difficulty,
      timeLeft,
      date: new Date().toLocaleDateString('ko-KR'),
      isSuccess: false,
    };
    saveRanking(entry);

    setTimeout(() => {
      setScreen('result');
    }, 1200);
  }, [nickname, score, difficulty, timeLeft]);

  // Game Victory (Success)
  const handleGameWin = useCallback(() => {
    soundManager.playClear();
    setIsSuccess(true);
    setMongsiliStatus('happy');

    // Time bonus + difficulty bonus
    const timeBonus = timeLeft * 25;
    const diffBonus = difficulty === 'hard' ? 500 : 200;
    const finalScore = score + 400 + timeBonus + diffBonus;
    setScore(finalScore);

    const entry: RankingEntry = {
      id: Date.now().toString(),
      name: nickname.trim() || '익명의 기체',
      score: finalScore,
      difficulty,
      timeLeft,
      date: new Date().toLocaleDateString('ko-KR'),
      isSuccess: true,
    };
    saveRanking(entry);

    setTimeout(() => {
      setScreen('result');
    }, 1200);
  }, [timeLeft, difficulty, score, nickname]);

  // Obstacle collision test when reaching checkpoint
  const evaluateObstacle = useCallback((stage: number) => {
    if (stage === 0) {
      // Stage 1: 좁은 틈 (Boyle's Law)
      // Condition: Volume must be <= 35% (Pressure >= 3.0 atm)
      if (volume <= 35) {
        soundManager.playClear();
        setScore((s) => s + 250);
        setStageNotice('✨ [보일 법칙] 압력 증가로 부피 축소 성공! 좁은 틈을 무사히 통과했습니다!');
        setTimeout(() => setStageNotice(null), 3500);
        setStageIndex(1);
        setDistance(0);
      } else {
        // Crash
        soundManager.playWrong();
        setMongsiliStatus('crashed');
        if (difficulty === 'easy' && lives > 1) {
          setLives((l) => l - 1);
          setStageNotice('⚠️ 충돌! 부피가 너무 큽니다! 압력(W)을 더 높여 35% 이하로 줄이세요! (생명 -1)');
          setDistance(30);
          setTimeout(() => {
            setMongsiliStatus('normal');
            setStageNotice(null);
          }, 3000);
        } else {
          handleGameOver('보일 법칙을 활용하지 못하고 압력을 높이지 않아 부피가 큰 상태로 좁은 틈에 부딪혔습니다!');
        }
      }
    } else if (stage === 1) {
      // Stage 2: 높은 굴뚝 / 상승 환기구 (Charles's Law)
      // Condition: Altitude >= 60% (Temperature >= 55°C)
      if (temperature >= 55) {
        soundManager.playClear();
        setScore((s) => s + 250);
        setStageNotice('✨ [샤를 법칙] 온도 상승으로 기체 팽창 & 상승 기류 탑승 성공! 환기구를 통과했습니다!');
        setTimeout(() => setStageNotice(null), 3500);
        setStageIndex(2);
        setDistance(0);
      } else {
        // Crash
        soundManager.playWrong();
        setMongsiliStatus('crashed');
        if (difficulty === 'easy' && lives > 1) {
          setLives((l) => l - 1);
          setStageNotice('⚠️ 추락! 온도가 낮아 굴뚝 높이까지 뜨지 못했습니다! 온도(D)를 60°C 이상으로 높이세요! (생명 -1)');
          setDistance(30);
          setTimeout(() => {
            setMongsiliStatus('normal');
            setStageNotice(null);
          }, 3000);
        } else {
          handleGameOver('샤를 법칙을 활용하지 못하고 온도를 높이지 않아 환기구로 상승하지 못하고 방화벽에 충돌했습니다!');
        }
      }
    } else if (stage === 2) {
      // Stage 3: 독가스 확산 지대 (Diffusion & Cooling)
      // Condition: Temperature <= 5°C or isCooling
      if (temperature <= 5 || isCooling) {
        soundManager.playClear();
        setScore((s) => s + 250);
        setStageNotice('✨ [확산과 냉각] 냉각으로 독가스 입자 운동이 둔화되어 안전하게 통과했습니다!');
        setTimeout(() => setStageNotice(null), 3500);
        setStageIndex(3);
        setDistance(0);
        // Trigger Stage 4 Quiz
        setTimeout(() => {
          setQuizActive(true);
        }, 800);
      } else {
        // Toxic gas exposure
        soundManager.playWrong();
        setMongsiliStatus('crashed');
        if (difficulty === 'easy' && lives > 1) {
          setLives((l) => l - 1);
          setStageNotice('⚠️ 오염! 고온에서 독가스가 빠르게 확산됩니다! 온도(A)를 낮추거나 [❄️ 냉각 스킬]을 쓰세요! (생명 -1)');
          setDistance(30);
          setTimeout(() => {
            setMongsiliStatus('normal');
            setStageNotice(null);
          }, 3000);
        } else {
          handleGameOver('기체의 확산 속도가 빠른 고온 상태에서 독가스 입자에 그대로 노출되었습니다!');
        }
      }
    }
  }, [volume, temperature, isCooling, difficulty, lives, handleGameOver]);

  // Main animation / physics loop
  useEffect(() => {
    if (screen !== 'game') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const intervalId = setInterval(() => {
      // 1-second countdown tick
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 10 && next > 0) {
          soundManager.playAlarm();
        }
        if (next <= 0) {
          clearInterval(intervalId);
          handleGameOver('제한 시간 60초가 지나 연구소 내부 기체가 폭발했습니다!');
          return 0;
        }
        return next;
      });

      // Decrease cooling cooldown
      setCoolingCooldown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [screen, handleGameOver]);

  // Distance progression loop
  useEffect(() => {
    if (screen !== 'game' || quizActive) return;

    const moveInterval = setInterval(() => {
      // Don't advance distance in stage 3 (quiz) or stage 4 (valve station)
      if (stageIndex >= 3) return;

      setDistance((d) => {
        const next = d + 1.2;
        if (next >= 85) {
          evaluateObstacle(stageIndex);
          return 85;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(moveInterval);
  }, [screen, quizActive, stageIndex, evaluateObstacle]);

  // Quiz correct answer handler
  const handleQuizCorrect = (qIndex: number) => {
    setCorrectQuizCount((c) => c + 1);
    setScore((s) => s + 150);

    if (qIndex + 1 < activeQuizSet.length) {
      setQuizIndex(qIndex + 1);
    } else {
      // All 3 questions answered!
      setQuizActive(false);
      setStageIndex(4); // Move to Stage 5: Central Valve!
      setStageNotice('🎉 모든 퀴즈 통과! [중앙 제어 밸브]에 도달했습니다! 밸브를 10번 돌리세요!');
      setTimeout(() => setStageNotice(null), 4000);
    }
  };

  // Quiz wrong answer handler
  const handleQuizWrong = (_qIndex: number, _retryCount: number) => {
    if (difficulty === 'easy') {
      setTimeLeft((t) => Math.max(1, t - 3));
      // Move to next question after penalty
      if (quizIndex + 1 < activeQuizSet.length) {
        setQuizIndex(quizIndex + 1);
      } else {
        setQuizActive(false);
        setStageIndex(4);
      }
    } else {
      // Hard mode: -5s penalty and must retry
      setTimeLeft((t) => Math.max(1, t - 5));
    }
  };

  return (
    <div className="min-h-screen bg-[#06151a] text-slate-100 flex flex-col items-center justify-center p-3 select-none">
      {/* Sound & Standalone Export Floater */}
      <div className="fixed top-3 right-3 z-40 flex items-center gap-2">
        <button
          onClick={downloadStandaloneHtml}
          title="오프라인에서 바로 실행되는 단일 HTML 파일 다운로드"
          className="px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-sm transition-all"
        >
          <span>📥</span>
          <span className="hidden sm:inline">단일 HTML 파일 다운로드</span>
        </button>

        <button
          onClick={handleToggleSound}
          title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
          className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 flex items-center justify-center text-sm shadow-lg cursor-pointer backdrop-blur-sm transition-all"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* ============================================================== */}
      {/* SCREEN 1: START SCREEN                                         */}
      {/* ============================================================== */}
      {screen === 'start' && (
        <section
          id="screen-start"
          className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-6 px-4 text-center animate-fadeIn"
        >
          {/* Floating lab equipment decorations */}
          <div className="flex items-center justify-center gap-4 text-3xl mb-3 opacity-80 animate-bounce">
            <span className="delay-100">🧪</span>
            <span className="delay-300">⚗️</span>
            <span className="delay-500">🔬</span>
          </div>

          {/* Game Title with responsive clamp */}
          <h1
            className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 drop-shadow-md tracking-tight leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}
          >
            기체 분자 구출 작전
          </h1>

          {/* Subtitle / Story text */}
          <p className="mt-2 text-xs md:text-sm text-cyan-200/90 max-w-md leading-relaxed">
            💥 <strong>폭발 위기의 기체 연구소를 탈출하라!</strong>
            <br />
            보일 법칙, 샤를 법칙, 기체 확산 원리로 몽실이를 조절해 연구소를 구하세요!
          </p>

          {/* Animated Mongsili Protagonist Avatar */}
          <div className="my-6 relative py-4">
            <div className="w-28 h-28 mx-auto flex items-center justify-center">
              <svg width="110" height="110" viewBox="0 0 100 100" className="animate-bounce">
                <radialGradient id="startMongsili" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="45%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </radialGradient>
                <path
                  d="M 50 12 C 65 12, 78 20, 84 32 C 93 36, 96 48, 93 58 C 95 72, 85 86, 70 88 C 58 92, 42 92, 30 88 C 15 86, 5 72, 7 58 C 4 48, 7 36, 16 32 C 22 20, 35 12, 50 12 Z"
                  fill="url(#startMongsili)"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <ellipse cx="27" cy="56" rx="6" ry="3.5" fill="#f43f5e" opacity="0.45" />
                <ellipse cx="73" cy="56" rx="6" ry="3.5" fill="#f43f5e" opacity="0.45" />
                <circle cx="37" cy="48" r="4.5" fill="#0f172a" />
                <circle cx="63" cy="48" r="4.5" fill="#0f172a" />
                <circle cx="35" cy="46" r="1.8" fill="#ffffff" />
                <circle cx="61" cy="46" r="1.8" fill="#ffffff" />
                <path d="M 43 62 Q 50 69 57 62" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-[11px] font-bold text-cyan-300 mt-1">
              🫧 주인공 몽실이
            </div>
          </div>

          {/* Nickname Input */}
          <div className="w-full max-w-xs mb-4 text-left">
            <label className="block text-[11px] font-bold text-slate-300 mb-1 ml-1">
              대원 닉네임 (최대 8자)
            </label>
            <input
              type="text"
              maxLength={8}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="익명의 기체"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-center font-bold text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all text-sm"
            />
          </div>

          {/* Difficulty Toggle */}
          <div className="w-full max-w-xs mb-6">
            <span className="block text-[11px] font-bold text-slate-300 mb-1 ml-1 text-left">
              난이도 선택
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 border border-slate-700 rounded-xl">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  difficulty === 'easy'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                쉬움 (❤️ 3개)
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  difficulty === 'hard'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                어려움 (❤️ 1개)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-xs flex flex-col gap-2.5">
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-base shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🚀</span>
              <span>게임 시작</span>
            </button>

            <button
              onClick={() => setShowHowToPlay(true)}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-bold shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📖</span>
              <span>게임 방법 보기 (과학 원리)</span>
            </button>

            <button
              onClick={() => setShowRanking(true)}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-amber-500/40 text-xs font-bold shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🏆</span>
              <span>랭킹 보기</span>
            </button>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SCREEN 2: GAMEPLAY SCREEN                                      */}
      {/* ============================================================== */}
      {screen === 'game' && (
        <section
          id="screen-game"
          className="w-full max-w-4xl mx-auto flex flex-col gap-3 py-2 animate-fadeIn"
        >
          {/* Top HUD */}
          <div className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-3 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 items-center">
              {/* 1) Timer */}
              <div
                className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                  timeLeft <= 10
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-800/80 border-slate-700 text-amber-300'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  {timeLeft <= 10 ? '🚨 긴급 탈출 카운트' : '⏱️ 남은 시간'}
                </div>
                <div className="text-xl md:text-2xl font-black font-mono">
                  {timeLeft}초
                </div>
              </div>

              {/* 2) Temperature Gauge */}
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>🌡️ 온도</span>
                  <span className="font-mono text-rose-400">{temperature}°C</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-1 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 transition-all duration-300"
                    style={{ width: `${((temperature + 10) / 100) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-400 block text-right mt-0.5">
                  -10 ~ 90°C
                </span>
              </div>

              {/* 3) Pressure Gauge */}
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>🎈 압력</span>
                  <span className="font-mono text-amber-400">{pressure.toFixed(1)} atm</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-1 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-rose-500 transition-all duration-300"
                    style={{ width: `${((pressure - 1) / 4) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-400 block text-right mt-0.5">
                  1.0 ~ 5.0 atm
                </span>
              </div>

              {/* 4) Volume Gauge */}
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>🫧 부피</span>
                  <span className="font-mono text-cyan-400">{volume}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-1 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300"
                    style={{ width: `${volume}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-400 block text-right mt-0.5">
                  10 ~ 100%
                </span>
              </div>

              {/* 5) Score, Stage, Lives */}
              <div className="col-span-2 md:col-span-1 p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">구간:</span>
                  <span className="font-bold text-cyan-300">구간 {stageIndex + 1}/5</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-0.5">
                  <span className="text-slate-400">점수:</span>
                  <span className="font-mono font-bold text-amber-300">{score}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-0.5">
                  <span className="text-slate-400">생명:</span>
                  <span className="text-rose-400">
                    {'❤️'.repeat(lives)}
                    {'🖤'.repeat((difficulty === 'easy' ? 3 : 1) - lives)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Central Lab Map */}
          <LabMap
            stageIndex={stageIndex}
            distance={distance}
            volume={volume}
            temperature={temperature}
            pressure={pressure}
            isCooling={isCooling}
            status={mongsiliStatus}
            stageNotice={stageNotice}
            valveClicks={valveClicks}
            onTurnValve={handleTurnValve}
            canTurnValve={stageIndex === 4}
          />

          {/* Bottom Controls */}
          <div className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
              <span>🎮 터치 및 키보드 조작 지원 (WASD / 방향키 / 스페이스바)</span>
              <span className="font-mono text-cyan-400 text-[11px]">
                {stageIndex === 0
                  ? '보일 구간: P↑ 부피 축소'
                  : stageIndex === 1
                  ? '샤를 구간: T↑ 상승 기류'
                  : stageIndex === 2
                  ? '확산 구간: 냉각/저온'
                  : stageIndex === 3
                  ? '보안 퀴즈'
                  : '밸브 연타'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {/* Pressure Up */}
              <button
                onClick={() => handlePressureChange(0.5)}
                className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-amber-500/40 text-amber-300 font-bold text-xs shadow cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
              >
                <div className="flex items-center gap-1">
                  <span>[W/↑]</span>
                  <span>압력 높이기 ↑</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  부피 축소 (보일 법칙)
                </span>
              </button>

              {/* Pressure Down */}
              <button
                onClick={() => handlePressureChange(-0.5)}
                className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-amber-500/40 text-amber-300 font-bold text-xs shadow cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
              >
                <div className="flex items-center gap-1">
                  <span>[S/↓]</span>
                  <span>압력 낮추기 ↓</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  부피 팽창 (보일 법칙)
                </span>
              </button>

              {/* Temp Up */}
              <button
                onClick={() => handleTempChange(10)}
                className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-rose-500/40 text-rose-300 font-bold text-xs shadow cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
              >
                <div className="flex items-center gap-1">
                  <span>[D/→]</span>
                  <span>온도 높이기 ↑</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  위로 상승 (샤를 법칙)
                </span>
              </button>

              {/* Temp Down */}
              <button
                onClick={() => handleTempChange(-10)}
                className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
              >
                <div className="flex items-center gap-1">
                  <span>[A/←]</span>
                  <span>온도 낮추기 ↓</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  아래로 하강 (냉각)
                </span>
              </button>

              {/* Cooling Skill Button / Valve button depending on stage */}
              {stageIndex === 4 ? (
                <button
                  onClick={handleTurnValve}
                  className="col-span-2 md:col-span-1 py-3 px-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-95 text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                >
                  <div className="flex items-center gap-1">
                    <span>🔄</span>
                    <span>[Space] 밸브 돌리기!</span>
                  </div>
                  <span className="text-[10px] text-amber-200 font-mono">
                    {valveClicks} / 10 회 회전
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleActivateCooling}
                  disabled={coolingCooldown > 0 || isCooling}
                  className={`col-span-2 md:col-span-1 py-3 px-2 rounded-xl active:scale-95 font-bold text-xs shadow cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                    coolingCooldown > 0
                      ? 'bg-slate-800/50 border border-slate-700 text-slate-500 cursor-not-allowed'
                      : isCooling
                      ? 'bg-cyan-600 border border-cyan-300 text-white animate-pulse'
                      : 'bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 border border-cyan-400 text-white'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>❄️</span>
                    <span>[Space] 냉각 스킬</span>
                  </div>
                  <span className="text-[10px] font-normal opacity-90">
                    {coolingCooldown > 0
                      ? `쿨타임 ${coolingCooldown}초`
                      : isCooling
                      ? '냉각 가동 중!'
                      : '입자 운동 급속 둔화'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SCREEN 3: RESULT SCREEN                                        */}
      {/* ============================================================== */}
      {screen === 'result' && (
        <ResultScreen
          isSuccess={isSuccess}
          nickname={nickname || '익명의 기체'}
          score={score}
          timeLeft={timeLeft}
          correctQuizCount={correctQuizCount}
          failureReason={failureReason}
          difficulty={difficulty}
          onRestart={handleStartGame}
          onHome={() => setScreen('start')}
          onOpenRanking={() => setShowRanking(true)}
        />
      )}

      {/* ============================================================== */}
      {/* MODALS: QUIZ, HOW TO PLAY, RANKING                             */}
      {/* ============================================================== */}
      {quizActive && (
        <QuizModal
          questions={activeQuizSet}
          currentIndex={quizIndex}
          difficulty={difficulty}
          timeLeft={timeLeft}
          onCorrect={handleQuizCorrect}
          onWrong={handleQuizWrong}
          onFailExplode={handleGameOver}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showRanking && (
        <RankingModal
          onClose={() => setShowRanking(false)}
          onClear={clearRankings}
          rankings={rankings}
        />
      )}
    </div>
  );
}
