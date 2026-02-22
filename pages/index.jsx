// pages/index.jsx — Deep Trade Scan v7.0
import { useState } from 'react';

const COINS = [
  'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT','MATIC','LINK',
  'UNI','ATOM','LTC','BCH','DOGE','SHIB','PEPE','WIF','BONK','FLOKI',
  'INJ','SUI','APT','ARB','OP','NEAR','TIA','TON','RENDER','AAVE',
  'HBAR','KAS','STX','NOT','IMX','LDO','SEI','PENGU','TRUMP','FTM',
  'SAND','MANA','AXS','GALA','ENJ','CHZ','FLOW','ICP','FIL','AR',
  'GRT','SNX','CRV','SUSHI','YFI','BAL','COMP','MKR','1INCH','ZRX',
  'LRC','DYDX','GMX','PERP','RUNE','THOR','KNC','BNT','REN','BAND',
  'OCEAN','FET','AGIX','NMR','RLC','GLM','CTSI','MDT','DATA','IOTX',
  'VET','EGLD','ONE','KLAY','CELO','ZIL','ICX','ONT','QTUM','NEO',
  'WAVES','ZEC','DASH','XMR','ETC','XLM','ALGO','XTZ','EOS','TRX',
  'HT','OKB','CRO','LEO','FTT','GT','KCS','MX','WOO','LINA',
  'ALPHA','BETA','POLS','REEF','XVS','BAKE','CAKE','BURGER','DODO','MDX',
  'ACH','FOR','LOKA','MAGIC','LOOKS','BLUR','X2Y2','RARE','SUPER','MBOX',
  'TLM','ALICE','PYR','SKILL','SLP','ATA','ARPA','BADGER','BOND','BIFI',
  'CREAM','COVER','HEGIC','ARMOR','KEEP','NU','TOKE','SPELL','MIM','TIME',
  'OHM','KLIMA','JADE','BTRFLY','TEMPLE','HEC','SB','ROME','MIMO','PAPA',
  'JOE','PNG','QI','XJOE','SNOB','YAK','AVME','OLIVE','LOST','CYCLE',
  'EGLD','RIDE','MEX','ITHEUM','HTM','ISET','PADAWAN','LKMEX','LKFARM','WEB3',
  'APE','LOOKS','ENS','BAYC','MAYC','PUNK','DOODLE','AZUKI','MOONBIRD','CLONE',
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [selectedCoin, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);
  const [search, setSearch] = useState('');

  const analyze = async (coin) => {
    setSelected(coin);
    setLoading(true);
    setError('');
    setAnalysis('');
    setCached(false);

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
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const filtered = COINS.filter(c => c.includes(search.toUpperCase()));

  // Analiz metnini bölümlere ayır ve formatla
  const formatAnalysis = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: 8 }} />;

      // Başlık satırları (━ içerenler veya KATMAN ile başlayanlar)
      if (line.includes('━') || line.startsWith('KATMAN') || line.startsWith('🔱')) {
        return (
          <div key={i} style={{ color: '#60a5fa', fontWeight: 800, fontSize: 13, marginTop: 20, marginBottom: 6, borderBottom: '1px solid #1e293b', paddingBottom: 6, letterSpacing: 0.5 }}>
            {line}
          </div>
        );
      }

      // Emoji ile başlayan önemli satırlar
      if (line.match(/^[🟢🔴🟡📈📉⚡🎯📊🚀⚡🔱]/)) {
        return (
          <div key={i} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, marginTop: 12, marginBottom: 4 }}>
            {line}
          </div>
        );
      }

      // Bullet point satırlar
      if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('[')) {
        return (
          <div key={i} style={{ color: '#94a3b8', fontSize: 13, paddingLeft: 16, marginBottom: 3, lineHeight: 1.6 }}>
            {line}
          </div>
        );
      }

      // Normal satır
      return (
        <div key={i} style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 3, lineHeight: 1.7 }}>
          {line}
        </div>
      );
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#e2e8f0', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#0f172a;} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
        .coin-btn:hover{background:#1e3a5f!important;color:#60a5fa!important;border-color:#3b82f6!important;}
        .coin-btn.active{background:#1e3a5f!important;color:#60a5fa!important;border-color:#3b82f6!important;}
        input{outline:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fade{from{opacity:0;}to{opacity:1;}}
      `}</style>

      {/* SOL PANEL — Coin Listesi */}
      <div style={{ width: 220, background: '#0a0f1a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        {/* Logo */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 15, fontWeight: 900, background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ⚡ DEEP TRADE SCAN
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>CHARTOS ENGINE</div>
        </div>

        {/* Arama */}
        <div style={{ padding: '10px 10px 6px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Coin ara..."
            style={{ width: '100%', padding: '7px 10px', background: '#111827', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
          />
        </div>

        {/* Coin Listesi */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {filtered.map(coin => (
            <button
              key={coin}
              className={`coin-btn ${selectedCoin === coin ? 'active' : ''}`}
              onClick={() => analyze(coin)}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 2,
                background: selectedCoin === coin ? '#1e3a5f' : 'transparent',
                border: `1px solid ${selectedCoin === coin ? '#3b82f6' : 'transparent'}`,
                borderRadius: 7, color: selectedCoin === coin ? '#60a5fa' : '#64748b',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <span style={{ fontSize: 10, color: '#334155', minWidth: 16 }}>{COINS.indexOf(coin) + 1}</span>
              {coin}
            </button>
          ))}
        </div>

        <div style={{ padding: '10px 14px', borderTop: '1px solid #1e293b', fontSize: 10, color: '#334155' }}>
          {filtered.length} coin
        </div>
      </div>

      {/* SAĞ PANEL — Analiz */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, background: '#030712', zIndex: 10 }}>
          {selectedCoin ? (
            <>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#e2e8f0' }}>{selectedCoin}/USDT</span>
              <span style={{ fontSize: 11, color: '#475569', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '2px 10px' }}>16 Katman Analiz</span>
              {cached && <span style={{ fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '2px 8px' }}>⚡ Cache</span>}
            </>
          ) : (
            <span style={{ color: '#475569', fontSize: 14 }}>Sol panelden coin seç</span>
          )}
        </div>

        {/* İçerik */}
        <div style={{ padding: '24px 32px', maxWidth: 900 }}>
          {!selectedCoin && !loading && (
            <div style={{ textAlign: 'center', paddingTop: 120 }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🔱</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>CHARTOS Hazır</div>
              <div style={{ color: '#334155', fontSize: 15 }}>Sol panelden bir coin seç — 16 katmanlı tanrısal analiz başlasın</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', paddingTop: 100 }}>
              <div style={{ width: 52, height: 52, border: '3px solid #1e293b', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
              <div style={{ color: '#475569', fontSize: 16, fontWeight: 600 }}>{selectedCoin} analiz ediliyor...</div>
              <div style={{ color: '#334155', fontSize: 12, marginTop: 8 }}>16 katman hesaplanıyor — biraz sabır 🔱</div>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', color: '#f87171' }}>
              ⚠️ {error}
            </div>
          )}

          {analysis && !loading && (
            <div style={{ animation: 'fade 0.3s ease' }}>
              <div style={{ background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 14, padding: '24px 28px', lineHeight: 1.7 }}>
                {formatAnalysis(analysis)}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: '#334155', textAlign: 'right' }}>
                CHARTOS Engine • claude-haiku • {new Date().toLocaleTimeString('tr-TR')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}