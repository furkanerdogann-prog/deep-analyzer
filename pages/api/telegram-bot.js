const CHANNEL = '@deeptradescan';
const MAJOR = ['BTC', 'ETH'];
const ALTS = ['SOL','XRP','BNB','DOGE','ADA','AVAX','INJ','SUI','ARB','NEAR','TON','MATIC','LINK','PEPE','WIF','TIA','AAVE','OP','APT','LTC','ATOM','FET','RENDER','HBAR','KAS','STX','GMX','RUNE','DOT','SHIB'];
const TAGS = '#crypto #bitcoin #btc #ethereum #eth #blockchain #cryptonews #cryptotrading #trading #defi #binance #altcoin #cryptomarket #bitcoinnews #investing';

function extractPriceRange(line) {
  const m = line.match(/\$\s*([\d,]+\.?\d*)\s*[-\u2013\u2014]\s*\$?\s*([\d,]+\.?\d*)/);
  if (m) return { v1: parseFloat(m[1].replace(/,/g,'')), v2: parseFloat(m[2].replace(/,/g,'')) };
  const s = line.match(/\$\s*([\d,]+\.?\d*)/);
  if (s) return { v1: parseFloat(s[1].replace(/,/g,'')), v2: null };
  return null;
}

function fmtP(n) {
  if (!n || isNaN(n)) return null;
  if (n >= 1000) return '$' + n.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
  if (n >= 1) return '$' + n.toFixed(4);
  if (n >= 0.0001) return '$' + n.toFixed(5);
  return '$' + n.toFixed(8);
}

function fmtRange(r) {
  if (!r) return null;
  return r.v2 ? fmtP(r.v1) + ' \u2013 ' + fmtP(r.v2) : fmtP(r.v1);
}

function parseSetup(text) {
  if (!text) return {};
  const clean = text.replace(/\*\*/g,'').replace(/\*/g,'').replace(/^#+\s*/gm,'');
  const lines = clean.split('\n').map(function(l){ return l.trim(); });
  var setupTip='', giris='', stop='', h1='', h2='', h3='', rr='', sure='', bias='';

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var ll = line.toLowerCase();
    var nxt = (lines[i+1] || '').trim();

    if (!bias && (ll.indexOf('deeptrader bias') >= 0 || ll.indexOf('deeptradescan bias') >= 0)) {
      var s = (line + ' ' + nxt).toLowerCase();
      if (s.indexOf('aşırı boğa') >= 0 || s.indexOf('güçlü boğa') >= 0) bias = 'GÜÇLÜ BOĞA 🟢';
      else if (s.indexOf('boğa') >= 0 || s.indexOf('bull') >= 0) bias = 'BOĞA 🟢';
      else if (s.indexOf('aşırı ayı') >= 0 || s.indexOf('güçlü ayı') >= 0) bias = 'GÜÇLÜ AYI 🔴';
      else if (s.indexOf('ayı') >= 0 || s.indexOf('bear') >= 0) bias = 'AYI 🔴';
      else bias = 'NÖTR ⚪';
    }

    if (!setupTip && ll.indexOf('setup tipi:') >= 0) {
      var v = line.split(':').slice(1).join(':').trim().replace(/^\[|\]$/g,'');
      setupTip = v || nxt;
    }
    if (!setupTip && ll.indexOf('setup tip:') >= 0) {
      var v = line.split(':').slice(1).join(':').trim().replace(/^\[|\]$/g,'');
      setupTip = v || nxt;
    }

    if (!giris && (ll.indexOf('giriş bölgesi:') >= 0 || ll.indexOf('entry zone:') >= 0)) {
      var v = line.split(':').slice(1).join(':');
      var r = extractPriceRange(v) || extractPriceRange(nxt);
      if (r) giris = fmtRange(r);
    }

    if (!stop && ll.indexOf('stop') >= 0 && ll.indexOf(':') >= 0 && !ll.indexOf('hedef') >= 0) {
      var colonIdx = line.indexOf(':');
      if (colonIdx >= 0 && ll.substring(0, colonIdx).indexOf('stop') >= 0) {
        var v = line.substring(colonIdx + 1);
        var r = extractPriceRange(v) || extractPriceRange(nxt);
        if (r) stop = fmtRange(r);
      }
    }

    if (!h1 && (ll.indexOf('hedef 1:') >= 0 || ll.indexOf('target 1:') >= 0)) {
      var v = line.split(':').slice(1).join(':');
      var r = extractPriceRange(v) || extractPriceRange(nxt);
      if (r) h1 = fmtP(r.v1);
    }
    if (!h2 && (ll.indexOf('hedef 2:') >= 0 || ll.indexOf('target 2:') >= 0)) {
      var v = line.split(':').slice(1).join(':');
      var r = extractPriceRange(v) || extractPriceRange(nxt);
      if (r) h2 = fmtP(r.v1);
    }
    if (!h3 && (ll.indexOf('hedef 3:') >= 0 || ll.indexOf('target 3:') >= 0)) {
      var v = line.split(':').slice(1).join(':');
      var r = extractPriceRange(v) || extractPriceRange(nxt);
      if (r) h3 = fmtP(r.v1);
    }

    if (!rr && (ll.indexOf('r:r') >= 0 || ll.indexOf('oran') >= 0 || ll.indexOf('ratio') >= 0)) {
      var m = (line + ' ' + nxt).match(/1\s*:\s*([\d.]+)/);
      if (m) rr = '1:' + m[1];
    }

    if (!sure && (ll.indexOf('beklenen süre:') >= 0 || ll.indexOf('expected duration:') >= 0)) {
      var v = line.split(':').slice(1).join(':').trim().replace(/^\[|\]$/g,'');
      sure = v || nxt;
    }
  }

  if (!giris) {
    var m = text.match(/(?:Giriş Bölgesi|Entry Zone|OTE)[:\s]*\$?([\d,]+\.?\d*)\s*[-\u2013]\s*\$?([\d,]+\.?\d*)/i);
    if (m) giris = fmtP(parseFloat(m[1].replace(/,/g,''))) + ' \u2013 ' + fmtP(parseFloat(m[2].replace(/,/g,'')));
  }

  return {setupTip, giris, stop, h1, h2, h3, rr, sure, bias};
}

function buildMessage(coin, sig, price) {
  var dir = (sig.bias && sig.bias.indexOf('AYI') >= 0) ? 'SHORT 🔴' : 'LONG 🟢';
  var setup = sig.setupTip || 'Smart Money Concept';
  var lines = [
    '🔱 CHARTOS SİNYAL | $' + coin + '/USDT',
    '━━━━━━━━━━━━━━━━━━━━━',
    '⚡ ' + setup,
    '📊 ' + dir + ' | ' + (sig.bias || 'BOĞA 🟢'),
    price ? '💰 ' + price : null,
    '━━━━━━━━━━━━━━━━━━━━━',
    sig.giris ? '📍 Giriş:  ' + sig.giris : null,
    sig.stop  ? '🛑 Stop:   ' + sig.stop  : null,
    sig.h1    ? '🎯 TP1:    ' + sig.h1    : null,
    sig.h2    ? '🎯 TP2:    ' + sig.h2    : null,
    sig.h3    ? '🎯 TP3:    ' + sig.h3    : null,
    sig.rr    ? '⚡ R:R  →  ' + sig.rr    : null,
    sig.sure  ? '⏱ Süre:   ' + sig.sure  : null,
    '━━━━━━━━━━━━━━━━━━━━━',
    '🌐 deeptradescan.com',
    '',
    TAGS,
  ];
  return lines.filter(function(l){ return l !== null; }).join('\n');
}

async function fetchAnalysis(coin) {
  const r = await fetch('https://deeptradescan.com/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://deeptradescan.com',
      'Referer': 'https://deeptradescan.com/app',
      'User-Agent': 'DeepTradeScan-Bot/1.0'
    },
    body: JSON.stringify({coin: coin, lang: 'TR'})
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function sendTG(botToken, text) {
  const r = await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({chat_id: CHANNEL, text: text})
  });
  const d = await r.json();
  if (!d.ok) throw new Error(d.description);
}

function getAltCoins() {
  const slot = Math.floor(Date.now() / 1800000);
  const day  = Math.floor(Date.now() / 86400000);
  const s = ALTS.slice();
  for (var i = s.length - 1; i > 0; i--) {
    var j = ((day * 2654435761 + i * 40503) >>> 0) % (i + 1);
    var tmp = s[i]; s[i] = s[j]; s[j] = tmp;
  }
  const start = (slot * 3) % s.length;
  return [s[start % s.length], s[(start+1) % s.length], s[(start+2) % s.length]];
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET || 'chartos-secret-2024';
  if (req.query.key !== secret) return res.status(401).json({error: 'Yetkisiz'});
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return res.status(500).json({error: 'Token eksik'});

  if (req.query.coin) {
    const coin = req.query.coin.toUpperCase();
    try {
      const data = await fetchAnalysis(coin);
      const sig  = parseSetup(data.analysis || '');
      const msg  = buildMessage(coin, sig, data.price);
      if (!req.query.preview) await sendTG(botToken, msg);
      return res.status(200).json({success: true, coin: coin, sig: sig, msg: msg});
    } catch(e) {
      return res.status(500).json({error: e.message});
    }
  }

  const coins = MAJOR.concat(getAltCoins());
  const sent = [], errors = [];
  for (var i = 0; i < coins.length; i++) {
    const coin = coins[i];
    try {
      if (i > 0) await new Promise(function(r){ setTimeout(r, 5000); });
      const data = await fetchAnalysis(coin);
      const sig  = parseSetup(data.analysis || '');
      const msg  = buildMessage(coin, sig, data.price);
      await sendTG(botToken, msg);
      sent.push(coin);
    } catch(e) {
      errors.push({coin: coin, error: e.message});
    }
  }
  return res.status(200).json({success: true, sent: sent, errors: errors});
}
