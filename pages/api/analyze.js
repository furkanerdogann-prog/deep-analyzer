// pages/api/analyze.js — CHARTOS Engine v6.0
// Minimum token, gizli prompt, 250 coin desteği

const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function getCache(k) {
  const e = cache.get(k);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) { cache.delete(k); return null; }
  return e.data;
}
function setCache(k, data) {
  if (cache.size > 300) {
    const old = [...cache.entries()].sort((a,b) => a[1].ts - b[1].ts)[0];
    if (old) cache.delete(old[0]);
  }
  cache.set(k, { data, ts: Date.now() });
}

// ─── Dinamik CoinGecko Map ────────────────────────────────────────────────────
let geckoMap = null;
let geckoMapTs = 0;

async function getGeckoMap() {
  if (geckoMap && Date.now() - geckoMapTs < 6 * 3600000) return geckoMap;
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false', { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error();
    const coins = await r.json();
    const map = {};
    for (const c of coins) { if (!map[c.symbol.toUpperCase()]) map[c.symbol.toUpperCase()] = c.id; }
    map['POL'] = 'matic-network'; map['RNDR'] = 'render-token';
    geckoMap = map; geckoMapTs = Date.now();
    return map;
  } catch {
    return { BTC:'bitcoin',ETH:'ethereum',BNB:'binancecoin',SOL:'solana',XRP:'ripple',ADA:'cardano',AVAX:'avalanche-2',DOT:'polkadot',MATIC:'matic-network',LINK:'chainlink',UNI:'uniswap',ATOM:'cosmos',LTC:'litecoin',BCH:'bitcoin-cash',DOGE:'dogecoin',SHIB:'shiba-inu',PEPE:'pepe',WIF:'dogwifcoin',BONK:'bonk',INJ:'injective-protocol',SUI:'sui',APT:'aptos',ARB:'arbitrum',OP:'optimism',AAVE:'aave',TON:'the-open-network',RENDER:'render-token',TRX:'tron',NEAR:'near',FIL:'filecoin',HBAR:'hedera-hashgraph',KAS:'kaspa',STX:'blockstack',FLOKI:'floki',NOT:'notcoin',IMX:'immutable-x',LDO:'lido-dao',SEI:'sei-network',TIA:'celestia',PENGU:'pudgy-penguins',TRUMP:'official-trump' };
  }
}

// ─── Teknik Göstergeler ───────────────────────────────────────────────────────
function calcEMA(d, p) {
  if (!d?.length) return [0];
  const k = 2/(p+1), s = Math.min(p, d.length);
  let e = d.slice(0,s).reduce((a,b)=>a+b,0)/s;
  const r = [e];
  for (let i=s;i<d.length;i++) { e=d[i]*k+e*(1-k); r.push(e); }
  return r;
}
function calcRSI(c, p=14) {
  if (!c||c.length<p+1) return 50;
  const ch = c.slice(1).map((v,i)=>v-c[i]);
  let ag=0,al=0;
  for (let i=0;i<p;i++) { if(ch[i]>0)ag+=ch[i]; else al+=Math.abs(ch[i]); }
  ag/=p; al/=p;
  for (let i=p;i<ch.length;i++) {
    ag=(ag*(p-1)+(ch[i]>0?ch[i]:0))/p;
    al=(al*(p-1)+(ch[i]<0?Math.abs(ch[i]):0))/p;
  }
  return al===0?100:parseFloat((100-100/(1+ag/al)).toFixed(1));
}
function calcMACD(c) {
  if (!c||c.length<35) return {h:0,trend:'NÖTR'};
  const ef=calcEMA(c,12),es=calcEMA(c,26);
  const off=ef.length-es.length;
  const ml=es.map((v,i)=>ef[i+off]-v);
  const sl=calcEMA(ml,9);
  const h=ml[ml.length-1]-sl[sl.length-1];
  return {h:parseFloat(h.toFixed(8)),trend:h>0?'YÜKSELİŞ':'DÜŞÜŞ'};
}
function calcBB(c,p=20) {
  const sl=c.slice(-Math.min(p,c.length));
  const m=sl.reduce((a,b)=>a+b,0)/sl.length;
  const sd=Math.sqrt(sl.reduce((s,v)=>s+Math.pow(v-m,2),0)/sl.length);
  const u=m+2*sd,l=m-2*sd,pr=c[c.length-1];
  return { u,m,l,bw:((u-l)/(m||1)), pct:(u-l)>0?Math.min(1.5,Math.max(-0.5,(pr-l)/(u-l))):0.5 };
}
function calcSR(c,h,l) {
  const pr=c[c.length-1],rs=[],rd=[];
  for (let i=2;i<c.length-2;i++) {
    if(l[i]<l[i-1]&&l[i]<l[i-2]&&l[i]<l[i+1]&&l[i]<l[i+2]) rs.push(l[i]);
    if(h[i]>h[i-1]&&h[i]>h[i-2]&&h[i]>h[i+1]&&h[i]>h[i+2]) rd.push(h[i]);
  }
  const cl=(lvl)=>{
    const s=[...lvl].sort((a,b)=>a-b);
    const out=[];let g=[];
    for(const v of s){if(!g.length||(v-g[0])/(g[0]||1)<0.015)g.push(v);else{out.push(g.reduce((a,b)=>a+b,0)/g.length);g=[v];}}
    if(g.length)out.push(g.reduce((a,b)=>a+b,0)/g.length);
    return out;
  };
  let sup=cl(rs).filter(v=>v<pr).sort((a,b)=>b-a).slice(0,3);
  let res=cl(rd).filter(v=>v>pr).sort((a,b)=>a-b).slice(0,3);
  while(sup.length<3)sup.push(pr*(1-0.04*(sup.length+1)));
  while(res.length<3)res.push(pr*(1+0.04*(res.length+1)));
  return {sup,res};
}
function calcWyckoff(c,v) {
  const n=c.length,mx=Math.max(...c),mn=Math.min(...c);
  const pos=(c[n-1]-mn)/((mx-mn)||1);
  const vr=(v.slice(-7).reduce((a,b)=>a+b,0)/7)/(v.slice(-21,-7).reduce((a,b)=>a+b,0)/14||1);
  const t30=(c[n-1]-c[0])/c[0],t7=(c[n-1]-c[Math.max(0,n-8)])/c[Math.max(0,n-8)];
  if(pos<0.25&&vr>1.15&&t7>-0.03)return{phase:'ACCUMULATION',signal:'BULLISH',t30pct:+(t30*100).toFixed(1)};
  if(pos<0.25&&t30<-0.15)return{phase:'MARKDOWN',signal:'BEARISH',t30pct:+(t30*100).toFixed(1)};
  if(pos>0.75&&vr>1.2&&t7<0.02)return{phase:'DISTRIBUTION',signal:'BEARISH',t30pct:+(t30*100).toFixed(1)};
  if(pos>0.75&&t30>0.15)return{phase:'MARKUP',signal:'BULLISH',t30pct:+(t30*100).toFixed(1)};
  return{phase:'RE_ACCUMULATION',signal:t30>0?'BULLISH':'NEUTRAL',t30pct:+(t30*100).toFixed(1)};
}
function fmt(p) {
  if(!p||isNaN(p))return'$0';
  const d=p>=1000?2:p>=1?4:p>=0.001?6:10;
  return`$${Number(p).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:d})}`;
}

// ─── CHARTOS AI Analizi (gizli prompt, minimum token) ─────────────────────────
async function chartosAnalysis(data, apiKey) {
  if (!apiKey) return null;

  // Gizli CHARTOS prompt — kullanıcıya gösterilmez
  const systemPrompt = `Sen CHARTOS'sun, tüm finansal grafik sistemlerinin mutlak analist TANRISI'sın.
Bilgin: Smart Money Concepts (ICT), Wyckoff Method, Volume Profile, Elliott Wave, Harmonic Patterns, Fibonacci, Klasik TA, Kurumsal likidite mühendisliği ve manipülasyon taktikleri.
SADECE Türkçe yaz. SADECE geçerli JSON döndür, başka hiçbir şey yazma.`;

  // Ultra-kompakt veri özeti — minimum token
  const userMsg = `Coin:${data.coin} Fiyat:$${data.price} Değişim:${data.chg}%
RSI:${data.rsi} MACD:${data.macd} BB%B:${data.bb}
EMA(8/21/50):${data.e8}/${data.e21}/${data.e50}
Wyckoff:${data.wyckoff} Trend30g:${data.t30}%
Destek:${data.s1}/${data.s2} Direnç:${data.r1}/${data.r2}
Hacim:${data.vol} PiyasaDegeri:${data.mcap}
F&G:${data.fg}

JSON döndür:
{"htfBias":"Aşırı Boğa/Boğa/Nötr/Ayı/Aşırı Ayı","biasPct":85,"marketStructure":{"htfBias":"","lastBOS":"","orderBlocks":"","fvg":"","liquidityPools":""},"keyLevels":{"demandZone":"","supplyZone":"","criticalLiquidity":"","invalidation":""},"scenarios":{"bull":{"pct":60,"desc":""},"bear":{"pct":40,"desc":""}},"setup":{"entry":"","invalidation":"","tp1":"","tp2":"","rr":"","riskNote":""},"godInsight":""}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role:'user', content:userMsg }]
      })
    });
    if (!r.ok) return null;
    const d = await r.json();
    const txt = d.content?.[0]?.text?.trim();
    if (!txt) return null;
    const m = txt.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    return null;
  } catch { return null; }
}

function fallbackChartos(data) {
  const bull = data.rsi < 45 || data.wyckoff === 'ACCUMULATION';
  const bias = bull ? 'Boğa' : 'Ayı';
  return {
    htfBias: bias,
    biasPct: 60,
    marketStructure: {
      htfBias: bull ? 'Yükseliş yapısı korunuyor' : 'Düşüş yapısı hakim',
      lastBOS: bull ? 'Son düşük korundu' : 'Son yüksek kırıldı',
      orderBlocks: `Destek OB: ${data.s1} | Direnç OB: ${data.r1}`,
      fvg: 'Mevcut veri ile FVG tespiti sınırlı',
      liquidityPools: `Eşit diplar: ${data.s2} | Eşit tepeler: ${data.r2}`
    },
    keyLevels: {
      demandZone: `${data.s1} — ${data.s2}`,
      supplyZone: `${data.r1} — ${data.r2}`,
      criticalLiquidity: data.s2,
      invalidation: bull ? data.s2 : data.r2
    },
    scenarios: {
      bull: { pct: bull?60:35, desc:`${data.r1} direnci aşılırsa ${data.r2} hedeflenir` },
      bear: { pct: bull?40:65, desc:`${data.s1} kırılırsa ${data.s2} test edilir` }
    },
    setup: {
      entry: bull ? data.s1 : data.r1,
      invalidation: bull ? data.s2 : data.r2,
      tp1: bull ? data.r1 : data.s1,
      tp2: bull ? data.r2 : data.s2,
      rr: '1:2.5',
      riskNote: 'Maksimum %2 risk — stop altında pozisyon kapat'
    },
    godInsight: `RSI ${data.rsi} ve Wyckoff ${data.wyckoff} fazı ${bias.toLowerCase()} yönünü destekliyor. MACD ${data.macd} ivmesi ile trend teyit ediliyor.`
  };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { coin } = req.body;
  if (!coin) return res.status(400).json({ error: 'Coin gerekli' });

  const symbol = coin.toUpperCase().replace(/USDT?$/i,'').trim();
  const ck = `chartos_${symbol}`;
  const cached = getCache(ck);
  if (cached) return res.status(200).json({ ...cached, _cached:true });

  const map = await getGeckoMap();
  const geckoId = map[symbol];
  if (!geckoId) return res.status(400).json({ error:`Desteklenmeyen: ${symbol}`, toplam:Object.keys(map).length });

  try {
    const [coinR, chartR, fgR] = await Promise.allSettled([
      fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&community_data=false&developer_data=false`),
      fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=60&interval=daily`),
      fetch('https://api.alternative.me/fng/?limit=1'),
    ]);

    if (!coinR.value?.ok || !chartR.value?.ok) return res.status(502).json({ error:'Veri alınamadı' });

    const coinData = await coinR.value.json();
    const chartData = await chartR.value.json();
    let fg = null;
    if (fgR.value?.ok) { try { const d=await fgR.value.json(); fg=d.data?.[0]?{value:+d.data[0].value,label:d.data[0].value_classification}:null; } catch {} }

    const closes = chartData.prices.map(p=>p[1]);
    const volumes = chartData.total_volumes.map(v=>v[1]);
    if (closes.length < 10) return res.status(502).json({ error:'Yetersiz veri' });

    const highs = closes.map((c,i)=>i>0?Math.max(c,closes[i-1])*1.012:c*1.012);
    const lows  = closes.map((c,i)=>i>0?Math.min(c,closes[i-1])*0.988:c*0.988);

    const md = coinData.market_data;
    const price = md.current_price.usd;
    const chg24 = md.price_change_percentage_24h??0;

    const rsi = calcRSI(closes);
    const macd = calcMACD(closes);
    const bb = calcBB(closes);
    const sr = calcSR(closes, highs, lows);
    const wyc = calcWyckoff(closes, volumes);

    const e8a=calcEMA(closes,8),e21a=calcEMA(closes,21),e50a=calcEMA(closes,50);
    const e8=e8a[e8a.length-1],e21=e21a[e21a.length-1],e50=e50a[e50a.length-1];

    const vol24=md.total_volume.usd;
    const mcap=md.market_cap.usd;

    // AI'a gönderilecek kompakt veri
    const aiData = {
      coin: symbol,
      price: price>=1?price.toFixed(4):price.toFixed(8),
      chg: chg24.toFixed(2),
      rsi,
      macd: macd.trend,
      bb: bb.pct.toFixed(2),
      e8: e8.toFixed(6), e21: e21.toFixed(6), e50: e50.toFixed(6),
      wyckoff: wyc.phase,
      t30: wyc.t30pct,
      s1: fmt(sr.sup[0]), s2: fmt(sr.sup[1]),
      r1: fmt(sr.res[0]), r2: fmt(sr.res[1]),
      vol: vol24>=1e9?`$${(vol24/1e9).toFixed(2)}B`:`$${(vol24/1e6).toFixed(1)}M`,
      mcap: mcap>=1e9?`$${(mcap/1e9).toFixed(2)}B`:`$${(mcap/1e6).toFixed(1)}M`,
      fg: fg?`${fg.value} (${fg.label})`:'N/A',
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let chartos = await chartosAnalysis(aiData, apiKey);
    const aiUsed = !!chartos;
    if (!chartos) chartos = fallbackChartos(aiData);

    // Trend
    const tDaily = e8>e50?'BULLISH':e8<e50?'BEARISH':'NEUTRAL';
    const t4h = e8>e21?'BULLISH':e8<e21?'BEARISH':'NEUTRAL';

    // Sinyal sayısı
    let bull=0,bear=0;
    if(rsi<35)bull++;else if(rsi>65)bear++;else if(rsi>52)bull++;else bear++;
    if(macd.h>0)bull++;else bear++;
    if(bb.pct<0.2)bull++;else if(bb.pct>0.8)bear++;
    if(e8>e21&&e21>e50)bull++;else if(e8<e21&&e21<e50)bear++;
    if(wyc.signal==='BULLISH')bull++;else if(wyc.signal==='BEARISH')bear++;

    const verdict = bull-bear>=3?'STRONG_BUY':bull-bear>=1?'BUY':bull-bear<=-3?'STRONG_SELL':bull-bear<=-1?'SELL':'NEUTRAL';

    const result = {
      // Temel
      coin:symbol, geckoId, price:fmt(price), priceRaw:price,
      change24h:`${chg24>=0?'+':''}${chg24.toFixed(2)}%`,
      high24h:fmt(md.high_24h.usd), low24h:fmt(md.low_24h.usd),
      volume24h:aiData.vol, marketCap:aiData.mcap,
      timestamp:new Date().toISOString(),

      // Karar
      verdict, bullSignals:bull, bearSignals:bear,
      trendDaily:tDaily, trend4h:t4h,

      // S/R
      supports:sr.sup.map(v=>fmt(v)),
      resistances:sr.res.map(v=>fmt(v)),

      // Wyckoff
      wyckoff:wyc,

      // Teknik
      rsi, macdTrend:macd.trend, bbPct:+bb.pct.toFixed(3),
      ema:{e8:+e8.toFixed(8),e21:+e21.toFixed(8),e50:+e50.toFixed(8)},

      // Fear & Greed
      fearGreed:fg,

      // CHARTOS Analizi
      chartos,

      _meta:{
        engine:'CHARTOS v6.0',
        aiModel:aiUsed?'claude-haiku-4-5-20251001':'fallback',
        tokenEst:aiUsed?'~650':'0',
        cacheTTL:'15dk',
        supportedCoins:Object.keys(map).length,
      }
    };

    setCache(ck, result);
    return res.status(200).json(result);
  } catch(e) {
    return res.status(500).json({ error:'Sunucu hatası', detail:e.message });
  }
}