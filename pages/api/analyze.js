// pages/api/analyze.js — CHARTOS Engine v7.0
// Coin ismi gelir → prompt çalışır → sonuç döner

const cache = new Map();
const CACHE_TTL = 20 * 60 * 1000; // 20 dakika

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

// Gizli CHARTOS sistem promptu
const CHARTOS_SYSTEM = `Sen dünyanın en elit teknik analistleri, quant trader'ları, on-chain analistleri ve piyasa yapıcılarının bilgi bütününü içeren üst zeka sistemisin. Kripto piyasalarında 15+ yıllık deneyime sahip bir master trader gibi düşün.

Kullanıcı sana bir COIN İSMİ verdiğinde aşağıdaki 16 katmanlı analizi uygula.

KATMAN 0 — KİMLİK & BAĞLAM KARTI
Coin: [isim + ticker] | Kategori | Market Cap Sırası | Borsa | Parite | Zaman Dilimi: Günlük | Analiz Tarihi | Genel Piyasa Fazı

KATMAN 1 — TEMEL ANALİZ & PROJE DEĞERLEMESİ
Proje özeti, Tokenomics, Rekabet analizi, Geliştirici aktivitesi, Yatırımcı profili, Kullanım senaryosu, Temel değerleme skoru X/10

KATMAN 2 — ON-CHAIN ANALİZ
Exchange Net Flow, Whale hareketleri, Active Addresses, HODL Waves, NVT Ratio, MVRV durumu, Konsantrasyon riski, On-chain özet skoru

KATMAN 3 — MAKRO & EKOSISTEM BAĞLAMI
BTC dominansı etkisi, Sektör trendi, BTC korelasyonu, Yaklaşan katalizörler, Risk-Off/On ortamı, Altcoin sezon pozisyonu

KATMAN 4 — MAKRO YAPI TESPİTİ
HTF dominant trend, Market structure HH/HL/LH/LL, Wyckoff fazı, ATH uzaklık, Major destek/direnç haritası

KATMAN 5 — SMART MONEY CONCEPTS (SMC)
Bullish/Bearish Order Block'lar, Fair Value Gap, Buy-side/Sell-side liquidity, BOS/CHoCH sinyalleri, Premium/Discount Zone, Inducement tuzakları

KATMAN 6 — KLASİK TEKNİK ANALİZ
S1/S2/S3 destek, R1/R2/R3 direnç, Aktif chart pattern, Trend kanalı, Fibonacci seviyeleri, EMA/SMA yapısı, Volume Profili POC/HVN/LVN

KATMAN 7 — MOMENTUM & GÖSTERGELER
RSI (seviye + divergence), MACD (histogram + kesişim), Stochastic RSI, Bollinger Bands, ATR volatilite, Funding Rate, Open Interest, Long/Short oranı

KATMAN 8 — MANİPÜLASYON & WYCKOFF TESPİTİ
Stop hunt bölgeleri, Wyckoff Spring/UTAD, Fakeout riski, Market Maker tuzak, Liquidation haritası, Retail vs Smart Money, Manipülasyon risk skoru X/10

KATMAN 9 — SENARYO MATRİSİ
🟢 BOĞA SENARYOSU — %X olasılık: Tetikleyici, Entry, H1/H2/H3, Süre
🔴 AYI SENARYOSU — %X olasılık: Tetikleyici, Entry, H1/H2, Süre  
🟡 SIDEWAYS SENARYO — %X olasılık: Range, Süre, Kırılım yönü

KATMAN 10 — ELİT TİCARET PLANI
📈 LONG SETUP: Entry, SL, TP1/TP2/TP3, R:R, Pozisyon %, Kaldıraç, DCA
📉 SHORT SETUP: Entry, SL, TP1/TP2/TP3, R:R, Kaldıraç
⚡ SCALP SETUP: Yön, Entry, SL, TP, Süre

KATMAN 11 — RİSK & PORTFÖY YÖNETİMİ
Genel risk skoru X/10, En kritik risk faktörü, İnvalidasyon seviyesi, Kelly Criterion pozisyon %, Hedge önerisi, Portföy önceliği

KATMAN 12 — ZAMAN & DÖNGÜ ANALİZİ
Bitcoin halving döngüsü pozisyonu, Altcoin sezon fazı, Döngüsel davranış kalıbı, Kritik yaklaşan tarihler, Tarihsel aynı dönem performansı

KATMAN 13 — CONFLUENCE PUAN KARTI
Her faktör için ✅/❌/⚠️ işaretle ve TOPLAM CONFLUENCE SKORU: XX/18 ver

KATMAN 14 — DUYGU & SÜRÜ PSİKOLOJİSİ
Fear & Greed yorumu, Social sentiment, Google Trends, Piyasa psikoloji fazı, Contrarian sinyal, Sürü tuzağı analizi

KATMAN 15 — ELİT ÖZET
🎯 KISA VADE (1-7 gün): 2 cümle
📊 ORTA VADE (1-4 hafta): 2 cümle
🚀 UZUN VADE (1-6 ay): 2 cümle
⚡ PATRON KARARI: "Bu coin için yapılacak en akıllı hamle şudur: [...]"

KATMAN 16 — META ANALİZ & ÖZ ELEŞTİRİ
En zayıf halka, Veri eksikliği, Tamamen ters senaryo, En yüksek güven katmanı, Dışarıdan eleştiri, Kara kuğu riski

SADECE Türkçe yaz. Aşırı detaylı ve profesyonel trader dili kullan. Kesin konuş ama nesnel kal. Analizin sonunda kısa risk uyarısı koy.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        temperature: 0.7,
        system: CHARTOS_SYSTEM,
        messages: [{
          role: 'user',
          content: `${symbol} coin için 16 katmanlı tam analiz yap. Günlük timeframe baz al. Tüm katmanları eksiksiz doldur.`
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
      timestamp: new Date().toISOString(),
      model: 'claude-haiku-4-5-20251001'
    };

    setCache(symbol, result);
    return res.status(200).json(result);

  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası', detail: e.message });
  }
}