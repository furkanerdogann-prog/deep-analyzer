// pages/index.jsx — CHARTOS UI v6.0
import { useState, useEffect, useCallback, useRef } from 'react';

const VERDICT_MAP = {
  STRONG_BUY:  { label:'GÜÇLÜ AL',  color:'#00ff88', bg:'rgba(0,255,136,0.1)',  glow:'rgba(0,255,136,0.3)',  emoji:'🚀' },
  BUY:         { label:'AL',         color:'#00cc66', bg:'rgba(0,204,102,0.1)',  glow:'rgba(0,204,102,0.25)', emoji:'📈' },
  NEUTRAL:     { label:'NÖTR',       color:'#f59e0b', bg:'rgba(245,158,11,0.1)', glow:'rgba(245,158,11,0.25)',emoji:'⚖️' },
  SELL:        { label:'SAT',        color:'#ef4444', bg:'rgba(239,68,68,0.1)',  glow:'rgba(239,68,68,0.25)', emoji:'📉' },
  STRONG_SELL: { label:'GÜÇLÜ SAT', color:'#dc2626', bg:'rgba(220,38,38,0.1)',  glow:'rgba(220,38,38,0.3)',  emoji:'💀' },
};

const POPULAR = [
  'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT','MATIC','LINK',
  'UNI','ATOM','LTC','DOGE','SHIB','PEPE','WIF','BONK','INJ','SUI',
  'APT','ARB','OP','NEAR','TIA','TON','RENDER','AAVE','HBAR','KAS',
  'STX','FLOKI','NOT','IMX','LDO','SEI','PENGU','TRUMP','FTM','SAND',
];

const WYCKOFF_TR = { ACCUMULATION:'Birikim 🟢', MARKUP:'Yükseliş 🚀', DISTRIBUTION:'Dağıtım 🔴', MARKDOWN:'Düşüş 💀', RE_ACCUMULATION:'Yeniden Birikim 🟡' };
const FG_COLOR = v => v<25?'#ef4444':v<45?'#f97316':v<55?'#f59e0b':v<75?'#84cc16':'#00ff88';

export default function App() {
  const [query, setQuery]     = useState('');
  const [suggestions, setSug] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [coinList, setCoins]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState('chartos');
  const inputRef = useRef();

  useEffect(() => {
    fetch('/api/coins').then(r=>r.json()).then(d=>{ if(d.coins) setCoins(d.coins); }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!query || query.length < 1) { setSug([]); setShowSug(false); return; }
    const q = query.toUpperCase();
    const r = coinList.filter(c=>c.symbol.startsWith(q)||c.name.toUpperCase().includes(q)).slice(0,6);
    setSug(r); setShowSug(r.length>0);
  }, [query, coinList]);

  const analyze = useCallback(async (sym) => {
    const target = (sym||query).toUpperCase().replace(/USDT?$/i,'').trim();
    if (!target) return;
    setLoading(true); setError(''); setData(null); setShowSug(false);
    try {
      const r = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({coin:target}) });
      const j = await r.json();
      if (!r.ok) { setError(j.error||'Analiz başarısız'); return; }
      setData(j); setTab('chartos');
    } catch { setError('Bağlantı hatası'); }
    finally { setLoading(false); }
  }, [query]);

  const pick = (sym) => { setQuery(sym); setShowSug(false); analyze(sym); };
  const vc = data ? (VERDICT_MAP[data.verdict]||VERDICT_MAP.NEUTRAL) : null;
  const ch = data?.chartos;

  return (
    <div style={{ minHeight:'100vh', background:'#030712', color:'#e2e8f0', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::selection{background:#1d4ed8;color:#fff;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:#0f172a;}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
        input{outline:none;}button{cursor:pointer;border:none;outline:none;}
        .sug:hover{background:#1e293b!important;}
        .chip:hover{background:#1e293b!important;color:#94a3b8!important;}
        .tab-btn:hover{color:#e2e8f0!important;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes glow{0%,100%{opacity:.7;}50%{opacity:1;}}
        @keyframes slide{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.05);}}
      `}</style>

      {/* TOP NAV */}
      <nav style={{ borderBottom:'1px solid #0f172a', background:'rgba(3,7,18,0.95)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:50, padding:'0 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', height:56, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⚡</div>
            <span style={{ fontSize:18, fontWeight:800, background:'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>DEEP TRADE SCAN</span>
          </div>
          <div style={{ fontSize:11, color:'#475569', background:'#0f172a', border:'1px solid #1e293b', borderRadius:20, padding:'3px 10px' }}>CHARTOS ENGINE</div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
            {data?._cached && <span style={{ fontSize:10, color:'#f59e0b', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:'2px 8px' }}>⚡ CACHE</span>}
            <span style={{ fontSize:11, color:'#475569' }}>{data?._meta?.supportedCoins||250} coin</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'32px 24px' }}>

        {/* HERO SEARCH */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h1 style={{ fontSize:36, fontWeight:900, marginBottom:8, lineHeight:1.2 }}>
            <span style={{ background:'linear-gradient(135deg,#60a5fa,#a78bfa,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Tanrısal Kripto Analizi
            </span>
          </h1>
          <p style={{ color:'#64748b', fontSize:15, marginBottom:28 }}>Smart Money • Wyckoff • ICT • 6 Katman Analiz</p>

          <div style={{ position:'relative', maxWidth:520, margin:'0 auto' }}>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ position:'relative', flex:1 }}>
                <input ref={inputRef} value={query}
                  onChange={e=>setQuery(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&analyze()}
                  onFocus={()=>suggestions.length>0&&setShowSug(true)}
                  onBlur={()=>setTimeout(()=>setShowSug(false),150)}
                  placeholder="BTC, ETH, SOL, PENGU..."
                  style={{ width:'100%', padding:'14px 20px', background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, color:'#e2e8f0', fontSize:15, transition:'border-color .2s' }}
                />
                {showSug && suggestions.length > 0 && (
                  <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, overflow:'hidden', zIndex:200, boxShadow:'0 20px 40px rgba(0,0,0,0.5)' }}>
                    {suggestions.map(c => (
                      <div key={c.id} className="sug" onMouseDown={()=>pick(c.symbol)}
                        style={{ padding:'10px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #0f172a' }}>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          {c.image&&<img src={c.image} alt="" style={{ width:22, height:22, borderRadius:'50%' }}/>}
                          <span style={{ fontWeight:700, color:'#60a5fa', fontSize:14 }}>{c.symbol}</span>
                          <span style={{ color:'#475569', fontSize:12 }}>{c.name}</span>
                          <span style={{ color:'#475569', fontSize:11 }}>#{c.rank}</span>
                        </div>
                        <span style={{ color:c.change24h>=0?'#34d399':'#f87171', fontSize:12, fontWeight:600 }}>
                          {c.change24h>=0?'+':''}{c.change24h?.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={()=>analyze()} disabled={loading}
                style={{ padding:'14px 24px', background:loading?'#1e293b':'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius:12, color:'#fff', fontWeight:700, fontSize:14, minWidth:110, boxShadow:loading?'none':'0 0 20px rgba(59,130,246,0.3)', transition:'all .2s' }}>
                {loading ? <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span> : '🔱 ANALİZ'}
              </button>
            </div>
          </div>

          {/* Popular chips */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', marginTop:20 }}>
            {POPULAR.map(s=>(
              <button key={s} className="chip" onClick={()=>pick(s)}
                style={{ padding:'5px 12px', background:'#0f172a', border:'1px solid #1e293b', borderRadius:20, color:'#64748b', fontSize:11, fontWeight:600, transition:'all .15s' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'14px 20px', color:'#f87171', marginBottom:24, textAlign:'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign:'center', padding:80 }}>
            <div style={{ width:56, height:56, border:'3px solid #1e293b', borderTop:'3px solid #3b82f6', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 20px' }}/>
            <div style={{ color:'#475569', fontSize:15 }}>CHARTOS analiz yapıyor...</div>
            <div style={{ color:'#334155', fontSize:12, marginTop:6 }}>6 katman hesaplanıyor</div>
          </div>
        )}

        {/* RESULTS */}
        {data && !loading && (
          <div style={{ animation:'slide 0.4s ease' }}>

            {/* COIN HEADER */}
            <div style={{ background:`linear-gradient(135deg,${vc.bg},#0f172a)`, border:`1px solid ${vc.glow}`, borderRadius:16, padding:'24px 28px', marginBottom:20, display:'flex', alignItems:'center', gap:24, flexWrap:'wrap', boxShadow:`0 0 40px ${vc.glow}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'#475569', marginBottom:4, fontWeight:600 }}>DEEP TRADE SCAN / CHARTOS</div>
                <div style={{ fontSize:32, fontWeight:900, color:'#e2e8f0', marginBottom:4 }}>{data.coin}<span style={{ color:'#475569', fontSize:18 }}>/USDT</span></div>
                <div style={{ fontSize:26, fontWeight:800, color:'#f1f5f9' }}>{data.price}</div>
                <div style={{ fontSize:15, color:data.change24h?.startsWith('+')?'#34d399':'#f87171', fontWeight:700, marginTop:4 }}>{data.change24h} (24s)</div>
                <div style={{ fontSize:12, color:'#475569', marginTop:4 }}>H: {data.high24h} | D: {data.low24h}</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:44, animation:'glow 2s ease infinite' }}>{vc.emoji}</div>
                <div style={{ color:vc.color, fontWeight:900, fontSize:20, marginTop:4 }}>{vc.label}</div>
                <div style={{ color:'#475569', fontSize:12, marginTop:2 }}>{data.bullSignals}🟢 {data.bearSignals}🔴</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:160 }}>
                {[
                  ['Trend (Günlük)', data.trendDaily, data.trendDaily==='BULLISH'?'#34d399':data.trendDaily==='BEARISH'?'#f87171':'#f59e0b'],
                  ['Trend (4s)', data.trend4h, data.trend4h==='BULLISH'?'#34d399':data.trend4h==='BEARISH'?'#f87171':'#f59e0b'],
                  ['Wyckoff', WYCKOFF_TR[data.wyckoff?.phase]||data.wyckoff?.phase, '#94a3b8'],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                    <span style={{ color:'#475569', fontSize:12 }}>{l}</span>
                    <span style={{ color:c, fontSize:12, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TABS */}
            <div style={{ display:'flex', gap:2, marginBottom:20, background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:4 }}>
              {[['chartos','🔱 CHARTOS'],['levels','📐 Seviyeler'],['technical','📊 Teknik'],['market','🌍 Piyasa']].map(([id,label])=>(
                <button key={id} className="tab-btn" onClick={()=>setTab(id)}
                  style={{ flex:1, padding:'10px 8px', background:tab===id?'#1e293b':'transparent', borderRadius:8, color:tab===id?'#60a5fa':'#475569', fontSize:13, fontWeight:tab===id?700:500, transition:'all .2s' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* TAB: CHARTOS */}
            {tab==='chartos' && ch && (
              <div style={{ display:'grid', gap:16 }}>
                {/* Bias Header */}
                <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'20px 24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div style={{ fontSize:11, color:'#475569', fontWeight:700, marginBottom:6 }}>🔱 CHARTOS TANRISAL BIAS</div>
                      <div style={{ fontSize:24, fontWeight:900, color: ch.htfBias?.includes('Boğa')?'#34d399':ch.htfBias?.includes('Ayı')?'#f87171':'#f59e0b' }}>
                        {ch.htfBias}
                      </div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:42, fontWeight:900, color:'#60a5fa' }}>{ch.biasPct}%</div>
                      <div style={{ fontSize:11, color:'#475569' }}>Güven Skoru</div>
                    </div>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
                  {/* Market Structure */}
                  <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                    <div style={{ fontSize:11, color:'#3b82f6', fontWeight:700, marginBottom:14, textTransform:'uppercase', letterSpacing:1 }}>📊 PİYASA YAPISI</div>
                    {ch.marketStructure && Object.entries({
                      'HTF Bias': ch.marketStructure.htfBias,
                      'Son BOS/CHoCH': ch.marketStructure.lastBOS,
                      'Order Block\'lar': ch.marketStructure.orderBlocks,
                      'FVG / Imbalance': ch.marketStructure.fvg,
                      'Likidite Havuzları': ch.marketStructure.liquidityPools,
                    }).map(([k,v])=>v&&(
                      <div key={k} style={{ marginBottom:10 }}>
                        <div style={{ fontSize:10, color:'#475569', marginBottom:2 }}>{k}</div>
                        <div style={{ fontSize:13, color:'#e2e8f0', lineHeight:1.5 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Key Levels */}
                  <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                    <div style={{ fontSize:11, color:'#8b5cf6', fontWeight:700, marginBottom:14, textTransform:'uppercase', letterSpacing:1 }}>🎯 ANA SEVİYELER</div>
                    {ch.keyLevels && [
                      ['Demand Zone (Alım)', ch.keyLevels.demandZone, '#34d399'],
                      ['Supply Zone (Satış)', ch.keyLevels.supplyZone, '#f87171'],
                      ['Kritik Likidite', ch.keyLevels.criticalLiquidity, '#f59e0b'],
                      ['Geçersizleşme', ch.keyLevels.invalidation, '#94a3b8'],
                    ].map(([l,v,c])=>v&&(
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e293b' }}>
                        <span style={{ color:'#64748b', fontSize:12 }}>{l}</span>
                        <span style={{ color:c, fontWeight:700, fontSize:13 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Scenarios */}
                  <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                    <div style={{ fontSize:11, color:'#10b981', fontWeight:700, marginBottom:14, textTransform:'uppercase', letterSpacing:1 }}>🎲 SENARYO ANALİZİ</div>
                    {ch.scenarios && (
                      <>
                        <div style={{ background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.15)', borderRadius:8, padding:'12px 14px', marginBottom:10 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                            <span style={{ color:'#34d399', fontWeight:700, fontSize:13 }}>🟢 BOĞA</span>
                            <span style={{ color:'#34d399', fontWeight:900 }}>%{ch.scenarios.bull?.pct}</span>
                          </div>
                          <div style={{ color:'#94a3b8', fontSize:12, lineHeight:1.5 }}>{ch.scenarios.bull?.desc}</div>
                        </div>
                        <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:8, padding:'12px 14px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                            <span style={{ color:'#f87171', fontWeight:700, fontSize:13 }}>🔴 AYI</span>
                            <span style={{ color:'#f87171', fontWeight:900 }}>%{ch.scenarios.bear?.pct}</span>
                          </div>
                          <div style={{ color:'#94a3b8', fontSize:12, lineHeight:1.5 }}>{ch.scenarios.bear?.desc}</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* God Setup */}
                  {ch.setup && (
                    <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                      <div style={{ fontSize:11, color:'#f59e0b', fontWeight:700, marginBottom:14, textTransform:'uppercase', letterSpacing:1 }}>⚡ TANRISAL SETUP</div>
                      {[
                        ['Giriş Bölgesi', ch.setup.entry, '#60a5fa'],
                        ['Geçersizleşme', ch.setup.invalidation, '#f87171'],
                        ['Hedef 1', ch.setup.tp1, '#34d399'],
                        ['Hedef 2', ch.setup.tp2, '#10b981'],
                        ['R:R Oranı', ch.setup.rr, '#f59e0b'],
                      ].map(([l,v,c])=>v&&(
                        <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e293b' }}>
                          <span style={{ color:'#64748b', fontSize:12 }}>{l}</span>
                          <span style={{ color:c, fontWeight:700, fontSize:13 }}>{v}</span>
                        </div>
                      ))}
                      {ch.setup.riskNote && (
                        <div style={{ marginTop:10, padding:'8px 12px', background:'rgba(245,158,11,0.08)', borderRadius:6, color:'#f59e0b', fontSize:11 }}>
                          ⚠️ {ch.setup.riskNote}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* God Insight */}
                {ch.godInsight && (
                  <div style={{ background:'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))', border:'1px solid rgba(139,92,246,0.2)', borderRadius:12, padding:'20px 24px' }}>
                    <div style={{ fontSize:11, color:'#a78bfa', fontWeight:700, marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>🔮 TANRISAL İÇGÖRÜ</div>
                    <div style={{ color:'#c4b5fd', fontSize:14, lineHeight:1.8 }}>{ch.godInsight}</div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LEVELS */}
            {tab==='levels' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
                <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:700, marginBottom:14 }}>DİRENÇ SEVİYELERİ</div>
                  {data.resistances?.map((r,i)=>(
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                      <span style={{ color:'#64748b', fontSize:12 }}>R{i+1} Direnç</span>
                      <span style={{ color:'#f87171', fontWeight:700 }}>{r}</span>
                    </div>
                  ))}
                  <div style={{ padding:'10px 0', textAlign:'center', color:'#60a5fa', fontWeight:700, fontSize:14, borderTop:'1px solid #334155', borderBottom:'1px solid #334155', margin:'4px 0' }}>
                    ●── {data.price} ──●
                  </div>
                  {data.supports?.map((s,i)=>(
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                      <span style={{ color:'#64748b', fontSize:12 }}>D{i+1} Destek</span>
                      <span style={{ color:'#34d399', fontWeight:700 }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:700, marginBottom:14 }}>WYCKOFF ANALİZİ</div>
                  {[
                    ['Faz', WYCKOFF_TR[data.wyckoff?.phase]||data.wyckoff?.phase, '#60a5fa'],
                    ['Sinyal', data.wyckoff?.signal, data.wyckoff?.signal==='BULLISH'?'#34d399':'#f87171'],
                    ['30g Trend', `${data.wyckoff?.t30pct}%`, data.wyckoff?.t30pct>=0?'#34d399':'#f87171'],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                      <span style={{ color:'#64748b', fontSize:12 }}>{l}</span>
                      <span style={{ color:c, fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: TECHNICAL */}
            {tab==='technical' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
                {[
                  { title:'RSI (14)', items:[['Değer', data.rsi, data.rsi<35?'#34d399':data.rsi>65?'#f87171':'#f59e0b'],['Bölge', data.rsi<35?'Aşırı Satım':data.rsi>65?'Aşırı Alım':'Nötr']] },
                  { title:'MACD', items:[['Trend', data.macdTrend, data.macdTrend==='YÜKSELİŞ'?'#34d399':'#f87171']] },
                  { title:'Bollinger %B', items:[['Değer', data.bbPct, data.bbPct<0.2?'#34d399':data.bbPct>0.8?'#f87171':'#f59e0b'],['Konum', data.bbPct<0.2?'Alt Band':'Alt Bant>0.8?Üst Band':'Orta']] },
                  { title:'EMA Yapısı', items:[['EMA 8', data.ema?.e8?.toFixed(6)],['EMA 21', data.ema?.e21?.toFixed(6)],['EMA 50', data.ema?.e50?.toFixed(6)],['Hizalama', data.trendDaily, data.trendDaily==='BULLISH'?'#34d399':'#f87171']] },
                ].map(({title,items})=>(
                  <div key={title} style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'14px 16px' }}>
                    <div style={{ fontSize:11, color:'#475569', fontWeight:700, marginBottom:10 }}>{title}</div>
                    {items.map(([l,v,c])=>(
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #1e293b' }}>
                        <span style={{ color:'#64748b', fontSize:12 }}>{l}</span>
                        <span style={{ color:c||'#e2e8f0', fontSize:12, fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* TAB: MARKET */}
            {tab==='market' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
                <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:700, marginBottom:14 }}>PİYASA VERİLERİ</div>
                  {[
                    ['Hacim (24s)', data.volume24h],
                    ['Piyasa Değeri', data.marketCap],
                    ['En Yüksek (24s)', data.high24h, '#34d399'],
                    ['En Düşük (24s)', data.low24h, '#f87171'],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e293b' }}>
                      <span style={{ color:'#64748b', fontSize:12 }}>{l}</span>
                      <span style={{ color:c||'#e2e8f0', fontWeight:600, fontSize:13 }}>{v}</span>
                    </div>
                  ))}
                </div>
                {data.fearGreed && (
                  <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                    <div style={{ fontSize:11, color:'#475569', fontWeight:700, marginBottom:14 }}>KORKU & AÇGÖZLÜLÜK</div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:52, fontWeight:900, color:FG_COLOR(data.fearGreed.value) }}>{data.fearGreed.value}</div>
                      <div style={{ color:'#64748b', fontSize:14, marginBottom:12 }}>{data.fearGreed.label}</div>
                      <div style={{ background:'#1e293b', borderRadius:8, height:8, overflow:'hidden' }}>
                        <div style={{ width:`${data.fearGreed.value}%`, height:'100%', background:'linear-gradient(90deg,#f87171,#f59e0b,#34d399)', transition:'width 1s' }}/>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'#475569' }}>
                        <span>Aşırı Korku</span><span>Aşırı Açgözlülük</span>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'18px 20px' }}>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:700, marginBottom:14 }}>SİSTEM BİLGİSİ</div>
                  {[
                    ['Motor', data._meta?.engine],
                    ['AI Modeli', data._meta?.aiModel],
                    ['Token Tahmini', data._meta?.tokenEst],
                    ['Cache TTL', data._meta?.cacheTTL],
                    ['Desteklenen', `${data._meta?.supportedCoins} coin`],
                  ].map(([l,v])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #1e293b' }}>
                      <span style={{ color:'#64748b', fontSize:12 }}>{l}</span>
                      <span style={{ color:'#94a3b8', fontSize:12 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {!data && !loading && !error && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#1e293b' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🔱</div>
            <div style={{ fontSize:18, color:'#334155' }}>Coin seç veya yaz, CHARTOS analiz etsin</div>
            <div style={{ fontSize:13, color:'#1e293b', marginTop:8 }}>250 kripto para destekleniyor</div>
          </div>
        )}
      </div>

      <footer style={{ textAlign:'center', padding:'32px 24px', color:'#1e293b', fontSize:11, borderTop:'1px solid #0f172a', marginTop:40 }}>
        Deep Trade Scan • CHARTOS Engine • {new Date().getFullYear()}<br/>
        <span style={{ color:'#1e293b' }}>Bu platform yatırım tavsiyesi vermez. Kripto piyasaları yüksek risk içerir.</span>
      </footer>
    </div>
  );
}