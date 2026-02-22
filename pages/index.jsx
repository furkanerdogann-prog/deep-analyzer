// pages/index.jsx — Deep Trade Scan v10.0 — Mobile First
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

export default function Home() {
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [error, setError]       = useState('');
  const [cached, setCached]     = useState(false);
  const [search, setSearch]     = useState('');
  const [drawer, setDrawer]     = useState(false);
  const [fearGreed, setFearGreed] = useState(null);
  const [market, setMarket]     = useState(null);
  const [recent, setRecent]     = useState([]);
  const [copied, setCopied]     = useState(false);
  const [retries, setRetries]   = useState(0);

  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1')
      .then(r=>r.json()).then(d=>setFearGreed(d.data?.[0])).catch(()=>{});
    fetch('https://api.coingecko.com/api/v3/global')
      .then(r=>r.json()).then(d=>setMarket(d.data)).catch(()=>{});
    fetch('/api/recent')
      .then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});
  }, []);

  useEffect(() => {
    if (drawer) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const analyze = useCallback(async (coin, retry=0) => {
    setSelected(coin);
    setLoading(true);
    setError('');
    setAnalysis('');
    setCached(false);
    setDrawer(false);
    setRetries(retry);
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({coin})
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error||'Analiz başarısız'); setLoading(false); return; }
      setAnalysis(data.analysis);
      setCached(!!data._cached);
      fetch('/api/recent').then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});
    } catch {
      if (retry < 1) {
        setTimeout(()=>analyze(coin, retry+1), 2500);
        return;
      }
      setError('Sunucuya ulaşılamadı. Tekrar deneyin.');
    } finally {
      if (retry === 0 || retry >= 1) setLoading(false);
    }
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  const tweet = () => {
    const t = `🔱 ${selected}/USDT — CHARTOS Analizi\ndeeptradescan.com\n#${selected} #Kripto`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank');
  };

  const fgVal = fearGreed ? +fearGreed.value : null;
  const fgColor = v => v<25?'#EF4444':v<45?'#F97316':v<55?'#F59E0B':v<75?'#10B981':'#00D4AA';
  const fgLabel = v => v<25?'Aşırı Korku':v<45?'Korku':v<55?'Nötr':v<75?'Açgözlülük':'Aşırı Açgözlülük';
  const fmtNum = n => n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:`$${(n/1e6).toFixed(0)}M`;

  const filtered = COIN_LIST.filter(c=>c.includes(search.toUpperCase()));

  const renderAnalysis = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const t = line.trim();
      if (!t) return <div key={i} style={{height:6}} />;

      // Başlık banner
      if (t.includes('🔱') && t.includes('CHARTOS')) return (
        <div key={i} style={{background:'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(139,92,246,0.15))',border:'1px solid rgba(37,99,235,0.4)',borderRadius:10,padding:'14px 16px',margin:'0 0 18px',textAlign:'center'}}>
          <div style={{fontSize:15,fontWeight:900,color:'#fff',letterSpacing:0.5}}>{t}</div>
        </div>
      );

      // Bölüm başlıkları
      if (t.match(/^(PİYASA YAPISI|ANA SEVİYELER|SENARYO ANALİZİ|YÜKSEK OLASILIKLI|TANRISAL İÇGÖRÜ)/)) return (
        <div key={i} style={{borderLeft:'3px solid #2563EB',paddingLeft:12,marginTop:20,marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:800,color:'#60A5FA',letterSpacing:1.5,textTransform:'uppercase'}}>{t}</div>
        </div>
      );

      // Meta bilgiler (Varlık, Fiyat vs)
      if (t.match(/^(Varlık|Güncel Fiyat|24s|Ana Timeframe|Tanrısal Bias):/)) {
        const colonIdx = t.indexOf(':');
        const label = t.slice(0, colonIdx);
        const val = t.slice(colonIdx+1).trim();
        return (
          <div key={i} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:'1px solid #0F172A',flexWrap:'wrap'}}>
            <span style={{color:'#64748B',fontSize:12,minWidth:120,flexShrink:0}}>{label}</span>
            <span style={{color:'#F1F5F9',fontSize:12,fontWeight:600,flex:1}}
              dangerouslySetInnerHTML={{__html:val.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#F59E0B">$1</strong>')}} />
          </div>
        );
      }

      // Emoji satırlar
      if (t.match(/^[🟢🔴🟡📈📉⚡🎯🚀🧠⚠️]/)) return (
        <div key={i} style={{color:'#F1F5F9',fontWeight:700,fontSize:13,marginTop:14,marginBottom:5}}>{t}</div>
      );

      // Bullet / tree
      if (t.startsWith('•') || t.startsWith('├') || t.startsWith('└')) return (
        <div key={i} style={{color:'#94A3B8',fontSize:12,paddingLeft:12,marginBottom:4,lineHeight:1.8,borderLeft:'2px solid #1E293B',marginLeft:4,fontFamily:'monospace'}}>{t}</div>
      );

      // Dash list
      if (t.startsWith('-')) return (
        <div key={i} style={{color:'#94A3B8',fontSize:12,paddingLeft:12,marginBottom:3,lineHeight:1.7,display:'flex',gap:6}}>
          <span style={{color:'#2563EB',flexShrink:0}}>›</span>
          <span dangerouslySetInnerHTML={{__html:t.slice(1).replace(/\*\*(.*?)\*\*/g,'<strong style="color:#F1F5F9">$1</strong>')}} />
        </div>
      );

      // Risk uyarısı
      if (t.startsWith('Risk Uyarısı')) return (
        <div key={i} style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 14px',marginTop:18,color:'#FCA5A5',fontSize:11,lineHeight:1.7}}>⚠️ {t}</div>
      );

      // Bold içerikli
      if (t.includes('**')) return (
        <div key={i} style={{color:'#94A3B8',fontSize:12,marginBottom:4,lineHeight:1.7}}
          dangerouslySetInnerHTML={{__html:t.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#F1F5F9;font-weight:700">$1</strong>')}} />
      );

      return <div key={i} style={{color:'#94A3B8',fontSize:12,marginBottom:3,lineHeight:1.7}}>{t}</div>;
    });
  };

  return (
    <div style={{height:'100dvh',background:'#080C14',color:'#F1F5F9',fontFamily:"'DM Sans',system-ui,sans-serif",display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#1E293B;border-radius:2px;}
        input,button{font-family:inherit;outline:none;} button{cursor:pointer;border:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        @keyframes shimmer{0%{opacity:0.4;}50%{opacity:0.8;}100%{opacity:0.4;}}
        .shimmer{animation:shimmer 1.5s ease infinite;background:#0D1421;border-radius:6px;}
        .fade{animation:fadeIn 0.3s ease forwards;}
        .btn-hover:hover{opacity:0.85;}
      `}</style>

      {/* MARKET BAR */}
      <div style={{background:'#060A12',borderBottom:'1px solid #1A2332',padding:'0 12px',height:34,display:'flex',alignItems:'center',gap:0,overflowX:'auto',flexShrink:0,whiteSpace:'nowrap'}}>
        <span style={{fontSize:9,color:'#334155',marginRight:12,letterSpacing:1,textTransform:'uppercase'}}>Piyasa</span>
        {market && <>
          <Pill l="MCap" v={fmtNum(market.total_market_cap?.usd)} c="#3B82F6" />
          <Pill l="BTC" v={`${market.market_cap_percentage?.btc?.toFixed(1)}%`} c="#F59E0B" />
          <Pill l="ETH" v={`${market.market_cap_percentage?.eth?.toFixed(1)}%`} c="#8B5CF6" />
          <Pill l="Hacim" v={fmtNum(market.total_volume?.usd)} c="#10B981" />
        </>}
        {fgVal && <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <span style={{fontSize:9,color:'#334155'}}>F&G</span>
          <span style={{fontSize:11,fontWeight:800,color:fgColor(fgVal)}}>{fgVal}</span>
          <span style={{fontSize:9,color:fgColor(fgVal)}}>{fgLabel(fgVal)}</span>
        </div>}
      </div>

      {/* TOPBAR */}
      <div style={{background:'#0D1421',borderBottom:'1px solid #1A2332',height:50,display:'flex',alignItems:'center',padding:'0 12px',gap:10,flexShrink:0}}>
        <button onClick={()=>setDrawer(true)}
          style={{width:36,height:36,background:'#111827',border:'1px solid #1A2332',borderRadius:8,color:'#64748B',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          ☰
        </button>
        {selected ? (
          <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#10B981',boxShadow:'0 0 6px #10B981',flexShrink:0}} />
            <span style={{fontSize:15,fontWeight:800,truncate:true,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selected}/USDT</span>
            {cached && <span style={{fontSize:9,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',color:'#F59E0B',borderRadius:5,padding:'2px 6px',flexShrink:0}}>ÖNBELLEKTEN</span>}
            {analysis && !loading && (
              <div style={{marginLeft:'auto',display:'flex',gap:6,flexShrink:0}}>
                <button onClick={copy} className="btn-hover"
                  style={{background:copied?'rgba(16,185,129,0.1)':'#111827',border:`1px solid ${copied?'#10B981':'#1A2332'}`,borderRadius:7,padding:'5px 10px',color:copied?'#10B981':'#64748B',fontSize:11,fontWeight:600}}>
                  {copied?'✓':'⎘'} {copied?'Kopyalandı':'Kopyala'}
                </button>
                <button onClick={tweet} className="btn-hover"
                  style={{background:'rgba(29,161,242,0.1)',border:'1px solid rgba(29,161,242,0.25)',borderRadius:7,padding:'5px 10px',color:'#1DA1F2',fontSize:11,fontWeight:600}}>
                  𝕏
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
            <span style={{fontSize:12,color:'#475569'}}>Coin seçin</span>
            <span style={{marginLeft:'auto',fontSize:11,color:'#334155'}}>⚡ CHARTOS</span>
          </div>
        )}
      </div>

      {/* MAIN SCROLL AREA */}
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>

        {/* TradingView - sadece seçilince, sabit yükseklik */}
        {selected && (
          <div style={{height:260,flexShrink:0,borderBottom:'1px solid #1A2332',background:'#0a0f1a'}}>
            <iframe key={selected}
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tv&symbol=BINANCE:${selected}USDT&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0a0f1a&theme=dark&style=1&timezone=Europe%2FIstanbul&locale=tr&withdateranges=0&hide_top_toolbar=0`}
              style={{width:'100%',height:'100%',border:'none'}} allowTransparency allowFullScreen />
          </div>
        )}

        {/* CONTENT */}
        <div style={{padding:'16px 14px 32px',flex:1}}>

          {/* BOŞ DURUM */}
          {!selected && !loading && (
            <div style={{textAlign:'center',paddingTop:40}}>
              <div style={{width:64,height:64,background:'linear-gradient(135deg,rgba(37,99,235,0.2),rgba(139,92,246,0.2))',border:'1px solid #1A2332',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 16px'}}>🔱</div>
              <div style={{fontSize:18,fontWeight:800,color:'#F1F5F9',marginBottom:8}}>CHARTOS Analiz Motoru</div>
              <div style={{fontSize:12,color:'#475569',marginBottom:24,lineHeight:1.7,maxWidth:300,margin:'0 auto 24px'}}>
                SMC • Wyckoff • ICT metodolojileri ile 200+ coin için profesyonel analiz
              </div>
              <button onClick={()=>setDrawer(true)}
                style={{background:'linear-gradient(135deg,#2563EB,#8B5CF6)',border:'none',borderRadius:10,padding:'12px 28px',color:'#fff',fontSize:14,fontWeight:700,boxShadow:'0 4px 20px rgba(37,99,235,0.35)'}}>
                🔱 Coin Seç ve Analiz Et
              </button>
              {fgVal && (
                <div style={{maxWidth:260,margin:'28px auto 0',background:'#0D1421',border:'1px solid #1A2332',borderRadius:12,padding:'16px'}}>
                  <div style={{fontSize:9,color:'#334155',letterSpacing:2,marginBottom:10,textTransform:'uppercase'}}>Korku & Açgözlülük</div>
                  <div style={{fontSize:40,fontWeight:900,color:fgColor(fgVal),lineHeight:1,marginBottom:4}}>{fgVal}</div>
                  <div style={{fontSize:12,color:fgColor(fgVal),fontWeight:700,marginBottom:10}}>{fgLabel(fgVal)}</div>
                  <div style={{background:'#1A2332',borderRadius:4,height:5,overflow:'hidden'}}>
                    <div style={{width:`${fgVal}%`,height:'100%',background:'linear-gradient(90deg,#EF4444,#F59E0B,#10B981)'}} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div style={{paddingTop:16}}>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{width:36,height:36,border:'2.5px solid #1A2332',borderTop:'2.5px solid #2563EB',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}} />
                <div style={{fontSize:13,fontWeight:600,color:'#F1F5F9',marginBottom:3}}>{selected} analiz ediliyor</div>
                <div style={{fontSize:11,color:'#334155'}}>CHARTOS 7 katman hesaplıyor{retries>0?' (tekrar deneniyor...)':''}</div>
              </div>
              {[240,180,280,140,220,160,260].map((w,i)=>(
                <div key={i} className="shimmer" style={{height:11,width:`${w}px`,maxWidth:'100%',marginBottom:10}} />
              ))}
            </div>
          )}

          {/* HATA */}
          {error && !loading && (
            <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'14px',display:'flex',gap:12,alignItems:'flex-start'}}>
              <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
              <div style={{flex:1}}>
                <div style={{color:'#FCA5A5',fontSize:13,fontWeight:600,marginBottom:4}}>Bağlantı Hatası</div>
                <div style={{color:'#F87171',fontSize:12}}>{error}</div>
              </div>
              <button onClick={()=>analyze(selected)}
                style={{background:'#111827',border:'1px solid #1A2332',borderRadius:7,padding:'6px 12px',color:'#94A3B8',fontSize:12,flexShrink:0}}>
                Tekrar
              </button>
            </div>
          )}

          {/* ANALİZ */}
          {analysis && !loading && (
            <div className="fade">
              <div style={{background:'#0D1421',border:'1px solid #1A2332',borderRadius:12,padding:'18px 14px',wordBreak:'break-word'}}>
                {renderAnalysis(analysis)}
              </div>
              <div style={{marginTop:10,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 2px'}}>
                <span style={{fontSize:10,color:'#1E293B'}}>CHARTOS • {new Date().toLocaleTimeString('tr-TR')}{cached?' • Önbellekten':''}</span>
                <div style={{display:'flex',gap:5}}>
                  <button onClick={copy} style={{background:'#0D1421',border:'1px solid #1A2332',borderRadius:6,padding:'4px 10px',color:'#475569',fontSize:11}}>⎘ Kopyala</button>
                  <button onClick={tweet} style={{background:'rgba(29,161,242,0.08)',border:'1px solid rgba(29,161,242,0.2)',borderRadius:6,padding:'4px 10px',color:'#1DA1F2',fontSize:11}}>𝕏</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DRAWER */}
      {drawer && (
        <div style={{position:'fixed',inset:0,zIndex:999}}>
          {/* Overlay */}
          <div onClick={()=>setDrawer(false)}
            style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(3px)'}} />
          {/* Panel */}
          <div style={{position:'absolute',left:0,top:0,bottom:0,width:270,background:'#0D1421',borderRight:'1px solid #1A2332',display:'flex',flexDirection:'column',animation:'slideIn .22s ease',zIndex:1}}>
            {/* Panel Header */}
            <div style={{padding:'16px 14px',borderBottom:'1px solid #1A2332',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:30,height:30,background:'linear-gradient(135deg,#2563EB,#8B5CF6)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>🔱</div>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:'#F1F5F9'}}>DEEP TRADE SCAN</div>
                  <div style={{fontSize:9,color:'#334155',letterSpacing:1}}>CHARTOS ENGINE</div>
                </div>
              </div>
              <button onClick={()=>setDrawer(false)}
                style={{width:32,height:32,background:'#111827',border:'1px solid #1A2332',borderRadius:8,color:'#64748B',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
                ✕
              </button>
            </div>

            {/* Search */}
            <div style={{padding:'10px 12px 6px',flexShrink:0}}>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#334155',fontSize:12}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Coin ara..."
                  style={{width:'100%',padding:'8px 10px 8px 28px',background:'#111827',border:'1px solid #1A2332',borderRadius:8,color:'#F1F5F9',fontSize:12}} />
              </div>
            </div>

            {/* Son Analizler */}
            {recent.length > 0 && !search && (
              <div style={{padding:'4px 12px 8px',flexShrink:0}}>
                <div style={{fontSize:9,color:'#334155',letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>SON ANALİZLER</div>
                {recent.slice(0,4).map((h,i)=>(
                  <button key={i} onClick={()=>analyze(h.coin)}
                    style={{width:'100%',textAlign:'left',padding:'7px 8px',marginBottom:2,background:'transparent',border:'1px solid transparent',borderRadius:6,color:'#64748B',fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all .15s'}}
                    onMouseOver={e=>{e.currentTarget.style.background='#111827';e.currentTarget.style.borderColor='#1A2332';}}
                    onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='transparent';}}>
                    <span style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:'#10B981',flexShrink:0}} />
                      {h.coin}
                    </span>
                    <span style={{fontSize:10,color:'#1E293B'}}>{h.time}</span>
                  </button>
                ))}
                <div style={{borderBottom:'1px solid #1A2332',margin:'6px 0'}} />
              </div>
            )}

            {/* Coin Listesi */}
            <div style={{flex:1,overflowY:'auto',padding:'0 8px 12px'}}>
              <div style={{fontSize:9,color:'#334155',letterSpacing:2,textTransform:'uppercase',marginBottom:6,paddingLeft:4}}>{filtered.length} VARLIK</div>
              {filtered.map((coin)=>{
                const isActive = selected === coin;
                return (
                  <button key={coin} onClick={()=>analyze(coin)}
                    style={{width:'100%',textAlign:'left',padding:'10px 10px',marginBottom:2,
                      background:isActive?'rgba(37,99,235,0.12)':'transparent',
                      border:`1px solid ${isActive?'#2563EB':'transparent'}`,
                      borderRadius:7,color:isActive?'#F1F5F9':'#64748B',
                      fontSize:13,fontWeight:isActive?700:500,
                      display:'flex',alignItems:'center',gap:10,transition:'all .12s'}}
                    onMouseOver={e=>{if(!isActive){e.currentTarget.style.background='#111827';}}}
                    onMouseOut={e=>{if(!isActive){e.currentTarget.style.background='transparent';}}}>
                    <span style={{fontSize:10,color:'#1E293B',minWidth:20,textAlign:'right'}}>{COIN_LIST.indexOf(coin)+1}</span>
                    <span>{coin}</span>
                    {isActive && <span style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#2563EB',boxShadow:'0 0 6px #2563EB'}} />}
                  </button>
                );
              })}
            </div>

            <div style={{padding:'10px 14px',borderTop:'1px solid #1A2332',display:'flex',justifyContent:'space-between',flexShrink:0}}>
              <span style={{fontSize:10,color:'#1E293B'}}>deeptradescan.com</span>
              <span style={{fontSize:10,color:'#1E293B'}}>v10.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ l, v, c }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:4,marginRight:16,flexShrink:0}}>
      <span style={{fontSize:9,color:'#334155'}}>{l}:</span>
      <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
    </div>
  );
}
