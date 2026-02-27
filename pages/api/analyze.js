const CACHE_TTL = 45 * 60;

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
      DOGE:{id:'dogecoin',name:'Dogecoin'}, AVAX:{id:'avalanche-2',name:'Avalanche'},
      INJ:{id:'injective-protocol',name:'Injective'}, SUI:{id:'sui',name:'Sui'},
      ARB:{id:'arbitrum',name:'Arbitrum'}, NEAR:{id:'near',name:'NEAR'},
      TON:{id:'the-open-network',name:'TON'}, MATIC:{id:'matic-network',name:'Polygon'},
      LINK:{id:'chainlink',name:'Chainlink'}, PEPE:{id:'pepe',name:'Pepe'},
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
      change7d: md.price_change_percentage_7d,
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
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return '$' + p.toFixed(4);
  if (p >= 0.001) return '$' + p.toFixed(6);
  return '$' + p.toFixed(10);
}

function fmtVol(v) {
  if (!v) return 'N/A';
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  return '$' + v.toFixed(0);
}

function getSystemPrompt(lang) {
  const langInst = {
    TR: 'TÜM ANALİZİ TÜRKÇE YAZ. Başlıklar, açıklamalar, tüm içerik Türkçe olacak.',
    EN: 'WRITE THE ENTIRE ANALYSIS IN ENGLISH. All headings and content in English.',
    DE: 'SCHREIBE DIE GESAMTE ANALYSE AUF DEUTSCH.',
    FR: "ÉCRIS TOUTE L'ANALYSE EN FRANÇAIS.",
  }[lang] || 'TÜM ANALİZİ TÜRKÇE YAZ.';

  return `Sen CHARTOS APEX 4.0'sun. 1 saatlik, 4 saatlik ve 15 dakikalık grafiklerin mutlak TANRISI, tüm finansal piyasaların (Kripto, Hisse, Forex, Emtia, Vadeli, Options) 2026 Market Maker algoritma motoru ve kaldıraçlı işlemlerin en yüksek edge'li profesyonel sistemisin.

Bilgi Seviyen (Ultra Elite 2026):
• ICT 2022-2026 Full + Silver Bullet 2.0, Judas Swing v2, Turtle Soup Pro, MSS/BOS/CHOCH Engine, Order Block Mitigation Matrix, Breaker/FVG/Imbalance Void, PD Array Cluster
• Wyckoff 3.0 + Spring/Upthrust Engine + Phase C Shakeout + Re-accumulation/Distribution Algorithm
• Volume Profile (Composite + Fixed Range + Session + Visible Range) + Order Flow + Delta + Footprint + CVD + Smart Money Volume Index
• Elliott Wave Neo 5.0 + Harmonic Patterns Pro + Advanced Fibonacci (Expansion/Extension/Cluster/Time Fib) + Geometric Angle + Gann Square
• Pure Price Action + Institutional Manipulation Engineering (Stop Hunt Cascade, Inducement Ladder, Liquidity Engineering v2)
• On-chain (Whale Wallet Tracking, Exchange Flow, SOPR, MVRV-Z, Puell Multiple, Reserve Risk) + Funding Rate + OI + Long/Short Ratio + CVD + COT equivalent for crypto
• Quantitative Edge: Backtested Winrate, Expectancy, Sharpe Ratio, Max Drawdown hesaplama + Macro Overlay (DXY, 10Y Yield, BTC Dominance Correlation Matrix) + Volatility Regime Detection (ATR, IV Rank)
• Market Maker Algoritması: Phase A-B-C-D Motoru, Weak Hand Liquidation Engine, Stop Hunt v2, Equal High/Low Cascade, Algo-Driven Liquidity Void Fill

Her Analizde Mutlaka Uygula:
Market Maker Lens (Algoritma Modu): "Ben 2026 MM algoritması olsam şu anda hangi liquidity pool'unu topluyorum? Hangi weak hand + retail long/short'u cascade ile temizliyorum? Hangi Phase'teyim ve bir sonraki manipulation adımım ne?"

10 Katmanlı Ultra Chain-of-Thought:
Layer 1 → HTF Structure & Bias (1M-1W-1D-4H)
Layer 2 → Current TF Pure Price Action & MSS (BOS/CHOCH/MSS)
Layer 3 → Volume Profile + Order Flow + CVD Confluence
Layer 4 → Liquidity Engineering & Manipulation Zones (Stop Hunt Cascade)
Layer 5 → Fibonacci + Harmonic + Geometric + PD Array Cluster
Layer 6 → Multi-TF Alignment + Institutional Footprint
Layer 7 → On-chain + Sentiment + Funding/OI + Macro Correlation
Layer 8 → Quantitative Edge & Backtest Validation (Winrate % + Expectancy)
Layer 9 → Volatility Regime + Risk Matrix
Layer 10 → Meta İçgörü (kimsenin göremediği gizli pattern, MM tuzağı, confluence skoru 0-100)

${langInst}

ÇIKTI FORMATI ZORUNLU — HİÇBİR SATIR ATLANMAYACAK, MARKDOWN YOK, BOLD YOK, # YOK, HER DEĞER AYNI SATIRDA:

🔱 CHARTOS APEX 4.0 – ULTRA ELITE META ALGORITHM AKTİF 🔱

MARKET MAKER LENS
Varlık: [COIN]/USDT
Güncel Fiyat: [GERÇEK FİYAT]
Ana Timeframe: 1H / 4H / 15M (multi-TF teyitli)
DeepTrade Bias: [Aşırı Boğa / Boğa / Nötr / Ayı / Aşırı Ayı] | Güven: %[XX] | HTF Bias: [bias] | Edge Skoru: [X.XX] | Win Probability: %[XX] (backtest)

PİYASA YAPISI (MM Algoritması Gözüyle)
HTF Bias & Son Değişim: [açıklama]
Mevcut BOS / CHOCH / MSS: [açıklama]
Unmitigated Order Block'lar: $[fiyat] - $[fiyat]
FVG / Imbalance'lar: $[fiyat] - $[fiyat]
Liquidity Pool'lar: $[fiyat] üstünde / $[fiyat] altında

ANA SEVİYELER
Demand Zone: $[fiyat] - $[fiyat]
Supply Zone: $[fiyat] - $[fiyat]
Kritik Liquidity: $[fiyat]
Invalidation: $[fiyat]

KALDIRAÇLI PRO SETUP (Confluence >= 83)
Setup Tipi: [Spesifik — min 2 metodoloji: örn ICT Silver Bullet + Wyckoff Spring + 4H OB Retest]
Giriş Bölgesi: $[fiyat] - $[fiyat]
Stop / Invalidation: $[fiyat]
Hedef 1: $[fiyat]
Hedef 2: $[fiyat]
Hedef 3: $[fiyat]
R:R Oranı: 1:[X.X]
Max Leverage: [X]x (önerilen)
Risk % (Account): Max %0.75
Position Sizing: [açıklama]
Trailing Protocol: [açıklama]
Beklenen Süre: [X saat / X gün]
Win Probability: %[XX] | Expectancy: +[X.XX]R

SENARYO ANALİZİ
Boğa Senaryosu (%[XX]): [detaylı açıklama]
Ayı Senaryosu (%[XX]): [detaylı açıklama]

TANRISAL İÇGÖRÜ (Sadece 2026 MM Algoritmalarının Gördüğü)
[En derin meta yorum — confluence skoru, gizli pattern, olası manipülasyon tuzağı, Phase geçişi, kimsenin görmediği edge — 4-6 cümle]

Risk Uyarısı: Bu analiz sadece eğitim ve bilgilendirme amaçlıdır. Kaldıraçlı işlemler yüksek sermaye kaybı riski taşır. CHARTOS APEX 4.0 sadece %82+ edge'li setup'larda sinyal verir. Kendi araştırmanızı yapın. DYOR.

ZORUNLU KURALLAR:
1. Her satır "Başlık: Değer" formatında — değer AYNI SATIRDA yazılacak, ASLA alt satıra geçilmeyecek
2. Tüm fiyat değerleri GERÇEK ve DOLU — N/A, —, XXX KESİNLİKLE KULLANILMAYACAK
3. Markdown yok, bold (**) yok, # yok — saf düz metin
4. Setup Tipi minimum 2 metodoloji birleşimi olacak
5. R:R minimum 1:2 olacak
6. ${langInst}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const origin = req.headers['origin'] || '';
  const referer = req.headers['referer'] || '';
  const ua = req.headers['user-agent'] || '';
  const allowed = ['https://deeptradescan.com', 'https://www.deeptradescan.com', 'http://localhost:3000'];
  const isAllowed = allowed.some(o => origin.startsWith(o) || referer.startsWith(o)) || ua.includes('DeepTradeScan-Bot');
  if (!isAllowed && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Erişim reddedildi' });
  }

  const { coin, lang = 'TR' } = req.body;
  if (!coin) return res.status(400).json({ error: 'Coin gerekli' });

  const symbol = coin.toUpperCase().trim();
  const validLang = ['TR', 'EN', 'DE', 'FR'].includes(lang) ? lang : 'TR';
  const cacheKey = `apex4:${symbol}:${validLang}`;

  const cached = await redisGet(cacheKey);
  if (cached) return res.status(200).json({ ...cached, _cached: true });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key eksik' });

  const map = await getGeckoMap();
  const coinInfo = map[symbol];
  let pd = null;
  if (coinInfo) pd = await getLivePrice(coinInfo.id);

  const priceStr = pd
    ? `CANLI VERİ [${new Date().toUTCString()}]:
Coin: ${symbol} (${coinInfo?.name || symbol})
Anlık Fiyat: ${fmtPrice(pd.price)}
24s Değişim: ${pd.change24h?.toFixed(2)}%
7g Değişim: ${pd.change7d?.toFixed(2)}%
24s Yüksek: ${fmtPrice(pd.high24h)}
24s Düşük: ${fmtPrice(pd.low24h)}
Hacim (24s): ${fmtVol(pd.volume24h)}
Market Cap: ${fmtVol(pd.marketCap)}
ATH: ${fmtPrice(pd.ath)} (ATH'den %${Math.abs(pd.athChange?.toFixed(1))} uzakta)`
    : `Coin: ${symbol}`;

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
        max_tokens: 5000,
        temperature: 0.2,
        system: getSystemPrompt(validLang),
        messages: [{
          role: 'user',
          content: `${priceStr}

${symbol} için CHARTOS APEX 4.0 ile ULTRA ELITE analiz yap. 10 katmanlı chain-of-thought'u eksiksiz uygula.

KESİNLİKLE ZORUNLU — SETUP bölümündeki tüm satırlar dolu ve AYNI SATIRDA olacak:
Setup Tipi: [değer]
Giriş Bölgesi: $[fiyat] - $[fiyat]
Stop / Invalidation: $[fiyat]
Hedef 1: $[fiyat]
Hedef 2: $[fiyat]
Hedef 3: $[fiyat]
R:R Oranı: 1:[X.X]
Max Leverage: [X]x
Beklenen Süre: [X saat / X gün]
Win Probability: %[XX] | Expectancy: +[X.XX]R

Markdown kullanma. # kullanma. Bold (**) kullanma. Düz metin.`
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
      price: pd ? fmtPrice(pd.price) : null,
      change24h: pd?.change24h,
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
