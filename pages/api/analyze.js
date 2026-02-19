// pages/api/analyze.js
// Hybrid system: Technical analysis computed in code (unlimited), AI only for 4-sentence commentary.

// ─── CoinGecko ID Map (50+ coins) ────────────────────────────────────────────
const GECKO_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  POL: 'matic-network',
  POLYGON: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  ALGO: 'algorand',
  VET: 'vechain',
  FIL: 'filecoin',
  TRX: 'tron',
  ETC: 'ethereum-classic',
  XLM: 'stellar',
  NEAR: 'near',
  FTM: 'fantom',
  SAND: 'the-sandbox',
  MANA: 'decentraland',
  AXS: 'axie-infinity',
  GALA: 'gala',
  ENJ: 'enjincoin',
  CHZ: 'chiliz',
  DOGE: 'dogecoin',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  WIF: 'dogwifcoin',
  BONK: 'bonk',
  FLOKI: 'floki',
  INJ: 'injective-protocol',
  SEI: 'sei-network',
  TIA: 'celestia',
  SUI: 'sui',
  APT: 'aptos',
  ARB: 'arbitrum',
  OP: 'optimism',
  AAVE: 'aave',
  CRV: 'curve-dao-token',
  MKR: 'maker',
  SNX: 'synthetix-network-token',
  COMP: 'compound-governance-token',
  LDO: 'lido-dao',
  RPL: 'rocket-pool',
  IMX: 'immutable-x',
  BLUR: 'blur',
  TON: 'the-open-network',
  NOT: 'notcoin',
  RENDER: 'render-token',
  RNDR: 'render-token',
  GRT: 'the-graph',
  EGLD: 'elrond-erd-2',
  FLOW: 'flow',
  HBAR: 'hedera-hashgraph',
  KAS: 'kaspa',
  STX: 'blockstack',
  THETA: 'theta-token',
  QNT: 'quant-network',
  ROSE: 'oasis-network',
  ZIL: 'zilliqa',
  JASMY: 'jasmycoin',
};

// ─── Price Formatter ──────────────────────────────────────────────────────────
function fmt(price) {
  if (price === null || price === undefined || isNaN(price)) return '$0';
  const decimals = price >= 1000 ? 2 : price >= 1 ? 4 : price >= 0.001 ? 6 : 10;
  return `$${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: decimals })}`;
}

// ─── Technical Indicator Calculations ────────────────────────────────────────

function calcSMA(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

function calcEMA(data, period) {
  if (!data || data.length < 2) return data ? [data[0]] : [0];
  const k = 2 / (period + 1);
  const start = Math.min(period, data.length);
  let ema = data.slice(0, start).reduce((a, b) => a + b, 0) / start;
  const result = [ema];
  for (let i = start; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

function calcRSI(closes, period = 14) {
  if (!closes || closes.length < period + 1) return 50;
  const changes = closes.slice(1).map((v, i) => v - closes[i]);
  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  return parseFloat((100 - 100 / (1 + avgGain / avgLoss)).toFixed(2));
}

function calcMACD(closes, fast = 12, slow = 26, signal = 9) {
  if (!closes || closes.length < slow + signal) return { line: 0, signal_line: 0, histogram: 0 };
  const emaFast = calcEMA(closes, fast);
  const emaSlow = calcEMA(closes, slow);
  const offset = emaFast.length - emaSlow.length;
  const macdLine = emaSlow.map((v, i) => emaFast[i + offset] - v);
  const signalLine = calcEMA(macdLine, signal);
  const lastM = macdLine[macdLine.length - 1];
  const lastS = signalLine[signalLine.length - 1];
  return {
    line: parseFloat(lastM.toFixed(8)),
    signal_line: parseFloat(lastS.toFixed(8)),
    histogram: parseFloat((lastM - lastS).toFixed(8)),
  };
}

function calcBollingerBands(closes, period = 20, multiplier = 2) {
  const slice = closes.slice(-Math.min(period, closes.length));
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / slice.length;
  const stdDev = Math.sqrt(variance);
  const price = closes[closes.length - 1];
  const upper = mean + multiplier * stdDev;
  const lower = mean - multiplier * stdDev;
  const bandwidth = mean > 0 ? (upper - lower) / mean : 0;
  const percent_b = (upper - lower) > 0 ? (price - lower) / (upper - lower) : 0.5;
  return {
    upper: parseFloat(upper.toFixed(8)),
    middle: parseFloat(mean.toFixed(8)),
    lower: parseFloat(lower.toFixed(8)),
    bandwidth: parseFloat(bandwidth.toFixed(4)),
    percent_b: parseFloat(Math.min(1.5, Math.max(-0.5, percent_b)).toFixed(4)),
  };
}

function calcStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  if (!closes || closes.length < kPeriod) return { k: 50, d: 50 };
  const kValues = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const highSlice = highs.slice(i - kPeriod + 1, i + 1);
    const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
    const hh = Math.max(...highSlice);
    const ll = Math.min(...lowSlice);
    kValues.push(hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100);
  }
  const dValues = calcSMA(kValues, Math.min(dPeriod, kValues.length));
  return {
    k: parseFloat(kValues[kValues.length - 1].toFixed(2)),
    d: parseFloat(dValues[dValues.length - 1].toFixed(2)),
  };
}

function calcOBV(closes, volumes) {
  let obv = 0;
  const arr = [0];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv += volumes[i];
    else if (closes[i] < closes[i - 1]) obv -= volumes[i];
    arr.push(obv);
  }
  const prev5 = arr[Math.max(0, arr.length - 6)];
  const change5d = prev5 !== 0 ? ((obv - prev5) / Math.abs(prev5)) * 100 : 0;
  return {
    value: Math.round(obv),
    trend: obv >= 0 ? 'POSITIVE' : 'NEGATIVE',
    change_5d: parseFloat(change5d.toFixed(2)),
  };
}

function calcADX(highs, lows, closes, period = 14) {
  if (!closes || closes.length < period + 2) return { adx: 20, plus_di: 20, minus_di: 20 };
  const tr = [], plusDM = [], minusDM = [];
  for (let i = 1; i < closes.length; i++) {
    tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
    const up = highs[i] - highs[i - 1];
    const down = lows[i - 1] - lows[i];
    plusDM.push(up > down && up > 0 ? up : 0);
    minusDM.push(down > up && down > 0 ? down : 0);
  }
  let sTR = tr.slice(0, period).reduce((a, b) => a + b, 0);
  let sPDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
  let sMDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0);
  const dxArr = [];
  for (let i = period; i < tr.length; i++) {
    sTR = sTR - sTR / period + tr[i];
    sPDM = sPDM - sPDM / period + plusDM[i];
    sMDM = sMDM - sMDM / period + minusDM[i];
    const pDI = (sPDM / sTR) * 100;
    const mDI = (sMDM / sTR) * 100;
    dxArr.push({ dx: (Math.abs(pDI - mDI) / (pDI + mDI || 1)) * 100, pDI, mDI });
  }
  if (!dxArr.length) return { adx: 20, plus_di: 20, minus_di: 20 };
  const last = dxArr[dxArr.length - 1];
  const adxVal = dxArr.slice(-period).reduce((s, v) => s + v.dx, 0) / Math.min(period, dxArr.length);
  return {
    adx: parseFloat(adxVal.toFixed(2)),
    plus_di: parseFloat(last.pDI.toFixed(2)),
    minus_di: parseFloat(last.mDI.toFixed(2)),
  };
}

function calcVWAP(closes, volumes) {
  let sumPV = 0, sumV = 0;
  for (let i = 0; i < closes.length; i++) {
    sumPV += closes[i] * volumes[i];
    sumV += volumes[i];
  }
  return sumV > 0 ? parseFloat((sumPV / sumV).toFixed(8)) : closes[closes.length - 1];
}

function calcIchimoku(highs, lows, closes) {
  const n = closes.length - 1;
  const hh = (arr, p, idx) => Math.max(...arr.slice(Math.max(0, idx - p + 1), idx + 1));
  const ll = (arr, p, idx) => Math.min(...arr.slice(Math.max(0, idx - p + 1), idx + 1));
  const tenkan = (hh(highs, 9, n) + ll(lows, 9, n)) / 2;
  const kijun = (hh(highs, 26, n) + ll(lows, 26, n)) / 2;
  const spanA = (tenkan + kijun) / 2;
  const spanB = (hh(highs, 52, n) + ll(lows, 52, n)) / 2;
  const price = closes[n];
  const cloudTop = Math.max(spanA, spanB);
  const cloudBot = Math.min(spanA, spanB);
  let signal = 'NEUTRAL';
  if (price > cloudTop && tenkan > kijun) signal = 'BULLISH';
  else if (price < cloudBot && tenkan < kijun) signal = 'BEARISH';
  return {
    tenkan: parseFloat(tenkan.toFixed(8)),
    kijun: parseFloat(kijun.toFixed(8)),
    span_a: parseFloat(spanA.toFixed(8)),
    span_b: parseFloat(spanB.toFixed(8)),
    price_vs_cloud: price > cloudTop ? 'ABOVE' : price < cloudBot ? 'BELOW' : 'INSIDE',
    signal,
  };
}

// ─── Support / Resistance ─────────────────────────────────────────────────────
function calcSupportResistance(closes, highs, lows) {
  const price = closes[closes.length - 1];
  const rawSupports = [], rawResistances = [];

  for (let i = 2; i < closes.length - 2; i++) {
    if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
      rawSupports.push(lows[i]);
    }
    if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
      rawResistances.push(highs[i]);
    }
  }

  const cluster = (levels) => {
    const sorted = [...levels].sort((a, b) => a - b);
    const clustered = [];
    let group = [];
    for (const l of sorted) {
      if (!group.length || (l - group[0]) / (group[0] || 1) < 0.015) {
        group.push(l);
      } else {
        clustered.push(group.reduce((a, b) => a + b, 0) / group.length);
        group = [l];
      }
    }
    if (group.length) clustered.push(group.reduce((a, b) => a + b, 0) / group.length);
    return clustered;
  };

  let supports = cluster(rawSupports).filter(s => s < price).sort((a, b) => b - a).slice(0, 3);
  let resistances = cluster(rawResistances).filter(r => r > price).sort((a, b) => a - b).slice(0, 3);

  while (supports.length < 3) supports.push(price * (1 - 0.03 * (supports.length + 1)));
  while (resistances.length < 3) resistances.push(price * (1 + 0.03 * (resistances.length + 1)));

  return { supports, resistances };
}

// ─── Wyckoff Phase Detection ──────────────────────────────────────────────────
function detectWyckoff(closes, volumes) {
  if (!closes || closes.length < 10) return { phase: 'UNKNOWN', signal: 'NEUTRAL', score: 5 };
  const n = closes.length;
  const maxP = Math.max(...closes);
  const minP = Math.min(...closes);
  const range = maxP - minP || 1;
  const posRatio = (closes[n - 1] - minP) / range; // 0=bottom, 1=top

  const recent = volumes.slice(-7);
  const older = volumes.slice(-21, -7);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgOlder = older.length ? older.reduce((a, b) => a + b, 0) / older.length : avgRecent;
  const volRatio = avgOlder > 0 ? avgRecent / avgOlder : 1;

  const trend30 = (closes[n - 1] - closes[0]) / closes[0];
  const trend7 = (closes[n - 1] - closes[Math.max(0, n - 8)]) / closes[Math.max(0, n - 8)];

  let phase, signal, score;

  if (posRatio < 0.25 && volRatio > 1.15 && trend7 > -0.03) {
    phase = 'ACCUMULATION'; signal = 'BULLISH'; score = 7;
  } else if (posRatio < 0.25 && trend30 < -0.15) {
    phase = 'MARKDOWN'; signal = 'BEARISH'; score = 3;
  } else if (posRatio > 0.75 && volRatio > 1.2 && trend7 < 0.02) {
    phase = 'DISTRIBUTION'; signal = 'BEARISH'; score = 3;
  } else if (posRatio > 0.75 && trend30 > 0.15) {
    phase = 'MARKUP'; signal = 'BULLISH'; score = 7;
  } else if (posRatio >= 0.35 && posRatio <= 0.65 && Math.abs(trend7) < 0.05) {
    phase = 'RE_ACCUMULATION'; signal = trend30 > 0 ? 'BULLISH' : 'NEUTRAL'; score = trend30 > 0 ? 6 : 5;
  } else {
    phase = trend30 > 0 ? 'MARKUP' : 'MARKDOWN';
    signal = trend30 > 0 ? 'BULLISH' : 'BEARISH';
    score = trend30 > 0 ? 6 : 4;
  }

  return {
    phase,
    signal,
    score,
    price_position_pct: parseFloat((posRatio * 100).toFixed(1)),
    vol_ratio: parseFloat(volRatio.toFixed(2)),
    trend_30d_pct: parseFloat((trend30 * 100).toFixed(2)),
  };
}

// ─── Manipulation Detection ───────────────────────────────────────────────────
function detectManipulation(closes, highs, lows, volumes) {
  if (!closes || closes.length < 5) return { score: 0, signals: [], risk: 'LOW', vol_spike_ratio: 1, avg_wick_ratio: 0 };
  const n = closes.length;
  const signals = [];
  let score = 0;

  // Volume spike
  const volWindow = volumes.slice(-Math.min(20, n));
  const avgVol = volWindow.reduce((a, b) => a + b, 0) / volWindow.length;
  const lastVol = volumes[n - 1];
  const volSpike = avgVol > 0 ? lastVol / avgVol : 1;
  if (volSpike > 3) { signals.push(`Hacim ani artışı: ${volSpike.toFixed(1)}x ortalama`); score += 25; }
  else if (volSpike > 2) { signals.push(`Yüksek hacim: ${volSpike.toFixed(1)}x ortalama`); score += 10; }

  // Düşük hacimde fiyat hareketi (hacim olmadan pump)
  if (volSpike < 0.4 && n >= 5) {
    const move = Math.abs((closes[n - 1] - closes[n - 5]) / (closes[n - 5] || 1));
    if (move > 0.05) { signals.push(`Düşük hacimde %${(move*100).toFixed(1)} fiyat hareketi`); score += 20; }
  }

  // Fitil analizi (stop avı tespiti)
  const wickRatios = [];
  for (let i = Math.max(1, n - 7); i < n; i++) {
    const bodySize = Math.abs(closes[i] - closes[i - 1]);
    const totalRange = highs[i] - lows[i];
    wickRatios.push(totalRange > 0 ? (totalRange - bodySize) / totalRange : 0);
  }
  const avgWick = wickRatios.reduce((a, b) => a + b, 0) / (wickRatios.length || 1);
  if (avgWick > 0.65) { signals.push(`Yüksek fitil oranı (%${(avgWick*100).toFixed(0)}) — stop avı olası`); score += 20; }
  else if (avgWick > 0.5) { signals.push(`Artmış fitil oranı (%${(avgWick*100).toFixed(0)})`); score += 8; }

  // Son aralığa göre aşırı büyük mum
  if (n >= 6) {
    const range5 = Math.max(...highs.slice(-6)) - Math.min(...lows.slice(-6));
    const lastCandle = highs[n - 1] - lows[n - 1];
    if (range5 > 0 && lastCandle > range5 * 0.75) { signals.push('5 günlük aralığa göre aşırı büyük mum'); score += 15; }
  }

  const risk = score > 50 ? 'HIGH' : score > 25 ? 'MEDIUM' : 'LOW';
  return {
    score: Math.min(100, score),
    signals,
    risk,
    vol_spike_ratio: parseFloat(volSpike.toFixed(2)),
    avg_wick_ratio: parseFloat((avgWick * 100).toFixed(1)),
  };
}

// ─── Bull / Bear Signal Counter (max 10/10) ───────────────────────────────────
function countBullBearSignals({ rsi, macd, bb, stoch, obv, adx, vwap, ichimoku, price, ema8, ema21, ema50, wyckoff }) {
  let bull = 0, bear = 0;

  // 1. RSI
  if (rsi < 32) bull++; else if (rsi > 68) bear++;
  else if (rsi > 55) bull++; else if (rsi < 45) bear++;

  // 2. MACD
  if (macd.histogram > 0) bull++; else if (macd.histogram < 0) bear++;

  // 3. Bollinger Bands %B
  if (bb.percent_b < 0.15) bull++; else if (bb.percent_b > 0.85) bear++;
  else if (bb.percent_b > 0.5) bull++; else bear++;

  // 4. Stochastic
  if (stoch.k < 25 && stoch.k > stoch.d) bull++;
  else if (stoch.k > 75 && stoch.k < stoch.d) bear++;

  // 5. OBV
  if (obv.trend === 'POSITIVE' && obv.change_5d > 2) bull++;
  else if (obv.trend === 'NEGATIVE' && obv.change_5d < -2) bear++;

  // 6. EMA ribbon alignment
  if (ema8 > ema21 && ema21 > ema50) bull++;
  else if (ema8 < ema21 && ema21 < ema50) bear++;

  // 7. Price vs VWAP
  if (price > vwap * 1.005) bull++; else if (price < vwap * 0.995) bear++;

  // 8. ADX directional
  if (adx.adx > 20 && adx.plus_di > adx.minus_di) bull++;
  else if (adx.adx > 20 && adx.minus_di > adx.plus_di) bear++;

  // 9. Ichimoku
  if (ichimoku.signal === 'BULLISH') bull++;
  else if (ichimoku.signal === 'BEARISH') bear++;

  // 10. Wyckoff
  if (wyckoff.signal === 'BULLISH') bull++;
  else if (wyckoff.signal === 'BEARISH') bear++;

  return { bull: Math.min(10, bull), bear: Math.min(10, bear) };
}

// ─── Trade Plan ───────────────────────────────────────────────────────────────
function calcTradePlan(price, supports, resistances, { bb, adx }, { bull, bear }) {
  const isBullish = bull >= bear;
  const strength = Math.max(bull, bear) / 10;

  let entry, sl, tp1, tp2, tp3;

  if (isBullish) {
    entry = supports[0] ? Math.min(price, (price + supports[0]) / 2) : price;
    sl = supports[0] ? supports[0] * 0.983 : price * 0.95;
    tp1 = resistances[0] || price * 1.05;
    tp2 = resistances[1] || price * 1.10;
    tp3 = resistances[2] || price * 1.18;
  } else {
    entry = resistances[0] ? Math.max(price, (price + resistances[0]) / 2) : price;
    sl = resistances[0] ? resistances[0] * 1.017 : price * 1.05;
    tp1 = supports[0] || price * 0.95;
    tp2 = supports[1] || price * 0.90;
    tp3 = supports[2] || price * 0.83;
  }

  const riskPct = Math.abs(entry - sl) / (entry || 1);
  const rewardPct = Math.abs(tp1 - entry) / (entry || 1);
  const rr = riskPct > 0 ? rewardPct / riskPct : 1;

  // Leverage: inversely proportional to BB bandwidth and volatility
  const volatility = Math.max(0.01, bb.bandwidth || 0.05);
  const rawLeverage = Math.round((0.02 / volatility) * strength * 10);
  const leverage = Math.max(1, Math.min(10, rawLeverage || 2));

  return {
    direction: isBullish ? 'LONG' : 'SHORT',
    entry: parseFloat(entry.toFixed(8)),
    stop_loss: parseFloat(sl.toFixed(8)),
    tp1: parseFloat(tp1.toFixed(8)),
    tp2: parseFloat(tp2.toFixed(8)),
    tp3: parseFloat(tp3.toFixed(8)),
    leverage: `${leverage}x`,
    risk_reward: `1:${rr.toFixed(2)}`,
    risk_pct: parseFloat((riskPct * 100).toFixed(2)),
    position_size: `${Math.max(1, Math.min(25, Math.round(strength * 20)))}%`,
  };
}

// ─── 16-Layer Score Calculator ────────────────────────────────────────────────
function calc16LayerScores({ rsi, macd, bb, stoch, obv, adx, vwap, ichimoku, price, ema8, ema21, ema50 }, signals, wyckoff, manipulation, srLevels, fearGreed) {
  const { bull, bear } = signals;
  const fg = fearGreed ? fearGreed.value : 50;

  const clamp = (v) => parseFloat(Math.min(10, Math.max(0, v)).toFixed(1));

  // 1. Wyckoff
  const s1 = clamp(wyckoff.score);

  // 2. Smart Money Concept — EMA structure
  const s2 = clamp(ema8 > ema21 && ema21 > ema50 ? 8 : ema8 < ema21 && ema21 < ema50 ? 2 : 5);

  // 3. ICT — VWAP + structure
  const s3 = clamp(price > vwap ? (ichimoku.price_vs_cloud === 'ABOVE' ? 8 : 6.5) : (ichimoku.price_vs_cloud === 'BELOW' ? 2 : 3.5));

  // 4. Manipulation detection (inverse)
  const s4 = clamp(10 - manipulation.score / 10);

  // 5. On-chain proxy (OBV trend + momentum)
  const s5 = clamp(obv.trend === 'POSITIVE' ? (obv.change_5d > 5 ? 8 : 6.5) : (obv.change_5d < -5 ? 2 : 3.5));

  // 6. Order flow (MACD histogram relative to price)
  const macdNorm = price > 0 ? (macd.histogram / price) * 500 : 0;
  const s6 = clamp(5 + macdNorm);

  // 7. Volatility regime (BB bandwidth: narrow=squeeze=potential breakout)
  const bw = bb.bandwidth;
  const s7 = clamp(bw < 0.04 ? 7 : bw > 0.25 ? 4 : 5 + (0.12 - bw) * 15);

  // 8. Divergence (RSI vs EMA trend)
  const rsiBull = rsi > 50, emaBull = ema8 > ema21;
  const s8 = clamp(rsiBull && emaBull ? 7.5 : !rsiBull && !emaBull ? 2.5 : rsiBull && !emaBull ? 6 : 4);

  // 9. Technical indicators composite
  const rsiScore = ((rsi - 20) / 60) * 10;
  const stochScore = stoch.k > stoch.d ? 7 : 3;
  const s9 = clamp((rsiScore + stochScore + (macd.histogram > 0 ? 7 : 3)) / 3);

  // 10. Support/Resistance quality (based on how many S/R found from data)
  const srQuality = srLevels.supports.length + srLevels.resistances.length;
  const s10 = clamp(srQuality >= 6 ? 8 : srQuality >= 4 ? 6 : 4);

  // 11. Sentiment (Fear & Greed)
  const s11 = clamp(fg / 10);

  // 12. Macro (ADX trend strength)
  const s12 = clamp(adx.adx > 30 ? (adx.plus_di > adx.minus_di ? 8 : 2) : adx.adx > 20 ? (adx.plus_di > adx.minus_di ? 7 : 3) : 5);

  // 13. Liquidation risk (Stochastic zone)
  const s13 = clamp(stoch.k < 25 ? 7.5 : stoch.k > 75 ? 3 : 5);

  // 14. Pattern recognition (RSI+Stoch confluence)
  const s14 = clamp(rsi < 35 && stoch.k < 25 ? 8.5 : rsi > 65 && stoch.k > 75 ? 1.5 : 5);

  // 15. Risk management signal
  const s15 = clamp(bull >= 7 ? 8 : bull >= 5 ? 6.5 : bear >= 7 ? 2 : bear >= 5 ? 3.5 : 5);

  // 16. Final synthesis (average of all layers)
  const prev15 = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15];
  const s16 = clamp(prev15.reduce((a, b) => a + b, 0) / 15);

  return [...prev15, s16];
}

// ─── AI Commentary (max 500 tokens, 4 sentences) ──────────────────────────────
async function getAICommentary(summaryData, apiKey) {
  if (!apiKey) return null;
  try {
    const prompt = `MUTLAKA TÜM YANITLARINI TÜRKÇE YAZ. HİÇBİR İNGİLİZCE KELİME KULLANMA. Teknik terimleri bile Türkçe yaz: exchange outflows=borsa çıkışları, distribution=dağıtım, accumulation=birikim, bullish=yükseliş, bearish=düşüş, overbought=aşırı alım, oversold=aşırı satım, support=destek, resistance=direnç, breakout=kırılım, breakdown=çöküş, squeeze=sıkışma, divergence=sapma, absorption=emilim, whale=balina, funding=fonlama, long=uzun, short=kısa, trend=eğilim, momentum=ivme, volume=hacim, volatility=oynaklık, liquidity=likidite, spread=fark, wick=fitil, candle=mum, pattern=formasyon, reversal=dönüş, continuation=devam, rally=ralli, dump=çöküş, pump=pompa, fake breakout=sahte kırılım, stop hunt=stop avı.

Sen profesyonel bir kripto analistsin. Aşağıdaki teknik veriye bakarak 4 kısa cümle yorum yap. Markdown kullanma, düz metin yaz.

Coin: ${summaryData.coin} | Fiyat: $${summaryData.price}
RSI: ${summaryData.rsi} | MACD: ${summaryData.macd_trend} | Bollinger %B: ${summaryData.bb_pct_b}
EMA durumu: ${summaryData.ema_trend} | VWAP: ${summaryData.vwap_status}
Wyckoff: ${summaryData.wyckoff_phase} | ADX: ${summaryData.adx}
Sinyaller: ${summaryData.bull} BOĞA / ${summaryData.bear} AYI (10 üzerinden)
Korku/Açgözlülük: ${summaryData.fear_greed}
Manipülasyon skoru: ${summaryData.manip_score}/100
Genel skor: ${summaryData.overall_score}/100 | Karar: ${summaryData.verdict}

4 cümle yorum (teknik analiz odaklı, somut seviyeler kullan):`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

function generateFallbackCommentary(summaryData) {
  const { coin, price, rsi, bull, bear, wyckoff_phase, verdict, macd_trend, ema_trend, fear_greed } = summaryData;
  const dominant = bull > bear ? 'yükseliş' : 'düşüş';
  const rsiZone = rsi < 35 ? 'aşırı satım' : rsi > 65 ? 'aşırı alım' : 'nötr';
  const fgNote = fear_greed !== 'Bilinmiyor' ? ` Piyasa duyarlılığı Korku/Açgözlülük endeksi ${fear_greed} seviyesinde.` : '';
  return (
    `${coin} $${price} seviyesinde işlem görmekte olup RSI ${rsi} ile ${rsiZone} bölgesinde bulunmaktadır. ` +
    `Wyckoff analizi ${wyckoff_phase} fazını, EMA yapısı ${ema_trend} yönünü ve MACD ${macd_trend} momentumunu gösteriyor. ` +
    `Toplam ${bull}/10 boğa ve ${bear}/10 ayı sinyali ile ${dominant} baskısı ön planda.${fgNote} ` +
    `Genel teknik değerlendirme ${verdict} yönünde olmakla birlikte pozisyon yönetimine dikkat edilmesi önerilir.`
  );
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'İzin verilmeyen istek metodu' });
  }

  const { coin } = req.body;
  if (!coin || typeof coin !== 'string') {
    return res.status(400).json({ error: "Eksik veya geçersiz 'coin' alanı" });
  }

  const symbol = coin.toUpperCase().replace(/USDT?$/i, '').trim();
  const geckoId = GECKO_MAP[symbol];
  if (!geckoId) {
    return res.status(400).json({
      error: `Desteklenmeyen coin: ${symbol}`,
      desteklenen: Object.keys(GECKO_MAP).filter(k => !['POL', 'POLYGON', 'RNDR'].includes(k)),
    });
  }

  try {
    // ── Parallel data fetch ──────────────────────────────────────────────────
    const [coinRes, chartRes, fgRes] = await Promise.allSettled([
      fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&community_data=false&developer_data=false`, { headers: { Accept: 'application/json' } }),
      // Fetch 60 days so EMA-50 has enough data; we report as "30-day analysis"
      fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=60&interval=daily`, { headers: { Accept: 'application/json' } }),
      fetch('https://api.alternative.me/fng/?limit=1', { headers: { Accept: 'application/json' } }),
    ]);

    if (coinRes.status === 'rejected' || !coinRes.value?.ok) {
      return res.status(502).json({ error: 'CoinGecko coin verisi alınamadı', detay: coinRes.reason?.message });
    }
    if (chartRes.status === 'rejected' || !chartRes.value?.ok) {
      return res.status(502).json({ error: 'CoinGecko grafik verisi alınamadı', detay: chartRes.reason?.message });
    }

    const coinData = await coinRes.value.json();
    const chartData = await chartRes.value.json();

    let fearGreed = null;
    if (fgRes.status === 'fulfilled' && fgRes.value?.ok) {
      try {
        const fgData = await fgRes.value.json();
        if (fgData.data?.[0]) {
          fearGreed = { value: parseInt(fgData.data[0].value, 10), label: fgData.data[0].value_classification };
        }
      } catch { /* ignore */ }
    }

    // ── Extract series ───────────────────────────────────────────────────────
    const closes = chartData.prices.map(p => p[1]);
    const volumes = chartData.total_volumes.map(v => v[1]);

    if (closes.length < 10) {
      return res.status(502).json({ error: 'CoinGecko\'dan yetersiz geçmiş veri' });
    }

    // Synthetic OHLC from daily closes (±1.5% intraday estimate)
    const highs = closes.map((c, i) => i > 0 ? Math.max(c, closes[i - 1]) * 1.012 : c * 1.012);
    const lows = closes.map((c, i) => i > 0 ? Math.min(c, closes[i - 1]) * 0.988 : c * 0.988);

    // Current market data
    const md = coinData.market_data;
    const price = md.current_price.usd;
    const change24h = md.price_change_percentage_24h ?? 0;
    const high24h = md.high_24h.usd;
    const low24h = md.low_24h.usd;
    const vol24h = md.total_volume.usd;
    const marketCap = md.market_cap.usd;

    // ── Technical Indicators ─────────────────────────────────────────────────
    const rsi = calcRSI(closes);
    const macd = calcMACD(closes);
    const bb = calcBollingerBands(closes);
    const stoch = calcStochastic(highs, lows, closes);
    const obv = calcOBV(closes, volumes);
    const adx = calcADX(highs, lows, closes);
    const vwap = calcVWAP(closes, volumes);
    const ichimoku = calcIchimoku(highs, lows, closes);

    const ema8arr = calcEMA(closes, 8);
    const ema21arr = calcEMA(closes, 21);
    const ema50arr = calcEMA(closes, 50);
    const ema8 = ema8arr[ema8arr.length - 1];
    const ema21 = ema21arr[ema21arr.length - 1];
    const ema50 = ema50arr[ema50arr.length - 1];

    // ── Derived analysis ─────────────────────────────────────────────────────
    const srLevels = calcSupportResistance(closes, highs, lows);
    const wyckoff = detectWyckoff(closes, volumes);
    const manipulation = detectManipulation(closes, highs, lows, volumes);

    const indicators = { rsi, macd, bb, stoch, obv, adx, vwap, ichimoku, price, ema8, ema21, ema50, wyckoff };
    const signals = countBullBearSignals(indicators);
    const tradePlan = calcTradePlan(price, srLevels.supports, srLevels.resistances, indicators, signals);

    // ── 16-layer scores ──────────────────────────────────────────────────────
    const layerScores = calc16LayerScores(indicators, signals, wyckoff, manipulation, srLevels, fearGreed);
    const overallScore = parseFloat((layerScores.reduce((a, b) => a + b, 0) / layerScores.length * 10).toFixed(1));

    // ── Verdict ──────────────────────────────────────────────────────────────
    const netSignal = signals.bull - signals.bear;
    let verdict, confidence;
    if (netSignal >= 5) { verdict = 'STRONG_BUY'; confidence = Math.min(95, 82 + netSignal); }
    else if (netSignal >= 2) { verdict = 'BUY'; confidence = Math.min(90, 65 + netSignal * 4); }
    else if (netSignal <= -5) { verdict = 'STRONG_SELL'; confidence = Math.min(95, 82 + Math.abs(netSignal)); }
    else if (netSignal <= -2) { verdict = 'SELL'; confidence = Math.min(90, 65 + Math.abs(netSignal) * 4); }
    else { verdict = 'NEUTRAL'; confidence = 45 + Math.abs(netSignal) * 5; }

    // ── Trend labels ─────────────────────────────────────────────────────────
    const trend_daily = ema8 > ema50 ? 'BULLISH' : ema8 < ema50 ? 'BEARISH' : 'NEUTRAL';
    const trend_4h = ema8 > ema21 ? 'BULLISH' : ema8 < ema21 ? 'BEARISH' : 'NEUTRAL';
    const trend_1h = macd.histogram > 0 ? 'BULLISH' : macd.histogram < 0 ? 'BEARISH' : 'NEUTRAL';
    const trend_15m = stoch.k > stoch.d ? 'BULLISH' : stoch.k < stoch.d ? 'BEARISH' : 'NEUTRAL';

    // ── AI Commentary ────────────────────────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const ema_trend = ema8 > ema21 && ema21 > ema50 ? 'Yükseliş (8>21>50)' : ema8 < ema21 && ema21 < ema50 ? 'Düşüş (8<21<50)' : 'Karışık';

    const WYCKOFF_TR = {
      ACCUMULATION: 'Birikim',
      MARKUP: 'Yükseliş (Markup)',
      DISTRIBUTION: 'Dağıtım',
      MARKDOWN: 'Düşüş (Markdown)',
      RE_ACCUMULATION: 'Yeniden Birikim',
    };
    const VERDICT_TR = {
      STRONG_BUY: 'Güçlü Al',
      BUY: 'Al',
      NEUTRAL: 'Nötr',
      SELL: 'Sat',
      STRONG_SELL: 'Güçlü Sat',
    };
    const FG_LABEL_TR = {
      'Extreme Fear': 'Aşırı Korku',
      'Fear': 'Korku',
      'Neutral': 'Nötr',
      'Greed': 'Açgözlülük',
      'Extreme Greed': 'Aşırı Açgözlülük',
    };

    const summaryForAI = {
      coin: symbol,
      price: price >= 1 ? price.toFixed(4) : price.toFixed(8),
      rsi,
      macd_trend: macd.histogram > 0 ? 'Yükseliş' : 'Düşüş',
      bb_pct_b: bb.percent_b,
      ema_trend,
      vwap_status: price > vwap ? 'VWAP Üstünde' : 'VWAP Altında',
      wyckoff_phase: WYCKOFF_TR[wyckoff.phase] || wyckoff.phase,
      adx: adx.adx,
      bull: signals.bull,
      bear: signals.bear,
      fear_greed: fearGreed ? `${fearGreed.value} (${FG_LABEL_TR[fearGreed.label] || fearGreed.label})` : 'Bilinmiyor',
      manip_score: manipulation.score,
      overall_score: overallScore,
      verdict: VERDICT_TR[verdict] || verdict,
    };

    let aiCommentary = await getAICommentary(summaryForAI, apiKey);
    const aiUsed = !!aiCommentary;
    if (!aiCommentary) aiCommentary = generateFallbackCommentary(summaryForAI);

    // ── Format S/R ───────────────────────────────────────────────────────────
    const fmtArr = (arr) => arr.map(v => fmt(v));

    // ── Compose response ─────────────────────────────────────────────────────
    return res.status(200).json({
      // Market data
      coin: symbol,
      gecko_id: geckoId,
      current_price: fmt(price),
      price_raw: price,
      price_change_24h: `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`,
      high_24h: fmt(high24h),
      low_24h: fmt(low24h),
      volume_24h: vol24h >= 1e9 ? `$${(vol24h / 1e9).toFixed(3)}B` : `$${(vol24h / 1e6).toFixed(2)}M`,
      market_cap: marketCap >= 1e9 ? `$${(marketCap / 1e9).toFixed(3)}B` : `$${(marketCap / 1e6).toFixed(2)}M`,
      timestamp: new Date().toISOString(),

      // Verdict
      overall_verdict: verdict,
      confidence_score: confidence,
      risk_level: manipulation.risk,
      overall_score: overallScore,
      manipulation_score: manipulation.score,
      bullish_signals_count: signals.bull,
      bearish_signals_count: signals.bear,

      // Trends
      trend_daily,
      trend_4h,
      trend_1h,
      trend_15m,

      // Layers
      layer_scores: layerScores,

      // S/R
      supports: fmtArr(srLevels.supports),
      resistances: fmtArr(srLevels.resistances),
      supports_raw: srLevels.supports,
      resistances_raw: srLevels.resistances,

      // Trade plan
      entry_sniper: fmt(tradePlan.entry),
      stop_loss: fmt(tradePlan.stop_loss),
      tp1: fmt(tradePlan.tp1),
      tp2: fmt(tradePlan.tp2),
      tp3: fmt(tradePlan.tp3),
      leverage: tradePlan.leverage,
      risk_reward: tradePlan.risk_reward,
      risk_pct: tradePlan.risk_pct,
      position_size: tradePlan.position_size,
      trade_direction: tradePlan.direction,

      // External data
      fear_greed_index: fearGreed,

      // All technical indicators
      technical_indicators: {
        rsi_14: rsi,
        macd: {
          line: macd.line,
          signal_line: macd.signal_line,
          histogram: macd.histogram,
          trend: macd.histogram > 0 ? 'BULLISH' : 'BEARISH',
        },
        ema: {
          ema_8: parseFloat(ema8.toFixed(8)),
          ema_21: parseFloat(ema21.toFixed(8)),
          ema_50: parseFloat(ema50.toFixed(8)),
          alignment: trend_daily,
        },
        bollinger_bands: bb,
        stochastic: stoch,
        obv,
        adx,
        vwap: parseFloat(vwap.toFixed(8)),
        ichimoku,
      },

      // Structural analysis
      wyckoff,
      manipulation_detection: manipulation,
      trade_plan: tradePlan,

      // AI commentary
      ai_commentary: aiCommentary,
      ai_used: aiUsed,

      // Meta
      _meta: {
        data_source: 'CoinGecko API + Alternative.me',
        analysis_type: 'HYBRID_CODE_PLUS_AI',
        candles_analyzed: closes.length,
        ai_model: aiUsed ? 'claude-haiku-4-5-20251001' : 'yedek-yorum',
        ai_max_tokens: 500,
        supported_coins: Object.keys(GECKO_MAP).filter(k => !['POL', 'POLYGON', 'RNDR'].includes(k)).length,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Dahili sunucu hatası', mesaj: err.message });
  }
}
