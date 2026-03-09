/* ═══════════════════════════════════════════════
   stats.js — Statistics view with Canvas charts
   ═══════════════════════════════════════════════ */

const Stats = (() => {
    const LEVELS = [
        { xp: 0, name: 'Anfänger' },
        { xp: 100, name: 'A1' },
        { xp: 300, name: 'A2' },
        { xp: 600, name: 'B1' },
        { xp: 1000, name: 'B2' },
        { xp: 1500, name: 'C1' },
        { xp: 2500, name: 'C2' },
    ];

    function getLevel(xp) {
        let level = LEVELS[0];
        for (const l of LEVELS) { if (xp >= l.xp) level = l; }
        return level;
    }
    function getNextLevel(xp) {
        return LEVELS.find(l => l.xp > xp) || null;
    }

    // ── Draw XP line chart ──────────────────────────
    function drawXPChart(history) {
        const canvas = document.getElementById('chart-xp');
        const empty = document.getElementById('chart-xp-empty');
        if (!canvas) return;

        // Seed with demo data if empty (first-time user)
        if (!history || history.length < 2) {
            if (empty) empty.style.display = 'flex';
            canvas.style.display = 'none';
            return;
        }
        if (empty) empty.style.display = 'none';
        canvas.style.display = 'block';

        const dpr = window.devicePixelRatio || 1;
        const W = canvas.offsetWidth || canvas.parentElement.offsetWidth || 300;
        const H = 120;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const pad = { top: 12, right: 12, bottom: 28, left: 36 };
        const cw = W - pad.left - pad.right;
        const ch = H - pad.top - pad.bottom;

        const xpVals = history.map(d => d.xp);
        const maxXP = Math.max(...xpVals, 1);
        const n = history.length;

        const px = i => pad.left + (i / (n - 1)) * cw;
        const py = v => pad.top + ch - (v / maxXP) * ch;

        // Style vars from CSS
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const brand = '#5856D6';
        const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
        const textColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)';

        ctx.clearRect(0, 0, W, H);

        // Grid lines (3 horizontal)
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) {
            const y = pad.top + (ch / 3) * i;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(pad.left + cw, y);
            ctx.stroke();
            // Y labels
            const val = Math.round(maxXP - (maxXP / 3) * i);
            ctx.fillStyle = labelColor;
            ctx.font = `10px -apple-system, system-ui, sans-serif`;
            ctx.textAlign = 'right';
            ctx.fillText(val, pad.left - 4, y + 4);
        }

        // Gradient fill under line
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
        grad.addColorStop(0, 'rgba(88,86,214,0.3)');
        grad.addColorStop(1, 'rgba(88,86,214,0.0)');

        ctx.beginPath();
        ctx.moveTo(px(0), py(xpVals[0]));
        for (let i = 1; i < n; i++) {
            const x0 = px(i - 1), y0 = py(xpVals[i - 1]);
            const x1 = px(i), y1 = py(xpVals[i]);
            const cpx = (x0 + x1) / 2;
            ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
        }
        ctx.lineTo(px(n - 1), pad.top + ch);
        ctx.lineTo(px(0), pad.top + ch);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(px(0), py(xpVals[0]));
        for (let i = 1; i < n; i++) {
            const x0 = px(i - 1), y0 = py(xpVals[i - 1]);
            const x1 = px(i), y1 = py(xpVals[i]);
            const cpx = (x0 + x1) / 2;
            ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
        }
        ctx.strokeStyle = brand;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Dots + date labels
        history.forEach((d, i) => {
            const x = px(i), y = py(d.xp);
            // Dot
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = brand;
            ctx.fill();
            ctx.strokeStyle = isDark ? '#1c1c1e' : '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Date label (only first & last or every Nth)
            if (i === 0 || i === n - 1 || (n <= 7) || (i % Math.ceil(n / 5) === 0)) {
                const label = d.date.slice(5); // MM-DD
                ctx.fillStyle = labelColor;
                ctx.font = '9px -apple-system, system-ui, sans-serif';
                ctx.textAlign = i === 0 ? 'left' : i === n - 1 ? 'right' : 'center';
                ctx.fillText(label, x, H - 6);
            }
        });
    }

    // ── Draw accuracy donut ─────────────────────────
    function drawDonut(accuracy) {
        const canvas = document.getElementById('chart-donut');
        const centerLabel = document.getElementById('donut-center-label');
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const S = 120;
        canvas.width = S * dpr;
        canvas.height = S * dpr;
        canvas.style.width = S + 'px';
        canvas.style.height = S + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const cx = S / 2, cy = S / 2, r = 46, lw = 14;
        const startAngle = -Math.PI / 2;
        const sweep = (accuracy / 100) * Math.PI * 2;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const trackColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

        ctx.clearRect(0, 0, S, S);

        // Track
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = lw;
        ctx.stroke();

        if (accuracy > 0) {
            // Colour: green ≥70%, orange ≥40%, red <40%
            const color = accuracy >= 70 ? '#34C759' : accuracy >= 40 ? '#FF9500' : '#FF3B30';

            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
            ctx.strokeStyle = color;
            ctx.lineWidth = lw;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        if (centerLabel) centerLabel.textContent = accuracy + '%';
    }

    function render() {
        const { xp, streak, totalCorrect, totalAttempts, xpHistory } = App.state;
        const words = App.state.words;
        const unlocked = words.filter(w => w.unlocked !== false).length;
        const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
        const level = getLevel(xp);
        const nextLevel = getNextLevel(xp);
        const xpPct = nextLevel ? Math.min(100, ((xp - level.xp) / (nextLevel.xp - level.xp)) * 100) : 100;

        set('stat-xp', xp);
        set('stat-xp2', xp);
        set('stat-streak', streak);
        set('stat-accuracy', accuracy + '%');
        set('stat-words', `${unlocked}/${words.length}`);
        set('stat-level-badge', el => el.innerHTML = `<i data-lucide="award" class="icon-xs"></i> ${level.name}`);

        const bar = document.getElementById('stat-xp-bar');
        if (bar) bar.style.width = xpPct + '%';

        // Update localized labels
        const lang = App.state.lang;
        setText('stat-xp-chart-label', lang === 'ru' ? 'Прогресс XP' : 'XP Verlauf');
        setText('stat-acc-label', lang === 'ru' ? 'Точность' : 'Genauigkeit');
        setText('stat-dist-label', lang === 'ru' ? 'Артикли' : 'Artikel');

        // Article distribution
        const derCount = words.filter(w => w.article === 'der').length;
        const dieCount = words.filter(w => w.article === 'die').length;
        const dasCount = words.filter(w => w.article === 'das').length;
        const total = Math.max(derCount + dieCount + dasCount, 1);
        setBar('dist-der', derCount, total); setText('dist-der-cnt', derCount);
        setBar('dist-die', dieCount, total); setText('dist-die-cnt', dieCount);
        setBar('dist-das', dasCount, total); setText('dist-das-cnt', dasCount);

        // Charts — defer one frame to let DOM layout complete
        requestAnimationFrame(() => {
            drawXPChart(xpHistory);
            drawDonut(accuracy);
        });

        if (window.lucide) lucide.createIcons();
    }

    function set(id, valOrFn) {
        const el = document.getElementById(id);
        if (!el) return;
        if (typeof valOrFn === 'function') valOrFn(el);
        else el.textContent = valOrFn;
    }
    function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
    function setBar(id, count, total) {
        const el = document.getElementById(id);
        if (el) el.style.width = Math.round((count / total) * 100) + '%';
    }

    return { render };
})();
