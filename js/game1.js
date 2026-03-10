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
      // Full custom pointer drag and drop
      let isDragging = false;
      let startX = 0; let startY = 0;
      let currentX = 0; let currentY = 0;

      card.addEventListener('pointerdown', e => {
        // Prevent default only if it's not a button or similar, but for custom drag we usually prevent it
        // However, on mobile sometimes setting pointercapture prevents scrolling. For cards, we want to grab it.
        e.preventDefault();
        isDragging = true;
        dragWord = word;
        
        const rect = card.getBoundingClientRect();
        startX = e.clientX - rect.left - (rect.width/2);
        startY = e.clientY - rect.top - (rect.height/2);
        
        card.classList.add('dragging-custom');
        card.setPointerCapture(e.pointerId);
        
        // Initial transform
        currentX = 0; currentY = 0;
        card.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.05) rotate(-2deg)`;
        card.style.zIndex = '1000';
      });

      card.addEventListener('pointermove', e => {
        if (!isDragging) return;
        
        // Calculate movement difference
        currentX += e.movementX;
        currentY += e.movementY;
        
        // Fallback calculation for some mobile devices where movementX/Y might act weird
        if(e.movementX === undefined) {
           // Basic delta if movement isn't supported (rare in modern browsers)
        }

        // We use absolute positioning based on page/client coordinates for smoother drag
        // Actually, simplest is transform translate from original position
        // e.clientX/Y minus the start relative offsets
        
        // Let's use a simpler approach: calculate delta from the start down position
        if (card._startX === undefined) {
             card._startX = e.clientX;
             card._startY = e.clientY;
        }
        
        const deltaX = e.clientX - card._startX;
        const deltaY = e.clientY - card._startY;
        
        const tilt = Math.max(-10, Math.min(10, deltaX * 0.05));
        
        card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05) rotate(${tilt}deg)`;
        
        // Check hover over towers (visual only)
        // Temporarily hide card so elementFromPoint sees what's underneath
        card.style.visibility = 'hidden';
        const elBeneath = document.elementFromPoint(e.clientX, e.clientY);
        card.style.visibility = 'visible';
        
        document.querySelectorAll('.tower').forEach(t => t.classList.remove('drag-over'));
        const tower = elBeneath ? elBeneath.closest('.tower') : null;
        if (tower) tower.classList.add('drag-over');
      });

      card.addEventListener('pointerup', e => {
        if (!isDragging) return;
        isDragging = false;
        card.releasePointerCapture(e.pointerId);
        card.classList.remove('dragging-custom');
        card._startX = undefined;
        card._startY = undefined;
        
        card.style.visibility = 'hidden';
        const elBeneath = document.elementFromPoint(e.clientX, e.clientY);
        card.style.visibility = 'visible';
        
        document.querySelectorAll('.tower').forEach(t => t.classList.remove('drag-over'));
        const tower = elBeneath ? elBeneath.closest('.tower') : null;
        
        if (tower) {
          card.style.transform = `translate(${card.style.transform.split('translate(')[1].split(')')[0]}) scale(0.5)`;
          card.style.opacity = '0';
          setTimeout(() => handleDrop(tower.dataset.article, card), 150);
        } else {
          // Snap back
          dragWord = null;
          card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          card.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
          card.style.zIndex = '';
          setTimeout(() => {
              card.style.transition = '';
          }, 300);
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
         card._startX = undefined;
         card._startY = undefined;
         setTimeout(() => card.style.transition = '', 300);
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
