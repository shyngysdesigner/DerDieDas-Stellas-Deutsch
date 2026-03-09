/* ═══════════════════════════════════════════════
   falcon.js — White Falcon Mascot
   Reacts to game activity: shows speech bubbles,
   pronounces German words &  encourages the user
   ═══════════════════════════════════════════════ */

const Falcon = (() => {
    // ── Messages ────────────────────────────────────────────
    const MESSAGES = {
        idle_de: [
            'Bereit zu lernen? 🦅',
            'Wähle ein Spiel!',
            'Auf geht\'s!',
            'Heute neue Wörter?',
            'Ich zeige dir ein Wort…'
        ],
        idle_ru: [
            'Готов учиться? 🦅',
            'Выбери игру!',
            'Начнём!',
            'Новые слова сегодня?',
            'Покажу тебе слово…'
        ],
        correct_de: [
            'Perfekt! 🎉',
            'Ausgezeichnet!',
            'Weiter so!',
            'Richtig! Du kannst es!',
            'Stark! 💪'
        ],
        correct_ru: [
            'Отлично! 🎉',
            'Превосходно!',
            'Так держать!',
            'Правильно! Ты справляешься!',
            'Сильно! 💪'
        ],
        wrong_de: [
            'Nicht schlimm, weiter!',
            'Beim nächsten Mal!',
            'Ups! Aber du lernst!',
            'Versuch es nochmal!'
        ],
        wrong_ru: [
            'Ничего, вперёд!',
            'В следующий раз!',
            'Упс! Но ты учишься!',
            'Попробуй ещё раз!'
        ],
        word_de: ['Dieses Wort ist wichtig:', 'Lerne dieses Wort:', 'Hör zu:'],
        word_ru: ['Это важное слово:', 'Выучи это слово:', 'Слушай:']
    };

    let bubbleTimer = null;
    let wordCycleTimer = null;
    let isInit = false;

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ── DOM helpers ──────────────────────────────────────────
    function getBubble() { return document.getElementById('falcon-bubble'); }
    function getAvatar() { return document.getElementById('falcon-avatar'); }
    function getWordEl() { return document.getElementById('falcon-word'); }
    function getTransEl() { return document.getElementById('falcon-trans'); }
    function getTitleEl() { return document.getElementById('falcon-title'); }

    // ── Show bubble ──────────────────────────────────────────
    function showBubble(text, durationMs = 2800) {
        const b = getBubble();
        if (!b) return;
        b.textContent = text;
        b.classList.add('visible');
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => b.classList.remove('visible'), durationMs);
    }

    // ── Animate avatar ───────────────────────────────────────
    function animateSpeak(ms = 1800) {
        const av = getAvatar();
        if (!av) return;
        av.classList.add('speaking');
        setTimeout(() => av.classList.remove('speaking'), ms);
    }

    // ── Show a random word from the database ─────────────────
    function showRandomWord() {
        const words = App.state.words.filter(w => w.article && w.translation);
        if (!words.length) return;
        const word = words[Math.floor(Math.random() * words.length)];
        const lang = App.state.lang;

        const titleEl = getTitleEl();
        const wordEl = getWordEl();
        const transEl = getTransEl();
        const label = pick(MESSAGES[`word_${lang}`]);

        if (titleEl) titleEl.textContent = label;
        if (wordEl) wordEl.textContent = (word.article ? word.article + ' ' : '') + word.word;
        if (transEl) transEl.textContent = word.translation || word.translationEn || '';

        showBubble(word.word + (word.article ? ' (' + word.article + ')' : ''), 2500);
    }

    // ── Public: react to correct answer ─────────────────────
    function onCorrect() {
        const lang = App.state.lang;
        showBubble(pick(MESSAGES[`correct_${lang}`]), 2200);
        animateSpeak(600);
    }

    // ── Public: react to wrong answer ────────────────────────
    function onWrong() {
        const lang = App.state.lang;
        showBubble(pick(MESSAGES[`wrong_${lang}`]), 2200);
    }

    // ── Speak button ─────────────────────────────────────────
    function speakCurrentWord() {
        const wordEl = getWordEl();
        if (!wordEl) return;
        const text = wordEl.textContent.replace(/^(der|die|das)\s/i, '');
        if (text && text !== '—') {
            App.speak(text);
            animateSpeak(1800);
            showBubble('🔊 ' + text, 2000);
        }
    }

    // ── Next word button ─────────────────────────────────────
    function nextWord() {
        showRandomWord();
    }

    // ── Start idle word cycling ───────────────────────────────
    function startCycle() {
        showRandomWord();
        clearInterval(wordCycleTimer);
        wordCycleTimer = setInterval(() => {
            // Only cycle when the games view is active
            const gamesView = document.getElementById('games-view');
            if (gamesView && gamesView.classList.contains('active')) {
                showRandomWord();
                // Occasionally show idle message instead
                if (Math.random() < 0.3) {
                    const lang = App.state.lang;
                    setTimeout(() => showBubble(pick(MESSAGES[`idle_${lang}`]), 2200), 800);
                }
            }
        }, 8000);
    }

    // ── Init ─────────────────────────────────────────────────
    function init() {
        if (isInit) return;
        isInit = true;

        const speakBtn = document.getElementById('falcon-speak-btn');
        const nextBtn = document.getElementById('falcon-next-btn');

        if (speakBtn) speakBtn.addEventListener('click', speakCurrentWord);
        if (nextBtn) nextBtn.addEventListener('click', nextWord);

        // Show an idle bubble after a short delay
        setTimeout(() => {
            const lang = App.state.lang;
            showBubble(pick(MESSAGES[`idle_${lang}`]), 2500);
            startCycle();
        }, 800);
    }

    // ── Re-init when language changes ────────────────────────
    function updateLang() {
        const lang = App.state.lang;
        showBubble(pick(MESSAGES[`idle_${lang}`]), 2000);
    }

    return { init, onCorrect, onWrong, updateLang, showBubble, animateSpeak, speakCurrentWord, nextWord };
})();

// Export globally
window.Falcon = Falcon;
