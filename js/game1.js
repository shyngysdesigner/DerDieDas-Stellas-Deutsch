/* ═══════════════════════════════════════════════
   game1.js — Tower Defense
   Drag word cards to der / die / das towers
   TTS only fires after answer reveal (on button)
   ═══════════════════════════════════════════════ */

const Game1 = (() => {
  let queue = [], qIndex = 0, score = 0, gameActive = false;
  const TOTAL = 10;
  let dragWord = null;

  function wordsWithArticles() {
    return App.state.words.filter(w => w.article && ['der', 'die', 'das'].includes(w.article));
  }

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - .5);
  }

  function updateProgress() {
    const pct = (qIndex / TOTAL) * 100;
    set('g1-progress', el => el.style.width = pct + '%');
    set('g1-progress-label', el => el.textContent = `${qIndex} / ${TOTAL}`);
    set('g1-xp-display', el => el.textContent = `⚡ ${score}`);
  }

  function set(id, fn) { const el = document.getElementById(id); if (el) fn(el); }
  function q(id) { return document.getElementById(id); }

  function renderHand() {
    const hand = q('g1-hand');
    if (!hand) return;
    hand.innerHTML = '';
    const remaining = queue.slice(qIndex, qIndex + 6);
    if (!remaining.length) { showGameOver(); return; }

    remaining.forEach(word => {
      const card = document.createElement('div');
      card.className = 'drag-card';
      card.draggable = false;
      card.dataset.id = word.id;
      card.innerHTML = `
        <div>${word.word}</div>
        <div class="drag-card-sub">${word.translation || word.translationEn || ''}</div>
      `;
      let isDragging = false;
      let startPointerX = 0; let startPointerY = 0;
      let lastTranslate = '';

      card.addEventListener('pointerdown', e => {
        e.preventDefault();
        isDragging = true;
        dragWord = word;
        
        startPointerX = e.clientX;
        startPointerY = e.clientY;
        lastTranslate = `translate(0px, 0px)`;
        
        card.classList.add('dragging-custom');
        card.setPointerCapture(e.pointerId);
        
        card.style.transform = `${lastTranslate} scale(1.05) rotate(-2deg)`;
        card.style.zIndex = '1000';
      });

      card.addEventListener('pointermove', e => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startPointerX;
        const deltaY = e.clientY - startPointerY;
        const tilt = Math.max(-10, Math.min(10, deltaX * 0.05));
        
        lastTranslate = `translate(${deltaX}px, ${deltaY}px)`;
        card.style.transform = `${lastTranslate} scale(1.05) rotate(${tilt}deg)`;
        
        // Find tower by distance to pointer
        let minDist = Infinity;
        let tower = null;
        document.querySelectorAll('.tower').forEach(t => {
          t.classList.remove('drag-over');
          const tr = t.getBoundingClientRect();
          const tx = tr.left + tr.width / 2;
          const ty = tr.top + tr.height / 2;
          const dist = Math.hypot(e.clientX - tx, e.clientY - ty);
          if (dist < minDist && dist < 120) {
            minDist = dist;
            tower = t;
          }
        });
        
        if (tower) tower.classList.add('drag-over');
      });

      card.addEventListener('pointerup', e => {
        if (!isDragging) return;
        isDragging = false;
        card.releasePointerCapture(e.pointerId);
        card.classList.remove('dragging-custom');
        
        let minDist = Infinity;
        let tower = null;
        document.querySelectorAll('.tower').forEach(t => {
          t.classList.remove('drag-over');
          const tr = t.getBoundingClientRect();
          const tx = tr.left + tr.width / 2;
          const ty = tr.top + tr.height / 2;
          const dist = Math.hypot(e.clientX - tx, e.clientY - ty);
          if (dist < minDist && dist < 120) {
            minDist = dist;
            tower = t;
          }
        });
        
        if (tower) {
          card.style.transform = `${lastTranslate} scale(0.5)`;
          card.style.opacity = '0';
          setTimeout(() => handleDrop(tower.dataset.article, card), 150);
        } else {
          dragWord = null;
          card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          card.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
          card.style.zIndex = '';
          setTimeout(() => { if(card) card.style.transition = ''; }, 300);
        }
      });
      
      card.addEventListener('pointercancel', e => {
         if (!isDragging) return;
         isDragging = false;
         card.releasePointerCapture(e.pointerId);
         card.classList.remove('dragging-custom');
         dragWord = null;
         card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
         card.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
         card.style.zIndex = '';
         setTimeout(() => { if(card) card.style.transition = ''; }, 300);
      });

      hand.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
  }

  function handleDrop(article, cardEl) {
    if (!gameActive || !dragWord) return;
    const correct = dragWord.article === article;
    App.recordAnswer(correct);

    const feedback = q('g1-feedback');
    if (correct) {
      score += 10; App.addXP(10);
      if (feedback) { feedback.textContent = '\u2713 ' + App.t('correct'); feedback.className = 'feedback correct'; }
      if (window.Falcon) Falcon.onCorrect();
      // Update tower count
      const cnt = q(`g1-count-${article}`);
      if (cnt) { cnt.textContent = (parseInt(cnt.textContent || 0) + 1) || 1; cnt.style.display = 'flex'; }
    } else {
      if (feedback) {
        feedback.textContent = `\u2717 ${App.t('wrong')} ${dragWord.article.toUpperCase()} ${dragWord.word}`;
        feedback.className = 'feedback wrong';
      }
      if (window.Falcon) Falcon.onWrong();
    }
    setTimeout(() => { if (feedback) feedback.className = 'feedback'; }, 1500);

    if (cardEl) cardEl.remove();
    qIndex++;
    dragWord = null;
    updateProgress();
    if (qIndex >= TOTAL) { setTimeout(showGameOver, 800); return; }
    renderHand();
  }

  function setupTowers() {
    document.querySelectorAll('.tower').forEach(tower => {
      tower.addEventListener('dragover', e => { e.preventDefault(); tower.classList.add('drag-over'); });
      tower.addEventListener('dragleave', () => tower.classList.remove('drag-over'));
      tower.addEventListener('drop', e => {
        tower.classList.remove('drag-over');
        const card = document.querySelector('.drag-card.dragging');
        handleDrop(tower.dataset.article, card);
      });
    });
  }

  function showGameOver() {
    gameActive = false;
    const area = q('g1-game-area');
    if (!area) return;
    area.innerHTML = `
      <div class="game-over">
        <i data-lucide="trophy" class="game-over-icon" style="color:#F59E0B"></i>
        <div class="game-over-title">${App.t('game-over')}</div>
        <div class="game-over-score">${App.t('score')}: ${score} XP</div>
        <div class="game-over-actions">
          <button class="btn btn-primary" onclick="Game1.start()">
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
    App.navigate('game1');
    const area = q('g1-game-area');
    area.innerHTML = `
      <div class="towers-row">
        <div class="tower der-tower" data-article="der">
          <span class="tower-count" id="g1-count-der"></span>
          <div class="tower-label" style="color:var(--der)">DER</div>
          <div class="tower-sub" data-i18n="masc">${App.t('masc')}</div>
          <i data-lucide="shield" class="tower-icon" style="color:var(--der)"></i>
        </div>
        <div class="tower die-tower" data-article="die">
          <span class="tower-count" id="g1-count-die"></span>
          <div class="tower-label" style="color:var(--die)">DIE</div>
          <div class="tower-sub" data-i18n="fem">${App.t('fem')}</div>
          <i data-lucide="shield" class="tower-icon" style="color:var(--die)"></i>
        </div>
        <div class="tower das-tower" data-article="das">
          <span class="tower-count" id="g1-count-das"></span>
          <div class="tower-label" style="color:var(--das)">DAS</div>
          <div class="tower-sub" data-i18n="neut">${App.t('neut')}</div>
          <i data-lucide="shield" class="tower-icon" style="color:var(--das)"></i>
        </div>
      </div>
      <div class="feedback" id="g1-feedback"></div>
      <div class="drag-hint">
        <i data-lucide="hand" class="icon-xs"></i> ${App.t('drag-hint')}
      </div>
      <div class="cards-hand" id="g1-hand"></div>
    `;
    if (window.lucide) lucide.createIcons();

    queue = shuffle(wordsWithArticles()).slice(0, TOTAL);
    qIndex = 0; score = 0; gameActive = true;
    updateProgress();
    setupTowers();
    renderHand();
  }

  function init() {
    const btn = document.getElementById('g1-start-btn');
    if (btn) btn.addEventListener('click', start);
  }

  return { init, start };
})();
