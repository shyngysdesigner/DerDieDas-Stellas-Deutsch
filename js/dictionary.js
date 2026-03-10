/* ═══════════════════════════════════════════════
   dictionary.js — Fixed filtering + examples
   ═══════════════════════════════════════════════ */

/* ── Cyrillic phonetic transcription of German words ─────
   Maps German letter combinations to approximate Cyrillic.
   Not perfect IPA — designed for Russian speakers.        */
function cyrillicTranscription(word) {
    if (!word) return '';
    let w = word.toLowerCase();

    // Multi-char replacements first (order matters)
    const rules = [
        // Umlauts
        [/ü/g, 'ю'], [/ö/g, 'ё'], [/ä/g, 'э'],
        [/ß/g, 'сс'],
        // Digraphs
        [/sch/g, 'ш'], [/tsch/g, 'ч'], [/qu/g, 'кв'],
        [/th/g, 'т'], [/ph/g, 'ф'], [/ch/g, 'х'],
        [/ck/g, 'к'], [/ng/g, 'нг'], [/nk/g, 'нк'],
        [/pf/g, 'пф'], [/sp/g, 'шп'], [/st/g, 'шт'],
        [/ie/g, 'и'], [/ei/g, 'ай'], [/eu/g, 'ой'],
        [/au/g, 'ау'], [/äu/g, 'ой'],
        [/ew/g, 'эв'], [/ow/g, 'ов'],
        // Single vowels
        [/a/g, 'а'], [/e/g, 'э'], [/i/g, 'и'],
        [/o/g, 'о'], [/u/g, 'у'], [/y/g, 'й'],
        // Consonants
        [/b/g, 'б'], [/c/g, 'к'], [/d/g, 'д'],
        [/f/g, 'ф'], [/g/g, 'г'], [/h/g, 'х'],
        [/j/g, 'й'], [/k/g, 'к'], [/l/g, 'л'],
        [/m/g, 'м'], [/n/g, 'н'], [/p/g, 'п'],
        [/r/g, 'р'], [/s/g, 'с'], [/t/g, 'т'],
        [/v/g, 'в'], [/w/g, 'в'], [/x/g, 'кс'],
        [/z/g, 'ц'],
    ];
    for (const [pat, rep] of rules) w = w.replace(pat, rep);
    // Capitalise first letter
    return w.charAt(0).toUpperCase() + w.slice(1);
}

const Dictionary = (() => {
    let activeCategory = 'all';
    let searchQuery = '';
    let searchListenerAdded = false;
    let allCollapsed = false;
    let activeArticleFilter = null; // null means show all
    // Track which category groups are collapsed (key = category key)
    const collapsedGroups = {};

    // ── Category pills ──────────────────────────────────────
    function renderPills() {
        const container = document.getElementById('cat-pills');
        if (!container) return;
        container.querySelectorAll('.cat-pill:not([data-cat="all"])').forEach(p => p.remove());

        const cats = App.state.categories;
        Object.entries(cats).forEach(([key, meta]) => {
            const count = App.state.words.filter(w => w.category === key).length;
            if (!count) return;
            const pill = document.createElement('button');
            pill.className = 'cat-pill';
            pill.dataset.cat = key;
            const labelKey = App.state.lang === 'ru' ? 'labelRu' : 'label';
            pill.innerHTML = `<i data-lucide="${meta.icon}" class="icon-xs"></i><span>${meta[labelKey] || meta.label}</span>`;
            pill.style.setProperty('--cat-color', meta.color);
            if (key === activeCategory) pill.classList.add('active');
            container.appendChild(pill);
        });

        // Mark the "All" pill
        const allPill = container.querySelector('[data-cat="all"]');
        if (allPill) {
            allPill.classList.toggle('active', activeCategory === 'all');
        }

        // Attach click listeners freshly
        container.querySelectorAll('.cat-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.dataset.cat;
                container.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                renderGrid();
            });
        });

        if (window.lucide) lucide.createIcons();
    }

    // ── Word grid with collapsible category groups ───────────
    function renderGrid() {
        const grid = document.getElementById('dict-grid');
        if (!grid) return;
        grid.innerHTML = '';

        let words = [...App.state.words];

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            words = words.filter(w =>
                w.word.toLowerCase().includes(q) ||
                (w.translation && w.translation.toLowerCase().includes(q)) ||
                (w.translationEn && w.translationEn.toLowerCase().includes(q))
            );
        }

        // Category filter
        if (activeCategory && activeCategory !== 'all') {
            words = words.filter(w => w.category === activeCategory);
        }

        // Article filter
        if (activeArticleFilter) {
            words = words.filter(w => w.article === activeArticleFilter);
        }

        if (!words.length) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text3);padding:48px 0;font-weight:500">Keine Ergebnisse</div>';
            return;
        }

        // Group by category
        const groups = {};
        words.forEach(w => {
            if (!groups[w.category]) groups[w.category] = [];
            groups[w.category].push(w);
        });

        const cats = App.state.categories;
        const groupKeys = activeCategory === 'all' ? Object.keys(cats) : [activeCategory];

        groupKeys.forEach(catKey => {
            const catWords = groups[catKey];
            if (!catWords || !catWords.length) return;
            const meta = cats[catKey] || { label: catKey, labelRu: catKey, icon: 'tag', color: '#6366F1' };
            const labelKey = App.state.lang === 'ru' ? 'labelRu' : 'label';
            const isCollapsed = !!collapsedGroups[catKey];

            // ── Category group header (clickable) ──
            const header = document.createElement('div');
            header.className = 'cat-group-header cat-group-toggle' + (isCollapsed ? ' collapsed' : '');
            header.setAttribute('data-cat', catKey);
            header.innerHTML = `
              <div class="cat-group-icon" style="background:${meta.color}22">
                <i data-lucide="${meta.icon}" style="color:${meta.color};width:17px;height:17px"></i>
              </div>
              <span class="cat-group-title">${meta[labelKey] || meta.label}</span>
              <span class="cat-group-count">${catWords.length}</span>
              <span class="cat-group-chevron">
                <i data-lucide="chevron-down" style="width:16px;height:16px"></i>
              </span>
            `;
            grid.appendChild(header);

            // ── Cards wrapper (collapses) ──
            const wrapper = document.createElement('div');
            wrapper.className = 'cat-group-body' + (isCollapsed ? ' collapsed' : '');
            wrapper.dataset.groupKey = catKey;

            // Word cards
            catWords.forEach(word => {
                const card = document.createElement('div');
                const artClass = word.article ? (word.article + '-card') : 'no-art';
                card.className = `word-card ${artClass}`;
                const wordIcon = (typeof getWordIcon === 'function') ? getWordIcon(word) : '';
                card.innerHTML = `
                  <div class="art-strip"></div>
                  ${wordIcon ? `<div class="card-emoji">${wordIcon}</div>` : ''}
                  <div class="card-article">${word.article ? word.article.toUpperCase() : '\u2014'}</div>
                  <div class="card-word">${word.word}</div>
                  <div class="card-trans">${word.translation || word.translationEn || ''}</div>
                `;
                card.addEventListener('click', () => openModal(word));
                wrapper.appendChild(card);
            });
            grid.appendChild(wrapper);

            // Toggle click
            header.addEventListener('click', () => {
                const key = header.dataset.cat;
                collapsedGroups[key] = !collapsedGroups[key];
                header.classList.toggle('collapsed', !!collapsedGroups[key]);
                wrapper.classList.toggle('collapsed', !!collapsedGroups[key]);
                if (window.lucide) lucide.createIcons();
            });
        });

        if (window.lucide) lucide.createIcons();
    }

    // ── Rich example sentences by category ─────────────────
    function getExamples(word) {
        const examples = [];

        // Primary example from data
        if (word.example && word.example.trim()) {
            examples.push({ de: word.example, ru: word.exampleTranslation || '' });
        }

        const cat = word.category;
        const w = word.word;
        const tr = word.translation || '';

        // Safe lowercasing: German nouns must stay capitalized in the middle of a sentence
        const wLower = word.article ? w : w.toLowerCase();
        // Russian words are usually fully lowercase in the middle of a sentence
        const trLower = tr.toLowerCase();

        // ── SENTENCES category: show extended usage patterns ──
        if (cat === 'sentences') {
            const sentenceExtras = {
                'Was ist\u2026?': [
                    { de: 'Was ist dein Name?', ru: 'Как тебя зовут?' },
                    { de: 'Was ist das auf Deutsch?', ru: 'Как это по-немецки?' },
                    { de: 'Was ist passiert?', ru: 'Что случилось?' },
                    { de: 'Was ist deine Adresse?', ru: 'Какой твой адрес?' },
                ],
                'Wo ist \u2026?': [
                    { de: 'Wo ist die Toilette?', ru: 'Где туалет?' },
                    { de: 'Wo ist das nächste Hotel?', ru: 'Где ближайший отель?' },
                    { de: 'Wo ist mein Koffer?', ru: 'Где мой чемодан?' },
                    { de: 'Wo ist der Ausgang?', ru: 'Где выход?' },
                ],
                'Wie \u2026?': [
                    { de: 'Wie spät ist es?', ru: 'Который час?' },
                    { de: 'Wie weit ist es?', ru: 'Как далеко это?' },
                    { de: 'Wie hei\u00dfen Sie?', ru: 'Как вас зовут?' },
                    { de: 'Wie kann ich helfen?', ru: 'Как я могу помочь?' },
                ],
                'Ich h\u00e4tte gerne \u2026': [
                    { de: 'Ich hätte gerne ein Zimmer.', ru: 'Я бы хотел(а) номер.' },
                    { de: 'Ich hätte gerne die Speisekarte.', ru: 'Можно мне меню?' },
                    { de: 'Ich hätte gerne etwas zu trinken.', ru: 'Я бы хотел(а) что-нибудь выпить.' },
                    { de: 'Ich hätte gerne die Rechnung.', ru: 'Пожалуйста, счёт.' },
                ],
                'Ich brauche \u2026': [
                    { de: 'Ich brauche einen Arzt.', ru: 'Мне нужен врач.' },
                    { de: 'Ich brauche ein Taxi.', ru: 'Мне нужно такси.' },
                    { de: 'Ich brauche mehr Zeit.', ru: 'Мне нужно больше времени.' },
                    { de: 'Ich brauche Wasser, bitte.', ru: 'Мне нужна вода, пожалуйста.' },
                ],
                'Gibt es \u2026?': [
                    { de: 'Gibt es einen Parkplatz?', ru: 'Есть ли парковка?' },
                    { de: 'Gibt es etwas Billiges?', ru: 'Есть ли что-то дешевле?' },
                    { de: 'Gibt es WLAN hier?', ru: 'Есть ли здесь Wi-Fi?' },
                    { de: 'Gibt es vegetarische Gerichte?', ru: 'Есть ли вегетарианские блюда?' },
                ],
                'Wie viel kostet es?': [
                    { de: 'Wie viel kostet das Zimmer?', ru: 'Сколько стоит номер?' },
                    { de: 'Wie viel kostet die Fahrkarte?', ru: 'Сколько стоит билет?' },
                    { de: 'Wie viel kostet das insgesamt?', ru: 'Сколько стоит всё вместе?' },
                    { de: 'Wie viel kostet der Eintritt?', ru: 'Сколько стоит вход?' },
                ],
                'Wie lange dauert es?': [
                    { de: 'Wie lange dauert der Flug?', ru: 'Сколько лететь на самолёте?' },
                    { de: 'Wie lange dauert die Wartezeit?', ru: 'Сколько ждать?' },
                    { de: 'Wie lange dauert der Kurs?', ru: 'Сколько длится курс?' },
                    { de: 'Wie lange dauert die Reparatur?', ru: 'Сколько длится ремонт?' },
                ],
                'Kein Problem!': [
                    { de: 'Das ist kein Problem.', ru: 'Это не проблема.' },
                    { de: 'Kein Problem, ich helfe gerne!', ru: 'Нет проблем, я рад помочь!' },
                    { de: 'Das schaffe ich, kein Problem.', ru: 'Я справлюсь, нет проблем.' },
                ],
            };
            // Find extras by matching start of word
            const key = Object.keys(sentenceExtras).find(k => w.startsWith(k.split(' ')[0]));
            if (key && sentenceExtras[key]) {
                sentenceExtras[key].forEach(e => { if (examples.length < 5) examples.push(e); });
            }
        }

        // ── ADJECTIVE category: avoid incorrect comparatives/endings ──
        else if (cat === 'adjective') {
            if (examples.length < 2) examples.push({ de: `Das ist sehr ${wLower}.`, ru: `Это очень ${trLower}.` });
            if (examples.length < 3) examples.push({ de: `Ist das ${wLower}?`, ru: `Это ${trLower}?` });
            if (examples.length < 4) examples.push({ de: `Wie ${wLower} ist das?`, ru: `Насколько это ${trLower}?` });
            if (examples.length < 5) examples.push({ de: `Das sieht ${wLower} aus.`, ru: `Это выглядит ${trLower}.` });
        }

        // ── TIME category: fix syntax and capitalization ──
        else if (cat === 'time') {
            const timeExtras = {
                'heute': [
                    { de: 'Heute ist schönes Wetter.', ru: 'Сегодня хорошая погода.' },
                    { de: 'Ich bin heute müde.', ru: 'Сегодня я устал(а).' },
                    { de: 'Was machst du heute?', ru: 'Что ты делаешь сегодня?' },
                    { de: 'Heute gehe ich einkaufen.', ru: 'Сегодня я иду за покупками.' },
                ],
                'morgen': [
                    { de: 'Morgen haben wir frei.', ru: 'Завтра у нас выходной.' },
                    { de: 'Bis morgen!', ru: 'До завтра!' },
                    { de: 'Morgen früh fliege ich ab.', ru: 'Завтра утром я вылетаю.' },
                    { de: 'Was machen wir morgen?', ru: 'Что мы будем делать завтра?' },
                ],
                'gestern': [
                    { de: 'Gestern war ich krank.', ru: 'Вчера я был(а) болен/больна.' },
                    { de: 'Gestern haben wir gearbeitet.', ru: 'Вчера мы работали.' },
                    { de: 'Was hast du gestern gemacht?', ru: 'Что ты делал(а) вчера?' },
                    { de: 'Gestern war das Wetter schlecht.', ru: 'Вчера была плохая погода.' },
                ],
                'jetzt': [
                    { de: 'Was machst du jetzt?', ru: 'Что ты делаешь сейчас?' },
                    { de: 'Jetzt bin ich fertig.', ru: 'Теперь я готов(а).' },
                    { de: 'Komm jetzt bitte her.', ru: 'Подойди сюда сейчас.' },
                    { de: 'Jetzt oder nie!', ru: 'Сейчас или никогда!' },
                ],
                'später': [
                    { de: 'Ich komme später.', ru: 'Я приду позже.' },
                    { de: 'Bis später!', ru: 'До встречи!' },
                    { de: 'Wir sprechen später darüber.', ru: 'Поговорим об этом позже.' },
                    { de: 'Später gehen wir essen.', ru: 'Позже мы пойдём поесть.' },
                ],
                'immer': [
                    { de: 'Er ist immer nett.', ru: 'Он всегда приветлив.' },
                    { de: 'Ich trinke immer Kaffee.', ru: 'Я всегда пью кофе.' },
                    { de: 'Das macht sie immer.', ru: 'Она всегда так делает.' },
                ],
                'nie': [
                    { de: 'Ich schlafe nie lang.', ru: 'Я никогда не сплю долго.' },
                    { de: 'Das tue ich nie wieder!', ru: 'Я больше никогда так не сделаю!' },
                    { de: 'Er lügt nie.', ru: 'Он никогда не лжёт.' },
                ],
            };
            const key = w.toLowerCase();
            if (timeExtras[key]) {
                timeExtras[key].forEach(e => { if (examples.length < 5) examples.push(e); });
            } else {
                // Generic pattern for other time words
                const capW = w.charAt(0).toUpperCase() + w.slice(1);
                const capTr = tr.charAt(0).toUpperCase() + tr.slice(1);
                if (examples.length < 2) examples.push({ de: `${capW} bin ich zu Hause.`, ru: `${capTr} я дома.` });
                if (examples.length < 3) examples.push({ de: `Ich komme ${wLower} zurück.`, ru: `Я вернусь ${trLower}.` });
                if (examples.length < 4) examples.push({ de: `Was machst du ${wLower}?`, ru: `Что ты делаешь ${trLower}?` });
            }
        }

        // ── VERB category: ensure Russian translations are natural ──
        else if (cat === 'verb') {
            const inf = wLower; // infinitive e.g. 'essen'
            const ruInf = trLower;
            if (examples.length < 2) examples.push({ de: `Ich möchte ${inf}.`, ru: `Я хочу ${ruInf}.` });
            if (examples.length < 3) examples.push({ de: `Kannst du ${inf}?`, ru: `Ты умеешь / можешь ${ruInf}?` });
            if (examples.length < 4) examples.push({ de: `Lass uns ${inf}!`, ru: `Давай ${ruInf}!` });
            if (examples.length < 5) examples.push({ de: `Es ist Zeit zu ${inf}.`, ru: `Пора ${ruInf}.` });
        }

        // ── NOUN category: Avoid accusative/dative issues in auto-generated Russian ──
        else if (word.article) {
            const art = word.article; // der, die, das
            // nominative templates ensure Russian noun stays in dictionary form
            if (examples.length === 0) {
                examples.push({ de: `${art.charAt(0).toUpperCase()}${art.slice(1)} ${w}.`, ru: `${tr.charAt(0).toUpperCase()}${tr.slice(1)}.` });
            }
            if (examples.length < 2) examples.push({ de: `Hier ist ${art} ${w}.`, ru: `Вот ${trLower}.` });
            if (examples.length < 3) examples.push({ de: `Wo ist ${art} ${w}?`, ru: `Где ${trLower}?` });
            if (examples.length < 4) examples.push({ de: `Ist das ${art === 'der' ? 'ein' : art === 'das' ? 'ein' : 'eine'} ${w}?`, ru: `Это ${trLower}?` });
            if (examples.length < 5) examples.push({ de: `Das ist kein ${art === 'die' ? 'e' : ''} ${w}.`, ru: `Это не ${trLower}.` });
        }

        // ── Fallback for other no-article words ──
        else {
            if (examples.length === 0) examples.push({ de: w, ru: tr });
            if (examples.length < 2) examples.push({ de: `Das ist ${wLower}.`, ru: `Это ${trLower}.` });
        }

        return examples.slice(0, 5);
    }

    // ── Modal ────────────────────────────────────────────────
    function openModal(word) {
        const overlay = document.getElementById('word-modal');
        const pills = overlay.querySelector('.article-pill');
        const artClass = word.article || 'none';
        pills.className = `article-pill ${artClass}`;
        pills.textContent = word.article ? word.article.toUpperCase() : '—';

        const meta = App.state.categories[word.category] || {};
        const labelKey = App.state.lang === 'ru' ? 'labelRu' : 'label';
        overlay.querySelector('#modal-cat-chip').textContent = meta[labelKey] || meta.label || word.category;
        overlay.querySelector('#modal-word').textContent = word.word;
        overlay.querySelector('#modal-trans').textContent = word.translation || '';
        // Cyrillic transcription
        const transcEl = overlay.querySelector('#modal-transcription');
        if (transcEl) {
            const existing = word.transcription && word.transcription.trim();
            transcEl.textContent = existing || ('[' + cyrillicTranscription(word.word) + ']');
        }

        // ── Animated scene ────────────────────────────────────
        const sceneWrap = document.getElementById('modal-scene-wrap');
        if (sceneWrap && typeof WordScenes !== 'undefined') {
            sceneWrap.innerHTML = WordScenes.getSceneHTML(word);
        }

        // Build examples
        const examplesContainer = overlay.querySelector('#modal-examples-list');
        if (examplesContainer) {
            examplesContainer.innerHTML = '';
            const exs = getExamples(word);
            exs.forEach((ex, i) => {
                const item = document.createElement('div');
                item.className = 'modal-example-item';
                item.innerHTML = `
                  <div class="modal-example-de">${ex.de}</div>
                  ${ex.ru ? `<div class="modal-example-ru">${ex.ru}</div>` : ''}
                  <button class="modal-example-tts" data-text="${ex.de.replace(/"/g, "'")}" title="Aussprechen">
                    <i data-lucide="volume-2" style="width:13px;height:13px"></i>
                  </button>
                `;
                // TTS
                item.querySelector('.modal-example-tts').addEventListener('click', e => {
                    e.stopPropagation();
                    App.speak(ex.de);
                });
                // Phrase reaction: clicking sentence triggers scene animation
                item.addEventListener('click', () => {
                    // Highlight active phrase
                    examplesContainer.querySelectorAll('.modal-example-item').forEach(el =>
                        el.classList.remove('phrase-active'));
                    item.classList.add('phrase-active');
                    if (typeof WordScenes !== 'undefined') {
                        WordScenes.triggerPhraseReaction(ex.de);
                    }
                });
                examplesContainer.appendChild(item);
            });
        }

        // Main TTS buttons
        const ttsWord = overlay.querySelector('#btn-tts');
        const close = overlay.querySelector('#btn-close-modal');
        const closeTop = overlay.querySelector('#btn-close-modal-top');
        const newTtsWord = ttsWord.cloneNode(true);
        const newClose = close.cloneNode(true);
        ttsWord.replaceWith(newTtsWord);
        close.replaceWith(newClose);

        if (closeTop) {
            const newCloseTop = closeTop.cloneNode(true);
            closeTop.replaceWith(newCloseTop);
            newCloseTop.addEventListener('click', closeModal);
        }

        newTtsWord.addEventListener('click', () => App.speak(word.word));
        newClose.addEventListener('click', closeModal);

        overlay.classList.add('open');
        overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); }, { once: true });

        if (window.lucide) lucide.createIcons();
        setTimeout(() => App.speak(word.word), 320);
    }

    function closeModal() {
        document.getElementById('word-modal').classList.remove('open');
        speechSynthesis.cancel();
    }

    // ── Public render (called once on init + on lang change) ─
    function render() {
        renderPills();
        renderGrid();

        // Attach search listeners only once
        if (!searchListenerAdded) {
            const inputEl = document.getElementById('dict-search');
            const clearEl = document.getElementById('dict-search-clear');

            if (inputEl) {
                inputEl.addEventListener('input', () => {
                    searchQuery = inputEl.value.trim();
                    if (clearEl) clearEl.style.display = searchQuery ? 'flex' : 'none';
                    renderGrid();
                });
            }
            if (clearEl) {
                clearEl.addEventListener('click', () => {
                    if (inputEl) inputEl.value = '';
                    searchQuery = '';
                    clearEl.style.display = 'none';
                    renderGrid();
                });
            }

            const foldAllBtn = document.getElementById('btn-fold-all');
            if (foldAllBtn) {
                foldAllBtn.addEventListener('click', () => {
                    allCollapsed = !allCollapsed;
                    const cats = App.state.categories || {};
                    Object.keys(cats).forEach(k => {
                        collapsedGroups[k] = allCollapsed;
                    });

                    const refNode = document.getElementById('icon-fold');
                    if (refNode) {
                        refNode.outerHTML = `<i data-lucide="${allCollapsed ? 'unfold-vertical' : 'fold-vertical'}" id="icon-fold" class="icon-sm" style="width: 16px; height: 16px;"></i>`;
                    }

                    renderGrid();
                });
            }

            const articleBtns = document.querySelectorAll('.badge-btn');
            articleBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const article = btn.dataset.article;
                    if (activeArticleFilter === article) {
                        activeArticleFilter = null;
                        btn.classList.remove('active');
                    } else {
                        activeArticleFilter = article;
                        articleBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                    renderGrid();
                });
            });

            searchListenerAdded = true;
            setupSwipeToClose();
        }
    }

    function setupSwipeToClose() {
        const overlay = document.getElementById('word-modal');
        const sheet = overlay.querySelector('.modal-sheet');
        if (!sheet) return;

        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        sheet.addEventListener('touchstart', (e) => {
            if (sheet.scrollTop > 0) return;
            startY = e.touches[0].clientY;
            isDragging = true;
            sheet.style.transition = 'none';
        }, { passive: true });

        sheet.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const y = e.touches[0].clientY;
            currentY = Math.max(0, y - startY);
            if (currentY > 0) {
                if (e.cancelable) e.preventDefault();
                sheet.style.transform = `translateY(${currentY}px)`;
            }
        }, { passive: false });

        sheet.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            sheet.style.transition = '';

            if (currentY > 100) {
                closeModal();
            }
            sheet.style.transform = '';
            currentY = 0;
        });
    }

    return { render, openModal, renderGrid, getExamples };
})();
