// pages/index.jsx — Deep Trade Scan v8.0
import { useState, useEffect, useRef } from 'react';

const COINS = [
  'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT','MATIC','LINK',
  'UNI','ATOM','LTC','BCH','DOGE','SHIB','PEPE','WIF','BONK','FLOKI',
  'INJ','SUI','APT','ARB','OP','NEAR','TIA','TON','RENDER','AAVE',
  'HBAR','KAS','STX','NOT','IMX','LDO','SEI','PENGU','TRUMP','FTM',
  'SAND','MANA','AXS','GALA','ENJ','CHZ','FLOW','ICP','FIL','AR',
  'GRT','SNX','CRV','SUSHI','YFI','BAL','COMP','MKR','1INCH','ZRX',
  'LRC','DYDX','GMX','RUNE','KNC','OCEAN','FET','AGIX','IOTX','VET',
  'EGLD','ONE','CELO','ZIL','QTUM','NEO','WAVES','ZEC','DASH','XMR',
  'ETC','XLM','ALGO','XTZ','EOS','TRX','CRO','WOO','MAGIC','LOOKS',
  'BLUR','SUPER','TLM','ALICE','PYR','SLP','ARPA','BADGER','APE','ENS',
  'PENDLE','PYTH','JTO','BOME','POPCAT','MEW','BRETT','WEN','JITO','NEIRO',
  'PNUT','ACT','GOAT','MOODENG','LUCE','DOG','HMSTR','CATI','MAJOR','DOGS',
  'TURBO','MOG','PONKE','FWOG','RETARDIO','GIGA','SIGMA','LOCK','PUPS','SATS',
  'ORDI','RATS','PIZZA','MUBI','TURT','ATOM','OSMO','JUNO','STARS','SCRT',
  'EVMOS','INJ','TIA','DYM','SAGA','PYTH','JTO','RNDR','WIF','BONK',
  'MEME','BOME','SLERF','BOOK','PONKE','PRCL','DRIFT','CLOUD','IO','ZEX',
  'BLAST','TAIKO','ZETA','MODE','MANTA','ALT','METIS','KAVA','CANTO','ROSE',
  'CFX','BOBA','STRAX','NKN','STORJ','SKL','ACH','ANKR','CELR','COTI',
  'DOCK','FIO','KEEP','OXT','POLS','REEF','UNFI','VITE','WAN','XEM',
];

// Tekil coinler bırak
const COIN_LIST = [...new Set(COINS)];

export default function Home() {
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);
  const [analysis, setAnalysis]     = useState('');
  const [error, setError]           = useState('');
  const [cached, setCached]         = useState(false);
  const [search, setSearch]         = useState('');
  const [sidebarOpen, setSidebar]   = useState(false);
  const [fearGreed, setFearGreed]   = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [history, setHistory]       = useState([]);
  const [theme, setTheme]           = useState('dark');
  const [copied, setCopied]         = useState(false);
  const retryRef = useRef(0);

  const isDark = theme === 'dark';
  const bg     = isDark ? '#030712' : '#f1f5f9';
  const bg2    = isDark ? '#0a0f1a' : '#ffffff';
  const bg3    = isDark ? '#0f172a' : '#f8fafc';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const text   = isDark ? '#e2e8f0' : '#0f172a';
  const muted  = isDark ? '#64748b' : '#94a3b8';

  // Fear & Greed + Market Data
  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1')
      .then(r => r.json())
      .then(d => setFearGreed(d.data?.[0]))
      .catch(() => {});

    fetch('https://api.coingecko.com/api/v3/global')
      .then(r => r.json())
      .then(d => setMarketData(d.data))
      .catch(() => {});

    // Analiz geçmişi localStorage'dan yükle
    try {
      const h = JSON.parse(localStorage.getItem('dts_history') || '[]');
      setHistory(h);
    } catch {}
  }, []);

  const analyze = async (coin, isRetry = false) => {
    if (!isRetry) retryRef.current = 0;
    setSelected(coin);
    setLoading(true);
    setError('');
    setAnalysis('');
    setCached(false);
    setSidebar(false);

    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin })
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Hata oluştu'); return; }
      setAnalysis(data.analysis);
      setCached(!!data._cached);

      // Geçmişe ekle
      try {
        const prev = JSON.parse(localStorage.getItem('dts_history') || '[]');
        const updated = [{ coin, time: new Date().toLocaleTimeString('tr-TR') }, ...prev.filter(h => h.coin !== coin)].slice(0, 8);
        localStorage.setItem('dts_history', JSON.stringify(updated));
        setHistory(updated);
      } catch {}

    } catch {
      // Otomatik retry
      if (retryRef.current < 1) {
        retryRef.current++;
        setTimeout(() => analyze(coin, true), 2000);
        return;
      }
      setError('Bağlantı hatası — lütfen tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  const copyAnalysis = () => {
    navigator.clipboard.writeText(analysis).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareTwitter = () => {
    const text = `🔱 ${selected}/USDT CHARTOS Analizi\n\ndeeptradescan.com\n\n#${selected} #Kripto #TeknikAnaliz`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filtered = COIN_LIST.filter(c => c.includes(search.toUpperCase()));

  const fgColor = (v) => v < 25 ? '#ef4444' : v < 45 ? '#f97316' : v < 55 ? '#f59e0b' : v < 75 ? '#84cc16' : '#00ff88';
  const fgLabel = (v) => v < 25 ? 'Aşırı Korku' : v < 45 ? 'Korku' : v < 55 ? 'Nötr' : v < 75 ? 'Açgözlülük' : 'Aşırı Açgözlülük';

  const formatNum = (n) => {
    if (!n) return 'N/A';
    if (n >= 1e12) return '$' + (n/1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return '$' + (n/1e9).toFixed(2) + 'B';
    return '$' + (n/1e6).toFixed(0) + 'M';
  };

  const formatAnalysis = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
      if (line.includes('🔱')) return (
        <div key={i} style={{ color: '#a78bfa', fontWeight: 900, fontSize: 16, marginTop: 24, marginBottom: 10, borderBottom: `1px solid ${border}`, paddingBottom: 8, letterSpacing: 0.5 }}>{line}</div>
      );
      if (line.startsWith('##') || (line.startsWith('**') && line.endsWith('**'))) return (
        <div key={i} style={{ color: '#60a5fa', fontWeight: 800, fontSize: 13, marginTop: 20, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{line.replace(/[#*]/g,'').trim()}</div>
      );
      if (line.match(/^[🟢🔴🟡📈📉⚡🎯📊🚀🧠🎭⚠️]/)) return (
        <div key={i} style={{ color: text, fontWeight: 700, fontSize: 14, marginTop: 14, marginBottom: 4 }}>{line}</div>
      );
      if (line.trim().startsWith('•') || line.trim().startsWith('├') || line.trim().startsWith('└') || line.trim().startsWith('|')) return (
        <div key={i} style={{ color: muted, fontSize: 13, paddingLeft: 12, marginBottom: 3, lineHeight: 1.7, fontFamily: 'monospace' }}>{line}</div>
      );
      if (line.trim().startsWith('-')) return (
        <div key={i} style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: 13, paddingLeft: 16, marginBottom: 3, lineHeight: 1.7 }}>{line}</div>
      );
      if (line.includes('**')) return (
        <div key={i} style={{ color: isDark ? '#e2e8f0' : '#1e293b', fontSize: 13, marginBottom: 3, lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, `<strong style="color:#60a5fa">$1</strong>`) }} />
      );
      return <div key={i} style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 13, marginBottom: 3, lineHeight: 1.7 }}>{line}</div>;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:${bg2};} ::-webkit-scrollbar-thumb{background:${border};border-radius:2px;}
        .coin-btn:hover{background:#1e3a5f!important;color:#60a5fa!important;}
        input,button{outline:none;}button{cursor:pointer;border:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
        .skeleton{animation:pulse 1.5s ease infinite;background:${border};border-radius:6px;}
      `}</style>

      {/* MARKET ŞERİDİ */}
      <div style={{ background: isDark ? '#060d1a' : '#1e293b', borderBottom: `1px solid ${border}`, padding: '6px 16px', display: 'flex', gap: 20, alignItems: 'center', overflowX: 'auto', flexWrap: 'nowrap' }}>
        {marketData ? (
          <>
            <span style={{ color: '#64748b', fontSize: 11, whiteSpace: 'nowrap' }}>Piyasa:</span>
            <span style={{ color: '#e2e8f0', fontSize: 11, whiteSpace: 'nowrap' }}>
              MCap: <strong style={{ color: '#60a5fa' }}>{formatNum(marketData.total_market_cap?.usd)}</strong>
            </span>
            <span style={{ color: '#e2e8f0', fontSize: 11, whiteSpace: 'nowrap' }}>
              BTC Dom: <strong style={{ color: '#f59e0b' }}>{marketData.market_cap_percentage?.btc?.toFixed(1)}%</strong>
            </span>
            <span style={{ color: '#e2e8f0', fontSize: 11, whiteSpace: 'nowrap' }}>
              ETH Dom: <strong style={{ color: '#a78bfa' }}>{marketData.market_cap_percentage?.eth?.toFixed(1)}%</strong>
            </span>
            <span style={{ color: '#e2e8f0', fontSize: 11, whiteSpace: 'nowrap' }}>
              24s Hacim: <strong style={{ color: '#34d399' }}>{formatNum(marketData.total_volume?.usd)}</strong>
            </span>
            <span style={{ color: '#e2e8f0', fontSize: 11, whiteSpace: 'nowrap' }}>
              Aktif Coin: <strong style={{ color: '#e2e8f0' }}>{marketData.active_cryptocurrencies?.toLocaleString()}</strong>
            </span>
          </>
        ) : (
          <span style={{ color: '#334155', fontSize: 11 }}>Piyasa verisi yükleniyor...</span>
        )}
        {fearGreed && (
          <span style={{ marginLeft: 'auto', fontSize: 11, whiteSpace: 'nowrap' }}>
            F&G: <strong style={{ color: fgColor(+fearGreed.value) }}>{fearGreed.value} — {fgLabel(+fearGreed.value)}</strong>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 33px)' }}>

        {/* Overlay mobil */}
        {sidebarOpen && (
          <div onClick={() => setSidebar(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} />
        )}

        {/* SOL SIDEBAR */}
        <div style={{ width: 200, background: bg2, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0, position: 'sticky', top: 33,
          ...(typeof window !== 'undefined' && window.innerWidth < 768 ? { position: 'fixed', top: 0, bottom: 0, zIndex: 100, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .25s ease' } : {}) }}>

          <div style={{ padding: '14px 12px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ DEEP TRADE SCAN</div>
              <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>CHARTOS ENGINE</div>
            </div>
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')}
              style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 6, padding: '4px 8px', color: muted, fontSize: 14 }}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          <div style={{ padding: '8px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Coin ara..."
              style={{ width: '100%', padding: '7px 10px', background: bg3, border: `1px solid ${border}`, borderRadius: 8, color: text, fontSize: 12 }} />
          </div>

          {/* Geçmiş */}
          {history.length > 0 && !search && (
            <div style={{ padding: '4px 8px 0' }}>
              <div style={{ fontSize: 10, color: muted, marginBottom: 4, paddingLeft: 4 }}>SON ANALİZLER</div>
              {history.slice(0,4).map(h => (
                <button key={h.coin} onClick={() => analyze(h.coin)}
                  style={{ width: '100%', textAlign: 'left', padding: '5px 10px', marginBottom: 1, background: 'transparent', borderRadius: 6, color: muted, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{h.coin}</span>
                  <span style={{ fontSize: 10, color: isDark ? '#334155' : '#cbd5e1' }}>{h.time}</span>
                </button>
              ))}
              <div style={{ borderBottom: `1px solid ${border}`, margin: '6px 0' }} />
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 8px' }}>
            {filtered.map((coin) => (
              <button key={coin} className="coin-btn" onClick={() => analyze(coin)}
                style={{ width: '100%', textAlign: 'left', padding: '7px 10px', marginBottom: 1,
                  background: selected === coin ? '#1e3a5f' : 'transparent',
                  border: `1px solid ${selected === coin ? '#3b82f6' : 'transparent'}`,
                  borderRadius: 6, color: selected === coin ? '#60a5fa' : muted,
                  fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s' }}>
                <span style={{ fontSize: 10, color: isDark ? '#334155' : '#cbd5e1', minWidth: 18 }}>{COIN_LIST.indexOf(coin) + 1}</span>
                {coin}
              </button>
            ))}
          </div>

          <div style={{ padding: '8px 12px', borderTop: `1px solid ${border}`, fontSize: 10, color: muted }}>{filtered.length} coin</div>
        </div>

        {/* SAĞ ANA PANEL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Header */}
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${border}`, background: bg2, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button onClick={() => setSidebar(!sidebarOpen)}
              style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 10px', color: muted, fontSize: 16, display: 'none' }}
              id="menu-btn">☰</button>

            {selected ? (
              <>
                <span style={{ fontSize: 16, fontWeight: 900 }}>{selected}/USDT</span>
                {cached && <span style={{ fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '2px 8px' }}>⚡ Önbellekten</span>}
                {loading && <span style={{ fontSize: 11, color: '#60a5fa', animation: 'pulse 1s infinite' }}>Analiz yapılıyor...</span>}
                {analysis && !loading && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button onClick={copyAnalysis}
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 8, padding: '5px 12px', color: copied ? '#34d399' : muted, fontSize: 12, fontWeight: 600 }}>
                      {copied ? '✅ Kopyalandı' : '📋 Kopyala'}
                    </button>
                    <button onClick={shareTwitter}
                      style={{ background: '#1da1f2', border: 'none', borderRadius: 8, padding: '5px 12px', color: '#fff', fontSize: 12, fontWeight: 600 }}>
                      𝕏 Paylaş
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button onClick={() => setSidebar(true)}
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  🔱 Coin Seç
                </button>
                <span style={{ color: muted, fontSize: 13 }}>CHARTOS hazır</span>
              </>
            )}
          </div>

          {/* TradingView Grafik */}
          {selected && (
            <div style={{ background: isDark ? '#0d1117' : '#f8fafc', borderBottom: `1px solid ${border}`, height: 420, flexShrink: 0 }}>
              <iframe
                key={selected}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tv&symbol=BINANCE:${selected}USDT&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=${isDark ? '0d1117' : 'f8fafc'}&studies=[]&theme=${theme}&style=1&timezone=Europe%2FIstanbul&withdateranges=1&showpopupbutton=0&locale=tr`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowTransparency
                allowFullScreen
              />
            </div>
          )}

          {/* İçerik */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>

            {!selected && !loading && (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🔱</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: muted, marginBottom: 8 }}>CHARTOS Hazır</div>
                <div style={{ color: isDark ? '#334155' : '#94a3b8', fontSize: 14, marginBottom: 24 }}>Sol panelden bir coin seç — 7 katmanlı tanrısal analiz başlasın</div>
                <button onClick={() => setSidebar(true)}
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', borderRadius: 12, padding: '12px 32px', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}>
                  🔱 Coin Seç
                </button>

                {/* Fear & Greed Kartı */}
                {fearGreed && (
                  <div style={{ maxWidth: 300, margin: '32px auto 0', background: bg2, border: `1px solid ${border}`, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>KORKU & AÇGÖZLÜLÜK ENDEKSİ</div>
                    <div style={{ fontSize: 48, fontWeight: 900, color: fgColor(+fearGreed.value) }}>{fearGreed.value}</div>
                    <div style={{ color: muted, fontSize: 13, marginBottom: 10 }}>{fgLabel(+fearGreed.value)}</div>
                    <div style={{ background: bg3, borderRadius: 6, height: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${fearGreed.value}%`, height: '100%', background: 'linear-gradient(90deg,#ef4444,#f59e0b,#00ff88)' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div style={{ animation: 'fade 0.3s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, border: '3px solid #1e293b', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <div style={{ color: muted, fontSize: 14, fontWeight: 600 }}>{selected} analiz ediliyor...</div>
                  <div style={{ color: isDark ? '#334155' : '#94a3b8', fontSize: 12, marginTop: 4 }}>CHARTOS 7 katman hesaplıyor 🔱</div>
                </div>
                {[120, 80, 160, 100, 140, 90, 200, 110].map((w, i) => (
                  <div key={i} className="skeleton" style={{ height: 14, width: `${w * 3}px`, maxWidth: '100%', marginBottom: 10 }} />
                ))}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '14px 16px', color: '#f87171', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>⚠️ {error}</span>
                <button onClick={() => analyze(selected)}
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 6, padding: '4px 14px', color: muted, fontSize: 12, marginLeft: 'auto' }}>
                  🔄 Tekrar Dene
                </button>
              </div>
            )}

            {analysis && !loading && (
              <div style={{ animation: 'fade 0.3s ease' }}>
                <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 12, padding: '20px 18px', lineHeight: 1.7, wordBreak: 'break-word' }}>
                  {formatAnalysis(analysis)}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: isDark ? '#334155' : '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>CHARTOS Engine • claude-haiku • {new Date().toLocaleTimeString('tr-TR')}{cached && ' • Önbellekten'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={copyAnalysis}
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 6, padding: '4px 10px', color: copied ? '#34d399' : muted, fontSize: 11 }}>
                      {copied ? '✅' : '📋'} Kopyala
                    </button>
                    <button onClick={shareTwitter}
                      style={{ background: '#1da1f2', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#fff', fontSize: 11 }}>
                      𝕏 Paylaş
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          #menu-btn{display:block!important;}
        }
      `}</style>
    </div>
  );
}