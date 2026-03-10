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
                saveToHistory(localMatch);
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
                saveToHistory({
                    word: isRu ? deText : text, 
                    translation: isRu ? text : ruText, 
                    category: 'search'
                });
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

    // ── Search History ──────────────────────────────
    function guessArticle(word) {
        if (!word || !/^[A-ZÄÖÜ]/.test(word)) return '';
        const lower = word.toLowerCase();
        if (/(ung|keit|heit|schaft|ion|tät|ik|ur|enz|anz|ie|ei)$/.test(lower)) return 'die';
        if (/(chen|lein|ment|um|tum|ma)$/.test(lower)) return 'das';
        if (/(ismus|ling|ig|ich)$/.test(lower)) return 'der';
        if (lower.endsWith('e')) return 'die';
        if (lower.endsWith('er')) return 'der';
        return '';
    }

    function saveToHistory(wordObj) {
        if (!wordObj || !wordObj.word) return;
        try {
            const history = JSON.parse(localStorage.getItem('DerDieDas_history') || '[]');
            // Filter out existing exact matches
            let newHistory = history.filter(w => w.word !== wordObj.word);
            // Insert at the beginning
            const newEntry = { ...wordObj };
            if (!newEntry.translation) newEntry.translation = '';
            if (!newEntry.article) newEntry.article = guessArticle(newEntry.word);
            if (!newEntry.category) newEntry.category = 'search';
            if (!newEntry.transcription && window.cyrillicTranscription) {
                 newEntry.transcription = cyrillicTranscription(newEntry.word);
            }
            newHistory.unshift(newEntry);
            // Keep maximum 50 words
            newHistory = newHistory.slice(0, 50);
            localStorage.setItem('DerDieDas_history', JSON.stringify(newHistory));
            renderSearchHistory();
        } catch (e) {
            console.error('Failed to save to history', e);
        }
    }

    function renderSearchHistory() {
        const grid = document.getElementById('history-grid');
        const clearBtn = document.getElementById('btn-clear-history');
        if (!grid) return;
        grid.innerHTML = '';

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('DerDieDas_history') || '[]');
        } catch(e) {}

        if (clearBtn) {
            clearBtn.style.display = history.length ? 'inline-flex' : 'none';
        }

        if (!history.length) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text3);padding:32px 0;">
                <i data-lucide="history" class="icon-md" style="margin-bottom:8px;opacity:0.5"></i>
                <div>${App.state.lang === 'ru' ? 'История пуста' : 'Der Suchverlauf ist leer'}</div>
            </div>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        history.forEach(word => {
            const card = document.createElement('div');
            const artClass = word.article ? (word.article + '-card') : 'no-art';
            card.className = `word-card ${artClass}`;
            
            // Try to resolve emoji if it exists in local dictionary
            let wordIcon = '';
            if (typeof getWordIcon === 'function') {
               wordIcon = getWordIcon(word);
            }
            if (!wordIcon || wordIcon === '📝') {
                if (typeof getDeterministicEmoji === 'function') {
                    wordIcon = getDeterministicEmoji(word.word);
                } else {
                    wordIcon = '📝';
                }
            }
            
            card.innerHTML = `
              <div class="art-strip"></div>
              ${wordIcon ? `<div class="card-emoji">${wordIcon}</div>` : ''}
              <div class="card-article" style="${!word.article ? 'opacity:0' : ''}">${word.article ? word.article.toUpperCase() : '\u2014'}</div>
              <div class="card-word">${word.word}</div>
              <div class="card-trans">${word.translation || ''}</div>
            `;
            
            card.addEventListener('click', () => {
                if (window.Dictionary && typeof window.Dictionary.openModal === 'function') {
                    window.Dictionary.openModal(word);
                }
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
        
        const clearBtn = document.getElementById('btn-clear-history');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if(confirm(App.state.lang === 'ru' ? 'Очистить историю поиска?' : 'Suchverlauf löschen?')) {
                    localStorage.removeItem('DerDieDas_history');
                    renderSearchHistory();
                }
            });
        }
        
        renderQuickPills();
        renderSearchHistory();
    }

    return { init, renderQuickPills, renderSearchHistory };
})();
