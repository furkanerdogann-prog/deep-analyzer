const CHANNEL = '@deeptradescan';

// Karışık altcoin listesi — her seferinde farklı coin
const COINS = [
  'BTC','ETH','SOL','XRP','BNB','DOGE','ADA','AVAX',
  'INJ','SUI','ARB','NEAR','TON','DOT','MATIC','LINK',
  'PEPE','WIF','SHIB','BONK','TIA','AAVE','OP','APT',
  'LTC','ATOM','UNI','FET','RENDER','HBAR','KAS','STX'
];

const GECKO_IDS = {
  BTC:'bitcoin',ETH:'ethereum',SOL:'solana',XRP:'ripple',
  BNB:'binancecoin',ADA:'cardano',AVAX:'avalanche-2',DOT:'polkadot',
  INJ:'injective-protocol',SUI:'sui',ARB:'arbitrum',NEAR:'near',
  TON:'the-open-network',MATIC:'matic-network',LINK:'chainlink',
  DOGE:'dogecoin',SHIB:'shiba-inu',PEPE:'pepe',WIF:'dogwifcoin',
  BONK:'bonk',TIA:'celestia',AAVE:'aave',OP:'optimism',APT:'aptos',
  LTC:'litecoin',ATOM:'cosmos',UNI:'uniswap',FET:'fetch-ai',
  RENDER:'render-token',HBAR:'hedera-hashgraph',KAS:'kaspa',STX:'blockstack'
};

const TAGS = `#crypto #bitcoin #btc #ethereum #eth #blockchain #cryptonews #cryptotrading #trading #defi #binance #altcoin #cryptomarket #bitcoinnews #investing`;

async function getLivePrice(coin) {
  try {
    const id = GECKO_IDS[coin]||coin.toLowerCase();
    const r = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`);
    const d = await r.json();
    const m = d.market_data;
    return {price:m.current_price.usd, change24h:m.price_change_percentage_24h?.toFixed(2)};
  } catch {return null;}
}

async function getFearGreed() {
  try {const r=await fetch('https://api.alternative.me/fng/?limit=1');const d=await r.json();return d.data?.[0];} catch {return null;}
}

function fmtPrice(p) {
  if(!p) return 'N/A';
  if(p>=1000) return '$'+p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  if(p>=1) return '$'+p.toFixed(4);
  if(p>=0.001) return '$'+p.toFixed(5);
  return '$'+p.toFixed(8);
}

function fgLabel(v) {
  const n=+v;
  if(n<=25) return '🔴 Aşırı Korku';
  if(n<=45) return '🟠 Korku';
  if(n<=55) return '🟡 Nötr';
  if(n<=75) return '🟢 Açgözlülük';
  return '🟢 Aşırı Açgözlülük';
}

function cleanLine(line) {
  return line.replace(/\*\*/g,'').replace(/\*/g,'').replace(/^#+\s*/,'').replace(/^[-•]\s*/,'').trim();
}

function findDollar(line) {
  const m = line.match(/\$\s*([\d,]+\.?\d*)\s*(?:[-–]\s*\$\s*([\d,]+\.?\d*))?/);
  if(!m) return '';
  const v1 = parseFloat(m[1].replace(/,/g,''));
  const v2 = m[2] ? parseFloat(m[2].replace(/,/g,'')) : null;
  const fmt = n => n>=1000 ? '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) : n>=1 ? '$'+n.toFixed(4) : '$'+n.toFixed(5);
  return v2 ? `${fmt(v1)} – ${fmt(v2)}` : fmt(v1);
}

function parseSignal(text) {
  if(!text) return {};
  const lines = text.split('\n').map(cleanLine).filter(l=>l.length>1);
  let giris='', stop='', h1='', h2='', h3='', rr='', bias='', setupTip='';

  for(const line of lines) {
    const ll = line.toLowerCase();

    // SETUP TİPİ
    if(!setupTip && (ll.includes('setup tipi') || ll.includes('setup tip'))) {
      const val = line.split(':').slice(1).join(':').trim();
      if(val) setupTip = val;
    }

    // BIAS
    if(!bias && (ll.includes('bias') || ll.includes('deeptrader') || ll.includes('deeptradescan'))) {
      if(ll.includes('aşırı boğa') || ll.includes('güçlü boğa')) bias='🟢 GÜÇLÜ BOĞA';
      else if(ll.includes('boğa') || ll.includes('bull')) bias='🟢 BOĞA';
      else if(ll.includes('aşırı ayı') || ll.includes('güçlü ayı')) bias='🔴 GÜÇLÜ AYI';
      else if(ll.includes('ayı') || ll.includes('bear')) bias='🔴 AYI';
    }

    // GİRİŞ
    if(!giris && (ll.includes('giriş bölgesi') || ll.includes('giriş:') || ll.includes('entry'))) {
      const val = findDollar(line);
      if(val) giris = val;
    }

    // STOP
    if(!stop && (ll.includes('stop') && (ll.includes('invalidation') || ll.includes(':') || ll.includes('/')))) {
      const val = findDollar(line);
      if(val) stop = val;
    }

    // HEDEFLER
    if(!h1 && ll.match(/hedef\s*1|tp\s*1|target\s*1/)) { const val=findDollar(line); if(val) h1=val; }
    if(!h2 && ll.match(/hedef\s*2|tp\s*2|target\s*2/)) { const val=findDollar(line); if(val) h2=val; }
    if(!h3 && ll.match(/hedef\s*3|tp\s*3|target\s*3/)) { const val=findDollar(line); if(val) h3=val; }

    // R:R
    if(!rr) {
      const m = line.match(/1\s*:\s*[\d.]+/);
      if(m && (ll.includes('r:r') || ll.includes('oran') || ll.includes('risk'))) rr=m[0].replace(/\s/g,'');
    }
  }

  // Fallback — demand zone'dan giriş çek
  if(!giris) {
    for(const line of lines) {
      if(line.toLowerCase().includes('demand zone') || line.toLowerCase().includes('demand block')) {
        const val = findDollar(line);
        if(val){giris=val;break;}
      }
    }
  }

  return {giris,stop,h1,h2,h3,rr,bias,setupTip};
}

function buildMessage(coin, price, fg, sig) {
  const bias = sig.bias || (price?.change24h>=0?'🟢 BOĞA':'🔴 AYI');
  const dir = bias.includes('BOĞA')?'LONG 🟢':'SHORT 🔴';
  const chg = price?.change24h;
  const chgEmoji = chg>=0?'📈':'📉';
  const setupLine = sig.setupTip ? `⚡ Setup: ${sig.setupTip}\n` : '';

  return `🔱 CHARTOS SİNYAL | $${coin}/USDT
━━━━━━━━━━━━━━━━━━━━━
${setupLine}💹 ${dir} | ${bias}
💰 ${fmtPrice(price?.price)} ${chgEmoji} %${chg}
😱 F&G: ${fg?.value}/100 ${fgLabel(fg?.value)}
━━━━━━━━━━━━━━━━━━━━━
📍 Giriş: ${sig.giris||'—'}
🛑 Stop: ${sig.stop||'—'}
🎯 Hedef 1: ${sig.h1||'—'}
🎯 Hedef 2: ${sig.h2||'—'}
🎯 Hedef 3: ${sig.h3||'—'}
${sig.rr?`⚡ R:R → ${sig.rr}`:''}
━━━━━━━━━━━━━━━━━━━━━
🌐 deeptradescan.com

${TAGS}`;
}

// Her çağrıda farklı coin — karışık sıra
function getNextCoin(currentIndex) {
  // Fisher-Yates shuffle seed ile — her gün farklı sıra
  const day = Math.floor(Date.now() / 86400000);
  const idx = (currentIndex + day * 7) % COINS.length;
  return COINS[idx];
}

let coinIdx = 0;

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET || 'chartos-secret-2024';
  if(req.query.key !== secret) return res.status(401).json({error:'Yetkisiz'});
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if(!botToken) return res.status(500).json({error:'Token eksik'});

  // Manuel coin veya otomatik karışık
  const coin = req.query.coin || getNextCoin(coinIdx++);

  try {
    const [priceData, fgData, analyzeRes] = await Promise.all([
      getLivePrice(coin),
      getFearGreed(),
      fetch('https://deeptradescan.com/api/analyze', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({coin})
      })
    ]);

    const analyzeData = await analyzeRes.json();
    const sig = parseSignal(analyzeData.analysis || '');
    const message = buildMessage(coin, priceData, fgData, sig);

    const tg = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:CHANNEL, text:message})
    });
    const tgData = await tg.json();
    if(!tgData.ok) throw new Error(tgData.description);

    return res.status(200).json({success:true, coin, sig, message});
  } catch(e) {
    return res.status(500).json({error:e.message});
  }
}
