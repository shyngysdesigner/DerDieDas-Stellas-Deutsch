/**
 * Game 4: Text Master (Fill in the blanks)
 */
const Game4 = {
  state: {
    isActive: false,
    currentTextObj: null,
    score: 0,
    round: 1,
    maxRounds: 10,
    answersCorrect: 0, // Number of correct dropdowns in the current text
    totalBlanks: 0
  },

  init() {
    this.els = {
      progress: document.getElementById('g4-progress'),
      progressLabel: document.getElementById('g4-progress-label'),
      xpDisplay: document.getElementById('g4-xp-display'),
      textContainer: document.getElementById('g4-text-container'),
      translation: document.getElementById('g4-trans'),
      feedback: document.getElementById('g4-feedback'),
      startBtn: document.getElementById('g4-start-btn'),
      checkBtn: document.getElementById('g4-check-btn'),
      nextBtn: document.getElementById('g4-next-btn')
    };

    if (this.els.startBtn) {
      this.els.startBtn.addEventListener('click', () => this.startGame());
    }
    if (this.els.checkBtn) {
      this.els.checkBtn.addEventListener('click', () => this.checkAnswers());
    }
    if (this.els.nextBtn) {
      this.els.nextBtn.addEventListener('click', () => this.nextRound());
    }
  },

  start() {
    if (typeof App !== 'undefined') App.navigate('game4');
    this.resetState();
    this.updateUI();
  },

  resetState() {
    this.state.isActive = false;
    this.state.score = 0;
    this.state.round = 1;
    this.els.startBtn.style.display = 'inline-flex';
    this.els.checkBtn.style.display = 'none';
    this.els.nextBtn.style.display = 'none';
    this.els.textContainer.innerHTML = '<div class="g3-sentence" style="text-align: center; color: var(--text3)">Drücke Start</div>';
    this.els.translation.textContent = '';
    this.els.feedback.className = 'feedback';
    this.els.feedback.textContent = '';
  },

  startGame() {
    this.state.isActive = true;
    this.state.score = 0;
    this.state.round = 1;
    this.els.startBtn.style.display = 'none';
    this.els.checkBtn.style.display = 'inline-flex';
    this.els.nextBtn.style.display = 'none';
    this.loadRound();
  },

  loadRound() {
    if (!window.TextsData || window.TextsData.length === 0) {
      console.error("No texts data found.");
      return;
    }

    // Pick a random text
    const randomIndex = Math.floor(Math.random() * window.TextsData.length);
    this.state.currentTextObj = window.TextsData[randomIndex];
    this.state.answersCorrect = 0;
    this.state.totalBlanks = this.state.currentTextObj.answers.length;

    this.renderText(this.state.currentTextObj);
    this.updateUI();
  },

  renderText(textObj) {
    this.els.feedback.className = 'feedback';
    this.els.feedback.textContent = '';
    this.els.translation.textContent = textObj.translation || '';
    this.els.textContainer.innerHTML = '';
    
    // Parse the text, split at [blank]
    const parts = textObj.text.split('[blank]');
    let html = '';

    parts.forEach((part, index) => {
      // Add text part
      html += `<span>${part}</span>`;
      
      // Add select dropdown if not the last part
      if (index < parts.length - 1) {
        // Collect unique answers to build dropdown options, falling back to basic articles
        // Or we can just use all unique answers from the texts database to throw them off
        const baseOptions = ["der", "die", "das", "den", "dem", "ein", "eine", "einen", "einem", "einer"];
        
        // We know what the correct answer is: textObj.answers[index]
        // But we want a static list for all dropdowns to not give it away
        // Let's deduce what type of articles this text uses.
        // If it exclusively uses der/die/das/den/dem, give them those.
        
        // Custom select for this blank
        html += `<select class="g4-select g4-blank-input" data-index="${index}">
          <option value="" disabled selected>---</option>
          <option value="der">der</option>
          <option value="die">die</option>
          <option value="das">das</option>
          <option value="den">den</option>
          <option value="dem">dem</option>
          <option value="des">des</option>
          <option value="ein">ein</option>
          <option value="eine">eine</option>
          <option value="einen">einen</option>
          <option value="einem">einem</option>
          <option value="einer">einer</option>
        </select>`;
      }
    });

    this.els.textContainer.innerHTML = html;
  },

  checkAnswers() {
    if (!this.state.isActive) return;

    const selects = this.els.textContainer.querySelectorAll('.g4-blank-input');
    let allFilled = true;
    let allCorrect = true;

    // Check if everything is filled
    selects.forEach(select => {
      if (!select.value) allFilled = false;
    });

    if (!allFilled) {
      if (typeof Falcon !== 'undefined' && Falcon.speak) Falcon.speak("Bitte fülle alle Lücken aus!");
      this.els.feedback.textContent = "Bitte fülle alle Lücken aus!";
      this.els.feedback.className = 'feedback feedback-wrong';
      setTimeout(() => { if(this.els.feedback) this.els.feedback.className = 'feedback' }, 1500);
      return;
    }

    // Check answers
    let correctCount = 0;
    selects.forEach(select => {
      const idx = parseInt(select.getAttribute('data-index'));
      const correctAnswer = this.state.currentTextObj.answers[idx].toLowerCase();
      
      if (select.value.toLowerCase() === correctAnswer) {
        select.classList.remove('wrong');
        select.classList.add('correct');
        select.disabled = true; // Lock it if it's right
        correctCount++;
      } else {
        select.classList.remove('correct');
        select.classList.add('wrong');
        allCorrect = false;
      }
    });

    // We reached the end of checking
    if (typeof App !== 'undefined') {
        App.recordAnswer(allCorrect);
    }

    if (allCorrect) {
      // Add XP base 5 + 2 for each blank
      const xpGained = 5 + (this.state.totalBlanks * 2);
      this.state.score += xpGained;
      if (typeof App !== 'undefined') App.addXP(xpGained);
      
      this.els.feedback.textContent = `Richtig! +${xpGained} XP`;
      this.els.feedback.className = 'feedback feedback-correct';
      
      if (typeof Falcon !== 'undefined') {
          if (Falcon.onCorrect) Falcon.onCorrect();
          else if (Falcon.speak) Falcon.speak("Perfekt gemacht!");
      }

      this.els.checkBtn.style.display = 'none';
      this.els.nextBtn.style.display = 'inline-flex';
    } else {
      this.els.feedback.textContent = `${correctCount} von ${this.state.totalBlanks} richtig. Versuche es nochmal!`;
      this.els.feedback.className = 'feedback feedback-wrong';
      if (typeof Falcon !== 'undefined') {
          if (Falcon.onWrong) Falcon.onWrong();
          else if (Falcon.speak) Falcon.speak("Noch nicht ganz richtig.");
      }
    }
    
    this.updateUI();
  },

  nextRound() {
    this.state.round++;
    if (this.state.round > this.state.maxRounds) {
      this.endGame();
    } else {
      this.els.checkBtn.style.display = 'inline-flex';
      this.els.nextBtn.style.display = 'none';
      this.loadRound();
    }
  },

  endGame() {
    this.state.isActive = false;
    this.els.textContainer.innerHTML = `<div class="g3-sentence" style="text-align: center;">
      🎉<br>Spiel beendet!<br>Du hast ${this.state.score} XP gesammelt.
    </div>`;
    this.els.translation.textContent = '';
    this.els.startBtn.style.display = 'inline-flex';
    this.els.checkBtn.style.display = 'none';
    this.els.nextBtn.style.display = 'none';
    
    if (typeof Stats !== 'undefined') Stats.render();
  },

  updateUI() {
    this.els.xpDisplay.innerHTML = `⚡ ${this.state.score}`;
    let prog = (this.state.round - 1) / this.state.maxRounds * 100;
    if (!this.state.isActive && this.state.round === 1) prog = 0;
    
    this.els.progress.style.width = prog + '%';
    
    if (!this.state.isActive && this.state.round === 1 && this.state.score === 0) {
      this.els.progressLabel.textContent = `0 / ${this.state.maxRounds}`;
    } else if (this.state.round > this.state.maxRounds) {
      this.els.progressLabel.textContent = `${this.state.maxRounds} / ${this.state.maxRounds}`;
      this.els.progress.style.width = '100%';
    } else {
      this.els.progressLabel.textContent = `${this.state.round} / ${this.state.maxRounds}`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Game4.init();
});
