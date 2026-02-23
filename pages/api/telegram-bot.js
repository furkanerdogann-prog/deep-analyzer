const CHANNEL = '@deeptradescan';
const COINS = ['BTC','ETH','SOL','XRP','BNB','ADA','AVAX','DOT','INJ','SUI','ARB','NEAR','TON'];
const GECKO_IDS = {BTC:'bitcoin',ETH:'ethereum',SOL:'solana',XRP:'ripple',BNB:'binancecoin',ADA:'cardano',AVAX:'avalanche-2',DOT:'polkadot',INJ:'injective-protocol',SUI:'sui',ARB:'arbitrum',NEAR:'near',TON:'the-open-network'};

async function getLivePrice(coin) {
  try {
    const id = GECKO_IDS[coin]||coin.toLowerCase();
    const r = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`);
    const d = await r.json();
    const m = d.market_data;
    return {price:m.current_price.usd,change24h:m.price_change_percentage_24h?.toFixed(2),high:m.high_24h.usd,low:m.low_24h.usd};
  } catch {return null;}
}

async function getFearGreed() {
  try {const r=await fetch('https://api.alternative.me/fng/?limit=1');const d=await r.json();return d.data?.[0];} catch {return null;}
}

function fmtPrice(p) {
  if(!p)return'N/A';
  if(p>=1000)return'$'+p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  if(p>=1)return'$'+p.toFixed(3);
  return'$'+p.toFixed(5);
}

function fgLabel(v){
  const n=+v;
  if(n<=25)return'🔴 Aşırı Korku';
  if(n<=45)return'🟠 Korku';
  if(n<=55)return'🟡 Nötr';
  if(n<=75)return'🟢 Açgözlülük';
  return'🟢 Aşırı Açgözlülük';
}

function cleanMd(text) {
  return text.replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/#{1,6}\s/g,'').trim();
}

function extractVal(lines, keywords) {
  for(const line of lines) {
    const cl = cleanMd(line);
    const ll = cl.toLowerCase();
    if(keywords.some(k => ll.includes(k.toLowerCase()))) {
      const match = cl.match(/\$[\d,]+(?:\.\d+)?(?:\s*[-–]\s*\$[\d,]+(?:\.\d+)?)?/);
      if(match) return match[0];
    }
  }
  return '';
}

function extractBias(lines) {
  for(const line of lines) {
    const cl = cleanMd(line).toLowerCase();
    if(cl.includes('bias')||cl.includes('yön')||cl.includes('tanrısal')) {
      if(cl.includes('boğa')||cl.includes('bull')||cl.includes('yukarı')) return '🟢 BOĞA';
      if(cl.includes('ayı')||cl.includes('bear')||cl.includes('aşağı')) return '🔴 AYI';
    }
  }
  return null;
}

function extractRR(lines) {
  for(const line of lines) {
    const cl = cleanMd(line);
    if(cl.toLowerCase().includes('optimal')) {
      const m = cl.match(/1:\d+\.?\d*/);
      if(m) return m[0];
    }
  }
  for(const line of lines) {
    const m = cleanMd(line).match(/1:\d+\.?\d*/);
    if(m) return m[0];
  }
  return '';
}

function buildSignal(analysis, coin, price, fg) {
  function buildTweet(analysis, coin, price, fg) {
  const lines = analysis.split('\n').filter(l => l.trim());
  const h1 = extractVal(lines, ['hedef 1','target 1','tp1']);
  const stop = extractVal(lines, ['hard stop','stop loss','stop:']);
  const bias = extractBias(lines)||(price?.change24h>=0?'🟢':'🔴');
  const rr = extractRR(lines);
  const change = price?.change24h;

  return `🔱 $${coin} CHARTOS SİNYAL
${bias} ${fmtPrice(price?.price)} (%${change})
🛑 Stop: ${stop||'-'} 🎯 Hedef: ${h1||'-'}
${rr?`⚡ R:R ${rr}`:''}
😱 F&G: ${fg?.value}/100
deeptradescan.com
#${coin} #Kripto #CHARTOS`;
}
  if(!analysis) return null;
  const lines = analysis.split('\n').filter(l => l.trim());
  const giris = extractVal(lines, ['limit order','market order','giriş bölgesi','giriş:','entry']);
  const stop  = extractVal(lines, ['hard stop','stop loss','invalidation','stop:']);
  const h1    = extractVal(lines, ['hedef 1','target 1','tp1','hedef1']);
  const h2    = extractVal(lines, ['hedef 2','target 2','tp2','hedef2']);
  const h3    = extractVal(lines, ['hedef 3','target 3','tp3','hedef3']);
  const rr    = extractRR(lines);
  const bias  = extractBias(lines)||(price?.change24h>=0?'🟢 BOĞA':'🔴 AYI');
  const change = price?.change24h;
  const changeEmoji = change>=0?'📈':'📉';

  return `🔱 CHARTOS SİNYAL | $${coin}/USDT
━━━━━━━━━━━━━━━━━━━━━
💰 Fiyat: ${fmtPrice(price?.price)} ${changeEmoji} %${change}
📊 24s: ${fmtPrice(price?.low)} — ${fmtPrice(price?.high)}
🧠 Bias: ${bias}
😱 F&G: ${fg?.value}/100 ${fgLabel(fg?.value)}
━━━━━━━━━━━━━━━━━━━━━
📍 Giriş: ${giris||'Analiz içinde'}
🛑 Stop: ${stop||'Analiz içinde'}
🎯 Hedef 1: ${h1||'-'}
🎯 Hedef 2: ${h2||'-'}
🎯 Hedef 3: ${h3||'-'}
${rr?`⚡ R:R → ${rr}`:''}
━━━━━━━━━━━━━━━━━━━━━
⚠️ Finansal tavsiye değildir.
🌐 deeptradescan.com
#${coin} #Kripto #CHARTOS #TeknikAnaliz`;
}

let coinIndex = 0;

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET||'chartos-secret-2024';
  if(req.query.key!==secret) return res.status(401).json({error:'Yetkisiz'});
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if(!botToken) return res.status(500).json({error:'Bot token eksik'});
  const coin = req.query.coin||COINS[coinIndex++%COINS.length];
  try {
    const [priceData,fgData,analyzeRes] = await Promise.all([
      getLivePrice(coin),
      getFearGreed(),
      fetch('https://deeptradescan.com/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({coin})})
    ]);
    const analyzeData = await analyzeRes.json();
    const message = buildSignal(analyzeData.analysis,coin,priceData,fgData);
    if(!message) throw new Error('Sinyal oluşturulamadı');
    const tg = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:CHANNEL,text:message})});
    const tgData = await tg.json();
    if(!tgData.ok) throw new Error(tgData.description);
    return res.status(200).json({
  success:true,
  coin,
  message,
  tweet: buildTweet(analyzeData.analysis,coin,priceData,fgData)
});
  } catch(e) {
    return res.status(500).json({error:e.message});
  }
}