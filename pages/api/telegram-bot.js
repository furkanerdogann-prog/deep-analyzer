// pages/api/telegram-bot.js — v2.0 Güncel Fiyatlı Tweet Formatları
const CHANNEL = '@deeptradescan';
const COINS = ['BTC','ETH','SOL','XRP'];

const GECKO_IDS = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', XRP: 'ripple',
  BNB: 'binancecoin', ADA: 'cardano', AVAX: 'avalanche-2', DOT: 'polkadot'
};

async function getLivePrice(coin) {
  try {
    const id = GECKO_IDS[coin] || coin.toLowerCase();
    const r = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`);
    const d = await r.json();
    const md = d.market_data;
    return {
      price: md.current_price.usd,
      change24h: md.price_change_percentage_24h?.toFixed(2),
      high: md.high_24h.usd,
      low: md.low_24h.usd,
      ath: md.ath.usd,
      athChange: md.ath_change_percentage.usd?.toFixed(1)
    };
  } catch { return null; }
}

async function getFearGreed() {
  try {
    const r = await fetch('https://api.alternative.me/fng/?limit=1');
    const d = await r.json();
    return d.data?.[0];
  } catch { return null; }
}

async function getMarket() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/global');
    const d = await r.json();
    return d.data;
  } catch { return null; }
}

function fmtPrice(p) {
  if (!p) return 'N/A';
  if (p >= 1000) return `$${p.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2})}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
}

function fmtB(n) {
  if (n >= 1e12) return `$${(n/1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  return `$${n.toFixed(0)}`;
}

function fgLabel(v) {
  if (v <= 25) return '🔴 Aşırı Korku';
  if (v <= 45) return '🟠 Korku';
  if (v <= 55) return '🟡 Nötr';
  if (v <= 75) return '🟢 Açgözlülük';
  return '🟢 Aşırı Açgözlülük';
}

// Format seçici — her çağrıda farklı format
const formats = [
  // Format 1: Analiz Özeti
  (coin, price, analysis, fg, market) => `🔱 $${coin} CHARTOS ANALİZİ

💰 Fiyat: ${fmtPrice(price?.price)} ${price?.change24h >= 0 ? '📈' : '📉'} ${price?.change24h}%
📊 24s: ${fmtPrice(price?.low)} — ${fmtPrice(price?.high)}
🧠 F&G: ${fg?.value}/100 ${fgLabel(+fg?.value)}

${extractSection(analysis, 'SENARYO')}

🔱 Tam CHARTOS Analizi 👇
deeptradescan.com

#${coin} #Kripto #TeknikAnaliz #CHARTOS`,

  // Format 2: Piyasa Özeti
  (coin, price, analysis, fg, market) => `📊 KRİPTO PİYASA ÖZETI
${new Date().toLocaleDateString('tr-TR')}

$${coin}: ${fmtPrice(price?.price)} (${price?.change24h}%)
MCap: ${market ? fmtB(market.total_market_cap?.usd) : 'N/A'}
BTC Dom: ${market?.market_cap_percentage?.btc?.toFixed(1)}%
F&G: ${fg?.value}/100 — ${fgLabel(+fg?.value)}

${extractKey(analysis)}

deeptradescan.com
#Kripto #Bitcoin #Altcoin #TeknikAnaliz`,

  // Format 3: Viral Soru
  (coin, price, analysis, fg, market) => `Sence $${coin} bu hafta ne yapar? 🤔

Şu an: ${fmtPrice(price?.price)}
ATH'den uzaklık: %${Math.abs(+price?.athChange)}
F&G: ${fg?.value}/100 ${fgLabel(+fg?.value)}

CHARTOS yanıtlıyor 👇
deeptradescan.com

🔁 RT edersen arkadaşların da görsün
#${coin} #Kripto #TeknikAnaliz`,

  // Format 4: Eğitici
  (coin, price, analysis, fg, market) => `⚡ F&G ${fg?.value}/100 ne anlama gelir?

Bu seviye tarihte nadir görüldü.
Geçmişte ne oldu?

→ Benzer okumalar büyük dönüm noktalarıyla çakıştı
→ Kapitülasyon = Fırsat mı?

$${coin}: ${fmtPrice(price?.price)}

CHARTOS 7 katman analizi:
deeptradescan.com

#Bitcoin #Kripto #TeknikAnaliz`,

  // Format 5: Acil Uyarı
  (coin, price, analysis, fg, market) => `🚨 $${coin} KRİTİK SEVİYEDE

Güncel: ${fmtPrice(price?.price)} (${price?.change24h}%)
24s Düşük: ${fmtPrice(price?.low)}
24s Yüksek: ${fmtPrice(price?.high)}

${extractLevels(analysis)}

Pozisyon almadan önce:
👉 deeptradescan.com

#${coin} #Kripto #KriptoHaber`
];

function extractSection(text, keyword) {
  if (!text) return '';
  const lines = text.split('\n');
  let capture = false;
  const result = [];
  for (const line of lines) {
    if (line.includes(keyword)) { capture = true; continue; }
    if (capture && line.trim() && !line.match(/^(PİYASA|ANA SEVİYE|TANRISAL|YÜKSEK)/)) {
      result.push(line.trim());
      if (result.length >= 3) break;
    }
    if (capture && line.match(/^(PİYASA|ANA SEVİYE|TANRISAL|YÜKSEK)/)) break;
  }
  return result.slice(0,2).join('\n') || '';
}

function extractKey(text) {
  if (!text) return '';
  const lines = text.split('\n').filter(l => l.trim() && l.includes(':') && l.length < 100);
  return lines.slice(2,5).join('\n') || '';
}

function extractLevels(text) {
  if (!text) return '';
  const lines = text.split('\n').filter(l => 
    l.match(/(Demand|Supply|Stop|Hedef|Giriş|Destek|Direnç)/) && l.length < 100
  );
  return lines.slice(0,3).join('\n') || '';
}

let formatIndex = 0;

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET || 'chartos-secret-2024';
  if (req.query.key !== secret) return res.status(401).json({error:'Yetkisiz'});

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return res.status(500).json({error:'Bot token eksik'});

  const coin = req.query.coin || COINS[Math.floor(Math.random() * COINS.length)];
  const fmt = req.query.format ? +req.query.format : (formatIndex++ % formats.length);

  try {
    // Paralel veri çek
    const [priceData, fgData, marketData, analyzeRes] = await Promise.all([
      getLivePrice(coin),
      getFearGreed(),
      getMarket(),
      fetch('https://deeptradescan.com/api/analyze', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({coin})
      })
    ]);

    const analyzeData = await analyzeRes.json();
    const analysis = analyzeData.analysis || '';

    // Tweet formatı oluştur
    const message = formats[fmt](coin, priceData, analysis, fgData, marketData);

    // Telegram'a gönder
    const tg = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        chat_id: CHANNEL,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const tgData = await tg.json();
    if (!tgData.ok) throw new Error(tgData.description);

    return res.status(200).json({
      success: true,
      coin,
      format: fmt,
      price: fmtPrice(priceData?.price),
      message_id: tgData.result?.message_id
    });

  } catch(e) {
    return res.status(500).json({error: e.message});
  }
}
