// pages/index.jsx — Deep Trade Scan v9.0 — Professional & Mobile-First
import { useState, useEffect, useCallback } from 'react';

const COINS = [
  'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT','MATIC','LINK',
  'UNI','ATOM','LTC','BCH','DOGE','SHIB','PEPE','WIF','BONK','FLOKI',
  'INJ','SUI','APT','ARB','OP','NEAR','TIA','TON','RENDER','AAVE',
  'HBAR','KAS','STX','IMX','LDO','SEI','PENGU','TRUMP','FTM','SAND',
  'MANA','AXS','GALA','ENJ','CHZ','FLOW','ICP','FIL','AR','GRT',
  'SNX','CRV','SUSHI','YFI','COMP','MKR','1INCH','DYDX','GMX','RUNE',
  'OCEAN','FET','AGIX','VET','EGLD','ALGO','XLM','ETC','XMR','ZEC',
  'DASH','NEO','QTUM','ZIL','CELO','WAVES','TRX','EOS','XTZ','CRO',
  'MAGIC','BLUR','APE','ENS','PENDLE','PYTH','JTO','BOME','POPCAT',
  'NEIRO','PNUT','TURBO','ORDI','SATS','BRETT','WEN','JITO','DOGS',
];
const COIN_LIST = [...new Set(COINS)];

const COLORS = {
  bg: '#080C14',
  bgCard: '#0D1421',
  bgHover: '#111827',
  border: '#1A2332',
  borderLight: '#243044',
  accent: '#2563EB',
  accentGlow: 'rgba(37,99,235,0.15)',
  accentSoft: '#1D4ED8',
  gold: '#F59E0B',
  green: '#10B981',
  red: '#EF4444',
  purple: '#8B5CF6',
  text: '#F1F5F9',
  textMid: '#94A3B8',
  textDim: '#475569',
  textFaint: '#1E293B',
};

export default function Home() {
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const [analysis, setAnalysis]   = useState('');
  const [error, setError]         = useState('');
  const [cached, setCached]       = useState(false);
  const [search, setSearch]       = useState('');
  const [drawer, setDrawer]       = useState(false);
  const [fearGreed, setFearGreed] = useState(null);
  const [market, setMarket]       = useState(null);
  const [recent, setRecent]       = useState([]);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1')
      .then(r => r.json()).then(d => setFearGreed(d.data?.[0])).catch(() => {});
    fetch('https://api.coingecko.com/api/v3/global')
      .then(r => r.json()).then(d => setMarket(d.data)).catch(() => {});
    fetch('/api/recent')
      .then(r => r.json()).then(d => setRecent(d.recent || [])).catch(() => {});
  }, []);

  // Drawer body scroll lock
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const analyze = useCallback(async (coin) => {
    setSelected(coin);
    setLoading(true);
    setError('');
    setAnalysis('');
    setCached(false);
    setDrawer(false);
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin })
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Analiz başarısız'); return; }
      setAnalysis(data.analysis);
      setCached(!!data._cached);
      fetch('/api/recent').then(r => r.json()).then(d => setRecent(d.recent || [])).catch(() => {});
    } catch {
      setError('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweet = () => {
    const t = `🔱 ${selected}/USDT — CHARTOS Analizi\ndeeptradescan.com\n#${selected} #Kripto #TeknikAnaliz`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank');
  };

  const fgVal = fearGreed ? +fearGreed.value : null;
  const fgColor = v => v < 25 ? COLORS.red : v < 45 ? '#F97316' : v < 55 ? COLORS.gold : v < 75 ? COLORS.green : '#00D4AA';
  const fgLabel = v => v < 25 ? 'Aşırı Korku' : v < 45 ? 'Korku' : v < 55 ? 'Nötr' : v < 75 ? 'Açgözlülük' : 'Aşırı Açgözlülük';
  const fmt = (n, d=2) => n >= 1e12 ? `$${(n/1e12).toFixed(d)}T` : n >= 1e9 ? `$${(n/1e9).toFixed(d)}B` : `$${(n/1e6).toFixed(0)}M`;

  const filtered = COIN_LIST.filter(c => c.startsWith(search.toUpperCase()) || c.includes(search.toUpperCase()));

  const renderAnalysis = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const t = line.trim();
      if (!t) return <div key={i} style={{height:8}} />;
      if (t.includes('🔱') && t.includes('CHARTOS')) return (
        <div key={i} style={{background:'linear-gradient(135deg,rgba(37,99,235,0.2),rgba(139,92,246,0.2))',border:`1px solid ${COLORS.accent}`,borderRadius:10,padding:'14px 18px',marginBottom:20,marginTop:4}}>
          <div style={{fontSize:16,fontWeight:900,color:'#fff',letterSpacing:1}}>{t}</div>
        </div>
      );
      if (t.startsWith('##') || (t.startsWith('**') && t.endsWith('**') && t.length < 80)) return (
        <div key={i} style={{color:COLORS.accent,fontWeight:800,fontSize:11,marginTop:22,marginBottom:8,letterSpacing:2,textTransform:'uppercase',display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:3,height:14,background:COLORS.accent,borderRadius:2,flexShrink:0}} />
          {t.replace(/[#*]/g,'').trim()}
        </div>
      );
      if (t.match(/^Varlık:|^Güncel Fiyat:|^Ana Timeframe:|^Tanrısal Bias:|^24s Değişim:/)) {
        const [label, ...rest] = t.split(':');
        return (
          <div key={i} style={{display:'flex',gap:8,marginBottom:5,padding:'4px 0',borderBottom:`1px solid ${COLORS.textFaint}`}}>
            <span style={{color:COLORS.textMid,fontSize:12,minWidth:130,flexShrink:0}}>{label}:</span>
            <span style={{color:COLORS.text,fontSize:12,fontWeight:600}}
              dangerouslySetInnerHTML={{__html: rest.join(':').replace(/\*\*(.*?)\*\*/g,`<strong style="color:${COLORS.gold}">$1</strong>`)}} />
          </div>
        );
      }
      if (t.match(/^[🟢🔴🟡📈📉⚡🎯📊🚀🧠🎭⚠️]/)) return (
        <div key={i} style={{color:COLORS.text,fontWeight:700,fontSize:13,marginTop:14,marginBottom:6,display:'flex',alignItems:'flex-start',gap:8}}>
          {t}
        </div>
      );
      if (t.startsWith('•') || t.startsWith('├') || t.startsWith('└') || t.startsWith('|')) return (
        <div key={i} style={{color:COLORS.textMid,fontSize:12,paddingLeft:14,marginBottom:4,lineHeight:1.7,fontFamily:'monospace',borderLeft:`2px solid ${COLORS.textFaint}`,marginLeft:4}}>
          {t}
        </div>
      );
      if (t.startsWith('-')) return (
        <div key={i} style={{color:COLORS.textMid,fontSize:12,paddingLeft:16,marginBottom:3,lineHeight:1.7,display:'flex',gap:6}}>
          <span style={{color:COLORS.accent,flexShrink:0}}>›</span>
          <span dangerouslySetInnerHTML={{__html:t.slice(1).replace(/\*\*(.*?)\*\*/g,`<strong style="color:${COLORS.text}">$1</strong>`)}} />
        </div>
      );
      if (t.includes('**')) return (
        <div key={i} style={{color:COLORS.textMid,fontSize:12,marginBottom:4,lineHeight:1.7}}
          dangerouslySetInnerHTML={{__html:t.replace(/\*\*(.*?)\*\*/g,`<strong style="color:${COLORS.text};font-weight:700">$1</strong>`)}} />
      );
      if (t.startsWith('Risk Uyarısı')) return (
        <div key={i} style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 14px',marginTop:20,color:'#FCA5A5',fontSize:11,lineHeight:1.6}}>
          ⚠️ {t}
        </div>
      );
      return <div key={i} style={{color:COLORS.textMid,fontSize:12,marginBottom:3,lineHeight:1.7}}>{t}</div>;
    });
  };

  const SidebarContent = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {/* Logo */}
      <div style={{padding:'20px 16px 16px',borderBottom:`1px solid ${COLORS.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
          <div style={{width:32,height:32,background:'linear-gradient(135deg,#2563EB,#8B5CF6)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>🔱</div>
          <div>
            <div style={{fontSize:13,fontWeight:900,color:COLORS.text,letterSpacing:0.5}}>DEEP TRADE SCAN</div>
            <div style={{fontSize:9,color:COLORS.textDim,letterSpacing:2,textTransform:'uppercase'}}>CHARTOS ENGINE v9</div>
          </div>
        </div>
      </div>

      {/* Arama */}
      <div style={{padding:'12px 12px 8px'}}>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:COLORS.textDim,fontSize:13}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Coin ara..."
            style={{width:'100%',padding:'8px 10px 8px 30px',background:COLORS.bgHover,border:`1px solid ${COLORS.border}`,borderRadius:8,color:COLORS.text,fontSize:12,transition:'border .2s'}}
            onFocus={e=>e.target.style.borderColor=COLORS.accent}
            onBlur={e=>e.target.style.borderColor=COLORS.border} />
        </div>
      </div>

      {/* Son Analizler */}
      {recent.length > 0 && !search && (
        <div style={{padding:'0 12px 8px'}}>
          <div style={{fontSize:9,color:COLORS.textDim,letterSpacing:2,textTransform:'uppercase',marginBottom:6,paddingLeft:2}}>SON ANALİZLER</div>
          {recent.slice(0,4).map((h,i) => (
            <button key={i} onClick={()=>analyze(h.coin)}
              style={{width:'100%',textAlign:'left',padding:'6px 8px',marginBottom:2,background:'transparent',border:`1px solid transparent`,borderRadius:6,color:COLORS.textMid,fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',transition:'all .15s'}}
              onMouseOver={e=>{e.currentTarget.style.background=COLORS.bgHover;e.currentTarget.style.borderColor=COLORS.border;}}
              onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='transparent';}}>
              <span style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:COLORS.green,flexShrink:0}} />
                {h.coin}
              </span>
              <span style={{fontSize:10,color:COLORS.textDim}}>{h.time}</span>
            </button>
          ))}
          <div style={{borderBottom:`1px solid ${COLORS.border}`,margin:'8px 0'}} />
        </div>
      )}

      {/* Coin Listesi */}
      <div style={{flex:1,overflowY:'auto',padding:'0 8px 8px'}}>
        <div style={{fontSize:9,color:COLORS.textDim,letterSpacing:2,textTransform:'uppercase',marginBottom:6,paddingLeft:4}}>{filtered.length} KRİPTO VARLIK</div>
        {filtered.map((coin) => {
          const idx = COIN_LIST.indexOf(coin);
          const isActive = selected === coin;
          return (
            <button key={coin} onClick={()=>analyze(coin)}
              style={{width:'100%',textAlign:'left',padding:'9px 10px',marginBottom:2,
                background: isActive ? COLORS.accentGlow : 'transparent',
                border: `1px solid ${isActive ? COLORS.accent : 'transparent'}`,
                borderRadius:7,color:isActive ? COLORS.text : COLORS.textMid,
                fontSize:13,fontWeight:isActive?700:500,
                display:'flex',alignItems:'center',gap:10,cursor:'pointer',transition:'all .15s'}}
              onMouseOver={e=>{if(!isActive){e.currentTarget.style.background=COLORS.bgHover;e.currentTarget.style.borderColor=COLORS.border;}}}
              onMouseOut={e=>{if(!isActive){e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='transparent';}}}>
              <span style={{fontSize:10,color:COLORS.textFaint,minWidth:20,textAlign:'right'}}>{idx+1}</span>
              <span>{coin}</span>
              {isActive && <span style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:COLORS.accent}} />}
            </button>
          );
        })}
      </div>

      <div style={{padding:'10px 14px',borderTop:`1px solid ${COLORS.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:10,color:COLORS.textDim}}>deeptradescan.com</span>
        <span style={{fontSize:10,color:COLORS.textDim}}>v9.0</span>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:COLORS.bg,color:COLORS.text,fontFamily:"'DM Sans','Sora',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;overflow:hidden;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:${COLORS.border};border-radius:2px;}
        input,button{font-family:inherit;outline:none;} button{cursor:pointer;border:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes shimmer{0%{background-position:-200px 0;}100%{background-position:200px 0;}}
        @keyframes drawerIn{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        .shimmer{background:linear-gradient(90deg,${COLORS.bgCard} 25%,${COLORS.bgHover} 50%,${COLORS.bgCard} 75%);background-size:400px 100%;animation:shimmer 1.4s ease infinite;}
        .fade-in{animation:fadeUp 0.35s ease forwards;}
        @media(min-width:769px){.mobile-only{display:none!important;} .desktop-sidebar{display:flex!important;}}
        @media(max-width:768px){.desktop-sidebar{display:none!important;} .mobile-only{display:flex!important;}}
      `}</style>

      {/* TOP MARKET BAR */}
      <div style={{height:36,background:'#060A12',borderBottom:`1px solid ${COLORS.border}`,display:'flex',alignItems:'center',paddingLeft:16,paddingRight:16,gap:0,overflowX:'auto',flexShrink:0}}>
        <span style={{fontSize:10,color:COLORS.textDim,marginRight:16,flexShrink:0,letterSpacing:1}}>PIYASA</span>
        {market ? <>
          <MarketPill label="Toplam MCap" value={fmt(market.total_market_cap?.usd)} color={COLORS.accent} />
          <MarketPill label="BTC Dom" value={`${market.market_cap_percentage?.btc?.toFixed(1)}%`} color={COLORS.gold} />
          <MarketPill label="ETH Dom" value={`${market.market_cap_percentage?.eth?.toFixed(1)}%`} color={COLORS.purple} />
          <MarketPill label="24s Hacim" value={fmt(market.total_volume?.usd)} color={COLORS.green} />
        </> : <span style={{fontSize:10,color:COLORS.textDim}}>Yükleniyor...</span>}
        {fearGreed && <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <span style={{fontSize:10,color:COLORS.textDim}}>F&G</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:28,height:4,background:COLORS.border,borderRadius:2,overflow:'hidden'}}>
              <div style={{width:`${fgVal}%`,height:'100%',background:`linear-gradient(90deg,${COLORS.red},${COLORS.gold},${COLORS.green})`}} />
            </div>
            <span style={{fontSize:11,fontWeight:700,color:fgColor(fgVal)}}>{fgVal}</span>
            <span style={{fontSize:10,color:fgColor(fgVal)}}>{fgLabel(fgVal)}</span>
          </div>
        </div>}
      </div>

      {/* MAIN LAYOUT */}
      <div style={{display:'flex',height:'calc(100vh - 36px)'}}>

        {/* DESKTOP SIDEBAR */}
        <div className="desktop-sidebar" style={{width:220,background:COLORS.bgCard,borderRight:`1px solid ${COLORS.border}`,flexDirection:'column',height:'100%',flexShrink:0,display:'flex'}}>
          <SidebarContent />
        </div>

        {/* MOBILE DRAWER OVERLAY */}
        {drawer && (
          <div style={{position:'fixed',inset:0,zIndex:200}} onClick={()=>setDrawer(false)}>
            <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}} />
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:260,background:COLORS.bgCard,borderRight:`1px solid ${COLORS.border}`,animation:'drawerIn .25s ease',display:'flex',flexDirection:'column'}}
              onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',borderBottom:`1px solid ${COLORS.border}`}}>
                <span style={{fontSize:13,fontWeight:800,color:COLORS.text}}>Coin Seç</span>
                <button onClick={()=>setDrawer(false)} style={{background:COLORS.bgHover,border:`1px solid ${COLORS.border}`,borderRadius:8,padding:'6px 10px',color:COLORS.textMid,fontSize:16,lineHeight:1}}>✕</button>
              </div>
              <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>

          {/* TOPBAR */}
          <div style={{height:52,background:COLORS.bgCard,borderBottom:`1px solid ${COLORS.border}`,display:'flex',alignItems:'center',paddingLeft:16,paddingRight:16,gap:12,flexShrink:0}}>
            <button className="mobile-only" onClick={()=>setDrawer(true)}
              style={{background:COLORS.bgHover,border:`1px solid ${COLORS.border}`,borderRadius:8,width:36,height:36,color:COLORS.textMid,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              ☰
            </button>

            {selected ? (
              <>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:COLORS.green,boxShadow:`0 0 6px ${COLORS.green}`}} />
                  <span style={{fontSize:15,fontWeight:800,color:COLORS.text}}>{selected}/USDT</span>
                </div>
                {cached && <span style={{fontSize:10,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',color:COLORS.gold,borderRadius:6,padding:'2px 8px',letterSpacing:0.5}}>ÖNBELLEKTEN</span>}
                {loading && <span style={{fontSize:11,color:COLORS.accent}}>Analiz yapılıyor...</span>}
                {analysis && !loading && (
                  <div style={{marginLeft:'auto',display:'flex',gap:6}}>
                    <button onClick={copy} style={{background:copied?'rgba(16,185,129,0.1)':COLORS.bgHover,border:`1px solid ${copied?COLORS.green:COLORS.border}`,borderRadius:7,padding:'6px 12px',color:copied?COLORS.green:COLORS.textMid,fontSize:11,fontWeight:600,transition:'all .2s'}}>
                      {copied ? '✓ Kopyalandı' : '⎘ Kopyala'}
                    </button>
                    <button onClick={tweet} style={{background:'rgba(29,161,242,0.1)',border:'1px solid rgba(29,161,242,0.25)',borderRadius:7,padding:'6px 12px',color:'#1DA1F2',fontSize:11,fontWeight:600}}>
                      𝕏 Paylaş
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:13,color:COLORS.textDim}}>Analiz için sol panelden coin seçin</span>
                <button className="mobile-only" onClick={()=>setDrawer(true)}
                  style={{background:'linear-gradient(135deg,#2563EB,#8B5CF6)',border:'none',borderRadius:8,padding:'7px 16px',color:'#fff',fontSize:12,fontWeight:700}}>
                  🔱 Seç
                </button>
              </div>
            )}
          </div>

          {/* SCROLLABLE AREA */}
          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>

            {/* TradingView Chart */}
            {selected && (
              <div style={{height:360,flexShrink:0,borderBottom:`1px solid ${COLORS.border}`,background:'#0a0f1a'}}>
                <iframe key={selected}
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tv&symbol=BINANCE:${selected}USDT&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0a0f1a&studies=[]&theme=dark&style=1&timezone=Europe%2FIstanbul&withdateranges=1&locale=tr`}
                  style={{width:'100%',height:'100%',border:'none'}} allowTransparency allowFullScreen />
              </div>
            )}

            {/* Content Area */}
            <div style={{flex:1,padding:'20px 20px 32px',maxWidth:860,width:'100%',margin:'0 auto'}}>

              {/* EMPTY STATE */}
              {!selected && !loading && (
                <div style={{paddingTop:48,textAlign:'center'}}>
                  <div style={{width:72,height:72,background:'linear-gradient(135deg,rgba(37,99,235,0.2),rgba(139,92,246,0.2))',border:`1px solid ${COLORS.border}`,borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 20px'}}>🔱</div>
                  <div style={{fontSize:20,fontWeight:800,color:COLORS.text,marginBottom:8}}>CHARTOS Analiz Motoru</div>
                  <div style={{fontSize:13,color:COLORS.textDim,maxWidth:340,margin:'0 auto 28px',lineHeight:1.7}}>
                    200+ kripto varlık için Smart Money Concepts, Wyckoff ve ICT metodolojileri ile profesyonel analiz
                  </div>
                  <button className="mobile-only" onClick={()=>setDrawer(true)}
                    style={{background:'linear-gradient(135deg,#2563EB,#8B5CF6)',border:'none',borderRadius:10,padding:'12px 28px',color:'#fff',fontSize:14,fontWeight:700,boxShadow:'0 4px 20px rgba(37,99,235,0.3)'}}>
                    🔱 Analiz Başlat
                  </button>

                  {fearGreed && (
                    <div style={{maxWidth:280,margin:'32px auto 0',background:COLORS.bgCard,border:`1px solid ${COLORS.border}`,borderRadius:12,padding:'18px 20px',textAlign:'left'}}>
                      <div style={{fontSize:9,color:COLORS.textDim,letterSpacing:2,marginBottom:12}}>KORKU & AÇGÖZLÜLÜK ENDEKSİ</div>
                      <div style={{display:'flex',alignItems:'flex-end',gap:12,marginBottom:12}}>
                        <div style={{fontSize:44,fontWeight:900,color:fgColor(fgVal),lineHeight:1}}>{fgVal}</div>
                        <div style={{paddingBottom:4}}>
                          <div style={{fontSize:13,fontWeight:700,color:fgColor(fgVal)}}>{fgLabel(fgVal)}</div>
                          <div style={{fontSize:10,color:COLORS.textDim}}>Güncel</div>
                        </div>
                      </div>
                      <div style={{background:COLORS.bgHover,borderRadius:4,height:6,overflow:'hidden'}}>
                        <div style={{width:`${fgVal}%`,height:'100%',background:`linear-gradient(90deg,${COLORS.red},${COLORS.gold},${COLORS.green})`,transition:'width .5s ease'}} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LOADING */}
              {loading && (
                <div className="fade-in">
                  <div style={{textAlign:'center',marginBottom:28}}>
                    <div style={{width:40,height:40,border:`2px solid ${COLORS.border}`,borderTop:`2px solid ${COLORS.accent}`,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 14px'}} />
                    <div style={{fontSize:14,fontWeight:600,color:COLORS.text,marginBottom:4}}>{selected} analiz ediliyor</div>
                    <div style={{fontSize:11,color:COLORS.textDim}}>7 katman hesaplanıyor...</div>
                  </div>
                  {[280,220,320,180,260,200,300,160,240].map((w,i) => (
                    <div key={i} className="shimmer" style={{height:12,width:`${w}px`,maxWidth:'100%',borderRadius:6,marginBottom:10}} />
                  ))}
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'14px 18px',display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:18}}>⚠️</span>
                  <div style={{flex:1}}>
                    <div style={{color:'#FCA5A5',fontSize:13,fontWeight:600}}>Hata</div>
                    <div style={{color:'#F87171',fontSize:12,marginTop:2}}>{error}</div>
                  </div>
                  <button onClick={()=>analyze(selected)} style={{background:COLORS.bgHover,border:`1px solid ${COLORS.border}`,borderRadius:7,padding:'6px 14px',color:COLORS.textMid,fontSize:12,fontWeight:600}}>
                    Tekrar Dene
                  </button>
                </div>
              )}

              {/* ANALYSIS */}
              {analysis && !loading && (
                <div className="fade-in">
                  <div style={{background:COLORS.bgCard,border:`1px solid ${COLORS.border}`,borderRadius:12,padding:'22px 20px',lineHeight:1.7,wordBreak:'break-word'}}>
                    {renderAnalysis(analysis)}
                  </div>
                  <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:10,color:COLORS.textDim}}>CHARTOS Engine • {new Date().toLocaleTimeString('tr-TR')}{cached?' • Önbellekten':''}</span>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={copy} style={{background:COLORS.bgCard,border:`1px solid ${COLORS.border}`,borderRadius:6,padding:'4px 10px',color:COLORS.textDim,fontSize:11}}>⎘ Kopyala</button>
                      <button onClick={tweet} style={{background:'rgba(29,161,242,0.08)',border:'1px solid rgba(29,161,242,0.2)',borderRadius:6,padding:'4px 10px',color:'#1DA1F2',fontSize:11}}>𝕏</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketPill({ label, value, color }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:5,marginRight:20,flexShrink:0}}>
      <span style={{fontSize:9,color:'#334155',letterSpacing:0.5}}>{label}:</span>
      <span style={{fontSize:11,fontWeight:700,color}}>{value}</span>
    </div>
  );
}
