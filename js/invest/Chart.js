class LineChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    draw(series, labels, opts = {}) {
        const canvas = this.canvas;
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = canvas.clientWidth || canvas.parentElement.clientWidth || 800;
        const cssHeight = canvas.clientHeight || 420;
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
        const ctx = this.ctx;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssWidth, cssHeight);

        const padL = 70, padR = 20, padT = 20, padB = 40;
        const w = cssWidth - padL - padR;
        const h = cssHeight - padT - padB;

        let min = Infinity, max = -Infinity;
        for (const s of series) {
            for (const v of s.data) {
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }
        if (!isFinite(min)) { min = 0; max = 1; }
        if (max === min) { max = min + 1; }
        const pad = (max - min) * 0.05;
        min = Math.max(0, min - pad);
        max = max + pad;

        const n = series[0] ? series[0].data.length : 0;
        const x = i => padL + (n <= 1 ? w / 2 : (i / (n - 1)) * w);
        const y = v => padT + h - ((v - min) / (max - min)) * h;

        ctx.font = '11px Segoe UI, sans-serif';
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.fillStyle = '#888';
        ctx.lineWidth = 1;
        const yTicks = 6;
        for (let i = 0; i <= yTicks; i++) {
            const v = min + (i / yTicks) * (max - min);
            const yy = y(v);
            ctx.beginPath();
            ctx.moveTo(padL, yy);
            ctx.lineTo(padL + w, yy);
            ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText(formatMoney(v), padL - 8, yy + 4);
        }

        const xTicks = Math.min(8, Math.max(2, Math.floor(n / 12)));
        ctx.textAlign = 'center';
        for (let i = 0; i <= xTicks; i++) {
            const idx = Math.round((i / xTicks) * (n - 1));
            ctx.fillText(labels[idx] || '', x(idx), padT + h + 18);
        }

        for (const s of series) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.dashed ? 1.5 : 2;
            ctx.setLineDash(s.dashed ? [6, 4] : []);
            ctx.beginPath();
            for (let i = 0; i < s.data.length; i++) {
                if (i === 0) ctx.moveTo(x(i), y(s.data[i]));
                else ctx.lineTo(x(i), y(s.data[i]));
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (opts.hoverIndex != null && n > 0) {
            const i = opts.hoverIndex;
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x(i), padT);
            ctx.lineTo(x(i), padT + h);
            ctx.stroke();
        }
    }
}

function formatMoney(v) {
    const abs = Math.abs(v);
    if (abs >= 1e6) return (v / 1e6).toFixed(1) + ' M€';
    if (abs >= 1e3) return (v / 1e3).toFixed(0) + ' k€';
    return Math.round(v) + ' €';
}

function formatPct(v) {
    return (v * 100).toFixed(1) + ' %';
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LineChart, formatMoney, formatPct };
}
