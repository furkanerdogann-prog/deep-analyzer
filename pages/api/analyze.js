// pages/api/analyze.js — CHARTOS Engine v8.1 — Çok Dilli

const CACHE_TTL = 60 * 60;

async function redisGet(key) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return null;
    const r = await fetch(`${url}/get/${key}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    return d.result ? JSON.parse(d.result) : null;
  } catch { return null; }
}

async function redisSet(key, value, ttl) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return;
    await fetch(`${url}/set/${key}/${encodeURIComponent(JSON.stringify(value))}?ex=${ttl}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {}
}

async function redisPush(key, value, maxLen = 10) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return;
    await fetch(`${url}/lpush/${key}/${encodeURIComponent(JSON.stringify(value))}`, { headers: { Authorization: `Bearer ${token}` } });
    await fetch(`${url}/ltrim/${key}/0/${maxLen - 1}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {}
}

let geckoMap = null;
let geckoMapTs = 0;

async function getGeckoMap() {
  if (geckoMap && Date.now() - geckoMapTs < 6 * 3600000) return geckoMap;
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false');
    if (!r.ok) throw new Error();
    const coins = await r.json();
    const map = {};
    for (const c of coins) { if (!map[c.symbol.toUpperCase()]) map[c.symbol.toUpperCase()] = { id: c.id, name: c.name }; }
    geckoMap = map; geckoMapTs = Date.now();
    return map;
  } catch {
    return {
      BTC:{id:'bitcoin',name:'Bitcoin'}, ETH:{id:'ethereum',name:'Ethereum'},
      BNB:{id:'binancecoin',name:'BNB'}, SOL:{id:'solana',name:'Solana'},
      XRP:{id:'ripple',name:'XRP'}, ADA:{id:'cardano',name:'Cardano'},
      AVAX:{id:'avalanche-2',name:'Avalanche'}, DOT:{id:'polkadot',name:'Polkadot'},
      DOGE:{id:'dogecoin',name:'Dogecoin'}, SHIB:{id:'shiba-inu',name:'Shiba Inu'},
      PEPE:{id:'pepe',name:'Pepe'}, INJ:{id:'injective-protocol',name:'Injective'},
      SUI:{id:'sui',name:'Sui'}, ARB:{id:'arbitrum',name:'Arbitrum'},
      TON:{id:'the-open-network',name:'TON'}, NEAR:{id:'near',name:'NEAR'},
    };
  }
}

async function getLivePrice(geckoId) {
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&community_data=false&developer_data=false`);
    if (!r.ok) return null;
    const d = await r.json();
    const md = d.market_data;
    return {
      price: md.current_price.usd,
      change24h: md.price_change_percentage_24h,
      high24h: md.high_24h.usd,
      low24h: md.low_24h.usd,
      volume24h: md.total_volume.usd,
      marketCap: md.market_cap.usd,
      ath: md.ath.usd,
      athChange: md.ath_change_percentage.usd,
    };
  } catch { return null; }
}

function fmtPrice(p) {
  if (!p) return 'N/A';
  if (p >= 1000) return '$' + p.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
  if (p >= 1) return '$' + p.toFixed(4);
  if (p >= 0.001) return '$' + p.toFixed(6);
  return '$' + p.toFixed(10);
}

function fmtVol(v) {
  if (!v) return 'N/A';
  if (v >= 1e9) return '$' + (v/1e9).toFixed(2) + 'B';
  if (v >= 1e6) return '$' + (v/1e6).toFixed(1) + 'M';
  return '$' + v.toFixed(0);
}

// Dil bazlı sistem promptu
function getSystemPrompt(lang) {
  const langInstructions = {
    TR: 'Analizi TAMAMEN TÜRKÇE yaz. Tüm başlıklar, açıklamalar ve değerler Türkçe olacak.',
    EN: 'Write the ENTIRE analysis in ENGLISH. All headings, descriptions and values must be in English.',
    DE: 'Schreibe die GESAMTE Analyse auf DEUTSCH. Alle Überschriften, Beschreibungen und Werte müssen auf Deutsch sein.',
    FR: 'Écris TOUTE l\'analyse en FRANÇAIS. Tous les titres, descriptions et valeurs doivent être en français.',
  };

  const langFormats = {
    TR: `Setup Tipi:
Giriş Bölgesi: $[fiyat] - $[fiyat]
Stop / Invalidation: $[fiyat]
Hedef 1: $[fiyat]
Hedef 2: $[fiyat]
Hedef 3: $[fiyat]
R:R Oranı: 1:[sayı]
Beklenen Süre: [süre]`,
    EN: `Setup Type:
Entry Zone: $[price] - $[price]
Stop / Invalidation: $[price]
Target 1: $[price]
Target 2: $[price]
Target 3: $[price]
R:R Ratio: 1:[number]
Expected Duration: [duration]`,
    DE: `Setup-Typ:
Einstiegszone: $[Preis] - $[Preis]
Stop / Invalidierung: $[Preis]
Ziel 1: $[Preis]
Ziel 2: $[Preis]
Ziel 3: $[Preis]
R:R Verhältnis: 1:[Zahl]
Erwartete Dauer: [Dauer]`,
    FR: `Type de Setup:
Zone d'Entrée: $[prix] - $[prix]
Stop / Invalidation: $[prix]
Objectif 1: $[prix]
Objectif 2: $[prix]
Objectif 3: $[prix]
Ratio R:R: 1:[nombre]
Durée Estimée: [durée]`,
  };

  const instruction = langInstructions[lang] || langInstructions.TR;
  const format = langFormats[lang] || langFormats.TR;

  return `Sen CHARTOS 3.0'sun. 1 saatlik, 4 saatlik ve 1 günlük verilerde tüm finansal piyasaların mutlak uzman yapay zeka analiz motorusun.

${instruction}

Bilgi seviyen:
• ICT 2022-2026 Full (Silver Bullet, Judas Swing, Turtle Soup, MSS, BOS, CHOCH, Order Block, Breaker, FVG, Imbalance, Liquidity Void, PD Array)
• Wyckoff 2.0 + Spring/Upthrust + Phase C Shakeout + Re-accumulation
• Volume Profile (Composite + Fixed Range + Session) + Order Flow + Delta + Footprint
• Elliott + Neo Wave + Harmonic + Advanced Fibonacci (Expansion, Extension, Cluster)
• Pure Price Action + Market Structure + Institutional Manipulation Engineering
• On-chain (whale wallets, exchange flow, SOPR, MVRV, Puell) + Funding Rate + OI + CVD + Long/Short Ratio
• Market Maker psikolojisi: Stop hunt, inducement, equal highs/lows, liquidity engineering, phase A-B-C-D

Her analizde mutlaka şu kuralları uygula:
1. Market Maker Lens: "Ben MM olsam şu anda ne yapardım?"
2. 8 katmanlı analiz: HTF → Price Action → Volume → Liquidity → Fibonacci → Multi-TF → On-chain → Meta İçgörü

ÇIKTI FORMATI — HİÇBİR SATIRI ATLAMA:

🔱 CHARTOS MODU – META ULTRA ELİT AKTİF 🔱

Market Maker Lens:
Varlık: [coin/USDT]
Güncel Fiyat: [GERÇEK FİYATI KULLAN]
Ana Timeframe: 1H / 4H / 1D
DeepTrader Bias: [Aşırı Boğa / Boğa / Nötr / Ayı / Aşırı Ayı] | Güven: %XX | HTF Bias: [bias]

PİYASA YAPISI (MM Gözüyle):
• HTF Bias & Son Değişim:
• Mevcut BOS / CHOCH / MSS:
• Unmitigated Order Block'lar:
• FVG / Imbalance'lar:
• Liquidity Pool'lar:

ANA SEVİYELER:
Demand Zone: $[fiyat] - $[fiyat]
Supply Zone: $[fiyat] - $[fiyat]
Kritik Liquidity: $[fiyat]
Invalidation: $[fiyat]

SENARYO ANALİZİ:
Boğa Senaryosu (%XX): [açıklama]
Ayı Senaryosu (%XX): [açıklama]

YÜKSEK OLASILIKLI DeepTradeScan SETUP'I:
${format}

DeepTrade İÇGÖRÜ:
[En derin meta yorum — confluence skoru, gizli pattern, manipülasyon senaryosu]

Risk Uyarısı: [Finansal tavsiye değildir — dile göre yaz]

KURALLAR:
- SETUP bölümündeki TÜM satırları doldur — Giriş/Entry, Stop, Hedef/Target 1-2-3 HEPSİ DOLU OLMALI
- Gerçek fiyat verilerini kullan
- Profesyonel, soğuk, net trader dili kullan
- ${instruction}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { coin, lang = 'TR' } = req.body;
  if (!coin) return res.status(400).json({ error: 'Coin gerekli' });

  const symbol = coin.toUpperCase().trim();
  const validLang = ['TR','EN','DE','FR'].includes(lang) ? lang : 'TR';

  // Cache key dile göre ayrı
  const cacheKey = `chartos:${symbol}:${validLang}`;
  const cached = await redisGet(cacheKey);
  if (cached) return res.status(200).json({ ...cached, _cached: true });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key eksik' });

  const map = await getGeckoMap();
  const coinInfo = map[symbol];
  let priceData = null;
  if (coinInfo) priceData = await getLivePrice(coinInfo.id);

  const priceStr = priceData
    ? `REAL-TIME DATA:
Coin: ${symbol} (${coinInfo?.name || symbol})
Current Price: ${fmtPrice(priceData.price)}
24h Change: ${priceData.change24h?.toFixed(2)}%
24h High: ${fmtPrice(priceData.high24h)}
24h Low: ${fmtPrice(priceData.low24h)}
Volume: ${fmtVol(priceData.volume24h)}
Market Cap: ${fmtVol(priceData.marketCap)}
ATH: ${fmtPrice(priceData.ath)} (${priceData.athChange?.toFixed(1)}% from ATH)`
    : `Coin: ${symbol} (no price data)`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        temperature: 0.3,
        system: getSystemPrompt(validLang),
        messages: [{
          role: 'user',
          content: `${priceStr}\n\nAnalyze ${symbol} now. Fill ALL fields in SETUP section — Entry, Stop, Target 1, Target 2, Target 3 must ALL be filled. Write in ${validLang === 'TR' ? 'Turkish' : validLang === 'EN' ? 'English' : validLang === 'DE' ? 'German' : 'French'}.`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: 'AI hatası', detail: err });
    }

    const data = await response.json();
    const analysis = data.content?.[0]?.text || '';

    const result = {
      coin: symbol,
      analysis,
      lang: validLang,
      price: priceData ? fmtPrice(priceData.price) : null,
      timestamp: new Date().toISOString()
    };

    await redisSet(cacheKey, result, CACHE_TTL);
    await redisPush('chartos:recent', {
      coin: symbol,
      time: new Date().toLocaleTimeString('tr-TR'),
      price: result.price
    }, 10);

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası', detail: e.message });
  }
}
