class Portfolio {
    constructor(stocks, bonds) {
        this.stocks = stocks;
        this.bonds = bonds;
    }

    total() {
        return this.stocks + this.bonds;
    }

    applyMonthlyReturn(rStock, rBond) {
        this.stocks *= (1 + rStock);
        this.bonds *= (1 + rBond);
    }
}

function runStrategy(data, startIdx, months, initialCapital, monthlyContribution, stockPct, dcaMonths, rebalanceAnnually) {
    const alloc = stockPct / 100;
    const pf = new Portfolio(0, 0);
    let cash = 0;

    if (dcaMonths > 0) {
        cash = initialCapital;
    } else {
        pf.stocks = initialCapital * alloc;
        pf.bonds = initialCapital * (1 - alloc);
    }

    const monthlyLump = dcaMonths > 0 ? initialCapital / dcaMonths : 0;
    const history = [];
    const investedHistory = [];
    let invested = initialCapital;
    let peak = pf.total() + cash;
    let maxDrawdown = 0;

    for (let m = 0; m < months; m++) {
        const point = data[startIdx + m];
        const rStock = point.r;
        const rBond = point.b !== null ? point.b : 0;

        pf.applyMonthlyReturn(rStock, rBond);
        cash *= (1 + rBond);

        if (monthlyLump > 0) {
            const investNow = Math.min(monthlyLump, cash);
            cash -= investNow;
            pf.stocks += investNow * alloc;
            pf.bonds += investNow * (1 - alloc);
        }

        if (monthlyContribution > 0) {
            pf.stocks += monthlyContribution * alloc;
            pf.bonds += monthlyContribution * (1 - alloc);
            invested += monthlyContribution;
        }

        if (rebalanceAnnually && m % 12 === 11 && m < months - 1) {
            const total = pf.total();
            pf.stocks = total * alloc;
            pf.bonds = total * (1 - alloc);
        }

        const value = pf.total() + cash;
        history.push(value);
        investedHistory.push(invested);

        if (value > peak) {
            peak = value;
        }
        const dd = value / peak - 1;
        if (dd < maxDrawdown) {
            maxDrawdown = dd;
        }
    }

    const finalValue = pf.total() + cash;
    let inflationFactor = 1;
    for (let m = 0; m < months; m++) {
        inflationFactor *= (1 + data[startIdx + m].i);
    }
    const realValue = finalValue / inflationFactor;

    const years = months / 12;
    const cagr = invested > 0 && finalValue > 0
        ? Math.pow(finalValue / invested, 1 / years) - 1
        : 0;

    const monthlyReturns = [];
    for (let m = 1; m < history.length; m++) {
        monthlyReturns.push(history[m] / history[m - 1] - 1);
    }
    const mean = monthlyReturns.reduce((a, b) => a + b, 0) / (monthlyReturns.length || 1);
    const variance = monthlyReturns.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (monthlyReturns.length || 1);
    const annualVol = Math.sqrt(variance) * Math.sqrt(12);

    return {
        history,
        investedHistory,
        finalValue,
        realValue,
        cagr,
        maxDrawdown,
        annualVol,
        invested,
    };
}

function findStartIndex(data, dateStr) {
    const idx = data.findIndex(p => p.d >= dateStr);
    return idx >= 0 ? idx : 0;
}

function clampMonths(data, startIdx, months) {
    return Math.min(months, data.length - startIdx);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Portfolio, runStrategy, findStartIndex, clampMonths };
}
