import { useState, useEffect } from 'react';

const COINS = [
  'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT','MATIC','LINK',
  'UNI','AAVE','CRV','SUSHI','YFI','COMP','MKR','SNX','GRT','BAL',
  '1INCH','DYDX','GMX','PENDLE','LDO','ARB','OP','IMX','NEAR','TIA',
  'TON','APT','SUI','SEI','INJ','HBAR','KAS','STX','FLOW','ICP',
  'ALGO','VET','EOS','TRX','ETC','XLM','XMR','DOGE','SHIB','PEPE',
  'WIF','BONK','FLOKI','TRUMP','MEME','BRETT','POPCAT','TURBO','BOME','PNUT',
  'PENGU','ACT','GOAT','ORDI','PYTH','RUNE','FET','RENDER','AR','FIL',
  'STRK','ZETA','JTO','PIXEL','MANTA','METIS','VIRTUAL','FARTCOIN','SAND','MANA',
  'AXS','GALA','ENJ','CHZ','APE','ILV','MAGIC','TAO','WLD','OCEAN',
  'ARKM','RSS3','ATOM','LTC','BCH','DASH','ZEC','QTUM','ICX','ZIL',
  'ONT','CRO','OKB','KCS','ENS','BLUR','HOOK','PORTAL','ALT','AI16Z'
];

// ── DİL PAKETLERİ ──────────────────────────────────────────
const LANGS = {
  TR: {
    code:'TR', flag:'🇹🇷', label:'Türkçe',
    market:'PİYASA', analyze:'Analiz Başlat', copy:'Kopyala', copied:'✓ Kopyalandı',
    loading:'analiz ediliyor', layers:'CHARTOS 8 KATMAN İŞLİYOR...',
    noCoins:'coin seçilmedi', recentLabel:'SON ANALİZLER', assets:'VARLIK',
    retry:'Tekrar Dene', fearGreed:'KORKU & AÇGÖZLÜLÜK',
    tagline:'SMC • ICT • Wyckoff • Volume Profile\n200+ coin için kurumsal yapay zeka analizi',
    footer:'Finansal tavsiye değildir',
    searchPlaceholder:'🔍 Coin ara...',
  },
  EN: {
    code:'EN', flag:'🇬🇧', label:'English',
    market:'MARKET', analyze:'Start Analysis', copy:'Copy', copied:'✓ Copied',
    loading:'analyzing', layers:'CHARTOS 8 LAYERS PROCESSING...',
    noCoins:'no coin selected', recentLabel:'RECENT ANALYSES', assets:'ASSETS',
    retry:'Retry', fearGreed:'FEAR & GREED',
    tagline:'SMC • ICT • Wyckoff • Volume Profile\nInstitutional AI analysis for 200+ coins',
    footer:'Not financial advice',
    searchPlaceholder:'🔍 Search coin...',
  },
  DE: {
    code:'DE', flag:'🇩🇪', label:'Deutsch',
    market:'MARKT', analyze:'Analyse Starten', copy:'Kopieren', copied:'✓ Kopiert',
    loading:'wird analysiert', layers:'CHARTOS 8 SCHICHTEN VERARBEITUNG...',
    noCoins:'kein Coin ausgewählt', recentLabel:'LETZTE ANALYSEN', assets:'VERMÖGEN',
    retry:'Erneut Versuchen', fearGreed:'ANGST & GIR',
    tagline:'SMC • ICT • Wyckoff • Volume Profile\nInstitutionelle KI-Analyse für 200+ Coins',
    footer:'Keine Finanzberatung',
    searchPlaceholder:'🔍 Coin suchen...',
  },
  FR: {
    code:'FR', flag:'🇫🇷', label:'Français',
    market:'MARCHÉ', analyze:'Lancer Analyse', copy:'Copier', copied:'✓ Copié',
    loading:'en analyse', layers:'CHARTOS 8 COUCHES EN TRAITEMENT...',
    noCoins:'aucun coin sélectionné', recentLabel:'ANALYSES RÉCENTES', assets:'ACTIFS',
    retry:'Réessayer', fearGreed:'PEUR & AVIDITÉ',
    tagline:'SMC • ICT • Wyckoff • Volume Profile\nAnalyse IA institutionnelle pour 200+ coins',
    footer:"Pas de conseil financier",
    searchPlaceholder:'🔍 Rechercher coin...',
  },
};

function parseAnalysis(text) {
  if (!text) return [];
  const clean = text.replace(/\*\*/g,'').replace(/\*/g,'').replace(/#{1,6}\s*/g,'');
  const lines = clean.split('\n').map(l=>l.trim()).filter(l=>l.length>0);
  const sections = [];
  let current = null;

  const isHeader = l => l.match(/CHARTOS APEX|CHARTOS MODU|CHARTOS AI/i);
  const isSectionTitle = l => l.match(/^(MARKET MAKER LENS|PİYASA YAPISI|ANA SEVİYELER|KALDIRAÇLI PRO SETUP|SENARYO ANALİZİ|TANRISAL İÇGÖRÜ|Risk Uyarısı|MARKET MAKER|SETUP BÖLÜMÜ|DEEPTRADESCAN İÇGÖRÜ|CHARTOS META|TWEET-READY|Tweet-Ready)/i);
  const isKV = l => l.match(/^(Varlık|Güncel Fiyat|Ana Timeframe|DeepTrade Bias|DeepTrader Bias|Edge Skoru|Win Probability|HTF Bias|HTF Bias & Son|Mevcut BOS|Unmitigated|FVG|Liquidity Pool|Demand Zone|Supply Zone|Kritik Liquidity|Invalidation|Setup Tipi|Giriş Bölgesi|Stop|Hedef [123]|R:R|Max Leverage|Risk %|Position Sizing|Trailing|Beklenen Süre|Expectancy|Boğa Senaryosu|Ayı Senaryosu|Asset|Current Price|Entry|Target [123]|Expected|Bull|Bear|Confluence|Win Prob):/i);

  for (const line of lines) {
    if (isHeader(line)) { sections.push({type:'header',text:line.replace(/[🔱]/g,'').trim()}); continue; }
    if (isSectionTitle(line)) {
      if (current) sections.push(current);
      current = {type:'section',title:line,items:[]}; continue;
    }
    if (isKV(line)) {
      if (!current) current = {type:'section',title:'ANALİZ',items:[]};
      const idx = line.indexOf(':');
      const key = line.substring(0,idx).trim();
      const value = line.substring(idx+1).trim();
      current.items.push({type:'kv',key,value}); continue;
    }
    if (line.match(/^[•\-›]/)) {
      if (!current) current = {type:'section',title:'ANALİZ',items:[]};
      current.items.push({type:'bullet',text:line.replace(/^[•\-›]\s*/,'')}); continue;
    }
    if (current) current.items.push({type:'text',text:line});
    else sections.push({type:'text',text:line});
  }
  if (current) sections.push(current);
  return sections;
}

function sectionMeta(title) {
  const t = title.toUpperCase();
  if (t.includes('MARKET MAKER')) return {icon:'🎯',color:'#7c3aed',bg:'rgba(124,58,237,0.12)',border:'rgba(124,58,237,0.4)'};
  if (t.includes('PİYASA')||t.includes('YAPISI')) return {icon:'📊',color:'#3b82f6',bg:'rgba(59,130,246,0.10)',border:'rgba(59,130,246,0.35)'};
  if (t.includes('SEVİYE')) return {icon:'📍',color:'#06b6d4',bg:'rgba(6,182,212,0.10)',border:'rgba(6,182,212,0.35)'};
  if (t.includes('SETUP')||t.includes('KALDIRAÇLI')) return {icon:'⚡',color:'#10b981',bg:'rgba(16,185,129,0.10)',border:'rgba(16,185,129,0.4)'};
  if (t.includes('SENARYO')) return {icon:'🎭',color:'#f59e0b',bg:'rgba(245,158,11,0.10)',border:'rgba(245,158,11,0.35)'};
  if (t.includes('İÇGÖRÜ')||t.includes('TANRISAL')||t.includes('META')) return {icon:'🔮',color:'#a855f7',bg:'rgba(168,85,247,0.12)',border:'rgba(168,85,247,0.4)'};
  if (t.includes('RISK')) return {icon:'⚠️',color:'#ef4444',bg:'rgba(239,68,68,0.08)',border:'rgba(239,68,68,0.3)'};
  return {icon:'📋',color:'#94a3b8',bg:'rgba(148,163,184,0.08)',border:'rgba(148,163,184,0.25)'};
}

function kvColor(key) {
  const k = key.toLowerCase();
  if (k.includes('giriş')||k.includes('entry')) return {color:'#10b981',bg:'rgba(16,185,129,0.12)'};
  if (k.includes('stop')||k.includes('invalid')) return {color:'#ef4444',bg:'rgba(239,68,68,0.12)'};
  if (k.includes('hedef 1')||k.includes('target 1')) return {color:'#06b6d4',bg:'rgba(6,182,212,0.10)'};
  if (k.includes('hedef 2')||k.includes('target 2')) return {color:'#22d3ee',bg:'rgba(34,211,238,0.08)'};
  if (k.includes('hedef 3')||k.includes('target 3')) return {color:'#67e8f9',bg:'rgba(103,232,249,0.08)'};
  if (k.includes('r:r')) return {color:'#a78bfa',bg:'rgba(167,139,250,0.12)'};
  if (k.includes('bias')||k.includes('win prob')||k.includes('edge')) return {color:'#f59e0b',bg:'rgba(245,158,11,0.10)'};
  if (k.includes('max leverage')) return {color:'#fb923c',bg:'rgba(251,146,60,0.10)'};
  if (k.includes('setup tipi')||k.includes('setup type')) return {color:'#818cf8',bg:'rgba(129,140,248,0.12)'};
  if (k.includes('demand')) return {color:'#34d399',bg:'rgba(52,211,153,0.08)'};
  if (k.includes('supply')) return {color:'#f87171',bg:'rgba(248,113,113,0.08)'};
  return {color:'#cbd5e1',bg:'transparent'};
}

export default function App() {
  const [coin,setCoin]=useState('');
  const [result,setResult]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [search,setSearch]=useState('');
  const [drawer,setDrawer]=useState(false);
  const [market,setMarket]=useState(null);
  const [fg,setFg]=useState(null);
  const [recent,setRecent]=useState([]);
  const [copied,setCopied]=useState(false);
  const [lang,setLang]=useState('TR');
  const LANG_COLORS = {TR:'#ef4444',EN:'#3b82f6',DE:'#f59e0b',FR:'#8b5cf6'};
  const LANG_FLAGS = {TR:'🇹🇷',EN:'🇬🇧',DE:'🇩🇪',FR:'🇫🇷'};

  const T = LANGS[lang];

  useEffect(()=>{
    const saved = typeof window!=='undefined' ? localStorage.getItem('dts_lang') : null;
    if (saved && LANGS[saved]) setLang(saved);
    fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()).then(d=>setMarket(d.data)).catch(()=>{});
    fetch('https://api.alternative.me/fng/?limit=1').then(r=>r.json()).then(d=>setFg(d.data?.[0])).catch(()=>{});
    fetch('/api/recent').then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});
  },[]);

  function changeLang(code) {
    setLang(code);
    try { localStorage.setItem('dts_lang', code); } catch {}
  }

  async function analyze(symbol){
    setCoin(symbol);setResult('');setError('');setLoading(true);setDrawer(false);
    try{
      const res=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({coin:symbol,lang})});
      const data=await res.json();
      if(data.analysis){setResult(data.analysis);fetch('/api/recent').then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});}
      else setError(data.error||'Analiz alınamadı');
    }catch(e){setError('Hata: '+e.message);}
    setLoading(false);
  }

  const fgV=fg?+fg.value:null;
  const fgColor=v=>v<25?'#ef4444':v<45?'#f97316':v<55?'#f59e0b':v<75?'#22c55e':'#00d4aa';
  const fgText=v=>v<25?'Aşırı Korku':v<45?'Korku':v<55?'Nötr':v<75?'Açgözlülük':'Aşırı Açgözlülük';
  const fmtB=n=>n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:'N/A';
  const filtered=COINS.filter(c=>c.includes(search.toUpperCase()));
  const sections=parseAnalysis(result);

  return (
    <div style={{minHeight:'100vh',background:'#06090f',color:'#f1f5f9',fontFamily:"'SF Pro Display',-apple-system,system-ui,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}button,input{font-family:inherit;border:none;outline:none;cursor:pointer}
        a{text-decoration:none}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes slide{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes langDrop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* MARKET BAR */}
      <div style={{background:'#040609',borderBottom:'1px solid #0f1923',padding:'0 14px',height:28,display:'flex',alignItems:'center',gap:16,overflowX:'auto',whiteSpace:'nowrap'}}>
        <span style={{fontSize:9,color:'#1e3a5f',letterSpacing:2,fontWeight:700}}>{T.market}</span>
        {market&&<>
          <span style={{fontSize:10,color:'#334155'}}>MCap <span style={{color:'#3b82f6',fontWeight:700}}>{fmtB(market.total_market_cap?.usd)}</span></span>
          <span style={{fontSize:10,color:'#334155'}}>BTC <span style={{color:'#f59e0b',fontWeight:700}}>{market.market_cap_percentage?.btc?.toFixed(1)}%</span></span>
          <span style={{fontSize:10,color:'#334155'}}>Vol <span style={{color:'#10b981',fontWeight:700}}>{fmtB(market.total_volume?.usd)}</span></span>
        </>}
        {fgV&&<span style={{marginLeft:'auto',fontSize:10,color:'#334155',flexShrink:0}}>F&G <span style={{color:fgColor(fgV),fontWeight:700}}>{fgV}</span></span>}
      </div>

      {/* TOPBAR */}
      <div style={{background:'#080c14',borderBottom:'1px solid #0f1923',height:52,display:'flex',alignItems:'center',padding:'0 14px',gap:10,position:'sticky',top:28,zIndex:50}}>
        <button onClick={()=>setDrawer(true)} style={{width:36,height:36,background:'#0d1421',border:'1px solid #162440',borderRadius:9,color:'#475569',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>☰</button>

        {coin ? (
          <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 6px #10b981',flexShrink:0}}/>
            <span style={{fontSize:15,fontWeight:800}}>{coin}/USDT</span>
            {result&&!loading&&(
              <div style={{marginLeft:'auto',display:'flex',gap:6,flexShrink:0}}>
                <button onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
                  style={{background:copied?'rgba(16,185,129,0.1)':'#0d1421',border:`1px solid ${copied?'#10b981':'#162440'}`,borderRadius:8,padding:'6px 12px',color:copied?'#10b981':'#475569',fontSize:11,fontWeight:700}}>
                  {copied?T.copied:T.copy}
                </button>
                <a href="https://t.me/deeptradescan" target="_blank" style={{background:'rgba(41,168,235,0.08)',border:'1px solid rgba(41,168,235,0.2)',borderRadius:8,padding:'6px 12px',color:'#29A8EB',fontSize:11,fontWeight:700}}>✈️ TG</a>
              </div>
            )}
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
            <img src="/logo.webp" style={{width:28,height:28,borderRadius:8,objectFit:'cover'}} alt="DTS"/>
            <span style={{fontSize:13,fontWeight:800,background:'linear-gradient(90deg,#60a5fa,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:1}}>DEEP TRADE SCAN</span>
          </div>
        )}

        {/* DİL SEÇİCİ — 4 BUTON */}
        <div style={{display:'flex',gap:3,flexShrink:0}}>
          {['TR','EN','DE','FR'].map(code=>{
            const active = lang===code;
            const color = LANG_COLORS[code];
            return (
              <button key={code} onClick={()=>changeLang(code)} style={{padding:'5px 8px',borderRadius:7,border:active?`1px solid ${color}`:'1px solid #162440',background:active?`${color}22`:'#0d1421',color:active?color:'#475569',fontSize:11,fontWeight:active?800:500,cursor:'pointer',display:'flex',alignItems:'center',gap:3,transition:'all .15s'}}>
                <span style={{fontSize:13}}>{LANG_FLAGS[code]}</span>
                <span>{code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TradingView */}
      {coin&&(
        <div style={{height:200,borderBottom:'1px solid #0f1923'}}>
          <iframe key={coin} src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=D&theme=dark&style=1&locale=tr&hide_top_toolbar=1&hide_legend=1`} style={{width:'100%',height:'100%',border:'none'}} allowFullScreen/>
        </div>
      )}

      <div style={{padding:'14px 14px 100px'}}>

        {/* BOŞ DURUM */}
        {!coin&&!loading&&(
          <div style={{textAlign:'center',paddingTop:28,animation:'fadeIn .4s ease'}}>
            <img src="/logo.webp" style={{width:76,height:76,borderRadius:18,objectFit:'cover',marginBottom:14,boxShadow:'0 0 40px rgba(26,106,255,0.25)'}} alt="DTS"/>
            <div style={{fontSize:18,fontWeight:900,marginBottom:6,background:'linear-gradient(135deg,#60a5fa,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:2}}>CHARTOS AI</div>
            <div style={{fontSize:12,color:'#334155',marginBottom:22,lineHeight:1.9,whiteSpace:'pre-line'}}>{T.tagline}</div>
            <button onClick={()=>setDrawer(true)} style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:12,padding:'13px 32px',color:'#fff',fontSize:15,fontWeight:800,boxShadow:'0 6px 24px rgba(26,106,255,0.35)',marginBottom:24,border:'none'}}>
              🔱 {T.analyze}
            </button>
            {fgV&&(
              <div style={{maxWidth:220,margin:'0 auto 20px',background:'#0a1020',border:'1px solid #0f1923',borderRadius:14,padding:16}}>
                <div style={{fontSize:9,color:'#1e3a5f',letterSpacing:3,marginBottom:8,fontWeight:700}}>{T.fearGreed}</div>
                <div style={{fontSize:42,fontWeight:900,color:fgColor(fgV),lineHeight:1,marginBottom:2}}>{fgV}</div>
                <div style={{fontSize:12,color:fgColor(fgV),fontWeight:700,marginBottom:10}}>{fgText(fgV)}</div>
                <div style={{background:'#0d1421',borderRadius:4,height:5,overflow:'hidden'}}>
                  <div style={{width:`${fgV}%`,height:'100%',background:'linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)'}}/>
                </div>
              </div>
            )}
            {recent.length>0&&(
              <div style={{maxWidth:260,margin:'0 auto'}}>
                <div style={{fontSize:9,color:'#1e3a5f',letterSpacing:3,marginBottom:8,fontWeight:700}}>{T.recentLabel}</div>
                <div style={{background:'#0a1020',border:'1px solid #0f1923',borderRadius:12,overflow:'hidden'}}>
                  {recent.slice(0,5).map((h,i)=>(
                    <button key={i} onClick={()=>analyze(h.coin)}
                      style={{width:'100%',display:'flex',justifyContent:'space-between',padding:'10px 14px',background:'transparent',borderTop:i?'1px solid #0a1020':'none',color:'#475569',fontSize:12,textAlign:'left'}}
                      onMouseOver={e=>e.currentTarget.style.background='#0d1421'}
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{fontWeight:700,color:'#94a3b8'}}>{h.coin}/USDT</span>
                      <span style={{fontSize:10,color:'#1e3a5f'}}>{h.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOADING */}
        {loading&&(
          <div style={{textAlign:'center',paddingTop:48}}>
            <div style={{width:40,height:40,border:'2px solid #0f1923',borderTop:'2px solid #3b82f6',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto 16px'}}/>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{coin} {T.loading}</div>
            <div style={{fontSize:11,color:'#1e3a5f',letterSpacing:1}}>{T.layers}</div>
          </div>
        )}

        {/* HATA */}
        {error&&!loading&&(
          <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{color:'#fca5a5',fontWeight:700,marginBottom:4,fontSize:13}}>⚠️ Hata</div>
            <div style={{color:'#f87171',fontSize:12,marginBottom:12}}>{error}</div>
            <button onClick={()=>analyze(coin)} style={{background:'#0d1421',border:'1px solid #162440',borderRadius:8,padding:'7px 16px',color:'#94a3b8',fontSize:12,fontWeight:600}}>{T.retry}</button>
          </div>
        )}

        {/* ANALİZ — PROFESYONEL KART */}
        {result&&!loading&&(
          <div style={{animation:'fadeIn .3s ease'}}>
            {sections.map((sec,si)=>{
              if(sec.type==='header') return (
                <div key={si} style={{background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(26,106,255,0.15))',border:'1px solid rgba(124,58,237,0.35)',borderRadius:16,padding:'16px 20px',marginBottom:14,textAlign:'center',boxShadow:'0 0 30px rgba(124,58,237,0.15)'}}>
                  <div style={{fontSize:13,fontWeight:900,color:'#fff',letterSpacing:2,textShadow:'0 0 20px rgba(124,58,237,0.8)'}}>🔱 {sec.text}</div>
                </div>
              );
              if(sec.type==='text') return (
                <div key={si} style={{fontSize:11,color:'#334155',padding:'3px 0',lineHeight:1.5}}>{sec.text}</div>
              );
              const meta=sectionMeta(sec.title||'');
              const isRisk=sec.title?.match(/Risk/i);
              return (
                <div key={si} style={{background:meta.bg,border:`1px solid ${meta.border}`,borderRadius:14,marginBottom:10,overflow:'hidden',animation:'fadeIn .3s ease',boxShadow:`0 2px 12px rgba(0,0,0,0.3)`}}>
                  <div style={{padding:'10px 16px',borderBottom:`1px solid ${meta.border}`,display:'flex',alignItems:'center',gap:10,background:`${meta.bg}`}}>
                    <span style={{fontSize:14}}>{meta.icon}</span>
                    <div style={{width:3,height:14,borderRadius:2,background:meta.color,boxShadow:`0 0 8px ${meta.color}`}}/>
                    <span style={{fontSize:11,fontWeight:800,color:meta.color,letterSpacing:1.5,textTransform:'uppercase',textShadow:`0 0 10px ${meta.color}40`}}>
                      {sec.title?.replace(/[🔱📊⚡🎯🎭🔮📍⚠️]/g,'').trim()}
                    </span>
                  </div>
                  <div style={{padding:'6px 0'}}>
                    {sec.items?.map((item,ii)=>{
                      if(item.type==='kv') {
                        const kvc=kvColor(item.key);
                        return (
                          <div key={ii} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'8px 16px',borderBottom:'1px solid rgba(255,255,255,0.03)',gap:12,background:kvc.bg,transition:'background .2s'}}>
                            <span style={{fontSize:11,color:'#475569',fontWeight:600,letterSpacing:0.5,flexShrink:0,minWidth:110}}>{item.key}</span>
                            <span style={{fontSize:12,fontWeight:800,color:kvc.color,textAlign:'right',textShadow:`0 0 8px ${kvc.color}50`,lineHeight:1.4}}>{item.value}</span>
                          </div>
                        );
                      }
                      if(item.type==='bullet') return (
                        <div key={ii} style={{display:'flex',gap:8,padding:'6px 16px',alignItems:'flex-start'}}>
                          <span style={{color:meta.color,fontSize:10,marginTop:3,flexShrink:0}}>▸</span>
                          <span style={{fontSize:12,color:'#64748b',lineHeight:1.6}}>{item.text}</span>
                        </div>
                      );
                      if(item.type==='text') return (
                        <div key={ii} style={{padding:'6px 16px',fontSize:12,color:isRisk?'#fca5a5':'#64748b',lineHeight:1.7}}>
                          {isRisk&&<span style={{marginRight:6}}>⚠️</span>}{item.text}
                        </div>
                      );
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {!loading&&(
        <div style={{background:'#040609',borderTop:'1px solid #0f1923',padding:'20px 16px'}}>
          <div style={{maxWidth:400,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <img src="/logo.webp" style={{width:26,height:26,borderRadius:7,objectFit:'cover'}} alt="DTS"/>
              <div>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:1}}>DEEP TRADE SCAN</div>
                <div style={{fontSize:9,color:'#1e3a5f',letterSpacing:1}}>CHARTOS ENGINE v8.0</div>
              </div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <a href="https://t.me/deeptradescan" target="_blank" style={{background:'rgba(41,168,235,0.08)',border:'1px solid rgba(41,168,235,0.15)',borderRadius:8,padding:'6px 12px',color:'#29A8EB',fontSize:11,fontWeight:700}}>✈️ Telegram</a>
              <a href="https://twitter.com/deeptradescan" target="_blank" style={{background:'rgba(255,255,255,0.03)',border:'1px solid #0f1923',borderRadius:8,padding:'6px 12px',color:'#475569',fontSize:11,fontWeight:700}}>𝕏</a>
            </div>
          </div>
          <div style={{textAlign:'center',marginTop:12,fontSize:10,color:'#1e3a5f'}}>⚠️ {T.footer}</div>
        </div>
      )}

      {/* DRAWER */}
      {drawer&&(
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex'}}>
          <div onClick={()=>setDrawer(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.85)'}}/>
          <div style={{position:'relative',width:280,height:'100%',background:'#08111e',borderRight:'1px solid #0f1923',display:'flex',flexDirection:'column',animation:'slide .2s ease',zIndex:1}}>
            <div style={{padding:'16px 14px',borderBottom:'1px solid #0f1923',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <img src="/logo.webp" style={{width:30,height:30,borderRadius:9,objectFit:'cover'}} alt="DTS"/>
                <div>
                  <div style={{fontSize:12,fontWeight:900,letterSpacing:1}}>DEEP TRADE SCAN</div>
                  <div style={{fontSize:9,color:'#1e3a5f',letterSpacing:1}}>CHARTOS ENGINE</div>
                </div>
              </div>
              <button onClick={()=>setDrawer(false)} style={{width:30,height:30,background:'#0d1421',border:'1px solid #162440',borderRadius:8,color:'#475569',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'10px 12px 8px',flexShrink:0}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.searchPlaceholder} style={{width:'100%',padding:'9px 12px',background:'#0d1421',border:'1px solid #162440',borderRadius:9,color:'#f1f5f9',fontSize:13}}/>
            </div>
            {recent.length>0&&!search&&(
              <div style={{padding:'0 12px 8px',flexShrink:0}}>
                <div style={{fontSize:9,color:'#1e3a5f',letterSpacing:2,marginBottom:6,fontWeight:700}}>{T.recentLabel}</div>
                {recent.slice(0,4).map((h,i)=>(
                  <button key={i} onClick={()=>analyze(h.coin)}
                    style={{width:'100%',display:'flex',justifyContent:'space-between',padding:'8px 8px',background:'transparent',borderRadius:8,color:'#475569',fontSize:12,marginBottom:1,textAlign:'left'}}
                    onMouseOver={e=>e.currentTarget.style.background='#0d1421'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontWeight:700,color:'#64748b'}}>{h.coin}</span>
                    <span style={{fontSize:10,color:'#1e3a5f'}}>{h.time}</span>
                  </button>
                ))}
                <div style={{borderBottom:'1px solid #0f1923',margin:'6px 0'}}/>
              </div>
            )}
            <div style={{flex:1,overflowY:'auto',padding:'0 8px 12px'}}>
              <div style={{fontSize:9,color:'#1e3a5f',letterSpacing:2,marginBottom:6,paddingLeft:4,fontWeight:700}}>{filtered.length} {T.assets}</div>
              {filtered.map((c,idx)=>(
                <button key={c} onClick={()=>analyze(c)}
                  style={{width:'100%',textAlign:'left',padding:'9px 10px',marginBottom:1,background:coin===c?'rgba(26,106,255,0.1)':'transparent',border:`1px solid ${coin===c?'rgba(26,106,255,0.3)':'transparent'}`,borderRadius:9,color:coin===c?'#60a5fa':'#475569',fontSize:13,fontWeight:coin===c?700:400,display:'flex',alignItems:'center',gap:10}}
                  onMouseOver={e=>{if(coin!==c)e.currentTarget.style.background='#0d1421'}}
                  onMouseOut={e=>{if(coin!==c)e.currentTarget.style.background='transparent'}}>
                  <span style={{fontSize:10,color:'#1e3a5f',minWidth:20,textAlign:'right'}}>{idx+1}</span>
                  <span>{c}/USDT</span>
                  {coin===c&&<span style={{marginLeft:'auto',width:5,height:5,borderRadius:'50%',background:'#1a6aff',boxShadow:'0 0 6px #1a6aff'}}/>}
                </button>
              ))}
            </div>
            <div style={{padding:'10px 14px',borderTop:'1px solid #0f1923',fontSize:9,color:'#1e3a5f',display:'flex',justifyContent:'space-between',letterSpacing:1,flexShrink:0}}>
              <span>deeptradescan.com</span><span>v8.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Dil dropdown dışına tıkla kapat */}
    </div>
  );
}
