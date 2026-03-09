/* ═══════════════════════════════════════════════
   translator.js — DE ↔ RU Translation
   Uses MyMemory free API (no key required)
   ═══════════════════════════════════════════════ */

const Translator = (() => {

    // Detect if text is Cyrillic (Russian)
    function isCyrillic(text) {
        return /[\u0400-\u04ff]/.test(text);
    }

    // ── MyMemory API call ──────────────────────
    async function translateText(text, fromLang, toLang) {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
        const r = await fetch(url);
        const data = await r.json();
        if (data.responseStatus === 200) {
            return data.responseData.translatedText || '';
        }
        throw new Error(data.responseDetails || 'Translation failed');
    }

    // ── Translate button handler ────────────────────
    async function doTranslate() {
        const input = document.getElementById('trans-input');
        const text = (input ? input.value : '').trim();
        if (!text) return;

        const loading = document.getElementById('trans-loading');
        const result = document.getElementById('trans-result');
        loading.classList.remove('hidden');
        result.classList.add('hidden');

        try {
            const isRu = isCyrillic(text);
            let deText = '', ruText = '', note = '';

            // Search local dictionary first (German word OR Russian translation)
            const localMatch = App.state.words.find(w => {
                if (isRu) return w.translation && w.translation.toLowerCase().includes(text.toLowerCase());
                return w.word && w.word.toLowerCase() === text.toLowerCase();
            });

            if (localMatch) {
                deText = (localMatch.article ? localMatch.article + ' ' : '') + localMatch.word;
                ruText = localMatch.translation || '';
                note = '\u2713 ' + (App.state.lang === 'ru' ? '\u041d\u0430\u0439\u0434\u0435\u043d\u043e \u0432 \u0441\u043b\u043e\u0432\u0430\u0440\u0435' : 'Aus deinem W\u00f6rterbuch');
            } else {
                // API: auto-detect direction
                if (isRu) {
                    deText = await translateText(text, 'ru', 'de');
                    ruText = text;
                } else {
                    deText = text;
                    ruText = await translateText(text, 'de', 'ru');
                }
                note = App.state.lang === 'ru' ? '\u2756 \u041f\u0435\u0440\u0435\u0432\u0435\u0434\u0435\u043d\u043e \u043e\u043d\u043b\u0430\u0439\u043d' : '\u2756 Online \u00fcbersetzt';
            }

            document.getElementById('trans-de').textContent = deText;
            document.getElementById('trans-ru').textContent = ruText;
            document.getElementById('trans-note').textContent = note;

            // TTS for German result
            const ttsDe = document.getElementById('trans-tts-de');
            ttsDe.onclick = () => App.speak(deText);

            loading.classList.add('hidden');
            result.classList.remove('hidden');
        } catch (err) {
            loading.classList.add('hidden');
            document.getElementById('trans-de').textContent = '\u2014';
            document.getElementById('trans-ru').textContent = err.message;
            document.getElementById('trans-note').textContent = '';
            result.classList.remove('hidden');
        }
    }

    // ── Quick pills: show German words ──────────────
    function renderQuickPills() {
        const container = document.getElementById('trans-quick-pills');
        if (!container) return;
        container.innerHTML = '';
        // Show 30 random German words (hover shows Russian meaning)
        const words = App.state.words.filter(w => w.word);
        const sample = words.sort(() => Math.random() - .5).slice(0, 30);
        sample.forEach(w => {
            const btn = document.createElement('button');
            btn.className = 'trans-quick-pill';
            const display = (w.article ? w.article + ' ' : '') + w.word;
            btn.textContent = display;
            btn.title = w.translation || '';
            btn.addEventListener('click', () => {
                const input = document.getElementById('trans-input');
                if (input) input.value = w.word;
                doTranslate();
            });
            container.appendChild(btn);
        });
    }

    // ── CSV categories browsable grid ───────────────
    function renderCsvGrid() {
        const grid = document.getElementById('csv-cat-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const cats = App.state.categories;
        Object.entries(cats).forEach(([key, meta]) => {
            const words = App.state.words.filter(w => w.category === key);
            if (!words.length) return;
            const labelKey = App.state.lang === 'ru' ? 'labelRu' : 'label';

            const card = document.createElement('div');
            card.className = 'csv-cat-card';
            card.innerHTML = `
        <div class="csv-cat-header">
          <div class="csv-cat-icon" style="background:${meta.color}22">
            <i data-lucide="${meta.icon}" style="color:${meta.color};width:18px;height:18px"></i>
          </div>
          <div>
            <div class="csv-cat-title">${meta[labelKey] || meta.label}</div>
            <div class="csv-cat-count">${words.length} ${App.state.lang === 'ru' ? '\u0441\u043b\u043e\u0432' : 'W\u00f6rter'}</div>
          </div>
          <i data-lucide="chevron-down" class="icon-sm csv-cat-expand"></i>
        </div>
        <div class="csv-cat-words">
          ${words.map(w => {
                const art = w.article ? `${w.article} ` : '';
                const chip_class = w.article ? 'csv-word-chip has-article' : 'csv-word-chip';
                const display = `${art}${w.word}`;
                const trans = w.translation ? ` \u2014 ${w.translation}` : '';
                return `<span class="${chip_class}">${display}${trans}</span>`;
            }).join('')}
        </div>
      `;
            card.querySelector('.csv-cat-header').addEventListener('click', () => {
                card.classList.toggle('open');
                if (window.lucide) lucide.createIcons();
            });
            grid.appendChild(card);
        });
        if (window.lucide) lucide.createIcons();
    }

    // ── Init ────────────────────────────────────────
    function init() {
        const btn = document.getElementById('btn-translate');
        if (btn) btn.addEventListener('click', doTranslate);

        const input = document.getElementById('trans-input');
        if (input) {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') doTranslate();
            });
        }
        renderQuickPills();
        renderCsvGrid();
    }

    return { init, renderQuickPills, renderCsvGrid };
})();
