const CHANNEL = '@deeptradescan';
const COINS = ['BTC','ETH','SOL','XRP','BNB','ADA','AVAX','DOGE','LINK','DOT','INJ','SUI','ARB','NEAR','TON'];

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET || 'chartos-secret-2024';
  if (req.query.key !== secret) return res.status(401).json({error:'Yetkisiz'});

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return res.status(500).json({error:'Bot token eksik'});

  const coin = req.query.coin || COINS[Math.floor(Math.random()*COINS.length)];

  try {
    const base = 'https://deeptradescan.com';
    const r = await fetch(`${base}/api/analyze`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({coin})
    });
    const data = await r.json();
    if (!data.analysis) throw new Error('Analiz alınamadı');

    const text = data.analysis.slice(0,3500) + `\n\n━━━━━━━━━━━━━━━\n🌐 deeptradescan.com\n#${coin} #Kripto #CHARTOS`;

    const tg = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id:CHANNEL, text, parse_mode:'HTML'})
    });
    const tgData = await tg.json();
    if (!tgData.ok) throw new Error(tgData.description);

    return res.status(200).json({success:true, coin});
  } catch(e) {
    return res.status(500).json({error:e.message});
  }
}
