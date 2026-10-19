/**
 * Generates and downloads a 100% self-contained single HTML file with embedded CSS, SVGs, JS, and sound synthesis.
 * Can be run completely offline with zero external network requests.
 */
import { QUIZ_BANK } from '../data/quizData';

export function downloadStandaloneHtml() {
  const jsonBank = JSON.stringify(QUIZ_BANK.slice(0, 40)); // essential bank for compact standalone

  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>기체 분자 구출 작전 - 단일 파일 실행판</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Malgun Gothic", sans-serif; }
    body { background: #06151a; color: #fff; min-height: 100vh; overflow-x: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .screen { width: 100%; max-width: 800px; padding: 20px; display: none; opacity: 0; transition: opacity 0.4s ease; }
    .screen.active { display: flex; flex-direction: column; opacity: 1; }
    h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); text-align: center; color: #38bdf8; text-shadow: 0 0 20px rgba(56,189,248,0.5); margin-bottom: 8px; }
    .btn { background: linear-gradient(135deg, #0284c7, #06b6d4); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer; transition: transform 0.1s, filter 0.2s; box-shadow: 0 4px 12px rgba(2,132,199,0.4); text-align: center; }
    .btn:hover { filter: brightness(1.1); }
    .btn:active { transform: scale(0.96); }
    .btn-secondary { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; }
    .btn-danger { background: linear-gradient(135deg, #e11d48, #f43f5e); }
    .hud { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; background: #0f172a; padding: 12px; border-radius: 14px; border: 1px solid #1e293b; margin-bottom: 12px; }
    .gauge { background: #1e293b; padding: 6px 10px; border-radius: 8px; font-size: 12px; }
    .gauge-bar { height: 6px; background: #334155; border-radius: 4px; overflow: hidden; margin-top: 4px; }
    .gauge-fill { height: 100%; width: 50%; transition: width 0.3s; }
    .map-box { position: relative; width: 100%; height: 320px; background: linear-gradient(to bottom, #06151a, #0b242c, #040e11); border: 2px solid #0891b2; border-radius: 16px; overflow: hidden; margin-bottom: 12px; }
    .mongsili { position: absolute; left: 20%; bottom: 40%; transform: translate(-50%, 50%); transition: all 0.3s ease-out; }
    .controls { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 8px; }
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; padding: 16px; z-index: 100; }
    .modal.active { display: flex; }
    .modal-content { background: #0f172a; border: 2px solid #0284c7; border-radius: 20px; padding: 24px; max-width: 500px; width: 100%; }
    .quiz-opt { width: 100%; text-align: left; background: #1e293b; border: 1px solid #334155; padding: 10px 14px; border-radius: 10px; color: #fff; margin: 6px 0; cursor: pointer; }
    .quiz-opt:hover { background: #334155; }
  </style>
</head>
<body>
  <!-- 화면 1: 시작 화면 -->
  <section id="screen-start" class="screen active" style="align-items: center;">
    <div style="font-size: 40px; margin-bottom: 10px;">🧪 ⚗️ 🔬</div>
    <h1>기체 분자 구출 작전</h1>
    <p style="color: #94a3b8; margin-bottom: 24px; text-align: center;">폭발 위기의 연구소를 탈출하라! 몽실이의 기체 상태를 조절하세요!</p>
    
    <div style="width: 100px; height: 100px; margin-bottom: 24px;">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="#38bdf8" />
        <ellipse cx="35" cy="46" rx="4" ry="6" fill="#0f172a" />
        <ellipse cx="65" cy="46" rx="4" ry="6" fill="#0f172a" />
        <circle cx="34" cy="44" r="1.5" fill="#fff" />
        <circle cx="64" cy="44" r="1.5" fill="#fff" />
        <ellipse cx="26" cy="54" rx="5" ry="3" fill="#f43f5e" opacity="0.5" />
        <ellipse cx="74" cy="54" rx="5" ry="3" fill="#f43f5e" opacity="0.5" />
        <path d="M 43 60 Q 50 67 57 60" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    </div>

    <input type="text" id="input-nickname" placeholder="대원 닉네임 (최대 8자)" maxlength="8" style="padding: 12px 16px; border-radius: 10px; border: 1px solid #334155; background: #1e293b; color: #fff; width: 260px; text-align: center; margin-bottom: 16px;">
    
    <div style="display: flex; gap: 8px; margin-bottom: 20px;">
      <button id="btn-diff-easy" class="btn" onclick="setDiff('easy')" style="padding: 8px 16px; font-size: 13px;">쉬움 (❤️3개)</button>
      <button id="btn-diff-hard" class="btn btn-secondary" onclick="setDiff('hard')" style="padding: 8px 16px; font-size: 13px;">어려움 (❤️1개)</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px; width: 260px;">
      <button class="btn" onclick="startGame()">🚀 게임 시작</button>
      <button class="btn btn-secondary" onclick="openHelp()">📖 게임 방법</button>
    </div>
  </section>

  <!-- 화면 2: 게임 화면 -->
  <section id="screen-game" class="screen">
    <div class="hud">
      <div class="gauge">
        <div>⏱️ 타이머: <strong id="hud-timer" style="color: #f59e0b;">60초</strong></div>
      </div>
      <div class="gauge">
        <div>🌡️ 온도: <span id="val-temp">20</span>°C</div>
        <div class="gauge-bar"><div id="bar-temp" class="gauge-fill" style="background: #ef4444; width: 30%;"></div></div>
      </div>
      <div class="gauge">
        <div>🎈 압력: <span id="val-pres">2.0</span> atm</div>
        <div class="gauge-bar"><div id="bar-pres" class="gauge-fill" style="background: #f59e0b; width: 40%;"></div></div>
      </div>
      <div class="gauge">
        <div>🫧 부피: <span id="val-vol">50</span>%</div>
        <div class="gauge-bar"><div id="bar-vol" class="gauge-fill" style="background: #38bdf8; width: 50%;"></div></div>
      </div>
      <div class="gauge">
        <div>⭐ 점수: <strong id="hud-score" style="color: #38bdf8;">0</strong></div>
      </div>
    </div>

    <!-- 맵 영역 -->
    <div class="map-box" id="map-box">
      <div id="obstacle" style="position: absolute; width: 90px; top: 0; bottom: 0; right: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: left 0.2s;">
        <div id="obs-top" style="background: #d97706; height: 35%; border-radius: 0 0 10px 10px; text-align: center; font-size: 11px; padding: 4px;">압축기</div>
        <div id="obs-tag" style="text-align: center; font-size: 10px; color: #fef08a;">구간 1: 좁은 틈</div>
        <div id="obs-bot" style="background: #d97706; height: 35%; border-radius: 10px 10px 0 0; text-align: center; font-size: 11px; padding: 4px;">압축기</div>
      </div>

      <div class="mongsili" id="mongsili">
        <svg width="70" height="70" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="#38bdf8" />
          <ellipse cx="35" cy="46" rx="4" ry="6" fill="#0f172a" />
          <ellipse cx="65" cy="46" rx="4" ry="6" fill="#0f172a" />
          <path d="M 43 60 Q 50 67 57 60" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <!-- 하단 조작 버튼 (WASD 지원) -->
    <div class="controls">
      <button class="btn btn-secondary" onclick="changePres(0.5)">[W] 압력 높이기 ↑ (부피 줄이기)</button>
      <button class="btn btn-secondary" onclick="changePres(-0.5)">[S] 압력 낮추기 ↓ (부피 늘리기)</button>
      <button class="btn btn-secondary" onclick="changeTemp(15)">[D] 온도 높이기 ↑ (부력 상승)</button>
      <button class="btn btn-secondary" onclick="changeTemp(-15)">[A] 온도 낮추기 ↓ (하강/냉각)</button>
      <button class="btn" style="grid-column: span 2; background: #0284c7;" onclick="skillCooling()">[Space] ❄️ 급속 냉각 스킬</button>
    </div>
  </section>

  <!-- 화면 3: 결과 화면 -->
  <section id="screen-result" class="screen" style="align-items: center; text-align: center;">
    <h1 id="res-title">🎉 연구소 탈출 성공!</h1>
    <p id="res-msg" style="color: #cbd5e1; margin-bottom: 20px;">보일과 샤를의 법칙을 완벽히 활용했습니다.</p>
    
    <div style="background: #0f172a; padding: 16px; border-radius: 16px; width: 100%; margin-bottom: 20px; border: 1px solid #334155;">
      <p>대원: <strong id="res-name"></strong> | 최종 점수: <strong id="res-score" style="color: #f59e0b;"></strong></p>
    </div>

    <div style="display: flex; gap: 10px;">
      <button class="btn" onclick="startGame()">다시 하기</button>
      <button class="btn btn-secondary" onclick="goHome()">처음으로</button>
    </div>
  </section>

  <!-- 퀴즈 모달 -->
  <div class="modal" id="modal-quiz">
    <div class="modal-content">
      <div style="font-size: 13px; color: #38bdf8; margin-bottom: 8px;">💡 기체 성질 보안 퀴즈</div>
      <h3 id="quiz-question" style="font-size: 16px; margin-bottom: 16px;">문제 내용</h3>
      <div id="quiz-options"></div>
      <div id="quiz-exp" style="display:none; margin-top: 12px; font-size: 12px; color: #a7f3d0; background: #064e3b; padding: 8px; border-radius: 8px;"></div>
    </div>
  </div>

  <script>
    const QUIZ_LIST = ${jsonBank};
    let state = {
      nickname: '익명의 기체',
      difficulty: 'easy',
      temp: 20,
      pres: 2.0,
      vol: 50,
      time: 60,
      score: 0,
      stage: 0,
      distance: 0,
      valveClicks: 0
    };
    let timerId = null;

    function showScreen(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
    }

    function setDiff(d) {
      state.difficulty = d;
      document.getElementById('btn-diff-easy').className = d === 'easy' ? 'btn' : 'btn btn-secondary';
      document.getElementById('btn-diff-hard').className = d === 'hard' ? 'btn' : 'btn btn-secondary';
    }

    function startGame() {
      const nick = document.getElementById('input-nickname').value.trim();
      state.nickname = nick || '익명의 기체';
      state.time = 60;
      state.score = 0;
      state.stage = 0;
      state.distance = 0;
      state.temp = 20;
      state.pres = 2.0;
      state.valveClicks = 0;
      updateState();
      showScreen('screen-game');
      clearInterval(timerId);
      timerId = setInterval(gameLoop, 200);
    }

    function updateState() {
      // V = 50 * (2.0 / P) * ((T + 273) / 293)
      state.vol = Math.round(50 * (2.0 / state.pres) * ((state.temp + 273.15) / 293.15));
      state.vol = Math.max(10, Math.min(100, state.vol));

      document.getElementById('val-temp').innerText = state.temp;
      document.getElementById('val-pres').innerText = state.pres.toFixed(1);
      document.getElementById('val-vol').innerText = state.vol;
      document.getElementById('hud-score').innerText = state.score;
      document.getElementById('hud-timer').innerText = state.time + '초';

      document.getElementById('bar-temp').style.width = ((state.temp + 10) / 100 * 100) + '%';
      document.getElementById('bar-pres').style.width = ((state.pres - 1) / 4 * 100) + '%';
      document.getElementById('bar-vol').style.width = state.vol + '%';

      const scale = 0.6 + (state.vol / 100) * 0.8;
      const bottom = 15 + ((state.temp + 10) / 100) * 60;
      const el = document.getElementById('mongsili');
      el.style.transform = 'translate(-50%, 50%) scale(' + scale + ')';
      el.style.bottom = bottom + '%';
    }

    function changePres(d) {
      state.pres = Math.max(1.0, Math.min(5.0, Number((state.pres + d).toFixed(1))));
      updateState();
    }

    function changeTemp(d) {
      state.temp = Math.max(-10, Math.min(90, state.temp + d));
      updateState();
    }

    function skillCooling() {
      state.temp = -10;
      updateState();
    }

    let tickCount = 0;
    function gameLoop() {
      tickCount++;
      if (tickCount % 5 === 0) {
        state.time--;
        document.getElementById('hud-timer').innerText = state.time + '초';
        if (state.time <= 0) {
          endGame(false, '시간 초과로 연구소가 폭발했습니다!');
          return;
        }
      }

      state.distance += 2.5;
      const obs = document.getElementById('obstacle');
      obs.style.right = (100 - state.distance) + '%';

      if (state.distance >= 80) {
        checkStageCondition();
      }
    }

    function checkStageCondition() {
      state.distance = 0;
      if (state.stage === 0) {
        // 구간 1: 보일 법칙 (부피 35% 이하)
        if (state.vol <= 35) {
          state.score += 200;
          state.stage = 1;
          document.getElementById('obs-tag').innerText = '구간 2: 높은 굴뚝';
          document.getElementById('obs-top').style.height = '15%';
          document.getElementById('obs-bot').style.height = '60%';
        } else {
          endGame(false, '압력을 높이지 않아 부피가 커서 좁은 틈에 부딪혔습니다! (보일 법칙)');
        }
      } else if (state.stage === 1) {
        // 구간 2: 샤를 법칙 (온도 55도 이상)
        if (state.temp >= 55) {
          state.score += 200;
          state.stage = 2;
          document.getElementById('obs-tag').innerText = '구간 3: 독가스 확산';
        } else {
          endGame(false, '온도를 높이지 않아 환기구로 떠오르지 못했습니다! (샤를 법칙)');
        }
      } else if (state.stage === 2) {
        // 구간 3: 냉각 / 확산 지대 (온도 5도 이하)
        if (state.temp <= 5) {
          state.score += 200;
          state.stage = 3;
          clearInterval(timerId);
          openQuiz(0);
        } else {
          endGame(false, '독가스가 빠르게 확산되는 고온에서 통과를 시도했습니다! (냉각 필요)');
        }
      }
    }

    let quizIdx = 0;
    function openQuiz(idx) {
      quizIdx = idx;
      const q = QUIZ_LIST[quizIdx % QUIZ_LIST.length];
      document.getElementById('quiz-question').innerText = 'Q. ' + q.question;
      const container = document.getElementById('quiz-options');
      container.innerHTML = '';
      document.getElementById('quiz-exp').style.display = 'none';

      q.options.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'quiz-opt';
        b.innerText = opt;
        b.onclick = () => {
          if (opt === q.answer) {
            b.style.background = '#059669';
            state.score += 150;
            setTimeout(() => {
              if (quizIdx < 2) {
                openQuiz(quizIdx + 1);
              } else {
                document.getElementById('modal-quiz').classList.remove('active');
                state.stage = 4;
                endGame(true, '중앙 밸브를 성공적으로 잠그고 연구소를 구출했습니다!');
              }
            }, 800);
          } else {
            b.style.background = '#dc2626';
            state.time = Math.max(0, state.time - 3);
          }
        };
        container.appendChild(b);
      });
      document.getElementById('modal-quiz').classList.add('active');
    }

    function endGame(success, reason) {
      clearInterval(timerId);
      document.getElementById('modal-quiz').classList.remove('active');
      showScreen('screen-result');
      document.getElementById('res-title').innerText = success ? '🎉 탈출 성공!' : '💥 연구소 폭발!';
      document.getElementById('res-msg').innerText = reason;
      document.getElementById('res-name').innerText = state.nickname;
      document.getElementById('res-score').innerText = state.score + '점';
    }

    function goHome() {
      clearInterval(timerId);
      showScreen('screen-start');
    }

    function openHelp() {
      alert('🎮 조작키\\n- W/S: 압력 조절 (보일 법칙)\\n- D/A: 온도 조절 (샤를 법칙)\\n- Space: 급속 냉각 스킬\\n\\n5개 구간을 통과해 연구소를 폭발에서 구출하세요!');
    }

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') changePres(0.5);
      if (k === 's' || e.key === 'ArrowDown') changePres(-0.5);
      if (k === 'd' || e.key === 'ArrowRight') changeTemp(15);
      if (k === 'a' || e.key === 'ArrowLeft') changeTemp(-15);
      if (e.code === 'Space') skillCooling();
    });
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '기체분자구출작전_단일실행파일.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
