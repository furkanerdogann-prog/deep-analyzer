import { useState, useEffect } from 'react';

const COINS = ['BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT','MATIC','LINK','UNI','ATOM','LTC','BCH','DOGE','SHIB','PEPE','WIF','BONK','FLOKI','INJ','SUI','APT','ARB','OP','NEAR','TIA','TON','RENDER','AAVE','HBAR','KAS','STX','IMX','LDO','SEI','PENGU','TRUMP','FTM','SAND','MANA','AXS','GALA','ENJ','CHZ','FLOW','ICP','FIL','AR','GRT','SNX','CRV','SUSHI','YFI','COMP','MKR','1INCH','DYDX','GMX','RUNE','OCEAN','FET','AGIX','VET','EGLD','ALGO','XLM','ETC','XMR','ZEC','DASH','NEO','QTUM','ZIL','CELO','WAVES','TRX','EOS','XTZ','CRO','MAGIC','BLUR','APE','ENS','PENDLE','PYTH','JTO','BOME','POPCAT','NEIRO','PNUT','TURBO','ORDI','SATS','BRETT','WEN','JITO','DOGS'];

export default function Home() {
  const [coin, setCoin] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [market, setMarket] = useState(null);
  const [fg, setFg] = useState(null);
  const [recent, setRecent] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()).then(d=>setMarket(d.data)).catch(()=>{});
    fetch('https://api.alternative.me/fng/?limit=1').then(r=>r.json()).then(d=>setFg(d.data?.[0])).catch(()=>{});
    fetch('/api/recent').then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});
  }, []);

  async function analyze(symbol) {
    setCoin(symbol);
    setResult('');
    setError('');
    setLoading(true);
    setDrawer(false);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({coin: symbol})
      });
      const data = await res.json();
      if (data.analysis) {
        setResult(data.analysis);
        fetch('/api/recent').then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});
      } else {
        setError(data.error || 'Analiz alınamadı');
      }
    } catch(e) {
      setError('Bağlantı hatası: ' + e.message);
    }
    setLoading(false);
  }

  const fgV = fg ? +fg.value : null;
  const fgColor = v => v<25?'#ef4444':v<45?'#f97316':v<55?'#f59e0b':v<75?'#22c55e':'#00d4aa';
  const fgText = v => v<25?'Aşırı Korku':v<45?'Korku':v<55?'Nötr':v<75?'Açgözlülük':'Aşırı Açgözlülük';
  const fmtB = n => n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:'N/A';
  const filtered = COINS.filter(c => c.includes(search.toUpperCase()));

  return (
    <div style={{minHeight:'100vh',background:'#080c14',color:'#f1f5f9',fontFamily:'system-ui,sans-serif'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        button,input{font-family:inherit;border:none;outline:none;cursor:pointer}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slide{from{transform:translateX(-100%)}to{transform:translateX(0)}}
      `}</style>

      {/* MARKET BAR */}
      <div style={{background:'#060a12',borderBottom:'1px solid #1a2332',padding:'0 12px',height:30,display:'flex',alignItems:'center',gap:12,overflowX:'auto',whiteSpace:'nowrap',flexShrink:0}}>
        <span style={{fontSize:9,color:'#334155',letterSpacing:1}}>PIYASA</span>
        {market && <>
          <span style={{fontSize:10}}><span style={{color:'#334155'}}>MCap: </span><span style={{color:'#3b82f6',fontWeight:700}}>{fmtB(market.total_market_cap?.usd)}</span></span>
          <span style={{fontSize:10}}><span style={{color:'#334155'}}>BTC: </span><span style={{color:'#f59e0b',fontWeight:700}}>{market.market_cap_percentage?.btc?.toFixed(1)}%</span></span>
          <span style={{fontSize:10}}><span style={{color:'#334155'}}>ETH: </span><span style={{color:'#8b5cf6',fontWeight:700}}>{market.market_cap_percentage?.eth?.toFixed(1)}%</span></span>
          <span style={{fontSize:10}}><span style={{color:'#334155'}}>Hacim: </span><span style={{color:'#10b981',fontWeight:700}}>{fmtB(market.total_volume?.usd)}</span></span>
        </>}
        {fgV && <span style={{marginLeft:'auto',fontSize:10,flexShrink:0}}><span style={{color:'#334155'}}>F&G: </span><span style={{color:fgColor(fgV),fontWeight:700}}>{fgV} {fgText(fgV)}</span></span>}
      </div>

      {/* TOPBAR */}
      <div style={{background:'#0d1421',borderBottom:'1px solid #1a2332',height:50,display:'flex',alignItems:'center',padding:'0 12px',gap:10}}>
        <button onClick={()=>setDrawer(true)} style={{width:36,height:36,background:'#111827',border:'1px solid #1a2332',borderRadius:8,color:'#64748b',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>☰</button>
        {coin ? (
          <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#10b981',flexShrink:0}}/>
            <span style={{fontSize:15,fontWeight:800,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{coin}/USDT</span>
            {result && !loading && (
              <div style={{marginLeft:'auto',display:'flex',gap:6,flexShrink:0}}>
                <button onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
                  style={{background:copied?'rgba(16,185,129,0.1)':'#111827',border:`1px solid ${copied?'#10b981':'#1a2332'}`,borderRadius:7,padding:'5px 10px',color:copied?'#10b981':'#64748b',fontSize:11,fontWeight:600}}>
                  {copied?'✓ Kopyalandı':'⎘ Kopyala'}
                </button>
                <button onClick={()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🔱 ${coin}/USDT CHARTOS Analizi\ndeeptradescan.com`)}`, '_blank')}
                  style={{background:'rgba(29,161,242,0.1)',border:'1px solid rgba(29,161,242,0.25)',borderRadius:7,padding:'5px 10px',color:'#1da1f2',fontSize:11,fontWeight:600}}>𝕏</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
            <span style={{fontSize:13,fontWeight:800,background:'linear-gradient(90deg,#60a5fa,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>DEEP TRADE SCAN</span>
            <button onClick={()=>setDrawer(true)} style={{marginLeft:'auto',background:'linear-gradient(135deg,#2563eb,#8b5cf6)',borderRadius:8,padding:'7px 16px',color:'#fff',fontSize:12,fontWeight:700}}>🔱 Coin Seç</button>
          </div>
        )}
      </div>

      {/* TradingView - sadece varsa */}
      {coin && (
        <div style={{height:220,borderBottom:'1px solid #1a2332'}}>
          <iframe key={coin}
            src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${coin}USDT&interval=D&theme=dark&style=1&locale=tr&hide_top_toolbar=1&hide_legend=1`}
            style={{width:'100%',height:'100%',border:'none'}} allowFullScreen/>
        </div>
      )}

      {/* CONTENT */}
      <div style={{padding:'16px 14px 60px'}}>

        {/* Boş durum */}
        {!coin && !loading && (
          <div style={{textAlign:'center',paddingTop:40}}>
            <div style={{fontSize:56,marginBottom:16}}>🔱</div>
            <div style={{fontSize:20,fontWeight:900,marginBottom:8,background:'linear-gradient(135deg,#60a5fa,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>YAPAY ZEKA DESTEKLİ DERİN ANALİZ</div>
            <div style={{fontSize:13,color:'#475569',marginBottom:28,lineHeight:1.8}}>SMC • ICT • Wyckoff • Volume Profile<br/>200+ coin için kurumsal düzeyde AI analizi</div>
            <button onClick={()=>setDrawer(true)} style={{background:'linear-gradient(135deg,#2563eb,#8b5cf6)',borderRadius:12,padding:'14px 32px',color:'#fff',fontSize:15,fontWeight:800,boxShadow:'0 6px 24px rgba(37,99,235,0.4)'}}>
              🔱 Analiz Başlat
            </button>
            {fgV && (
              <div style={{maxWidth:240,margin:'32px auto 0',background:'#0d1421',border:'1px solid #1a2332',borderRadius:12,padding:'16px'}}>
                <div style={{fontSize:9,color:'#334155',letterSpacing:2,marginBottom:10}}>KORKU & AÇGÖZLÜLÜK</div>
                <div style={{fontSize:44,fontWeight:900,color:fgColor(fgV),lineHeight:1,marginBottom:4}}>{fgV}</div>
                <div style={{fontSize:13,color:fgColor(fgV),fontWeight:700,marginBottom:10}}>{fgText(fgV)}</div>
                <div style={{background:'#1a2332',borderRadius:4,height:6,overflow:'hidden'}}>
                  <div style={{width:`${fgV}%`,height:'100%',background:'linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)'}}/>
                </div>
              </div>
            )}
            {recent.length>0 && (
              <div style={{maxWidth:280,margin:'20px auto 0',background:'#0d1421',border:'1px solid #1a2332',borderRadius:12,overflow:'hidden'}}>
                <div style={{padding:'10px 14px 6px',fontSize:9,color:'#334155',letterSpacing:2}}>SON ANALİZLER</div>
                {recent.slice(0,5).map((h,i)=>(
                  <button key={i} onClick={()=>analyze(h.coin)} style={{width:'100%',display:'flex',justifyContent:'space-between',padding:'9px 14px',background:'transparent',borderTop:'1px solid #0f172a',color:'#94a3b8',fontSize:12,textAlign:'left'}}
                    onMouseOver={e=>e.currentTarget.style.background='#111827'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontWeight:600,color:'#f1f5f9'}}>{h.coin}</span>
                    <span style={{fontSize:10,color:'#334155'}}>{h.time}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{textAlign:'center',paddingTop:32}}>
            <div style={{width:42,height:42,border:'3px solid #1a2332',borderTop:'3px solid #3b82f6',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px'}}/>
            <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9',marginBottom:4}}>{coin} analiz ediliyor</div>
            <div style={{fontSize:12,color:'#334155'}}>CHARTOS 7 katman işliyor...</div>
          </div>
        )}

        {/* Hata */}
        {error && !loading && (
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'14px',marginBottom:16}}>
            <div style={{color:'#fca5a5',fontWeight:700,marginBottom:4}}>⚠️ Hata</div>
            <div style={{color:'#f87171',fontSize:12,marginBottom:10}}>{error}</div>
            <button onClick={()=>analyze(coin)} style={{background:'#111827',border:'1px solid #1a2332',borderRadius:7,padding:'6px 14px',color:'#94a3b8',fontSize:12,fontWeight:600}}>Tekrar Dene</button>
          </div>
        )}

        {/* ANALİZ SONUCU */}
        {result && !loading && (
          <div style={{background:'#0d1421',border:'1px solid #1a2332',borderRadius:12,padding:'18px 14px',lineHeight:1.8,whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:13,color:'#94a3b8'}}>
            {result.split('\n').map((line,i) => {
              const t = line.trim();
              if (!t) return <br key={i}/>;
              if (t.includes('🔱') && t.includes('CHARTOS')) return <div key={i} style={{background:'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(139,92,246,0.15))',border:'1px solid rgba(99,102,241,0.4)',borderRadius:10,padding:'14px',marginBottom:16,textAlign:'center',fontSize:15,fontWeight:900,color:'#fff'}}>{t}</div>;
              if (t.match(/^(PİYASA YAPISI|ANA SEVİYELER|SENARYO|YÜKSEK OLASILIKLI|TANRISAL İÇGÖRÜ)/)) return <div key={i} style={{borderLeft:'3px solid #2563eb',paddingLeft:10,marginTop:20,marginBottom:8,fontSize:11,fontWeight:800,color:'#60a5fa',letterSpacing:1.5,textTransform:'uppercase'}}>{t}</div>;
              if (t.match(/^(Varlık|Güncel Fiyat|24s|Ana Timeframe|Tanrısal Bias):/)) return <div key={i} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:'1px solid #0f172a',fontSize:12}}><span style={{color:'#475569',minWidth:120,flexShrink:0}}>{t.split(':')[0]}</span><span style={{color:'#f1f5f9',fontWeight:600}}>{t.split(':').slice(1).join(':').trim()}</span></div>;
              if (t.startsWith('•')||t.startsWith('├')||t.startsWith('└')) return <div key={i} style={{color:'#94a3b8',fontSize:12,paddingLeft:10,marginBottom:3,borderLeft:'2px solid #1e293b',marginLeft:4}}>{t}</div>;
              if (t.startsWith('-')) return <div key={i} style={{color:'#94a3b8',fontSize:12,paddingLeft:12,marginBottom:3,display:'flex',gap:6}}><span style={{color:'#3b82f6',flexShrink:0}}>›</span><span>{t.slice(1)}</span></div>;
              if (t.startsWith('Risk Uyarısı')) return <div key={i} style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 12px',marginTop:16,color:'#fca5a5',fontSize:11}}>⚠️ {t}</div>;
              if (t.match(/^[🟢🔴🟡📈📉⚡🎯🚀🧠]/)) return <div key={i} style={{color:'#f1f5f9',fontWeight:700,fontSize:13,marginTop:12,marginBottom:4}}>{t}</div>;
              return <div key={i} style={{color:'#94a3b8',fontSize:12,marginBottom:2}}>{t}</div>;
            })}
          </div>
        )}
      </div>

      {/* DRAWER */}
      {drawer && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex'}}>
          <div onClick={()=>setDrawer(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.8)'}}/>
          <div style={{position:'relative',width:280,height:'100%',background:'#0d1421',borderRight:'1px solid #1a2332',display:'flex',flexDirection:'column',animation:'slide .22s ease',zIndex:1}}>
            <div style={{padding:'16px 14px',borderBottom:'1px solid #1a2332',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,background:'linear-gradient(135deg,#2563eb,#8b5cf6)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🔱</div>
                <div>
                  <div style={{fontSize:13,fontWeight:800}}>DEEP TRADE SCAN</div>
                  <div style={{fontSize:9,color:'#334155',letterSpacing:1}}>CHARTOS ENGINE</div>
                </div>
              </div>
              <button onClick={()=>setDrawer(false)} style={{width:32,height:32,background:'#111827',border:'1px solid #1a2332',borderRadius:8,color:'#64748b',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'10px 12px 6px',flexShrink:0}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Coin ara..."
                style={{width:'100%',padding:'9px 12px',background:'#111827',border:'1px solid #1a2332',borderRadius:9,color:'#f1f5f9',fontSize:13}}/>
            </div>
            {recent.length>0 && !search && (
              <div style={{padding:'4px 12px 8px',flexShrink:0}}>
                <div style={{fontSize:9,color:'#334155',letterSpacing:2,marginBottom:6}}>SON ANALİZLER</div>
                {recent.slice(0,4).map((h,i)=>(
                  <button key={i} onClick={()=>analyze(h.coin)} style={{width:'100%',display:'flex',justifyContent:'space-between',padding:'7px 8px',background:'transparent',borderRadius:7,color:'#64748b',fontSize:13,marginBottom:1,textAlign:'left'}}
                    onMouseOver={e=>e.currentTarget.style.background='#111827'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontWeight:600}}>{h.coin}</span><span style={{fontSize:10,color:'#1e293b'}}>{h.time}</span>
                  </button>
                ))}
                <div style={{borderBottom:'1px solid #1a2332',margin:'6px 0'}}/>
              </div>
            )}
            <div style={{flex:1,overflowY:'auto',padding:'0 8px 12px'}}>
              <div style={{fontSize:9,color:'#334155',letterSpacing:2,marginBottom:6,paddingLeft:4}}>{filtered.length} VARLIK</div>
              {filtered.map((c,idx)=>(
                <button key={c} onClick={()=>analyze(c)} style={{width:'100%',textAlign:'left',padding:'10px',marginBottom:2,background:coin===c?'rgba(37,99,235,0.12)':'transparent',border:`1px solid ${coin===c?'rgba(37,99,235,0.4)':'transparent'}`,borderRadius:8,color:coin===c?'#f1f5f9':'#64748b',fontSize:13,fontWeight:coin===c?700:400,display:'flex',alignItems:'center',gap:10}}
                  onMouseOver={e=>{if(coin!==c)e.currentTarget.style.background='#111827'}} onMouseOut={e=>{if(coin!==c)e.currentTarget.style.background='transparent'}}>
                  <span style={{fontSize:10,color:'#1e293b',minWidth:22,textAlign:'right'}}>{idx+1}</span>
                  <span>{c}</span>
                  {coin===c && <span style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#3b82f6'}}/>}
                </button>
              ))}
            </div>
            <div style={{padding:'10px 14px',borderTop:'1px solid #1a2332',fontSize:10,color:'#1e293b',display:'flex',justifyContent:'space-between',flexShrink:0}}>
              <span>deeptradescan.com</span><span>v11.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
