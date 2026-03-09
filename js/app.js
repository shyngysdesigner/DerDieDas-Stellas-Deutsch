/* ═══════════════════════════════════════════════════════
   app.js — Core: Router · State · i18n · Theme · TTS
   ═══════════════════════════════════════════════════════ */

const App = (() => {
    // ── i18n strings ───────────────────────────────────────
    const STRINGS = {
        de: {
            all: 'Alle', vocab: 'Vokabeln', 'translate-short': 'Übersetzer',
            games: 'Spiele', statistics: 'Statistik',
            translator: 'Übersetzer', 'translator-sub': 'DE / RU',
            'input-word': 'Deutsches oder russisches Wort:',
            translate: 'Übersetzen', 'from-files': 'Schnellauswahl:',
            'your-files': 'Deine Dateien',
            'games-sub': '3 verfügbar',
            'g1-title': 'Tower Defense', 'g1-desc': 'Ziehe Wörter auf den richtigen Turm', 'g1-title-tag': 'Spiel 1 · Empfohlen',
            'g2-title': 'Elixir Rush', 'g2-desc': 'Wähle den Artikel — schnell!',
            'g3-title': 'Focus Mode', 'g3-desc': 'Fülle den Artikel im Satz ein',
            masc: 'männlich', fem: 'weiblich', neut: 'neutral',
            'drag-hint': 'Ziehe die Karte zum richtigen Turm',
            'g2-press-start': 'Drücke Start',
            'g3-press-start': 'Drücke Start',
            start: 'Spiel starten', word: 'Wort',
            'choose-article': 'Wähle den richtigen Artikel:',
            'next-level': 'Nächstes Level', 'total-xp': 'Gesamt XP',
            streak: 'Streak', accuracy: 'Genauigkeit', 'words-count': 'Wörter',
            'article-dist': 'Artikel-Verteilung', reset: 'Zurücksetzen',
            'listen-word': 'Wort hören', 'listen-sentence': 'Satz hören',
            loading: 'Übersetzung wird geladen…',
            'game-over': 'Spiel vorbei', score: 'Punkte',
            'play-again': 'Nochmal', 'to-games': 'Zu den Spielen',
            correct: 'Richtig!', wrong: 'Falsch!',
        },
        ru: {
            all: 'Все', vocab: 'Словарь', 'translate-short': 'Перевод',
            games: 'Игры', statistics: 'Статистика',
            translator: 'Переводчик', 'translator-sub': 'DE / RU',
            'input-word': 'Немецкое или русское слово:',
            translate: 'Перевести', 'from-files': 'Быстрый выбор:',
            'your-files': 'Твои файлы',
            'games-sub': '3 доступных',
            'g1-title': 'Защита башни', 'g1-desc': 'Перетащи слово на нужную башню', 'g1-title-tag': 'Игра 1 · Рекомендуем',
            'g2-title': 'Эликсир Раш', 'g2-desc': 'Выбери артикль — быстро!',
            'g3-title': 'Режим фокуса', 'g3-desc': 'Вставь артикль в предложение',
            masc: 'мужской', fem: 'женский', neut: 'средний',
            'drag-hint': 'Перетащи карточку на нужную башню',
            'g2-press-start': 'Жми Старт',
            'g3-press-start': 'Жми Старт',
            start: 'Начать', word: 'Слово',
            'choose-article': 'Выбери правильный артикль:',
            'next-level': 'Следующий уровень', 'total-xp': 'Всего XP',
            streak: 'Серия', accuracy: 'Точность', 'words-count': 'Слова',
            'article-dist': 'Распределение артиклей', reset: 'Сбросить',
            'listen-word': 'Слушать слово', 'listen-sentence': 'Слушать пример',
            loading: 'Загрузка перевода…',
            'game-over': 'Игра окончена', score: 'Очки',
            'play-again': 'Ещё раз', 'to-games': 'К играм',
            correct: 'Правильно!', wrong: 'Неверно!',
        }
    };

    // ── State ───────────────────────────────────────────────
    const state = {
        words: [],
        categories: {},
        xp: 0,
        streak: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        lang: 'de',    // 'de' | 'ru'
        theme: 'light', // 'light' | 'dark'
        xpHistory: [],  // [{date:'YYYY-MM-DD', xp:N, correct:N, attempts:N}]
        sessionStart: Date.now()
    };

    // ── Persistence ────────────────────────────────────────
    function loadStorage() {
        try {
            const s = JSON.parse(localStorage.getItem('derdiedas') || '{}');
            state.xp = s.xp || 0;
            state.streak = s.streak || 0;
            state.totalCorrect = s.totalCorrect || 0;
            state.totalAttempts = s.totalAttempts || 0;
            state.lang = s.lang || 'de';
            state.theme = s.theme || 'light';
            state.xpHistory = s.xpHistory || [];
        } catch (e) { }
    }

    function saveStorage() {
        localStorage.setItem('derdiedas', JSON.stringify({
            xp: state.xp, streak: state.streak,
            totalCorrect: state.totalCorrect, totalAttempts: state.totalAttempts,
            lang: state.lang, theme: state.theme,
            xpHistory: state.xpHistory
        }));
    }

    // Record today's snapshot into history (called after each answer)
    function recordDailySnapshot() {
        const today = new Date().toISOString().slice(0, 10);
        const last = state.xpHistory[state.xpHistory.length - 1];
        if (last && last.date === today) {
            last.xp = state.xp;
            last.correct = state.totalCorrect;
            last.attempts = state.totalAttempts;
        } else {
            state.xpHistory.push({ date: today, xp: state.xp, correct: state.totalCorrect, attempts: state.totalAttempts });
            // Keep only last 30 days
            if (state.xpHistory.length > 30) state.xpHistory = state.xpHistory.slice(-30);
        }
    }

    // ── Router ──────────────────────────────────────────────
    function navigate(view) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const viewEl = document.getElementById(view + '-view');
        if (viewEl) viewEl.classList.add('active');
        const tabBtn = document.querySelector(`[data-view="${view}"]`);
        if (tabBtn) tabBtn.classList.add('active');
        if (view === 'stats') Stats.render();
        if (view === 'games' && window.Falcon) Falcon.init();
        // Re-init lucide icons in the new view
        if (window.lucide) lucide.createIcons();
    }

    // ── TTS ─────────────────────────────────────────────────
    function speak(text, lang = 'de-DE') {
        if (!window.speechSynthesis) return;
        speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang;
        utt.rate = 0.82;
        utt.pitch = 1.05;

        // Pick best available voice
        const voices = speechSynthesis.getVoices();
        const prefer = [
            'Google Deutsch', 'Microsoft Conrad Online', 'Microsoft Hedda Online',
            'Anna', 'Google Deutsch', 'de-DE'
        ];
        let chosen = null;
        for (const name of prefer) {
            const v = voices.find(v => v.name.includes(name) || v.lang === name);
            if (v) { chosen = v; break; }
        }
        if (!chosen) {
            chosen = voices.find(v => v.lang && v.lang.startsWith('de'));
        }
        if (chosen) utt.voice = chosen;
        speechSynthesis.speak(utt);
    }

    // ── i18n ────────────────────────────────────────────────
    function t(key) {
        return (STRINGS[state.lang] || STRINGS.de)[key] || key;
    }

    function applyLang() {
        document.documentElement.lang = state.lang === 'de' ? 'de' : 'ru';
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const str = t(key);
            if (str) el.textContent = str;
        });
        // Search placeholder
        const si = document.getElementById('dict-search');
        if (si) si.placeholder = state.lang === 'de' ? 'Suchen… / Search…' : 'Поиск…';
        // Lang chip
        const chip = document.getElementById('lang-label');
        if (chip) chip.textContent = state.lang === 'de' ? 'RU' : 'DE';
    }

    function toggleLang() {
        state.lang = state.lang === 'de' ? 'ru' : 'de';
        saveStorage();
        applyLang();
        Dictionary.render();
        if (window.Falcon) Falcon.updateLang();
        if (window.lucide) lucide.createIcons();
    }

    // ── Theme ────────────────────────────────────────────────
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.setAttribute('data-lucide', state.theme === 'dark' ? 'moon' : 'sun');
            if (window.lucide) lucide.createIcons();
        }
    }

    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        saveStorage();
        applyTheme();
    }

    // ── XP ──────────────────────────────────────────────────
    function addXP(amount) {
        state.xp += amount;
        saveStorage();
        const el = document.getElementById('nav-score-val');
        if (el) {
            el.textContent = state.xp;
            el.parentElement.classList.add('pop');
            setTimeout(() => el.parentElement.classList.remove('pop'), 350);
        }
    }

    function recordAnswer(correct) {
        state.totalAttempts++;
        if (correct) {
            state.totalCorrect++;
            state.streak++;
        } else {
            state.streak = 0;
        }
        recordDailySnapshot();
        saveStorage();
    }

    // ── Data load ────────────────────────────────────────────
    async function loadData() {
        // Use inline WORDS_DATA global (from words-data.js)
        // Falls back to fetching words.json if WORDS_DATA is not available
        if (typeof WORDS_DATA !== 'undefined') {
            state.words = WORDS_DATA.words || [];
            state.categories = WORDS_DATA.categories || {};
        } else {
            try {
                const r = await fetch('data/words.json');
                const data = await r.json();
                state.words = data.words || [];
                state.categories = data.categories || {};
            } catch (e) {
                console.warn('Could not load words.json:', e);
            }
        }
    }

    // ── Init ─────────────────────────────────────────────────
    async function init() {
        loadStorage();
        applyTheme();

        await loadData();

        // Update XP display
        const xpEl = document.getElementById('nav-score-val');
        if (xpEl) xpEl.textContent = state.xp;

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => navigate(btn.dataset.view));
        });

        // Theme toggle
        document.getElementById('btn-theme').addEventListener('click', toggleTheme);

        // Lang toggle
        document.getElementById('btn-lang').addEventListener('click', toggleLang);

        // Init Lucide
        if (window.lucide) lucide.createIcons();

        // Start at home
        navigate('home');
        applyLang();

        Dictionary.render();
        Translator.init();
        Game1.init();
        Game2.init();
        Game3.init();
        if (typeof Falcon !== 'undefined') Falcon.init();
    }

    document.addEventListener('DOMContentLoaded', init);

    return { state, navigate, speak, t, addXP, recordAnswer, applyLang, recordDailySnapshot };
})();
