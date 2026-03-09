/* ═══════════════════════════════════════════════
   game2.js — Elixir Rush
   Time-attack article quiz with SVG ring timer
   No auto-TTS — TTS only on explicit button press
   ═══════════════════════════════════════════════ */

const Game2 = (() => {
    let queue = [], qIndex = 0, score = 0, gameActive = false;
    let timer = null, timeLeft = 0;
    const TOTAL = 10, SECONDS = 8;
    const CIRC = 2 * Math.PI * 40; // r=40

    function wordsWithArticles() {
        return App.state.words.filter(w => w.article && ['der', 'die', 'das'].includes(w.article));
    }
    function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }
    function q(id) { return document.getElementById(id); }

    function updateRing(fraction) {
        const circle = q('g2-timer-circle');
        if (!circle) return;
        circle.style.strokeDashoffset = CIRC * (1 - fraction);
        // Color: green → yellow → red
        if (fraction > .5) circle.style.stroke = 'var(--success)';
        else if (fraction > .25) circle.style.stroke = 'var(--warning)';
        else circle.style.stroke = 'var(--danger)';
    }

    function setDashArray() {
        const c = q('g2-timer-circle');
        if (c) { c.style.strokeDasharray = CIRC; c.style.strokeDashoffset = 0; }
    }

    function showQuestion() {
        if (qIndex >= TOTAL) { showGameOver(); return; }
        const word = queue[qIndex];
        const g2German = q('g2-german');
        const g2Hint = q('g2-hint');
        if (g2German) g2German.textContent = word.word;
        if (g2Hint) g2Hint.textContent = word.translation || word.translationEn || '';

        // Reset choices state
        document.querySelectorAll('.g2-choice').forEach(b => {
            b.className = b.className.replace(/ correct| wrong/g, '');
            b.disabled = false;
        });

        // Update progress
        const pct = (qIndex / TOTAL) * 100;
        const gp = q('g2-progress'); if (gp) gp.style.width = pct + '%';
        const gpl = q('g2-progress-label'); if (gpl) gpl.textContent = `${qIndex} / ${TOTAL}`;

        startTimer();
    }

    function startTimer() {
        clearInterval(timer);
        timeLeft = SECONDS;
        q('g2-timer-text').textContent = timeLeft;
        setDashArray();
        updateRing(1);
        timer = setInterval(() => {
            timeLeft--;
            const el = q('g2-timer-text');
            if (el) el.textContent = timeLeft;
            updateRing(timeLeft / SECONDS);
            if (timeLeft <= 0) {
                clearInterval(timer);
                handleChoice(null, true); // time out
            }
        }, 1000);
    }

    function handleChoice(article, timedOut = false) {
        if (!gameActive) return;
        clearInterval(timer);
        const word = queue[qIndex];
        const correct = !timedOut && article === word.article;
        App.recordAnswer(correct);

        const feedback = q('g2-feedback');
        document.querySelectorAll('.g2-choice').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.article === word.article) btn.classList.add('correct');
            else if (btn.dataset.article === article) btn.classList.add('wrong');
        });

        if (correct) {
            const bonus = timeLeft >= 6 ? 20 : timeLeft >= 3 ? 15 : 10;
            score += bonus; App.addXP(bonus);
            if (feedback) { feedback.textContent = `\u2713 ${App.t('correct')} +${bonus} XP`; feedback.className = 'feedback correct'; }
            if (window.Falcon) Falcon.onCorrect();
        } else {
            if (feedback) {
                feedback.textContent = timedOut
                    ? `\u23f1 ${word.article.toUpperCase()} ${word.word}`
                    : `\u2717 ${App.t('wrong')} ${word.article.toUpperCase()} ${word.word}`;
                feedback.className = 'feedback wrong';
            }
            if (window.Falcon) Falcon.onWrong();
        }
        const xpEl = q('g2-xp-display'); if (xpEl) xpEl.textContent = `\u26a1 ${score}`;
        qIndex++;
        setTimeout(() => {
            if (feedback) feedback.className = 'feedback';
            showQuestion();
        }, 1200);
    }

    function showGameOver() {
        gameActive = false;
        clearInterval(timer);
        const area = q('g2-area');
        if (!area) return;
        area.innerHTML = `
      <div class="game-over">
        <i data-lucide="zap" class="game-over-icon" style="color:#F59E0B"></i>
        <div class="game-over-title">${App.t('game-over')}</div>
        <div class="game-over-score">${App.t('score')}: ${score} XP</div>
        <div class="game-over-actions">
          <button class="btn btn-primary" onclick="Game2.start()">
            <i data-lucide="refresh-cw" class="icon-sm"></i> ${App.t('play-again')}
          </button>
          <button class="btn btn-ghost" onclick="App.navigate('games')">
            <i data-lucide="grid-2x2" class="icon-sm"></i> ${App.t('to-games')}
          </button>
        </div>
      </div>`;
        if (window.lucide) lucide.createIcons();
    }

    function start() {
        App.navigate('game2');
        // Rebuild area
        q('g2-area').innerHTML = `
      <div class="timer-ring-wrap">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border)" stroke-width="7"/>
          <circle id="g2-timer-circle" cx="48" cy="48" r="40"
            fill="none" stroke="var(--success)" stroke-width="7"
            stroke-linecap="round"
            style="transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset 0.95s linear,stroke 0.5s"/>
        </svg>
        <div class="timer-text" id="g2-timer-text">8</div>
      </div>
      <div class="g2-word-display">
        <div class="g2-german" id="g2-german">–</div>
        <div class="g2-hint" id="g2-hint">${App.t('g2-press-start')}</div>
      </div>
      <div class="g2-choices">
        <button class="g2-choice der-btn" data-article="der">der</button>
        <button class="g2-choice die-btn" data-article="die">die</button>
        <button class="g2-choice das-btn" data-article="das">das</button>
      </div>
      <div class="feedback" id="g2-feedback"></div>
    `;
        if (window.lucide) lucide.createIcons();
        document.querySelectorAll('.g2-choice').forEach(btn => {
            btn.addEventListener('click', () => handleChoice(btn.dataset.article));
        });

        queue = shuffle(wordsWithArticles()).slice(0, TOTAL);
        qIndex = 0; score = 0; gameActive = true;
        setDashArray();
        showQuestion();
    }

    function init() {
        const btn = document.getElementById('g2-start-btn');
        if (btn) btn.addEventListener('click', start);
    }

    return { init, start };
})();
