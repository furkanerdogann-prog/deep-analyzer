// pages/index.jsx — Deep Trade Scan v7.2 - Mobil Uyumlu
import { useState } from 'react';

const COINS = [
  'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT','MATIC','LINK',
  'UNI','ATOM','LTC','BCH','DOGE','SHIB','PEPE','WIF','BONK','FLOKI',
  'INJ','SUI','APT','ARB','OP','NEAR','TIA','TON','RENDER','AAVE',
  'HBAR','KAS','STX','NOT','IMX','LDO','SEI','PENGU','TRUMP','FTM',
  'SAND','MANA','AXS','GALA','ENJ','CHZ','FLOW','ICP','FIL','AR',
  'GRT','SNX','CRV','SUSHI','YFI','BAL','COMP','MKR','1INCH','ZRX',
  'LRC','DYDX','GMX','PERP','RUNE','KNC','OCEAN','FET','AGIX','IOTX',
  'VET','EGLD','ONE','CELO','ZIL','QTUM','NEO','WAVES','ZEC','DASH',
  'XMR','ETC','XLM','ALGO','XTZ','EOS','TRX','CRO','WOO','MAGIC',
  'LOOKS','BLUR','SUPER','TLM','ALICE','PYR','SLP','ARPA','BADGER','BOND',
  'APE','ENS','OP','IMX','DYDX','PERP','GMX','SNX','CRV','BAL',
  'COMP','AAVE','MKR','YFI','UNI','SUSHI','1INCH','LRC','ZRX','BNT',
  'REN','BAND','OCEAN','FET','AGIX','NMR','RLC','GLM','CTSI','MDT',
  'IOTX','VET','ONE','KLAY','CELO','ZIL','ICX','ONT','QTUM','NEO',
  'HT','OKB','LEO','KCS','MX','LINA','ALPHA','BETA','POLS','REEF',
  'XVS','BAKE','CAKE','DODO','ACH','FOR','LOKA','LOOKS','RARE','MBOX',
  'SKILL','ATA','KEEP','NU','TOKE','SPELL','TIME','OHM','JADE','JOE',
  'PNG','QI','AVME','LOST','RIDE','MEX','ITHEUM','HTM','APE','BAYC',
  'PENDLE','PYTH','JTO','DRIFT','WEN','JITO','BOME','POPCAT','MEW','BRETT',
];

export default function Home() {
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const [analysis, setAnalysis]   = useState('');
  const [error, setError]         = useState('');
  const [cached, setCached]       = useState(false);
  const [search, setSearch]       = useState('');
  const [sidebarOpen, setSidebar] = useState(false);

  const analyze = async (coin) => {
    setSelected(coin);
    setLoading(true);
    setError('');
    setAnalysis('');
    setCached(false);
    setSidebar(false); // mobilde sidebar kapat

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
    } catch {
      setError('Bağlantı hatası — lütfen tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  const filtered = COINS.filter(c => c.includes(search.toUpperCase()));

  const formatAnalysis = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
      if (line.includes('🔱') || line.includes('━')) return (
        <div key={i} style={{ color: '#a78bfa', fontWeight: 900, fontSize: 15, marginTop: 24, marginBottom: 8, borderBottom: '1px solid #1e293b', paddingBottom: 8 }}>{line}</div>
      );
      if (line.startsWith('##') || line.startsWith('**') && line.endsWith('**')) return (
        <div key={i} style={{ color: '#60a5fa', fontWeight: 800, fontSize: 13, marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{line.replace(/[#*]/g,'').trim()}</div>
      );
      if (line.match(/^[🟢🔴🟡📈📉⚡🎯📊🚀🧠🎭]/)) return (
        <div key={i} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, marginTop: 14, marginBottom: 4 }}>{line}</div>
      );
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('├') || line.trim().startsWith('└') || line.trim().startsWith('|')) return (
        <div key={i} style={{ color: '#94a3b8', fontSize: 13, paddingLeft: 12, marginBottom: 3, lineHeight: 1.7, fontFamily: 'monospace' }}>{line}</div>
      );
      if (line.includes('**')) return (
        <div key={i} style={{ color: '#e2e8f0', fontSize: 13, marginBottom: 3, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#60a5fa">$1</strong>') }} />
      );
      return <div key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 3, lineHeight: 1.7 }}>{line}</div>;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#e2e8f0', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0f172a;} ::-webkit-scrollbar-thumb{background:#334155;border-radius:2px;}
        .coin-btn:hover{background:#1e3a5f!important;color:#60a5fa!important;}
        input{outline:none;} button{cursor:pointer;border:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @media(max-width:768px){
          .layout{flex-direction:column!important;}
          .sidebar{position:fixed!important;left:0;top:0;bottom:0;z-index:100;transform:translateX(-100%);transition:transform .25s ease;}
          .sidebar.open{transform:translateX(0)!important;}
          .main{width:100%!important;height:100vh;}
          .overlay{display:block!important;}
        }
      `}</style>

      <div className="layout" style={{ display: 'flex', height: '100vh' }}>

        {/* Overlay - mobilde sidebar açıkken arka planı karart */}
        <div className="overlay" onClick={() => setSidebar(false)}
          style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'all' : 'none', transition: 'opacity .25s' }} />

        {/* SOL SIDEBAR */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}
          style={{ width: 200, background: '#0a0f1a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>

          <div style={{ padding: '14px 12px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ fontSize: 14, fontWeight: 900, background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ DEEP TRADE SCAN</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>CHARTOS ENGINE</div>
          </div>

          <div style={{ padding: '8px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Coin ara..."
              style={{ width: '100%', padding: '7px 10px', background: '#111827', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 8px' }}>
            {filtered.map((coin, idx) => (
              <button key={coin} className="coin-btn" onClick={() => analyze(coin)}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 1, background: selected === coin ? '#1e3a5f' : 'transparent', border: `1px solid ${selected === coin ? '#3b82f6' : 'transparent'}`, borderRadius: 6, color: selected === coin ? '#60a5fa' : '#64748b', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s' }}>
                <span style={{ fontSize: 10, color: '#334155', minWidth: 18 }}>{COINS.indexOf(coin) + 1}</span>
                {coin}
              </button>
            ))}
          </div>

          <div style={{ padding: '8px 12px', borderTop: '1px solid #1e293b', fontSize: 10, color: '#334155' }}>{filtered.length} coin</div>
        </div>

        {/* SAĞ ANA PANEL */}
        <div className="main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', background: '#030712', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Mobil menü butonu */}
            <button onClick={() => setSidebar(!sidebarOpen)}
              style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: '6px 10px', color: '#64748b', fontSize: 16, display: 'none' }}
              className="menu-btn">☰</button>

            {selected ? (
              <>
                <span style={{ fontSize: 17, fontWeight: 900 }}>{selected}/USDT</span>
                {cached && <span style={{ fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '2px 8px' }}>⚡ Cache</span>}
                {loading && <span style={{ fontSize: 11, color: '#60a5fa' }}>Analiz yapılıyor...</span>}
              </>
            ) : (
              <>
                <button onClick={() => setSidebar(true)}
                  style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: '6px 12px', color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>
                  ☰ Coin Seç
                </button>
                <span style={{ color: '#334155', fontSize: 13 }}>CHARTOS hazır</span>
              </>
            )}
          </div>

          {/* İçerik */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>

            {!selected && !loading && (
              <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🔱</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>CHARTOS Hazır</div>
                <div style={{ color: '#334155', fontSize: 14, marginBottom: 20 }}>Sol panelden bir coin seç</div>
                <button onClick={() => setSidebar(true)}
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', borderRadius: 10, padding: '12px 28px', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  🔱 Coin Seç
                </button>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ width: 48, height: 48, border: '3px solid #1e293b', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ color: '#475569', fontSize: 15, fontWeight: 600 }}>{selected} analiz ediliyor...</div>
                <div style={{ color: '#334155', fontSize: 12, marginTop: 6 }}>CHARTOS 7 katman hesaplıyor 🔱</div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '14px 16px', color: '#f87171', marginBottom: 16 }}>
                ⚠️ {error}
                <button onClick={() => analyze(selected)} style={{ marginLeft: 12, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '4px 12px', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                  Tekrar Dene
                </button>
              </div>
            )}

            {analysis && !loading && (
              <div style={{ animation: 'fade 0.3s ease' }}>
                <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 12, padding: '20px 16px', lineHeight: 1.7, wordBreak: 'break-word' }}>
                  {formatAnalysis(analysis)}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: '#334155', textAlign: 'right' }}>
                  CHARTOS Engine • {new Date().toLocaleTimeString('tr-TR')}
                  {cached && ' • Önbellekten'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .menu-btn{display:block!important;}
        }
      `}</style>
    </div>
  );
}