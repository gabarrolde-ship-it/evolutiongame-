const COLORS = {
    lump: '#00ff88',
    dca: '#00d4ff',
    mix: '#ffaa00',
    invested: '#888888',
};

function readParams() {
    return {
        startDate: document.getElementById('startDate').value,
        duration: parseInt(document.getElementById('duration').value, 10),
        initialCapital: parseFloat(document.getElementById('initialCapital').value) || 0,
        monthlyContribution: parseFloat(document.getElementById('monthlyContribution').value) || 0,
        stockAllocation: parseInt(document.getElementById('stockAllocation').value, 10),
        dcaMonths: parseInt(document.getElementById('dcaMonths').value, 10) || 1,
    };
}

function buildLabels(data, startIdx, months) {
    const labels = [];
    for (let m = 0; m < months; m++) {
        const p = data[startIdx + m];
        labels.push(p ? p.d : '');
    }
    return labels;
}

function runSimulation() {
    const params = readParams();
    const startIdx = findStartIndex(MARKET_DATA, params.startDate);
    const months = clampMonths(MARKET_DATA, startIdx, params.duration * 12);
    if (months <= 0) return;

    const labels = buildLabels(MARKET_DATA, startIdx, months);

    const lump = runStrategy(MARKET_DATA, startIdx, months, params.initialCapital, params.monthlyContribution, params.stockAllocation, 0, false);
    const dca = runStrategy(MARKET_DATA, startIdx, months, params.initialCapital, params.monthlyContribution, params.stockAllocation, params.dcaMonths, false);
    const mix = runStrategy(MARKET_DATA, startIdx, months, params.initialCapital, params.monthlyContribution, 60, 0, true);

    const chart = new LineChart(document.getElementById('chartCanvas'));
    chart.draw([
        { data: lump.history, color: COLORS.lump },
        { data: dca.history, color: COLORS.dca },
        { data: mix.history, color: COLORS.mix },
        { data: lump.investedHistory, color: COLORS.invested, dashed: true },
    ], labels);

    document.getElementById('periodLabel').textContent =
        MARKET_DATA[startIdx].d + ' → ' + MARKET_DATA[startIdx + months - 1].d;
    document.getElementById('investedLabel').textContent = formatMoney(lump.invested);

    const rows = [
        { name: 'Lump sum (' + params.stockAllocation + '% actions)', res: lump, color: COLORS.lump },
        { name: 'DCA sur ' + params.dcaMonths + ' mois (' + params.stockAllocation + '% actions)', res: dca, color: COLORS.dca },
        { name: '60/40 rééquilibré annuellement', res: mix, color: COLORS.mix },
    ];

    const body = document.getElementById('statsBody');
    body.innerHTML = '';
    for (const row of rows) {
        const tr = document.createElement('tr');
        const perfClass = row.res.cagr >= 0 ? 'pos' : 'neg';
        const ddClass = 'neg';
        tr.innerHTML =
            '<td><span class="legend-color" style="display:inline-block;background:' + row.color + ';margin-right:8px"></span>' + row.name + '</td>' +
            '<td class="' + perfClass + '">' + formatMoney(row.res.finalValue) + '</td>' +
            '<td>' + formatMoney(row.res.realValue) + '</td>' +
            '<td class="' + perfClass + '">' + formatPct(row.res.cagr) + '</td>' +
            '<td class="' + ddClass + '">' + formatPct(row.res.maxDrawdown) + '</td>' +
            '<td>' + formatPct(row.res.annualVol) + '</td>';
        body.appendChild(tr);
    }
}

function resetParams() {
    document.getElementById('startDate').value = '2000-01';
    document.getElementById('duration').value = '20';
    document.getElementById('initialCapital').value = '10000';
    document.getElementById('monthlyContribution').value = '200';
    document.getElementById('stockAllocation').value = '100';
    document.getElementById('stockAllocationValue').textContent = '100%';
    document.getElementById('dcaMonths').value = '12';
    runSimulation();
}

document.addEventListener('DOMContentLoaded', () => {
    const alloc = document.getElementById('stockAllocation');
    alloc.addEventListener('input', () => {
        document.getElementById('stockAllocationValue').textContent = alloc.value + '%';
    });
    document.getElementById('simulateBtn').addEventListener('click', runSimulation);
    document.getElementById('resetBtn').addEventListener('click', resetParams);
    window.addEventListener('resize', runSimulation);
    runSimulation();
});
