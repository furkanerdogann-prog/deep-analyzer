// pages/index.jsx — Deep Trade Scan v11.0
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
  'ACT','GOAT','MOODENG','HMSTR','CATI','MAJOR','MOG','PONKE','GIGA','SIGMA',
];
const COIN_LIST = [...new Set(COINS)];

export default function Home() {
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const [analysis, setAnalysis]   = useState('');
  const [error, setError]         = useState('');
  const [cached, setCached]       = useState(false);
  const [search, setSearch]       = useState('');
  const [drawer, setDrawer]       = useState(false);
  const [fg, setFg]               = useState(null);
  const [market, setMarket]       = useState(null);
  const [recent, setRecent]       = useState([]);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1')
      .then(r=>r.json()).then(d=>setFg(d.data?.[0])).catch(()=>{});
    fetch('https://api.coingecko.com/api/v3/global')
      .then(r=>r.json()).then(d=>setMarket(d.data)).catch(()=>{});
    fetch('/api/recent')
      .then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});
  }, []);

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
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({coin})
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error||'Hata'); setLoading(false); return; }
      setAnalysis(data.analysis||'');
      setCached(!!data._cached);
      fetch('/api/recent').then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});
    } catch {
      setError('Bağlantı hatası. Tekrar deneyin.');
    }
    setLoading(false);
  }, []);

  const copy = () => { navigator.clipboard.writeText(analysis); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const tweet = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🔱 ${selected}/USDT CHARTOS Analizi\ndeeptradescan.com\n#${selected} #Kripto`)}`, '_blank');

  const fgV = fg ? +fg.value : null;
  const fgC = v => v<25?'#EF4444':v<45?'#F97316':v<55?'#F59E0B':v<75?'#22C55E':'#00D4AA';
  const fgL = v => v<25?'Aşırı Korku':v<45?'Korku':v<55?'Nötr':v<75?'Açgözlülük':'Aşırı Açgözlülük';
  const fmtB = n => n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:`$${(n/1e6).toFixed(0)}M`;

  const filtered = COIN_LIST.filter(c => c.includes(search.toUpperCase()));

  const renderLine = (line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{height:6}}/>;

    if (t.includes('🔱') && t.includes('CHARTOS')) return (
      <div key={i} style={{background:'linear-gradient(135deg,rgba(37,99,235,0.18),rgba(139,92,246,0.18))',border:'1px solid rgba(99,102,241,0.5)',borderRadius:12,padding:'16px',margin:'4px 0 20px',textAlign:'center'}}>
        <div style={{fontSize:16,fontWeight:900,color:'#fff',letterSpacing:1}}>{t}</div>
      </div>
    );
    if (t.match(/^(PİYASA YAPISI|ANA SEVİYELER|SENARYO ANALİZİ|YÜKSEK OLASILIKLI|TANRISAL İÇGÖRÜ)/)) return (
      <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginTop:22,marginBottom:10}}>
        <div style={{width:3,height:16,background:'#3B82F6',borderRadius:2,flexShrink:0}}/>
        <span style={{fontSize:11,fontWeight:800,color:'#60A5FA',letterSpacing:2,textTransform:'uppercase'}}>{t}</span>
      </div>
    );
    if (t.match(/^(Varlık|Güncel Fiyat|24s|Ana Timeframe|Tanrısal Bias):/)) {
      const ci = t.indexOf(':'); const lbl = t.slice(0,ci); const val = t.slice(ci+1).trim();
      return (
        <div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid #0F172A',alignItems:'flex-start'}}>
          <span style={{color:'#475569',fontSize:12,minWidth:130,flexShrink:0}}>{lbl}</span>
          <span style={{color:'#F1F5F9',fontSize:12,fontWeight:600,flex:1,wordBreak:'break-word'}}
            dangerouslySetInnerHTML={{__html:val.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#F59E0B">$1</strong>')}}/>
        </div>
      );
    }
    if (t.match(/^[🟢🔴🟡📈📉⚡🎯🚀🧠⚠️]/)) return (
      <div key={i} style={{color:'#F1F5F9',fontWeight:700,fontSize:13,marginTop:14,marginBottom:6}}>{t}</div>
    );
    if (t.startsWith('•')||t.startsWith('├')||t.startsWith('└')) return (
      <div key={i} style={{color:'#94A3B8',fontSize:12,paddingLeft:10,marginBottom:4,lineHeight:1.8,borderLeft:'2px solid #1E293B',marginLeft:4}}>{t}</div>
    );
    if (t.startsWith('-')) return (
      <div key={i} style={{display:'flex',gap:6,paddingLeft:8,marginBottom:4,lineHeight:1.7}}>
        <span style={{color:'#3B82F6',flexShrink:0,fontSize:12}}>›</span>
        <span style={{color:'#94A3B8',fontSize:12}} dangerouslySetInnerHTML={{__html:t.slice(1).replace(/\*\*(.*?)\*\*/g,'<strong style="color:#F1F5F9">$1</strong>')}}/>
      </div>
    );
    if (t.startsWith('Risk Uyarısı')) return (
      <div key={i} style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 12px',marginTop:20,color:'#FCA5A5',fontSize:11,lineHeight:1.7}}>⚠️ {t}</div>
    );
    if (t.includes('**')) return (
      <div key={i} style={{color:'#94A3B8',fontSize:12,marginBottom:4,lineHeight:1.7}}
        dangerouslySetInnerHTML={{__html:t.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#F1F5F9;font-weight:700">$1</strong>')}}/>
    );
    return <div key={i} style={{color:'#94A3B8',fontSize:12,marginBottom:3,lineHeight:1.7}}>{t}</div>;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#080C14;color:#F1F5F9;font-family:'DM Sans',system-ui,sans-serif;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#1E293B;border-radius:2px;}
        input,button{font-family:inherit;outline:none;border:none;}
        button{cursor:pointer;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        @keyframes pulse{0%,100%{opacity:.5;}50%{opacity:1;}}
        .fade{animation:fadeUp .3s ease forwards;}
        .skeleton{animation:pulse 1.4s ease infinite;background:#0D1421;border-radius:6px;}
      `}</style>

      {/* MARKET BAR - sticky top */}
      <div style={{position:'sticky',top:0,zIndex:50,background:'#060A12',borderBottom:'1px solid #1A2332',height:32,display:'flex',alignItems:'center',padding:'0 12px',gap:0,overflowX:'auto',whiteSpace:'nowrap'}}>
        <span style={{fontSize:9,color:'#334155',marginRight:10,letterSpacing:1}}>PIYASA</span>
        {market && <>
          {[
            {l:'MCap',v:fmtB(market.total_market_cap?.usd),c:'#3B82F6'},
            {l:'BTC',v:`${market.market_cap_percentage?.btc?.toFixed(1)}%`,c:'#F59E0B'},
            {l:'ETH',v:`${market.market_cap_percentage?.eth?.toFixed(1)}%`,c:'#8B5CF6'},
            {l:'Hacim',v:fmtB(market.total_volume?.usd),c:'#10B981'},
          ].map(({l,v,c})=>(
            <span key={l} style={{marginRight:14,flexShrink:0}}>
              <span style={{fontSize:9,color:'#334155'}}>{l}: </span>
              <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
            </span>
          ))}
        </>}
        {fgV && <span style={{marginLeft:'auto',flexShrink:0}}>
          <span style={{fontSize:9,color:'#334155'}}>F&G: </span>
          <span style={{fontSize:10,fontWeight:800,color:fgC(fgV)}}>{fgV} {fgL(fgV)}</span>
        </span>}
      </div>

      {/* TOPBAR */}
      <div style={{position:'sticky',top:32,zIndex:50,background:'#0D1421',borderBottom:'1px solid #1A2332',height:52,display:'flex',alignItems:'center',padding:'0 12px',gap:10}}>
        <button onClick={()=>setDrawer(true)}
          style={{width:38,height:38,background:'#111827',border:'1px solid #1A2332',borderRadius:9,color:'#64748B',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          ☰
        </button>
        {selected ? (
          <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#10B981',boxShadow:'0 0 8px #10B981',flexShrink:0}}/>
            <span style={{fontSize:15,fontWeight:800,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selected}/USDT</span>
            {cached && <span style={{fontSize:9,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',color:'#F59E0B',borderRadius:5,padding:'2px 7px',flexShrink:0}}>ÖNBELLEKTEN</span>}
            {analysis && !loading && (
              <div style={{marginLeft:'auto',display:'flex',gap:6,flexShrink:0}}>
                <button onClick={copy} style={{background:copied?'rgba(16,185,129,0.12)':'#111827',border:`1px solid ${copied?'#10B981':'#1A2332'}`,borderRadius:7,padding:'5px 11px',color:copied?'#10B981':'#64748B',fontSize:11,fontWeight:600,transition:'all .2s'}}>
                  {copied?'✓ Kopyalandı':'⎘ Kopyala'}
                </button>
                <button onClick={tweet} style={{background:'rgba(29,161,242,0.1)',border:'1px solid rgba(29,161,242,0.25)',borderRadius:7,padding:'5px 11px',color:'#1DA1F2',fontSize:11,fontWeight:600}}>
                  𝕏
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
            <div style={{width:28,height:28,background:'linear-gradient(135deg,#2563EB,#8B5CF6)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🔱</div>
            <span style={{fontSize:13,fontWeight:700,color:'#F1F5F9'}}>DEEP TRADE SCAN</span>
            <button onClick={()=>setDrawer(true)}
              style={{marginLeft:'auto',background:'linear-gradient(135deg,#2563EB,#8B5CF6)',border:'none',borderRadius:8,padding:'7px 16px',color:'#fff',fontSize:12,fontWeight:700}}>
              Coin Seç 🔱
            </button>
          </div>
        )}
      </div>

      {/* PAGE CONTENT — normal scroll */}
      <div style={{padding:'0 0 60px'}}>

        {/* TradingView */}
        {selected && (
          <div style={{height:250,background:'#080C14',borderBottom:'1px solid #1A2332'}}>
            <iframe key={selected}
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tv&symbol=BINANCE:${selected}USDT&interval=D&hidesidetoolbar=1&saveimage=0&toolbarbg=080C14&theme=dark&style=1&timezone=Europe%2FIstanbul&locale=tr&withdateranges=0`}
              style={{width:'100%',height:'100%',border:'none'}} allowTransparency allowFullScreen/>
          </div>
        )}

        <div style={{padding:'16px 14px'}}>

          {/* BOŞ DURUM */}
          {!selected && !loading && !error && (
            <div style={{textAlign:'center',paddingTop:32}}>
              <div style={{width:72,height:72,background:'linear-gradient(135deg,rgba(37,99,235,0.2),rgba(139,92,246,0.2))',border:'1px solid #1A2332',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:34,margin:'0 auto 20px'}}>🔱</div>
              <div style={{fontSize:22,fontWeight:900,marginBottom:10,background:'linear-gradient(135deg,#60A5FA,#A78BFA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>CHARTOS TANRI MODU</div>
              <div style={{fontSize:13,color:'#475569',lineHeight:1.8,maxWidth:300,margin:'0 auto 28px'}}>
                SMC • ICT • Wyckoff • Volume Profile<br/>200+ coin için kurumsal düzeyde analiz
              </div>
              <button onClick={()=>setDrawer(true)}
                style={{background:'linear-gradient(135deg,#2563EB,#8B5CF6)',border:'none',borderRadius:12,padding:'14px 32px',color:'#fff',fontSize:15,fontWeight:800,boxShadow:'0 6px 24px rgba(37,99,235,0.4)',letterSpacing:0.5}}>
                🔱 Analiz Başlat
              </button>

              {/* F&G Kartı */}
              {fgV && (
                <div style={{maxWidth:260,margin:'32px auto 0',background:'#0D1421',border:'1px solid #1A2332',borderRadius:14,padding:'18px 16px'}}>
                  <div style={{fontSize:9,color:'#334155',letterSpacing:2,marginBottom:12,textTransform:'uppercase'}}>Korku & Açgözlülük Endeksi</div>
                  <div style={{display:'flex',alignItems:'flex-end',gap:12,marginBottom:12}}>
                    <div style={{fontSize:48,fontWeight:900,color:fgC(fgV),lineHeight:1}}>{fgV}</div>
                    <div style={{paddingBottom:4}}>
                      <div style={{fontSize:14,fontWeight:700,color:fgC(fgV)}}>{fgL(fgV)}</div>
                    </div>
                  </div>
                  <div style={{background:'#1A2332',borderRadius:4,height:6,overflow:'hidden'}}>
                    <div style={{width:`${fgV}%`,height:'100%',background:'linear-gradient(90deg,#EF4444,#F59E0B,#22C55E)',transition:'width .6s ease'}}/>
                  </div>
                </div>
              )}

              {/* Son Analizler */}
              {recent.length > 0 && (
                <div style={{maxWidth:300,margin:'24px auto 0'}}>
                  <div style={{fontSize:9,color:'#334155',letterSpacing:2,marginBottom:10,textTransform:'uppercase'}}>Son Analizler</div>
                  <div style={{background:'#0D1421',border:'1px solid #1A2332',borderRadius:12,overflow:'hidden'}}>
                    {recent.slice(0,5).map((h,i)=>(
                      <button key={i} onClick={()=>analyze(h.coin)}
                        style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'transparent',borderBottom:i<recent.length-1?'1px solid #0F172A':'none',color:'#94A3B8',fontSize:13,textAlign:'left',transition:'background .15s'}}
                        onMouseOver={e=>e.currentTarget.style.background='#111827'}
                        onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                        <span style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{width:6,height:6,borderRadius:'50%',background:'#10B981'}}/>
                          <span style={{fontWeight:600,color:'#F1F5F9'}}>{h.coin}</span>
                          <span style={{fontSize:11,color:'#475569'}}>analiz edildi</span>
                        </span>
                        <span style={{fontSize:11,color:'#334155'}}>{h.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div style={{paddingTop:8}}>
              <div style={{textAlign:'center',marginBottom:28}}>
                <div style={{width:42,height:42,border:'3px solid #1A2332',borderTop:'3px solid #3B82F6',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 14px'}}/>
                <div style={{fontSize:15,fontWeight:700,color:'#F1F5F9',marginBottom:4}}>{selected} analiz ediliyor</div>
                <div style={{fontSize:12,color:'#334155'}}>CHARTOS 7 katman işliyor...</div>
              </div>
              {[260,180,300,140,240,170,280,130,200].map((w,i)=>(
                <div key={i} className="skeleton" style={{height:12,width:`${w}px`,maxWidth:'90%',marginBottom:10}}/>
              ))}
            </div>
          )}

          {/* HATA */}
          {error && !loading && (
            <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12,padding:'16px',display:'flex',gap:12,alignItems:'flex-start',marginTop:8}}>
              <span style={{fontSize:22,flexShrink:0}}>⚠️</span>
              <div style={{flex:1}}>
                <div style={{color:'#FCA5A5',fontWeight:700,marginBottom:4,fontSize:13}}>Bağlantı Hatası</div>
                <div style={{color:'#F87171',fontSize:12}}>{error}</div>
              </div>
              <button onClick={()=>analyze(selected)}
                style={{background:'#111827',border:'1px solid #1A2332',borderRadius:8,padding:'7px 14px',color:'#94A3B8',fontSize:12,fontWeight:600,flexShrink:0}}>
                Tekrar Dene
              </button>
            </div>
          )}

          {/* ANALİZ SONUCU */}
          {analysis && !loading && (
            <div className="fade">
              <div style={{background:'#0D1421',border:'1px solid #1A2332',borderRadius:14,padding:'20px 16px',wordBreak:'break-word',lineHeight:1.7}}>
                {analysis.split('\n').map((line, i) => renderLine(line, i))}
              </div>
              <div style={{marginTop:10,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 2px'}}>
                <span style={{fontSize:10,color:'#1E293B'}}>CHARTOS Engine{cached?' • Önbellekten':''} • {new Date().toLocaleTimeString('tr-TR')}</span>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={copy} style={{background:'#0D1421',border:'1px solid #1A2332',borderRadius:6,padding:'4px 10px',color:'#475569',fontSize:11}}>⎘ Kopyala</button>
                  <button onClick={tweet} style={{background:'rgba(29,161,242,0.08)',border:'1px solid rgba(29,161,242,0.2)',borderRadius:6,padding:'4px 10px',color:'#1DA1F2',fontSize:11}}>𝕏 Paylaş</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* DRAWER */}
      {drawer && (
        <div style={{position:'fixed',inset:0,zIndex:9999}}>
          <div onClick={()=>setDrawer(false)}
            style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)'}}/>
          <div onClick={e=>e.stopPropagation()}
            style={{position:'absolute',left:0,top:0,bottom:0,width:280,background:'#0D1421',borderRight:'1px solid #1A2332',display:'flex',flexDirection:'column',animation:'slideIn .22s ease'}}>

            {/* Drawer Header */}
            <div style={{padding:'16px 14px',borderBottom:'1px solid #1A2332',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,background:'linear-gradient(135deg,#2563EB,#8B5CF6)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🔱</div>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:'#F1F5F9'}}>DEEP TRADE SCAN</div>
                  <div style={{fontSize:9,color:'#334155',letterSpacing:1,textTransform:'uppercase'}}>Chartos Engine</div>
                </div>
              </div>
              <button onClick={()=>setDrawer(false)}
                style={{width:34,height:34,background:'#111827',border:'1px solid #1A2332',borderRadius:8,color:'#64748B',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>
                ✕
              </button>
            </div>

            {/* Search */}
            <div style={{padding:'10px 12px 6px',flexShrink:0}}>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'#334155'}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Coin ara..."
                  style={{width:'100%',padding:'9px 10px 9px 30px',background:'#111827',border:'1px solid #1A2332',borderRadius:9,color:'#F1F5F9',fontSize:13}}/>
              </div>
            </div>

            {/* Son Analizler */}
            {recent.length>0 && !search && (
              <div style={{padding:'4px 12px 8px',flexShrink:0}}>
                <div style={{fontSize:9,color:'#334155',letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Son Analizler</div>
                {recent.slice(0,4).map((h,i)=>(
                  <button key={i} onClick={()=>analyze(h.coin)}
                    style={{width:'100%',textAlign:'left',padding:'7px 8px',marginBottom:2,background:'transparent',borderRadius:7,color:'#64748B',fontSize:13,display:'flex',justifyContent:'space-between',alignItems:'center',transition:'background .15s'}}
                    onMouseOver={e=>e.currentTarget.style.background='#111827'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{display:'flex',alignItems:'center',gap:7}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:'#10B981',flexShrink:0}}/>
                      <span style={{fontWeight:600,color:'#94A3B8'}}>{h.coin}</span>
                    </span>
                    <span style={{fontSize:10,color:'#1E293B'}}>{h.time}</span>
                  </button>
                ))}
                <div style={{borderBottom:'1px solid #1A2332',margin:'6px 0'}}/>
              </div>
            )}

            {/* Coin List */}
            <div style={{flex:1,overflowY:'auto',padding:'0 8px 12px'}}>
              <div style={{fontSize:9,color:'#334155',letterSpacing:2,textTransform:'uppercase',marginBottom:6,paddingLeft:4}}>{filtered.length} Varlık</div>
              {filtered.map(coin=>{
                const isA = selected===coin;
                return (
                  <button key={coin} onClick={()=>analyze(coin)}
                    style={{width:'100%',textAlign:'left',padding:'10px 10px',marginBottom:2,
                      background:isA?'rgba(37,99,235,0.12)':'transparent',
                      border:`1px solid ${isA?'rgba(37,99,235,0.4)':'transparent'}`,
                      borderRadius:8,color:isA?'#F1F5F9':'#64748B',
                      fontSize:13,fontWeight:isA?700:400,
                      display:'flex',alignItems:'center',gap:10,transition:'all .12s'}}
                    onMouseOver={e=>{if(!isA)e.currentTarget.style.background='#111827';}}
                    onMouseOut={e=>{if(!isA)e.currentTarget.style.background='transparent';}}>
                    <span style={{fontSize:10,color:'#1E293B',minWidth:22,textAlign:'right'}}>{COIN_LIST.indexOf(coin)+1}</span>
                    <span>{coin}</span>
                    {isA && <span style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#3B82F6',boxShadow:'0 0 6px #3B82F6'}}/>}
                  </button>
                );
              })}
            </div>

            <div style={{padding:'10px 14px',borderTop:'1px solid #1A2332',display:'flex',justifyContent:'space-between',flexShrink:0}}>
              <span style={{fontSize:10,color:'#1E293B'}}>deeptradescan.com</span>
              <span style={{fontSize:10,color:'#1E293B'}}>v11.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
