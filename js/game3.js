/* ═══════════════════════════════════════════════
   game3.js — Focus Mode
   Fill-in-the-blank article in a sentence
   TTS available via explicit button only (no auto)
   ═══════════════════════════════════════════════ */

const Game3 = (() => {
    let queue = [], qIndex = 0, score = 0, gameActive = false;
    const TOTAL = 10;

    function wordsWithSentences() {
        return App.state.words.filter(w => w.article && w.example && ['der', 'die', 'das'].includes(w.article));
    }
    function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }
    function q(id) { return document.getElementById(id); }

    function showQuestion() {
        if (qIndex >= TOTAL || qIndex >= queue.length) { showGameOver(); return; }
        const word = queue[qIndex];
        const pct = (qIndex / TOTAL) * 100;
        const gp = q('g3-progress'); if (gp) gp.style.width = pct + '%';
        const gpl = q('g3-progress-label'); if (gpl) gpl.textContent = `${qIndex} / ${TOTAL}`;

        q('g3-word-display').textContent = word.word;

        // Build sentence with blank
        const sent = word.example || '';
        const art = word.article;
        // Replace the first occurrence of the article (case insensitive) with a blank
        const blanked = sent.replace(new RegExp(`\\b${art}\\b`, 'i'), `<span class="g3-blank">___</span>`);
        q('g3-sentence').innerHTML = blanked;
        q('g3-trans').textContent = word.exampleTranslation || '';

        // TTS button for sentence (explicit only)
        const ttsBtn = q('g3-tts-btn');
        if (ttsBtn) {
            ttsBtn.style.display = '';
            ttsBtn.onclick = () => App.speak(sent);
        }

        // Reset card states
        document.querySelectorAll('.g3-play-card').forEach(c => {
            c.className = c.className.replace(/ correct| wrong/g, '');
            c.disabled = false;
        });
        q('g3-feedback').textContent = '';
        q('g3-feedback').className = 'feedback';
    }

    function handleChoice(article) {
        if (!gameActive) return;
        const word = queue[qIndex];
        const correct = article === word.article;
        App.recordAnswer(correct);

        // Reveal answer
        const blank = q('g3-sentence').querySelector('.g3-blank');
        if (blank) {
            blank.textContent = word.article;
            blank.style.color = correct ? 'var(--success)' : 'var(--danger)';
            blank.style.borderColor = correct ? 'var(--success)' : 'var(--danger)';
        }

        document.querySelectorAll('.g3-play-card').forEach(c => {
            c.disabled = true;
            if (c.dataset.article === word.article) c.classList.add('correct');
            else if (c.dataset.article === article && !correct) c.classList.add('wrong');
        });

        const feedback = q('g3-feedback');
        if (correct) {
            score += 10; App.addXP(10);
            feedback.textContent = `✓ ${App.t('correct')}`;
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = `✗ ${App.t('wrong')} — ${word.article.toUpperCase()} ${word.word}`;
            feedback.className = 'feedback wrong';
        }

        const xpEl = q('g3-xp-display'); if (xpEl) xpEl.textContent = `⚡ ${score}`;

        qIndex++;
        setTimeout(() => showQuestion(), 1400);
    }

    function showGameOver() {
        gameActive = false;
        const area = q('g3-area');
        if (!area) return;
        area.innerHTML = `
      <div class="game-over">
        <i data-lucide="target" class="game-over-icon" style="color:#EC4899"></i>
        <div class="game-over-title">${App.t('game-over')}</div>
        <div class="game-over-score">${App.t('score')}: ${score} XP</div>
        <div class="game-over-actions">
          <button class="btn btn-primary" onclick="Game3.start()">
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
        App.navigate('game3');
        // Rebuild area to reset state
        q('g3-area').innerHTML = `
      <div class="g3-word-header">
        <span class="label-dim" data-i18n="word">${App.t('word')}</span>
        <div class="g3-word-big" id="g3-word-display">–</div>
      </div>
      <div class="g3-sentence-card">
        <div class="g3-sentence" id="g3-sentence">${App.t('g3-press-start')}</div>
        <div class="g3-trans" id="g3-trans"></div>
        <button class="icon-btn tts-mini" id="g3-tts-btn" style="display:none">
          <i data-lucide="volume-2" class="icon-sm"></i>
        </button>
      </div>
      <div class="label-dim" style="text-align:center;margin-bottom:10px">${App.t('choose-article')}</div>
      <div class="g3-cards-play">
        <button class="g3-play-card der-card" data-article="der">der</button>
        <button class="g3-play-card die-card" data-article="die">die</button>
        <button class="g3-play-card das-card" data-article="das">das</button>
      </div>
      <div class="feedback" id="g3-feedback"></div>
    `;
        if (window.lucide) lucide.createIcons();
        document.querySelectorAll('.g3-play-card').forEach(c => {
            c.addEventListener('click', () => handleChoice(c.dataset.article));
        });

        queue = shuffle(wordsWithSentences()).slice(0, TOTAL);
        qIndex = 0; score = 0; gameActive = true;
        showQuestion();
    }

    function init() {
        const btn = document.getElementById('g3-start-btn');
        if (btn) btn.addEventListener('click', start);
    }

    return { init, start };
})();
