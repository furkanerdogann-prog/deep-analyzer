// pages/api/analyze.js
// v5.0 — Dinamik coin map + in-memory cache + optimize AI prompt (400 token)

// ─── In-Memory Cache (15 dakika TTL) ─────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { data, ts: Date.now() });
}

// ─── Dinamik CoinGecko Map (top 250 otomatik) ────────────────────────────────
let dynamicGeckoMap = null;
let geckoMapLastFetch = 0;
const GECKO_MAP_TTL = 6 * 60 * 60 * 1000; // 6 saat

async function getGeckoMap() {
  if (dynamicGeckoMap && Date.now() - geckoMapLastFetch < GECKO_MAP_TTL) {
    return dynamicGeckoMap;
  }
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false',
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) throw new Error('CoinGecko markets API hatası');
    const coins = await res.json();
    const map = {};
    for (const coin of coins) {
      const sym = coin.symbol.toUpperCase();
      if (!map[sym]) map[sym] = coin.id;
    }
    // Manuel override'lar (çakışanlar için)
    map['POL'] = 'matic-network';
    map['RNDR'] = 'render-token';
    dynamicGeckoMap = map;
    geckoMapLastFetch = Date.now();
    return map;
  } catch {
    // Fallback: statik map
    return {
      BTC:'bitcoin',ETH:'ethereum',BNB:'binancecoin',SOL:'solana',XRP:'ripple',
      ADA:'cardano',AVAX:'avalanche-2',DOT:'polkadot',MATIC:'matic-network',
      LINK:'chainlink',UNI:'uniswap',ATOM:'cosmos',LTC:'litecoin',BCH:'bitcoin-cash',
      DOGE:'dogecoin',SHIB:'shiba-inu',PEPE:'pepe',WIF:'dogwifcoin',BONK:'bonk',
      INJ:'injective-protocol',SUI:'sui',APT:'aptos',ARB:'arbitrum',OP:'optimism',
      AAVE:'aave',TON:'the-open-network',RENDER:'render-token',GRT:'the-graph',
      TRX:'tron',NEAR:'near',FIL:'filecoin',ALGO:'algorand',VET:'vechain',
      HBAR:'hedera-hashgraph',KAS:'kaspa',STX:'blockstack',FLOKI:'floki',
      NOT:'notcoin',IMX:'immutable-x',LDO:'lido-dao',SEI:'sei-network',
      TIA:'celestia',FTM:'fantom',SAND:'the-sandbox',MANA:'decentraland',
      AXS:'axie-infinity',CHZ:'chiliz',GALA:'gala',CRV:'curve-dao-token',
      MKR:'maker',SNX:'synthetix-network-token',PENGU:'pudgy-penguins',
      TRUMP:'official-trump',FARTCOIN:'fartcoin',POPCAT:'popcat',
      MEW:'cat-in-a-dogs-world',BOME:'book-of-meme',WEN:'wen-4',
      MYRO:'myro',SLERF:'slerf',PNUT:'peanut-the-squirrel',
    };
  }
}

// ─── Price Formatter ──────────────────────────────────────────────────────────
function fmt(price) {
  if (price === null || price === undefined || isNaN(price)) return '$0';
  const d = price >= 1000 ? 2 : price >= 1 ? 4 : price >= 0.001 ? 6 : 10;
  return `$${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: d })}`;
}

// ─── Technical Indicators ─────────────────────────────────────────────────────
function calcEMA(data, period) {
  if (!data || data.length < 2) return data ? [data[0]] : [0];
  const k = 2 / (period + 1);
  const start = Math.min(period, data.length);
  let ema = data.slice(0, start).reduce((a, b) => a + b, 0) / start;
  const result = [ema];
  for (let i = start; i < data.length; i++) { ema = data[i] * k + ema * (1 - k); result.push(ema); }
  return result;
}

function calcSMA(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    result.push(data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
  }
  return result;
}

function calcRSI(closes, period = 14) {
  if (!closes || closes.length < period + 1) return 50;
  const changes = closes.slice(1).map((v, i) => v - closes[i]);
  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i]; else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period; avgLoss /= period;
  for (let i = period; i < changes.length; i++) {
    const g = changes[i] > 0 ? changes[i] : 0;
    const l = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
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
  return { line: parseFloat(lastM.toFixed(8)), signal_line: parseFloat(lastS.toFixed(8)), histogram: parseFloat((lastM - lastS).toFixed(8)) };
}

function calcBollingerBands(closes, period = 20, multiplier = 2) {
  const slice = closes.slice(-Math.min(period, closes.length));
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const stdDev = Math.sqrt(slice.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / slice.length);
  const upper = mean + multiplier * stdDev;
  const lower = mean - multiplier * stdDev;
  const price = closes[closes.length - 1];
  return {
    upper: parseFloat(upper.toFixed(8)), middle: parseFloat(mean.toFixed(8)), lower: parseFloat(lower.toFixed(8)),
    bandwidth: parseFloat(((upper - lower) / (mean || 1)).toFixed(4)),
    percent_b: parseFloat(Math.min(1.5, Math.max(-0.5, (upper - lower) > 0 ? (price - lower) / (upper - lower) : 0.5)).toFixed(4)),
  };
}

function calcStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  if (!closes || closes.length < kPeriod) return { k: 50, d: 50 };
  const kValues = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const hh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
    const ll = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
    kValues.push(hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100);
  }
  const dValues = calcSMA(kValues, Math.min(dPeriod, kValues.length));
  return { k: parseFloat(kValues[kValues.length - 1].toFixed(2)), d: parseFloat(dValues[dValues.length - 1].toFixed(2)) };
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
  return { value: Math.round(obv), trend: obv >= 0 ? 'POSITIVE' : 'NEGATIVE', change_5d: parseFloat((prev5 !== 0 ? ((obv - prev5) / Math.abs(prev5)) * 100 : 0).toFixed(2)) };
}

function calcADX(highs, lows, closes, period = 14) {
  if (!closes || closes.length < period + 2) return { adx: 20, plus_di: 20, minus_di: 20 };
  const tr = [], plusDM = [], minusDM = [];
  for (let i = 1; i < closes.length; i++) {
    tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
    const up = highs[i] - highs[i - 1], down = lows[i - 1] - lows[i];
    plusDM.push(up > down && up > 0 ? up : 0);
    minusDM.push(down > up && down > 0 ? down : 0);
  }
  let sTR = tr.slice(0, period).reduce((a, b) => a + b, 0);
  let sPDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
  let sMDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0);
  const dxArr = [];
  for (let i = period; i < tr.length; i++) {
    sTR = sTR - sTR / period + tr[i]; sPDM = sPDM - sPDM / period + plusDM[i]; sMDM = sMDM - sMDM / period + minusDM[i];
    const pDI = (sPDM / sTR) * 100, mDI = (sMDM / sTR) * 100;
    dxArr.push({ dx: (Math.abs(pDI - mDI) / (pDI + mDI || 1)) * 100, pDI, mDI });
  }
  if (!dxArr.length) return { adx: 20, plus_di: 20, minus_di: 20 };
  const last = dxArr[dxArr.length - 1];
  const adxVal = dxArr.slice(-period).reduce((s, v) => s + v.dx, 0) / Math.min(period, dxArr.length);
  return { adx: parseFloat(adxVal.toFixed(2)), plus_di: parseFloat(last.pDI.toFixed(2)), minus_di: parseFloat(last.mDI.toFixed(2)) };
}

function calcVWAP(closes, volumes) {
  let sumPV = 0, sumV = 0;
  for (let i = 0; i < closes.length; i++) { sumPV += closes[i] * volumes[i]; sumV += volumes[i]; }
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
  const cloudTop = Math.max(spanA, spanB), cloudBot = Math.min(spanA, spanB);
  let signal = 'NEUTRAL';
  if (price > cloudTop && tenkan > kijun) signal = 'BULLISH';
  else if (price < cloudBot && tenkan < kijun) signal = 'BEARISH';
  return {
    tenkan: parseFloat(tenkan.toFixed(8)), kijun: parseFloat(kijun.toFixed(8)),
    span_a: parseFloat(spanA.toFixed(8)), span_b: parseFloat(spanB.toFixed(8)),
    price_vs_cloud: price > cloudTop ? 'ABOVE' : price < cloudBot ? 'BELOW' : 'INSIDE', signal,
  };
}

function calcSupportResistance(closes, highs, lows) {
  const price = closes[closes.length - 1];
  const rawS = [], rawR = [];
  for (let i = 2; i < closes.length - 2; i++) {
    if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && lows[i] < lows[i+1] && lows[i] < lows[i+2]) rawS.push(lows[i]);
    if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && highs[i] > highs[i+1] && highs[i] > highs[i+2]) rawR.push(highs[i]);
  }
  const cluster = (levels) => {
    const sorted = [...levels].sort((a, b) => a - b);
    const clustered = [];
    let group = [];
    for (const l of sorted) {
      if (!group.length || (l - group[0]) / (group[0] || 1) < 0.015) group.push(l);
      else { clustered.push(group.reduce((a, b) => a + b, 0) / group.length); group = [l]; }
    }
    if (group.length) clustered.push(group.reduce((a, b) => a + b, 0) / group.length);
    return clustered;
  };
  let supports = cluster(rawS).filter(s => s < price).sort((a, b) => b - a).slice(0, 3);
  let resistances = cluster(rawR).filter(r => r > price).sort((a, b) => a - b).slice(0, 3);
  while (supports.length < 3) supports.push(price * (1 - 0.03 * (supports.length + 1)));
  while (resistances.length < 3) resistances.push(price * (1 + 0.03 * (resistances.length + 1)));
  return { supports, resistances };
}

function detectWyckoff(closes, volumes) {
  if (!closes || closes.length < 10) return { phase: 'UNKNOWN', signal: 'NEUTRAL', score: 5 };
  const n = closes.length;
  const maxP = Math.max(...closes), minP = Math.min(...closes);
  const posRatio = (closes[n-1] - minP) / ((maxP - minP) || 1);
  const recent = volumes.slice(-7), older = volumes.slice(-21, -7);
  const avgR = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgO = older.length ? older.reduce((a, b) => a + b, 0) / older.length : avgR;
  const volRatio = avgO > 0 ? avgR / avgO : 1;
  const trend30 = (closes[n-1] - closes[0]) / closes[0];
  const trend7 = (closes[n-1] - closes[Math.max(0, n-8)]) / closes[Math.max(0, n-8)];
  let phase, signal, score;
  if (posRatio < 0.25 && volRatio > 1.15 && trend7 > -0.03) { phase = 'ACCUMULATION'; signal = 'BULLISH'; score = 7; }
  else if (posRatio < 0.25 && trend30 < -0.15) { phase = 'MARKDOWN'; signal = 'BEARISH'; score = 3; }
  else if (posRatio > 0.75 && volRatio > 1.2 && trend7 < 0.02) { phase = 'DISTRIBUTION'; signal = 'BEARISH'; score = 3; }
  else if (posRatio > 0.75 && trend30 > 0.15) { phase = 'MARKUP'; signal = 'BULLISH'; score = 7; }
  else if (posRatio >= 0.35 && posRatio <= 0.65 && Math.abs(trend7) < 0.05) { phase = 'RE_ACCUMULATION'; signal = trend30 > 0 ? 'BULLISH' : 'NEUTRAL'; score = trend30 > 0 ? 6 : 5; }
  else { phase = trend30 > 0 ? 'MARKUP' : 'MARKDOWN'; signal = trend30 > 0 ? 'BULLISH' : 'BEARISH'; score = trend30 > 0 ? 6 : 4; }
  return { phase, signal, score, price_position_pct: parseFloat((posRatio * 100).toFixed(1)), vol_ratio: parseFloat(volRatio.toFixed(2)), trend_30d_pct: parseFloat((trend30 * 100).toFixed(2)) };
}

function detectManipulation(closes, highs, lows, volumes) {
  if (!closes || closes.length < 5) return { score: 0, signals: [], risk: 'LOW', vol_spike_ratio: 1, avg_wick_ratio: 0 };
  const n = closes.length;
  const signals = [];
  let score = 0;
  const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumes.length);
  const volSpike = avgVol > 0 ? volumes[n-1] / avgVol : 1;
  if (volSpike > 3) { signals.push(`Hacim ani artışı: ${volSpike.toFixed(1)}x`); score += 25; }
  else if (volSpike > 2) { signals.push(`Yüksek hacim: ${volSpike.toFixed(1)}x`); score += 10; }
  if (volSpike < 0.4 && n >= 5) {
    const move = Math.abs((closes[n-1] - closes[n-5]) / (closes[n-5] || 1));
    if (move > 0.05) { signals.push(`Düşük hacimde %${(move*100).toFixed(1)} hareket`); score += 20; }
  }
  const wickRatios = [];
  for (let i = Math.max(1, n-7); i < n; i++) {
    const body = Math.abs(closes[i] - closes[i-1]), range = highs[i] - lows[i];
    wickRatios.push(range > 0 ? (range - body) / range : 0);
  }
  const avgWick = wickRatios.reduce((a, b) => a + b, 0) / (wickRatios.length || 1);
  if (avgWick > 0.65) { signals.push(`Yüksek fitil (%${(avgWick*100).toFixed(0)}) — stop avı olası`); score += 20; }
  else if (avgWick > 0.5) { signals.push(`Artmış fitil (%${(avgWick*100).toFixed(0)})`); score += 8; }
  if (n >= 6) {
    const range5 = Math.max(...highs.slice(-6)) - Math.min(...lows.slice(-6));
    if (range5 > 0 && (highs[n-1] - lows[n-1]) > range5 * 0.75) { signals.push('Aşırı büyük mum'); score += 15; }
  }
  return { score: Math.min(100, score), signals, risk: score > 50 ? 'HIGH' : score > 25 ? 'MEDIUM' : 'LOW', vol_spike_ratio: parseFloat(volSpike.toFixed(2)), avg_wick_ratio: parseFloat((avgWick * 100).toFixed(1)) };
}

function countBullBearSignals({ rsi, macd, bb, stoch, obv, adx, vwap, ichimoku, price, ema8, ema21, ema50, wyckoff }) {
  let bull = 0, bear = 0;
  if (rsi < 32) bull++; else if (rsi > 68) bear++; else if (rsi > 55) bull++; else bear++;
  if (macd.histogram > 0) bull++; else bear++;
  if (bb.percent_b < 0.15) bull++; else if (bb.percent_b > 0.85) bear++; else if (bb.percent_b > 0.5) bull++; else bear++;
  if (stoch.k < 25 && stoch.k > stoch.d) bull++; else if (stoch.k > 75 && stoch.k < stoch.d) bear++;
  if (obv.trend === 'POSITIVE' && obv.change_5d > 2) bull++; else if (obv.trend === 'NEGATIVE' && obv.change_5d < -2) bear++;
  if (ema8 > ema21 && ema21 > ema50) bull++; else if (ema8 < ema21 && ema21 < ema50) bear++;
  if (price > vwap * 1.005) bull++; else if (price < vwap * 0.995) bear++;
  if (adx.adx > 20 && adx.plus_di > adx.minus_di) bull++; else if (adx.adx > 20 && adx.minus_di > adx.plus_di) bear++;
  if (ichimoku.signal === 'BULLISH') bull++; else if (ichimoku.signal === 'BEARISH') bear++;
  if (wyckoff.signal === 'BULLISH') bull++; else if (wyckoff.signal === 'BEARISH') bear++;
  return { bull: Math.min(10, bull), bear: Math.min(10, bear) };
}

function calcTradePlan(price, supports, resistances, { bb }, { bull, bear }) {
  const isBullish = bull >= bear;
  const strength = Math.max(bull, bear) / 10;
  let entry, sl, tp1, tp2, tp3;
  if (isBullish) {
    entry = supports[0] ? Math.min(price, (price + supports[0]) / 2) : price;
    sl = supports[0] ? supports[0] * 0.983 : price * 0.95;
    tp1 = resistances[0] || price * 1.05; tp2 = resistances[1] || price * 1.10; tp3 = resistances[2] || price * 1.18;
  } else {
    entry = resistances[0] ? Math.max(price, (price + resistances[0]) / 2) : price;
    sl = resistances[0] ? resistances[0] * 1.017 : price * 1.05;
    tp1 = supports[0] || price * 0.95; tp2 = supports[1] || price * 0.90; tp3 = supports[2] || price * 0.83;
  }
  const riskPct = Math.abs(entry - sl) / (entry || 1);
  const rewardPct = Math.abs(tp1 - entry) / (entry || 1);
  const rr = riskPct > 0 ? rewardPct / riskPct : 1;
  const volatility = Math.max(0.01, bb.bandwidth || 0.05);
  const leverage = Math.max(1, Math.min(10, Math.round((0.02 / volatility) * strength * 10) || 2));
  return {
    direction: isBullish ? 'LONG' : 'SHORT',
    entry: parseFloat(entry.toFixed(8)), stop_loss: parseFloat(sl.toFixed(8)),
    tp1: parseFloat(tp1.toFixed(8)), tp2: parseFloat(tp2.toFixed(8)), tp3: parseFloat(tp3.toFixed(8)),
    leverage: `${leverage}x`, risk_reward: `1:${rr.toFixed(2)}`,
    risk_pct: parseFloat((riskPct * 100).toFixed(2)),
    position_size: `${Math.max(1, Math.min(25, Math.round(strength * 20)))}%`,
  };
}

function calc16LayerScores({ rsi, macd, bb, stoch, obv, adx, vwap, ichimoku, price, ema8, ema21, ema50 }, signals, wyckoff, manipulation, srLevels, fearGreed) {
  const { bull, bear } = signals;
  const fg = fearGreed ? fearGreed.value : 50;
  const clamp = (v) => parseFloat(Math.min(10, Math.max(0, v)).toFixed(1));
  const s1 = clamp(wyckoff.score);
  const s2 = clamp(ema8 > ema21 && ema21 > ema50 ? 8 : ema8 < ema21 && ema21 < ema50 ? 2 : 5);
  const s3 = clamp(price > vwap ? (ichimoku.price_vs_cloud === 'ABOVE' ? 8 : 6.5) : (ichimoku.price_vs_cloud === 'BELOW' ? 2 : 3.5));
  const s4 = clamp(10 - manipulation.score / 10);
  const s5 = clamp(obv.trend === 'POSITIVE' ? (obv.change_5d > 5 ? 8 : 6.5) : (obv.change_5d < -5 ? 2 : 3.5));
  const macdNorm = price > 0 ? (macd.histogram / price) * 500 : 0;
  const s6 = clamp(5 + macdNorm);
  const bw = bb.bandwidth;
  const s7 = clamp(bw < 0.04 ? 7 : bw > 0.25 ? 4 : 5 + (0.12 - bw) * 15);
  const s8 = clamp(rsi > 50 && ema8 > ema21 ? 7.5 : rsi < 50 && ema8 < ema21 ? 2.5 : rsi > 50 && ema8 < ema21 ? 6 : 4);
  const s9 = clamp((((rsi - 20) / 60) * 10 + (stoch.k > stoch.d ? 7 : 3) + (macd.histogram > 0 ? 7 : 3)) / 3);
  const srQ = srLevels.supports.length + srLevels.resistances.length;
  const s10 = clamp(srQ >= 6 ? 8 : srQ >= 4 ? 6 : 4);
  const s11 = clamp(fg / 10);
  const s12 = clamp(adx.adx > 30 ? (adx.plus_di > adx.minus_di ? 8 : 2) : adx.adx > 20 ? (adx.plus_di > adx.minus_di ? 7 : 3) : 5);
  const s13 = clamp(stoch.k < 25 ? 7.5 : stoch.k > 75 ? 3 : 5);
  const s14 = clamp(rsi < 35 && stoch.k < 25 ? 8.5 : rsi > 65 && stoch.k > 75 ? 1.5 : 5);
  const s15 = clamp(bull >= 7 ? 8 : bull >= 5 ? 6.5 : bear >= 7 ? 2 : bear >= 5 ? 3.5 : 5);
  const prev15 = [s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12,s13,s14,s15];
  const s16 = clamp(prev15.reduce((a, b) => a + b, 0) / 15);
  return [...prev15, s16];
}

// ─── OPTİMİZE AI PROMPT (12 katmanlı, ~400 token) ────────────────────────────
async function getAICommentary(d, apiKey) {
  if (!apiKey) return null;
  try {
    const prompt = `Kripto analist. Türkçe yanıt. Sadece JSON döndür.

${d.coin} | $${d.price} | RSI:${d.rsi} | MACD:${d.macd} | BB%B:${d.bb} | EMA:${d.ema} | VWAP:${d.vwap}
Wyckoff:${d.wyckoff} | ADX:${d.adx} | Sinyal:${d.bull}B/${d.bear}A | F&G:${d.fg} | Manip:${d.manip}/100
Skor:${d.score}/100 | Karar:${d.verdict} | Destek:${d.s1} | Direnç:${d.r1}

JSON format (Türkçe):
{"summary":"3 cümle özet","mmMove":"2 cümle MM stratejisi","bullScenario":"2 cümle yükseliş","bearScenario":"2 cümle düşüş","warnings":["uyarı1","uyarı2","uyarı3"],"onchain_summary":"2 cümle zincir üstü","orderflow_summary":"2 cümle emir akışı"}`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 500, temperature: 0.3, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) return null;
    try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch {}
    return null;
  } catch { return null; }
}

function fallbackCommentary(d) {
  const dom = d.bull > d.bear ? 'yükseliş' : 'düşüş';
  const rsiZ = d.rsi < 35 ? 'aşırı satım' : d.rsi > 65 ? 'aşırı alım' : 'nötr';
  return {
    summary: `${d.coin} $${d.price} seviyesinde RSI ${d.rsi} ile ${rsiZ} bölgesinde. Wyckoff ${d.wyckoff} fazı, skor ${d.score}/100.`,
    mmMove: `Piyasa yapıcılar ${dom} yönünde konumlanmış. ADX ${d.adx} ile ${d.adx > 25 ? 'güçlü' : 'zayıf'} trend.`,
    bullScenario: `${d.bull}/10 boğa sinyali ile ${d.r1} direnci hedeflenebilir. Yükseliş teyidi için MACD çaprazı şart.`,
    bearScenario: `${d.bear}/10 ayı baskısı ile ${d.s1} desteği test edilebilir. Manipülasyon ${d.manip}/100 risk yüksek.`,
    warnings: [`RSI ${d.rsi} — ${rsiZ} bölgesi`, `Manipülasyon skoru ${d.manip}/100`, `${d.wyckoff} fazında dikkatli olun`],
    onchain_summary: `OBV trendi ve VWAP ${d.vwap} konumu kurumsal ilgiyi ${dom === 'yükseliş' ? 'pozitif' : 'negatif'} gösteriyor.`,
    orderflow_summary: `${d.bull}B/${d.bear}A sinyal dağılımı ${dom} ağırlıklı emir akışına işaret ediyor.`,
  };
}

// ─── 12 Katman Confluence Skoru ───────────────────────────────────────────────
function calc12LayerConfluence({ rsi, macd, bb, stoch, adx, ichimoku, wyckoff }, signals, srLevels, fearGreed, trend_daily) {
  const { bull, bear } = signals;
  const isBull = bull >= bear;
  let score = 0;
  const factors = [];

  // K1: Trend yönü teyidi
  if ((isBull && trend_daily === 'BULLISH') || (!isBull && trend_daily === 'BEARISH')) { score += 2; factors.push('✅ Trend Teyidi +2'); } else factors.push('❌ Trend Karşıt');

  // K2: SMC Order Block (EMA yapısı)
  const emaAligned = isBull ? (wyckoff.signal === 'BULLISH') : (wyckoff.signal === 'BEARISH');
  if (emaAligned) { score += 2; factors.push('✅ SMC/Wyckoff +2'); } else factors.push('❌ SMC Zayıf');

  // K3: Fibonacci (BB %B proxy)
  const fibOk = isBull ? bb.percent_b < 0.35 : bb.percent_b > 0.65;
  if (fibOk) { score += 1; factors.push('✅ Fib Bölgesi +1'); } else factors.push('❌ Fib Dışı');

  // K4: Hacim teyidi
  if (adx.adx > 20) { score += 1; factors.push('✅ Hacim/ADX +1'); } else factors.push('❌ Hacim Zayıf');

  // K5: RSI/MACD teyidi
  const rsiOk = isBull ? rsi < 55 : rsi > 45;
  if (rsiOk && ((isBull && macd.histogram > 0) || (!isBull && macd.histogram < 0))) { score += 1; factors.push('✅ RSI+MACD +1'); } else factors.push('❌ RSI/MACD Karşıt');

  // K6: S/R seviyesi
  const srOk = srLevels.supports.length >= 2 && srLevels.resistances.length >= 2;
  if (srOk) { score += 1; factors.push('✅ S/R Güçlü +1'); } else factors.push('❌ S/R Zayıf');

  // K7: Pattern (Stoch + RSI confluence)
  const patternOk = isBull ? (rsi < 40 && stoch.k < 35) : (rsi > 60 && stoch.k > 65);
  if (patternOk) { score += 1; factors.push('✅ Pattern +1'); } else factors.push('⚠️ Pattern Yok');

  // K8: Ichimoku
  if ((isBull && ichimoku.signal === 'BULLISH') || (!isBull && ichimoku.signal === 'BEARISH')) { score += 1; factors.push('✅ Ichimoku +1'); } else factors.push('❌ Ichimoku Nötr');

  // Bonus: Fear & Greed extremes
  if (fearGreed) {
    if ((isBull && fearGreed.value < 25) || (!isBull && fearGreed.value > 75)) { score += 0; factors.push(`📊 F&G: ${fearGreed.value} (kontrarian sinyali)`); }
  }

  return { score: Math.min(10, score), max: 10, factors, rating: score >= 8 ? 'ELİT' : score >= 6 ? 'GÜÇLÜ' : score >= 4 ? 'ORTA' : 'ZAYIF' };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { coin } = req.body;
  if (!coin || typeof coin !== 'string') return res.status(400).json({ error: "Geçersiz 'coin' alanı" });
  
  const symbol = coin.toUpperCase().replace(/USDT?$/i, '').trim();

  // Cache kontrolü
  const cacheKey = `analyze_${symbol}`;
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json({ ...cached, _cached: true, _cache_age_seconds: Math.round((Date.now() - (cache.get(cacheKey)?.ts || Date.now())) / 1000) });

  // Dinamik coin map
  const geckoMap = await getGeckoMap();
  const geckoId = geckoMap[symbol];
  if (!geckoId) {
    return res.status(400).json({
      error: `Desteklenmeyen coin: ${symbol}`,
      toplam_desteklenen: Object.keys(geckoMap).length,
      ipucu: 'Top 250 coin otomatik desteklenir. USDT olmadan sembol girin (örn: BTC, ETH, PENGU)',
    });
  }

  try {
    const [coinRes, chartRes, fgRes] = await Promise.allSettled([
      fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&community_data=false&developer_data=false`, { headers: { Accept: 'application/json' } }),
      fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=60&interval=daily`, { headers: { Accept: 'application/json' } }),
      fetch('https://api.alternative.me/fng/?limit=1', { headers: { Accept: 'application/json' } }),
    ]);

    if (coinRes.status === 'rejected' || !coinRes.value?.ok) return res.status(502).json({ error: 'CoinGecko coin verisi alınamadı' });
    if (chartRes.status === 'rejected' || !chartRes.value?.ok) return res.status(502).json({ error: 'CoinGecko grafik verisi alınamadı' });

    const coinData = await coinRes.value.json();
    const chartData = await chartRes.value.json();

    let fearGreed = null;
    if (fgRes.status === 'fulfilled' && fgRes.value?.ok) {
      try { const fgData = await fgRes.value.json(); if (fgData.data?.[0]) fearGreed = { value: parseInt(fgData.data[0].value, 10), label: fgData.data[0].value_classification }; } catch {}
    }

    const closes = chartData.prices.map(p => p[1]);
    const volumes = chartData.total_volumes.map(v => v[1]);
    if (closes.length < 10) return res.status(502).json({ error: 'Yetersiz veri' });

    const highs = closes.map((c, i) => i > 0 ? Math.max(c, closes[i-1]) * 1.012 : c * 1.012);
    const lows = closes.map((c, i) => i > 0 ? Math.min(c, closes[i-1]) * 0.988 : c * 0.988);

    const md = coinData.market_data;
    const price = md.current_price.usd;
    const change24h = md.price_change_percentage_24h ?? 0;

    // Indicators
    const rsi = calcRSI(closes);
    const macd = calcMACD(closes);
    const bb = calcBollingerBands(closes);
    const stoch = calcStochastic(highs, lows, closes);
    const obv = calcOBV(closes, volumes);
    const adx = calcADX(highs, lows, closes);
    const vwap = calcVWAP(closes, volumes);
    const ichimoku = calcIchimoku(highs, lows, closes);
    const ema8arr = calcEMA(closes, 8), ema21arr = calcEMA(closes, 21), ema50arr = calcEMA(closes, 50);
    const ema8 = ema8arr[ema8arr.length-1], ema21 = ema21arr[ema21arr.length-1], ema50 = ema50arr[ema50arr.length-1];

    const srLevels = calcSupportResistance(closes, highs, lows);
    const wyckoff = detectWyckoff(closes, volumes);
    const manipulation = detectManipulation(closes, highs, lows, volumes);

    const indicators = { rsi, macd, bb, stoch, obv, adx, vwap, ichimoku, price, ema8, ema21, ema50, wyckoff };
    const signals = countBullBearSignals(indicators);
    const tradePlan = calcTradePlan(price, srLevels.supports, srLevels.resistances, indicators, signals);
    const layerScores = calc16LayerScores(indicators, signals, wyckoff, manipulation, srLevels, fearGreed);
    const overallScore = parseFloat((layerScores.reduce((a, b) => a + b, 0) / layerScores.length * 10).toFixed(1));

    const netSignal = signals.bull - signals.bear;
    let verdict, confidence;
    if (netSignal >= 5) { verdict = 'STRONG_BUY'; confidence = Math.min(95, 82 + netSignal); }
    else if (netSignal >= 2) { verdict = 'BUY'; confidence = Math.min(90, 65 + netSignal * 4); }
    else if (netSignal <= -5) { verdict = 'STRONG_SELL'; confidence = Math.min(95, 82 + Math.abs(netSignal)); }
    else if (netSignal <= -2) { verdict = 'SELL'; confidence = Math.min(90, 65 + Math.abs(netSignal) * 4); }
    else { verdict = 'NEUTRAL'; confidence = 45 + Math.abs(netSignal) * 5; }

    const trend_daily = ema8 > ema50 ? 'BULLISH' : ema8 < ema50 ? 'BEARISH' : 'NEUTRAL';
    const trend_4h = ema8 > ema21 ? 'BULLISH' : ema8 < ema21 ? 'BEARISH' : 'NEUTRAL';
    const trend_1h = macd.histogram > 0 ? 'BULLISH' : 'BEARISH';
    const trend_15m = stoch.k > stoch.d ? 'BULLISH' : 'BEARISH';

    // 12 Katman Confluence
    const confluence12 = calc12LayerConfluence({ rsi, macd, bb, stoch, adx, ichimoku, wyckoff }, signals, srLevels, fearGreed, trend_daily);

    const WYCKOFF_TR = { ACCUMULATION:'Birikim', MARKUP:'Yükseliş', DISTRIBUTION:'Dağıtım', MARKDOWN:'Düşüş', RE_ACCUMULATION:'Yeniden Birikim' };
    const VERDICT_TR = { STRONG_BUY:'Güçlü Al', BUY:'Al', NEUTRAL:'Nötr', SELL:'Sat', STRONG_SELL:'Güçlü Sat' };
    const FG_TR = { 'Extreme Fear':'Aşırı Korku', 'Fear':'Korku', 'Neutral':'Nötr', 'Greed':'Açgözlülük', 'Extreme Greed':'Aşırı Açgözlülük' };

    const aiInput = {
      coin: symbol, price: price >= 1 ? price.toFixed(4) : price.toFixed(8),
      rsi, macd: macd.histogram > 0 ? 'Yükseliş' : 'Düşüş', bb: bb.percent_b,
      ema: ema8 > ema21 && ema21 > ema50 ? 'Yükseliş (8>21>50)' : ema8 < ema21 && ema21 < ema50 ? 'Düşüş' : 'Karışık',
      vwap: price > vwap ? 'Üstünde' : 'Altında', wyckoff: WYCKOFF_TR[wyckoff.phase] || wyckoff.phase,
      adx: adx.adx, bull: signals.bull, bear: signals.bear,
      fg: fearGreed ? `${fearGreed.value} (${FG_TR[fearGreed.label] || fearGreed.label})` : 'Bilinmiyor',
      manip: manipulation.score, score: overallScore, verdict: VERDICT_TR[verdict] || verdict,
      s1: fmt(srLevels.supports[0]), r1: fmt(srLevels.resistances[0]),
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let aiCommentary = await getAICommentary(aiInput, apiKey);
    const aiUsed = !!aiCommentary;
    if (!aiCommentary) aiCommentary = fallbackCommentary(aiInput);

    const vol24h = md.total_volume.usd;
    const marketCap = md.market_cap.usd;

    const response = {
      coin: symbol, gecko_id: geckoId, current_price: fmt(price), price_raw: price,
      price_change_24h: `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`,
      high_24h: fmt(md.high_24h.usd), low_24h: fmt(md.low_24h.usd),
      volume_24h: vol24h >= 1e9 ? `$${(vol24h/1e9).toFixed(3)}B` : `$${(vol24h/1e6).toFixed(2)}M`,
      market_cap: marketCap >= 1e9 ? `$${(marketCap/1e9).toFixed(3)}B` : `$${(marketCap/1e6).toFixed(2)}M`,
      timestamp: new Date().toISOString(),
      overall_verdict: verdict, confidence_score: confidence,
      risk_level: manipulation.risk, overall_score: overallScore,
      manipulation_score: manipulation.score,
      bullish_signals_count: signals.bull, bearish_signals_count: signals.bear,
      trend_daily, trend_4h, trend_1h, trend_15m,
      layer_scores: layerScores,
      confluence_12layer: confluence12,
      supports: srLevels.supports.map(v => fmt(v)), resistances: srLevels.resistances.map(v => fmt(v)),
      supports_raw: srLevels.supports, resistances_raw: srLevels.resistances,
      entry_sniper: fmt(tradePlan.entry), stop_loss: fmt(tradePlan.stop_loss),
      tp1: fmt(tradePlan.tp1), tp2: fmt(tradePlan.tp2), tp3: fmt(tradePlan.tp3),
      leverage: tradePlan.leverage, risk_reward: tradePlan.risk_reward,
      risk_pct: tradePlan.risk_pct, position_size: tradePlan.position_size,
      trade_direction: tradePlan.direction,
      fear_greed_index: fearGreed,
      technical_indicators: {
        rsi_14: rsi, macd: { ...macd, trend: macd.histogram > 0 ? 'BULLISH' : 'BEARISH' },
        ema: { ema_8: parseFloat(ema8.toFixed(8)), ema_21: parseFloat(ema21.toFixed(8)), ema_50: parseFloat(ema50.toFixed(8)), alignment: trend_daily },
        bollinger_bands: bb, stochastic: stoch, obv, adx, vwap: parseFloat(vwap.toFixed(8)), ichimoku,
      },
      wyckoff, manipulation_detection: manipulation, trade_plan: tradePlan,
      ai_commentary: aiCommentary.summary || '',
      warnings: aiCommentary.warnings || [],
      ai_bull_scenario: aiCommentary.bullScenario || '',
      ai_bear_scenario: aiCommentary.bearScenario || '',
      ai_mm_move: aiCommentary.mmMove || '',
      ai_onchain_summary: aiCommentary.onchain_summary || '',
      ai_orderflow_summary: aiCommentary.orderflow_summary || '',
      ai_used: aiUsed,
      _meta: {
        data_source: 'CoinGecko + Alternative.me',
        analysis_type: 'HYBRID_v5',
        candles_analyzed: closes.length,
        ai_model: aiUsed ? 'claude-haiku-4-5-20251001' : 'fallback',
        ai_tokens_approx: aiUsed ? 400 : 0,
        supported_coins: Object.keys(geckoMap).length,
        cache_ttl_minutes: 15,
      },
    };

    setCache(cacheKey, response);
    return res.status(200).json(response);

  } catch (err) {
    return res.status(500).json({ error: 'Dahili sunucu hatası', mesaj: err.message });
  }
}
