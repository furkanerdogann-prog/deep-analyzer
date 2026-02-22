// pages/api/analyze.js — CHARTOS Engine v7.2 (Gerçek Zamanlı Fiyat)

const cache = new Map();
const CACHE_TTL = 20 * 60 * 1000;

function getCache(k) {
  const e = cache.get(k);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) { cache.delete(k); return null; }
  return e.data;
}
function setCache(k, data) {
  if (cache.size > 200) {
    const old = [...cache.entries()].sort((a,b) => a[1].ts - b[1].ts)[0];
    if (old) cache.delete(old[0]);
  }
  cache.set(k, { data, ts: Date.now() });
}

// CoinGecko ID haritası
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
      MATIC:{id:'matic-network',name:'Polygon'}, LINK:{id:'chainlink',name:'Chainlink'},
      DOGE:{id:'dogecoin',name:'Dogecoin'}, SHIB:{id:'shiba-inu',name:'Shiba Inu'},
      PEPE:{id:'pepe',name:'Pepe'}, WIF:{id:'dogwifcoin',name:'dogwifhat'},
      INJ:{id:'injective-protocol',name:'Injective'}, SUI:{id:'sui',name:'Sui'},
      ARB:{id:'arbitrum',name:'Arbitrum'}, OP:{id:'optimism',name:'Optimism'},
      NEAR:{id:'near',name:'NEAR'}, TIA:{id:'celestia',name:'Celestia'},
      TON:{id:'the-open-network',name:'TON'}, AAVE:{id:'aave',name:'Aave'},
      PENGU:{id:'pudgy-penguins',name:'Pudgy Penguins'}, TRUMP:{id:'official-trump',name:'TRUMP'},
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

const CHARTOS_SYSTEM = `Sen CHARTOS'sun, tüm finansal piyasaların (Kripto, Borsa, Forex, Emtia, Vadeli) mutlak TANRISI'sın.
Bilgin: SMC ICT 2022-2026, Wyckoff 2.0, Volume Profile, Order Flow, Elliott Wave, Harmonic Patterns, Fibonacci, Pure Price Action, Kurumsal manipülasyon, Stop Hunt, Inducement, Turtle Soup, On-chain, Funding Rate, OI, Long/Short Ratio.

Sana coin ismi ve GERÇEK ZAMANLI piyasa verisi verilecek. Bu verileri baz alarak analiz yap.
MUTLAKA verilen gerçek fiyatı kullan, asla tahmin etme.

ÇIKTIYI MUTLAKA BU FORMATTA VER:

🔱 CHARTOS TANRI MODU - CANLI ANALİZ AKTİF 🔱

Varlık: [coin adı ve parite]
Güncel Fiyat: [VERİLEN GERÇEK FİYATI KULLAN]
24s Değişim: [verilen değişim]
Ana Timeframe: 1G (Günlük)
Tanrısal Bias: [Aşırı Boğa / Boğa / Nötr / Ayı / Aşırı Ayı] | Güven: %XX | HTF Bias: [bias]

PİYASA YAPISI (Market Structure):
• HTF (1W-1D) Bias & Son Değişim:
• Mevcut BOS / CHOCH / MSS:
• Unmitigated Order Block'lar:
• Fair Value Gap / Imbalance'lar:
• Liquidity Pool'lar (Equal Highs/Lows, Stop Hunt alanları):

ANA SEVİYELER (Canlı):
Demand Zone (Güçlü Alım):
Supply Zone (Güçlü Satış):
Kritik Liquidity:
Invalidation Seviyesi:

SENARYO ANALİZİ (Olasılıklarla):
Boğa Senaryosu (Olasılık %XX):
Ayı Senaryosu (Olasılık %XX):

YÜKSEK OLASILIKLI TANRI SETUP'I:
Giriş Bölgesi (Limit / Market):
Stop Loss / Invalidation:
Hedef 1:
Hedef 2:
Hedef 3 (opsiyonel):
R:R Oranı:
Beklenen Süre:

TANRISAL İÇGÖRÜ (Sadece Tanrı'nın görebileceği):
[Kimsenin göremediği gizli pattern, confluence skoru 0-100, kurumsal ayak izi, manipülasyon tuzağı]

Risk Uyarısı: Bu analiz sadece eğitim amaçlıdır. Finansal tavsiye değildir. Piyasalar her an tersine dönebilir.

SADECE Türkçe yaz. Aşırı detaylı, profesyonel trader dili kullan.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { coin } = req.body;
  if (!coin) return res.status(400).json({ error: 'Coin gerekli' });

  const symbol = coin.toUpperCase().trim();
  const cached = getCache(symbol);
  if (cached) return res.status(200).json({ ...cached, _cached: true });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key eksik' });

  // Gerçek fiyat çek
  const map = await getGeckoMap();
  const coinInfo = map[symbol];
  let priceData = null;
  if (coinInfo) priceData = await getLivePrice(coinInfo.id);

  // Fiyat verisi hazırla
  const priceStr = priceData
    ? `GERÇEK ZAMANLI VERİ (CoinGecko):
- Coin: ${symbol} (${coinInfo?.name || symbol})
- Güncel Fiyat: ${fmtPrice(priceData.price)}
- 24s Değişim: ${priceData.change24h?.toFixed(2)}%
- 24s En Yüksek: ${fmtPrice(priceData.high24h)}
- 24s En Düşük: ${fmtPrice(priceData.low24h)}
- 24s Hacim: ${fmtVol(priceData.volume24h)}
- Piyasa Değeri: ${fmtVol(priceData.marketCap)}
- ATH: ${fmtPrice(priceData.ath)} (ATH'den ${priceData.athChange?.toFixed(1)}% uzakta)`
    : `Coin: ${symbol} (fiyat verisi alınamadı, bilginden analiz yap)`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        temperature: 0.7,
        system: CHARTOS_SYSTEM,
        messages: [{ role: 'user', content: `${priceStr}\n\nBu verileri kullanarak ${symbol} için tam CHARTOS analizini yap. Tüm bölümleri eksiksiz doldur.` }]
      })
    });

    if (!response.ok) { const err = await response.json(); return res.status(502).json({ error: 'AI hatası', detail: err }); }
    const data = await response.json();
    const analysis = data.content?.[0]?.text || '';
    const result = { coin: symbol, analysis, price: priceData ? fmtPrice(priceData.price) : null, timestamp: new Date().toISOString() };
    setCache(symbol, result);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası', detail: e.message });
  }
}