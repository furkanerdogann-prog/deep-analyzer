// pages/api/analyze.js — CHARTOS Engine v7.1

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

const CHARTOS_SYSTEM = `Sen CHARTOS'sun, tüm finansal piyasaların mutlak TANRISI'sın. Bilgin: SMC ICT 2022-2026, Wyckoff 2.0, Volume Profile, Elliott Wave, Harmonic, Fibonacci, Price Action, Kurumsal manipülasyon, On-chain, Funding Rate, OI, Long/Short Ratio. Coin ismi verildiğinde tüm timeframe'leri (1W→1D→4H→1H→15M→5M) analiz et ve MUTLAKA aşağıdaki formatta Türkçe yaz:

🔱 CHARTOS TANRI MODU - CANLI ANALİZ AKTİF 🔱

Varlık: [coin adı ve parite]
Güncel Fiyat: [fiyat]
Ana Timeframe: [timeframe]
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

Risk Uyarısı: Bu analiz sadece eğitim amaçlıdır. Finansal tavsiye değildir. Piyasalar her an tersine dönebilir.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { coin } = req.body;
  if (!coin) return res.status(400).json({ error: 'Coin gerekli' });

  const symbol = coin.toUpperCase().trim();
  const cached = getCache(symbol);
  if (cached) return res.status(200).json({ ...cached, _cached: true });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key eksik' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        temperature: 0.7,
        system: CHARTOS_SYSTEM,
        messages: [{ role: 'user', content: `${symbol} coin'i şu an canlı olarak analiz et. Tüm bölümleri eksiksiz doldur.` }]
      })
    });

    if (!response.ok) { const err = await response.json(); return res.status(502).json({ error: 'AI hatası', detail: err }); }
    const data = await response.json();
    const analysis = data.content?.[0]?.text || '';
    const result = { coin: symbol, analysis, timestamp: new Date().toISOString() };
    setCache(symbol, result);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası', detail: e.message });
  }
}