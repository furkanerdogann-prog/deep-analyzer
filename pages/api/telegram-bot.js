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

function cleanMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function extractSignal(analysis, coin, price, fg) {
  if(!analysis) return null;
  const lines = analysis.split('\n').map(l => cleanMarkdown(l.trim())).filter(Boolean);
  
  // Kritik seviyeleri bul
  let giris = '', stop = '', hedef1 = '', hedef2 = '', hedef3 = '', rr = '', bias = '';
  
  for(const line of lines) {
    const l = line.toLowerCase();
    if(l.includes('limit order') && !giris) giris = line.replace(/.*limit order[:\s]*/i,'').split('(')[0].trim();
    if((l.includes('hard stop') || l.includes('stop loss')) && !stop) stop = line.replace(/.*hard stop[:\s]*/i,'').replace(/.*stop loss[:\s]*/i,'').split('(')[0].trim();
    if(l.includes('hedef 1') && !hedef1) hedef1 = line.replace(/.*hedef 1[:\s]*/i,'').split('(')[0].trim();
    if(l.includes('hedef 2') && !hedef2) hedef2 = line.replace(/.*hedef 2[:\s]*/i,'').split('(')[0].trim();
    if(l.includes('hedef 3') && !hedef3) hedef3 = line.replace(/.*hedef 3[:\s]*/i,'').split('(')[0].trim();
    if(l.includes('optimal') && l.includes('1:') && !rr) rr = line.match(/1:\d+\.?\d*/)?.[0] || '';
    if((l.includes('bias') || l.includes('yön')) && !bias) {
      if(l.includes('boğa')||l.includes('bull')||l.includes('yukari')) bias = '🟢 BOĞA';
      else if(l.includes('ayı')||l.includes('bear')||l.includes('aşağı')) bias = '🔴 AYI';
      else bias = '🟡 NÖTR';
    }
  }

  if(!bias) bias = price?.change24h >= 0 ? '🟢 BOĞA' : '🔴 AYI';

  const change = price?.change24h;
  const changeEmoji = change >= 0 ? '📈' : '📉';

  return `🔱 CHARTOS SİNYAL | $${coin}/USDT
━━━━━━━━━━━━━━━━━━━━━
💰 Fiyat: ${fmtPrice(price?.price)} ${changeEmoji} ${change}%
📊 24s: ${fmtPrice(price?.low)} — ${fmtPrice(price?.high)}
🧠 Bias: ${bias}
😱 F&G: ${fg?.value}/100 ${fgLabel(fg?.value)}
━━━━━━━━━━━━━━━━━━━━━
${giris ? `📍 Giriş: ${giris}` : ''}
${stop ? `🛑 Stop: ${stop}` : ''}
${hedef1 ? `🎯 Hedef 1: ${hedef1}` : ''}
${hedef2 ? `🎯 Hedef 2: ${hedef2}` : ''}
${hedef3 ? `🎯 Hedef 3: ${hedef3}` : ''}
${rr ? `⚡ R:R → ${rr}` : ''}
━━━━━━━━━━━━━━━━━━━━━
⚠️ Bu bir finansal tavsiye değildir.
🌐 deeptradescan.com
#${coin} #Kripto #CHARTOS #TeknikAnaliz`;
}

let coinIndex = 0;

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET || 'chartos-secret-2024';
  if(req.query.key !== secret) return res.status(401).json({error:'Yetkisiz'});
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if(!botToken) return res.status(500).json({error:'Bot token eksik'});

  const coin = req.query.coin || COINS[coinIndex++ % COINS.length];

  try {
    const [priceData, fgData, analyzeRes] = await Promise.all([
      getLivePrice(coin),
      getFearGreed(),
      fetch('https://deeptradescan.com/api/analyze',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({coin})
      })
    ]);

    const analyzeData = await analyzeRes.json();
    const message = extractSignal(analyzeData.analysis, coin, priceData, fgData);
    if(!message) throw new Error('Sinyal oluşturulamadı');

    const tg = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:CHANNEL,text:message})
    });
    const tgData = await tg.json();
    if(!tgData.ok) throw new Error(tgData.description);

    return res.status(200).json({success:true,coin,message});
  } catch(e) {
    return res.status(500).json({error:e.message});
  }
}
