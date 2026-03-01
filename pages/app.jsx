import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://hgijvoqarkkcebccvzxf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnaWp2b3FhcmtrY2ViY2N2enhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDMzMjYsImV4cCI6MjA4Nzg3OTMyNn0.CvOeVcVxainTIHG_Zo7sa9fZWLzCpYq1Cm0zwlkqXYs';

const COINS = [
  'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOT','MATIC','LINK',
  'UNI','AAVE','CRV','SUSHI','YFI','COMP','MKR','SNX','GRT','BAL',
  '1INCH','DYDX','GMX','PENDLE','LDO','ARB','OP','IMX','NEAR','TIA',
  'TON','APT','SUI','SEI','INJ','HBAR','KAS','STX','FLOW','ICP',
  'ALGO','VET','EOS','TRX','ETC','XLM','XMR','DOGE','SHIB','PEPE',
  'WIF','BONK','FLOKI','TRUMP','MEME','BRETT','POPCAT','TURBO','BOME','PNUT',
  'PENGU','ACT','GOAT','ORDI','PYTH','RUNE','FET','RENDER','AR','FIL',
  'STRK','ZETA','JTO','PIXEL','MANTA','METIS','VIRTUAL','FARTCOIN',
  'SAND','MANA','AXS','GALA','ENJ','CHZ','APE','ILV','MAGIC',
  'TAO','WLD','OCEAN','ARKM','RSS3','ENS','BLUR','HOOK','PORTAL','ALT','AI16Z',
  'ATOM','LTC','BCH','DASH','ZEC','QTUM','ICX','ZIL','ONT','CRO','OKB','KCS','LINEA',
];

const PLANS = {
  free:  { name:'FREE',  price:'$0/ay',   color:'#64748b', glow:'rgba(100,116,139,0.2)', features:['Günlük 3 Analiz','CHARTOS APEX 4.0','Temel Sinyaller','Topluluk Erişimi'] },
  pro:   { name:'PRO',   price:'$100/ay', color:'#3b82f6', glow:'rgba(59,130,246,0.25)', features:['Sınırsız Analiz','Öncelikli İşlem','Özel Telegram Grubu','Portföy Takip Sistemi','7/24 Öncelikli Destek','Özel Raporlar'] },
  elite: { name:'ELITE', price:'$500/ay', color:'#a855f7', glow:'rgba(168,85,247,0.3)',  features:['Pro\'daki Her Şey','1-1 Özel Danışmanlık','Kişisel Portföy Yönetimi','VIP Telegram Kanalı','Aylık Strateji Toplantısı','Dedicatd Account Manager','Kurumsal API Erişimi'] },
};

function parseAnalysis(text) {
  if (!text) return [];
  const clean = text.replace(/\*\*/g,'').replace(/\*/g,'').replace(/#{1,6}\s*/g,'');
  const lines = clean.split('\n').map(l=>l.trim()).filter(l=>l.length>0);
  const sections = []; let current = null;
  const isHeader = l => l.match(/CHARTOS APEX|CHARTOS MODU/i);
  const isSect   = l => l.match(/^(MARKET MAKER LENS|PİYASA YAPISI|ANA SEVİYELER|KALDIRAÇLI PRO SETUP|SENARYO ANALİZİ|TANRISAL İÇGÖRÜ|Risk Uyarısı)/i);
  const isKV     = l => l.match(/^(Varlık|Güncel Fiyat|Ana Timeframe|DeepTrade Bias|Edge Skoru|Win Probability|HTF Bias|Mevcut BOS|Unmitigated|FVG|Liquidity Pool|Demand Zone|Supply Zone|Kritik Liquidity|Invalidation|Setup Tipi|Giriş Bölgesi|Stop|Hedef [123]|R:R|Max Leverage|Risk %|Position Sizing|Trailing|Beklenen Süre|Expectancy|Boğa Senaryosu|Ayı Senaryosu):/i);
  for (const line of lines) {
    if (isHeader(line)) { sections.push({type:'header',text:line.replace(/[🔱]/g,'').trim()}); continue; }
    if (isSect(line))   { if(current) sections.push(current); current={type:'section',title:line,items:[]}; continue; }
    if (isKV(line))     { if(!current) current={type:'section',title:'ANALİZ',items:[]}; const idx=line.indexOf(':'); current.items.push({type:'kv',key:line.substring(0,idx).trim(),value:line.substring(idx+1).trim()}); continue; }
    if (line.match(/^[•\-›]/)) { if(!current) current={type:'section',title:'ANALİZ',items:[]}; current.items.push({type:'bullet',text:line.replace(/^[•\-›]\s*/,'')}); continue; }
    if (current) current.items.push({type:'text',text:line});
    else sections.push({type:'text',text:line});
  }
  if (current) sections.push(current);
  return sections;
}

function sectionMeta(title='') {
  const t = title.toUpperCase();
  if (t.includes('MARKET MAKER')) return {icon:'⬡',color:'#8b5cf6',border:'rgba(139,92,246,0.3)',bg:'rgba(139,92,246,0.05)'};
  if (t.includes('PİYASA'))       return {icon:'◈',color:'#3b82f6',border:'rgba(59,130,246,0.25)',bg:'rgba(59,130,246,0.04)'};
  if (t.includes('SEVİYE'))       return {icon:'◎',color:'#06b6d4',border:'rgba(6,182,212,0.25)',bg:'rgba(6,182,212,0.04)'};
  if (t.includes('SETUP')||t.includes('KALDIRAÇLI')) return {icon:'◆',color:'#10b981',border:'rgba(16,185,129,0.3)',bg:'rgba(16,185,129,0.05)'};
  if (t.includes('SENARYO'))      return {icon:'◐',color:'#f59e0b',border:'rgba(245,158,11,0.25)',bg:'rgba(245,158,11,0.04)'};
  if (t.includes('İÇGÖRÜ')||t.includes('TANRISAL')) return {icon:'◉',color:'#a855f7',border:'rgba(168,85,247,0.3)',bg:'rgba(168,85,247,0.05)'};
  if (t.includes('RISK'))         return {icon:'△',color:'#ef4444',border:'rgba(239,68,68,0.25)',bg:'rgba(239,68,68,0.04)'};
  return {icon:'○',color:'#475569',border:'rgba(71,85,105,0.2)',bg:'rgba(71,85,105,0.03)'};
}

function kvStyle(key='') {
  const k = key.toLowerCase();
  if (k.includes('giriş'))   return '#10b981';
  if (k.includes('stop'))    return '#ef4444';
  if (k.includes('hedef 1')) return '#06b6d4';
  if (k.includes('hedef 2')) return '#0ea5e9';
  if (k.includes('hedef 3')) return '#38bdf8';
  if (k.includes('r:r'))     return '#a78bfa';
  if (k.includes('bias')||k.includes('win prob')||k.includes('edge')) return '#f59e0b';
  if (k.includes('leverage')) return '#fb923c';
  if (k.includes('setup'))   return '#818cf8';
  if (k.includes('demand'))  return '#34d399';
  if (k.includes('supply'))  return '#f87171';
  return '#94a3b8';
}

async function apiAuth(action, body={}, token=null) {
  const headers = {'Content-Type':'application/json'};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`/api/auth?action=${action}`, {method:'POST',headers,body:JSON.stringify(body)});
  return r.json();
}

export default function App() {
  const [lang, setLang] = useState('TR');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState({email:'',password:'',name:''});
  const [coin, setCoin] = useState('BTC');
  const [search, setSearch] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState([]);
  const [quota, setQuota] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const sections = parseAnalysis(result);

  useEffect(() => {
    const stored = localStorage.getItem('dts_session');
    if (stored) {
      try { const s=JSON.parse(stored); setSession(s); loadProfile(s.access_token); } catch {}
    }
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token) {
        const s = {access_token, refresh_token};
        localStorage.setItem('dts_session', JSON.stringify(s));
        setSession(s); loadProfile(access_token);
        window.location.hash = '';
      }
    }
  }, []);

  async function loadProfile(token) {
    const d = await apiAuth('profile', {}, token);
    if (d.profile) {
      setProfile(d.profile);
      const today = new Date().toISOString().split('T')[0];
      const used = d.profile.last_analysis_date === today ? d.profile.daily_analyses : 0;
      const limit = d.profile.plan === 'free' ? 3 : 999999;
      setQuota({used, limit, plan: d.profile.plan});
    }
  }

  async function handleLogin(e) {
    e?.preventDefault();
    setAuthLoading(true); setAuthError('');
    const d = await apiAuth('login', {email:form.email, password:form.password});
    setAuthLoading(false);
    if (d.error) { setAuthError(d.error); return; }
    localStorage.setItem('dts_session', JSON.stringify(d.session));
    setSession(d.session); loadProfile(d.session.access_token);
  }

  async function handleRegister(e) {
    e?.preventDefault();
    if (!form.email||!form.password) { setAuthError('Tüm alanları doldurun'); return; }
    if (form.password.length < 6) { setAuthError('Şifre en az 6 karakter'); return; }
    setAuthLoading(true); setAuthError('');
    const d = await apiAuth('register', {email:form.email, password:form.password, full_name:form.name});
    setAuthLoading(false);
    if (d.error) { setAuthError(d.error); return; }
    if (d.session) {
      localStorage.setItem('dts_session', JSON.stringify(d.session));
      setSession(d.session); loadProfile(d.session.access_token);
    } else {
      setAuthError('Kayıt başarılı. Lütfen giriş yapın.');
      setAuthMode('login');
    }
  }

  function handleLogout() {
    localStorage.removeItem('dts_session');
    setSession(null); setProfile(null); setResult(''); setQuota(null);
  }

  async function handleAnalyze(symbol) {
    const s = symbol || coin;
    setResult(''); setError(''); setLoading(true);
    const check = await apiAuth('check-analysis', {}, session.access_token);
    if (check.error && check.upgrade) {
      setLoading(false); setShowPlans(true);
      setError(`Günlük ${check.limit} analiz hakkınız doldu.`);
      return;
    }
    if (check.error) {
      setLoading(false);
      if (check.error.includes('oturum')||check.error.includes('Token')) { handleLogout(); return; }
      setError(check.error); return;
    }
    setQuota({used:check.used, limit:check.limit, plan:check.plan, remaining:check.remaining});
    try {
      const r = await fetch('/api/analyze', {
        method:'POST',
        headers:{'Content-Type':'application/json','Origin':'https://deeptradescan.com'},
        body:JSON.stringify({coin:s, lang})
      });
      const data = await r.json();
      if (data.analysis) {
        setResult(data.analysis);
        fetch('/api/recent').then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{});
      } else setError(data.error || 'Analiz alınamadı');
    } catch { setError('Bağlantı hatası'); }
    setLoading(false);
  }

  const filtered = COINS.filter(c=>c.includes(search.toUpperCase()));
  const planInfo = PLANS[profile?.plan || 'free'];

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html { font-family: 'Space Grotesk', sans-serif; background: #020509; color: #e2e8f0; }
    body { min-height: 100vh; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #020509; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.3); } 50% { box-shadow: 0 0 40px rgba(59,130,246,0.6); } }
    @keyframes scanline { 0% { top: -100%; } 100% { top: 200%; } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .auth-card { animation: fadeUp 0.5s ease; }
    .section-card { animation: fadeUp 0.3s ease; }
    .btn-primary { transition: all 0.2s ease; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(59,130,246,0.4); }
    .coin-btn:hover { border-color: rgba(59,130,246,0.5) !important; color: #93c5fd !important; transform: translateY(-1px); }
    .coin-btn { transition: all 0.15s ease; }
    .inp { width: 100%; background: #0a1628; border: 1px solid #1e293b; border-radius: 10px; color: #e2e8f0; padding: 13px 16px; font-size: 14px; font-family: 'Space Grotesk', sans-serif; outline: none; transition: border-color 0.2s; }
    .inp:focus { border-color: #3b82f6; }
    .inp::placeholder { color: #334155; }
    .tab-btn { transition: all 0.2s; flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.5px; }
    .recent-row:hover { background: rgba(59,130,246,0.06) !important; cursor: pointer; }
    .recent-row { transition: background 0.2s; }
    @media (min-width: 1024px) {
      .app-layout { display: grid; grid-template-columns: 260px 1fr 380px; grid-template-rows: 60px 1fr; min-height: 100vh; }
      .top-bar { grid-column: 1 / -1; }
      .left-panel { grid-row: 2; overflow-y: auto; border-right: 1px solid #0f1923; }
      .center-panel { grid-row: 2; overflow-y: auto; }
      .right-panel { grid-row: 2; overflow-y: auto; border-left: 1px solid #0f1923; }
      .mobile-only { display: none !important; }
    }
    @media (max-width: 1023px) {
      .desktop-only { display: none !important; }
      .app-layout { display: flex; flex-direction: column; min-height: 100vh; }
    }
  `;

  // ── AUTH SCREEN ─────────────────────────────────────────────────────────────
  if (!session) {
    if (showPlans || authMode === 'plans') {
      return (
        <div style={{minHeight:'100vh',background:'#020509',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <style>{CSS}</style>
          <div style={{width:'100%',maxWidth:860,animation:'fadeUp 0.4s ease'}}>
            <div style={{textAlign:'center',marginBottom:40}}>
              <div style={{fontSize:13,color:'#3b82f6',letterSpacing:4,fontWeight:600,marginBottom:10}}>MEMBERSHIP</div>
              <div style={{fontSize:32,fontWeight:700,letterSpacing:-0.5}}>Planınızı Seçin</div>
              <div style={{fontSize:14,color:'#475569',marginTop:8}}>CHARTOS APEX 4.0 ile kurumsal seviyede analiz</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20,marginBottom:32}}>
              {Object.entries(PLANS).map(([key,plan])=>(
                <div key={key} style={{background:'#080f1a',border:`1px solid ${key==='pro'?plan.color+'50':'#0f1923'}`,borderRadius:16,padding:28,position:'relative',overflow:'hidden',boxShadow:key==='pro'?`0 0 40px ${plan.glow}`:'none'}}>
                  {key==='pro'&&<div style={{position:'absolute',top:14,right:14,background:'#3b82f6',borderRadius:6,padding:'3px 10px',fontSize:10,fontWeight:700,letterSpacing:1}}>POPÜLER</div>}
                  <div style={{fontSize:11,color:plan.color,letterSpacing:3,fontWeight:700,marginBottom:8}}>{plan.name}</div>
                  <div style={{fontSize:28,fontWeight:700,color:'#f1f5f9',marginBottom:20,fontFamily:"'JetBrains Mono',monospace"}}>{plan.price}</div>
                  <div style={{borderTop:'1px solid #0f1923',paddingTop:20,marginBottom:24}}>
                    {plan.features.map((f,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                        <div style={{width:16,height:16,borderRadius:4,background:plan.color+'20',border:`1px solid ${plan.color}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <div style={{width:5,height:5,borderRadius:'50%',background:plan.color}}/>
                        </div>
                        <span style={{fontSize:12,color:'#94a3b8'}}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {key==='free'
                    ? <button onClick={()=>setShowPlans(false)} style={{width:'100%',background:'#0f1923',border:'1px solid #1e293b',borderRadius:10,padding:'12px',color:'#64748b',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>Ücretsiz Devam Et</button>
                    : <button onClick={()=>alert('Ödeme sistemi aktif oluyor. İletişim: @deeptradescan')} style={{width:'100%',background:`linear-gradient(135deg,${plan.color},${plan.color}cc)`,border:'none',borderRadius:10,padding:'13px',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>{plan.name} Planını Başlat →</button>
                  }
                </div>
              ))}
            </div>
            <div style={{textAlign:'center'}}>
              <button onClick={()=>setShowPlans(false)} style={{background:'none',border:'none',color:'#475569',fontSize:13,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>← Geri dön</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{minHeight:'100vh',background:'#020509',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',position:'relative',overflow:'hidden'}}>
        <style>{CSS}</style>
        {/* BG Grid */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:600,height:600,background:'radial-gradient(ellipse,rgba(59,130,246,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

        <div style={{width:'100%',maxWidth:420,position:'relative',zIndex:1}} className="auth-card">
          {/* Logo — sadece 1 tane */}
          <div style={{textAlign:'center',marginBottom:40}}>
            <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:64,height:64,borderRadius:18,background:'linear-gradient(135deg,#0f1f3d,#1a3a6a)',border:'1px solid rgba(59,130,246,0.3)',marginBottom:16,boxShadow:'0 0 30px rgba(59,130,246,0.2)'}}>
              <img src="/logo.webp" style={{width:40,height:40,borderRadius:10,objectFit:'cover'}} alt="DTS" onError={e=>{e.target.style.display='none';}}/>
            </div>
            <div style={{fontSize:20,fontWeight:700,letterSpacing:1,color:'#f1f5f9'}}>DEEP TRADE SCAN</div>
            <div style={{fontSize:10,color:'#3b82f6',letterSpacing:4,marginTop:4,fontWeight:600}}>CHARTOS APEX 4.0</div>
          </div>

          {/* Card */}
          <div style={{background:'#080f1a',border:'1px solid #0f1923',borderRadius:20,padding:32,boxShadow:'0 25px 60px rgba(0,0,0,0.5)'}}>
            {/* Tabs */}
            <div style={{display:'flex',background:'#020509',borderRadius:12,padding:4,marginBottom:28,gap:4}}>
              {[['login','Giriş Yap'],['register','Kayıt Ol']].map(([m,label])=>(
                <button key={m} className="tab-btn" onClick={()=>{setAuthMode(m);setAuthError('');}}
                  style={{background:authMode===m?'#0f1f3d':'transparent',color:authMode===m?'#60a5fa':'#475569',border:authMode===m?'1px solid rgba(59,130,246,0.3)':'1px solid transparent'}}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {authMode==='register'&&(
                <div>
                  <label style={{fontSize:10,color:'#475569',letterSpacing:2,fontWeight:600,display:'block',marginBottom:7}}>AD SOYAD</label>
                  <input className="inp" placeholder="Adınız Soyadınız" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
              )}
              <div>
                <label style={{fontSize:10,color:'#475569',letterSpacing:2,fontWeight:600,display:'block',marginBottom:7}}>E-POSTA</label>
                <input className="inp" type="email" placeholder="ornek@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                  onKeyDown={e=>e.key==='Enter'&&(authMode==='login'?handleLogin():handleRegister())}/>
              </div>
              <div>
                <label style={{fontSize:10,color:'#475569',letterSpacing:2,fontWeight:600,display:'block',marginBottom:7}}>ŞİFRE</label>
                <input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                  onKeyDown={e=>e.key==='Enter'&&(authMode==='login'?handleLogin():handleRegister())}/>
              </div>

              {authError&&(
                <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:10,padding:'12px 14px',fontSize:12,color:'#f87171',lineHeight:1.5}}>{authError}</div>
              )}

              <button className="btn-primary" onClick={authMode==='login'?handleLogin:handleRegister} disabled={authLoading}
                style={{background:authLoading?'#0f1f3d':'linear-gradient(135deg,#1d4ed8,#3b82f6)',border:'none',borderRadius:12,padding:'14px',color:'#fff',fontSize:14,fontWeight:700,cursor:authLoading?'wait':'pointer',fontFamily:"'Space Grotesk',sans-serif",letterSpacing:0.5,marginTop:4}}>
                {authLoading
                  ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><span style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'}}/> Yükleniyor...</span>
                  : authMode==='login' ? '→ Güvenli Giriş' : '→ Hesap Oluştur'
                }
              </button>

              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{flex:1,height:1,background:'#0f1923'}}/><span style={{fontSize:10,color:'#1e293b',letterSpacing:1}}>VEYA</span><div style={{flex:1,height:1,background:'#0f1923'}}/>
              </div>

              <button onClick={()=>{window.location.href=`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin+'/app')}`;}}
                style={{background:'#fff',border:'none',borderRadius:12,padding:'13px',color:'#111',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontFamily:"'Space Grotesk',sans-serif"}}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.52V5.45H1.83a8 8 0 0 0 0 7.1l2.67-2.07z"/><path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.54A8 8 0 0 0 1.83 5.45L4.5 7.52A4.77 4.77 0 0 1 8.98 3.58z"/></svg>
                Google ile {authMode==='login'?'Giriş':'Kayıt'}
              </button>
            </div>

            <div style={{textAlign:'center',marginTop:20}}>
              <button onClick={()=>setShowPlans(true)} style={{background:'none',border:'none',color:'#3b82f6',fontSize:12,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>
                Üyelik planlarını görüntüle →
              </button>
            </div>
          </div>

          <div style={{textAlign:'center',marginTop:20,fontSize:11,color:'#1e293b'}}>
            ⚠️ Bu platform finansal tavsiye vermez. DYOR.
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN APP ────────────────────────────────────────────────────────────────
  const LeftPanel = () => (
    <div style={{padding:'20px 16px',background:'#04080f'}}>
      {/* User Card */}
      <div style={{background:'#080f1a',border:'1px solid #0f1923',borderRadius:14,padding:16,marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${PLANS[profile?.plan||'free'].color}30,${PLANS[profile?.plan||'free'].color}10)`,border:`1px solid ${PLANS[profile?.plan||'free'].color}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <div style={{fontSize:14,fontWeight:700,color:PLANS[profile?.plan||'free'].color}}>{(profile?.email||'U')[0].toUpperCase()}</div>
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.full_name || 'Kullanıcı'}</div>
            <div style={{fontSize:10,color:'#334155',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.email || ''}</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#020509',borderRadius:8,padding:'8px 10px'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:PLANS[profile?.plan||'free'].color,boxShadow:`0 0 6px ${PLANS[profile?.plan||'free'].color}`}}/>
            <span style={{fontSize:10,fontWeight:700,color:PLANS[profile?.plan||'free'].color,letterSpacing:1}}>{(profile?.plan||'free').toUpperCase()}</span>
          </div>
          {quota&&quota.plan==='free'&&(
            <span style={{fontSize:10,color:'#475569'}}>{quota.used}/{quota.limit} analiz</span>
          )}
          {quota?.plan==='free'&&(
            <button onClick={()=>setShowPlans(true)} style={{background:'none',border:'none',color:'#3b82f6',fontSize:10,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>Yükselt</button>
          )}
        </div>
        {quota?.plan==='free'&&(
          <div style={{marginTop:8,height:3,background:'#0f1923',borderRadius:2}}>
            <div style={{height:'100%',width:`${(quota.used/quota.limit)*100}%`,background:'linear-gradient(90deg,#1d4ed8,#3b82f6)',borderRadius:2,transition:'width 0.3s'}}/>
          </div>
        )}
      </div>

      {/* Coin Arama */}
      <div style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:600,marginBottom:10}}>VARLIKLAR</div>
      <div style={{position:'relative',marginBottom:12}}>
        <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#334155',fontSize:12}}>⌕</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Coin ara..."
          style={{width:'100%',background:'#020509',border:'1px solid #0f1923',borderRadius:8,padding:'9px 10px 9px 28px',color:'#e2e8f0',fontSize:12,outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5,maxHeight:340,overflowY:'auto'}}>
        {filtered.map(c=>(
          <button key={c} className="coin-btn" onClick={()=>{setCoin(c);setSearch('');}}
            style={{background:coin===c?'rgba(59,130,246,0.15)':'transparent',border:`1px solid ${coin===c?'rgba(59,130,246,0.4)':'#0f1923'}`,borderRadius:7,padding:'5px 10px',color:coin===c?'#60a5fa':'#475569',fontSize:11,fontWeight:coin===c?700:400,cursor:'pointer',fontFamily:"'JetBrains Mono',monospace"}}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );

  const CenterPanel = () => (
    <div style={{padding:'24px 24px',background:'#020509'}}>
      {/* Analiz Başlık */}
      <div style={{background:'#08111e',border:'1px solid #0f1923',borderRadius:16,padding:'20px 24px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
        <div>
          <div style={{fontSize:28,fontWeight:700,letterSpacing:-0.5,fontFamily:"'JetBrains Mono',monospace",color:'#f1f5f9'}}>
            {coin}<span style={{fontSize:14,color:'#334155',fontWeight:400,marginLeft:6}}>/USDT</span>
          </div>
          <div style={{fontSize:10,color:'#3b82f6',letterSpacing:3,marginTop:4,fontWeight:600}}>CHARTOS APEX 4.0 — HAZIR</div>
        </div>
        <button className="btn-primary" onClick={()=>handleAnalyze(coin)} disabled={loading}
          style={{background:loading?'#0f1f3d':'linear-gradient(135deg,#1d4ed8,#6d28d9)',border:'none',borderRadius:12,padding:'13px 24px',color:'#fff',fontSize:13,fontWeight:700,cursor:loading?'wait':'pointer',fontFamily:"'Space Grotesk',sans-serif",whiteSpace:'nowrap',minWidth:140}}>
          {loading
            ? <span style={{display:'flex',alignItems:'center',gap:8}}><span style={{width:12,height:12,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'}}/> Analiz...</span>
            : '⚡ Analiz Et'
          }
        </button>
      </div>

      {/* Hata */}
      {error&&!loading&&(
        <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
          <div style={{fontSize:12,color:'#f87171'}}>{error}</div>
          {(error.includes('limit')||error.includes('doldu'))&&(
            <button onClick={()=>setShowPlans(true)} style={{marginTop:10,background:'#1d4ed8',border:'none',borderRadius:8,padding:'8px 16px',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>→ Pro'ya Geç</button>
          )}
        </div>
      )}

      {/* Analiz Sonucu */}
      {result&&!loading&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:600}}>ANALİZ SONUCU</div>
            <button onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
              style={{background:copied?'rgba(16,185,129,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${copied?'rgba(16,185,129,0.3)':'#0f1923'}`,borderRadius:7,padding:'5px 12px',color:copied?'#34d399':'#475569',fontSize:11,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>
              {copied?'✓ Kopyalandı':'Kopyala'}
            </button>
          </div>
          {sections.map((sec,si)=>{
            if(sec.type==='header') return (
              <div key={si} style={{background:'linear-gradient(135deg,rgba(109,40,217,0.1),rgba(29,78,216,0.1))',border:'1px solid rgba(99,102,241,0.2)',borderRadius:12,padding:'14px 18px',marginBottom:12,textAlign:'center'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#818cf8',letterSpacing:2}}>🔱 {sec.text}</div>
              </div>
            );
            if(sec.type==='text') return <div key={si} style={{fontSize:11,color:'#334155',padding:'2px 0',lineHeight:1.5}}>{sec.text}</div>;
            const m = sectionMeta(sec.title);
            const isRisk = sec.title?.match(/Risk/i);
            return (
              <div key={si} className="section-card" style={{background:m.bg,border:`1px solid ${m.border}`,borderRadius:12,marginBottom:10,overflow:'hidden'}}>
                <div style={{padding:'10px 16px',borderBottom:`1px solid ${m.border}`,display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:12,color:m.color,fontFamily:"'JetBrains Mono',monospace"}}>{m.icon}</span>
                  <span style={{fontSize:10,fontWeight:700,color:m.color,letterSpacing:1.5,textTransform:'uppercase'}}>{sec.title?.replace(/[🔱📊⚡🎯🎭🔮📍⚠️◆◎⬡◈◐◉△○]/g,'').trim()}</span>
                </div>
                <div>
                  {sec.items?.map((item,ii)=>{
                    if(item.type==='kv'){const c=kvStyle(item.key);return(
                      <div key={ii} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'9px 16px',borderBottom:'1px solid rgba(255,255,255,0.02)',gap:12}}>
                        <span style={{fontSize:11,color:'#475569',fontWeight:500,flexShrink:0,minWidth:120,fontFamily:"'Space Grotesk',sans-serif"}}>{item.key}</span>
                        <span style={{fontSize:12,fontWeight:700,color:c,textAlign:'right',fontFamily:"'JetBrains Mono',monospace",lineHeight:1.4}}>{item.value}</span>
                      </div>
                    );}
                    if(item.type==='bullet') return(
                      <div key={ii} style={{display:'flex',gap:8,padding:'7px 16px',alignItems:'flex-start'}}>
                        <span style={{color:m.color,fontSize:9,marginTop:4,flexShrink:0}}>▸</span>
                        <span style={{fontSize:11,color:'#64748b',lineHeight:1.6}}>{item.text}</span>
                      </div>
                    );
                    return(
                      <div key={ii} style={{padding:'6px 16px',fontSize:11,color:isRisk?'#fca5a5':'#64748b',lineHeight:1.7}}>{item.text}</div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!result&&!loading&&(
        <div style={{textAlign:'center',padding:'60px 0',color:'#1e293b'}}>
          <div style={{fontSize:40,marginBottom:12,opacity:0.3}}>◈</div>
          <div style={{fontSize:13,color:'#1e293b'}}>Coin seçin ve analiz başlatın</div>
        </div>
      )}
    </div>
  );

  const RightPanel = () => (
    <div style={{padding:'20px 16px',background:'#04080f'}}>
      <div style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:600,marginBottom:16}}>SON ANALİZLER</div>
      {recent.length>0 ? recent.map((r,i)=>(
        <div key={i} className="recent-row" onClick={()=>handleAnalyze(r.coin)}
          style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#080f1a',border:'1px solid #0f1923',borderRadius:10,marginBottom:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#3b82f6',boxShadow:'0 0 6px #3b82f6'}}/>
            <span style={{fontSize:12,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{r.coin}</span>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11,color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}}>{r.price}</div>
            <div style={{fontSize:9,color:'#1e293b',marginTop:1}}>{r.time}</div>
          </div>
        </div>
      )) : (
        <div style={{fontSize:11,color:'#1e293b',textAlign:'center',padding:'30px 0'}}>Henüz analiz yapılmadı</div>
      )}

      <div style={{marginTop:24,borderTop:'1px solid #0f1923',paddingTop:20}}>
        <div style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:600,marginBottom:12}}>HIZLI ERİŞİM</div>
        <a href="https://t.me/deeptradescan" target="_blank" style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',background:'rgba(41,168,235,0.06)',border:'1px solid rgba(41,168,235,0.15)',borderRadius:10,color:'#29A8EB',fontSize:12,fontWeight:600,marginBottom:8,textDecoration:'none'}}>
          ✈️ Telegram Kanalı
        </a>
        <button onClick={()=>setShowPlans(true)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'11px 14px',background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)',borderRadius:10,color:'#60a5fa',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",marginBottom:8}}>
          ⚡ Planlar & Fiyatlar
        </button>
        <button onClick={handleLogout} style={{width:'100%',padding:'10px',background:'transparent',border:'1px solid #0f1923',borderRadius:10,color:'#475569',fontSize:12,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <style>{CSS}</style>

      {showPlans && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(2,5,9,0.95)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,overflow:'auto'}} className="auth-card">
          <div style={{width:'100%',maxWidth:860}}>
            <div style={{textAlign:'center',marginBottom:32}}>
              <div style={{fontSize:13,color:'#3b82f6',letterSpacing:4,fontWeight:600,marginBottom:8}}>MEMBERSHIP</div>
              <div style={{fontSize:28,fontWeight:700}}>Planınızı Seçin</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:24}}>
              {Object.entries(PLANS).map(([key,plan])=>(
                <div key={key} style={{background:'#080f1a',border:`1px solid ${key==='pro'?plan.color+'50':'#0f1923'}`,borderRadius:16,padding:24,boxShadow:key==='pro'?`0 0 30px ${plan.glow}`:'none'}}>
                  <div style={{fontSize:10,color:plan.color,letterSpacing:3,fontWeight:700,marginBottom:6}}>{plan.name}</div>
                  <div style={{fontSize:24,fontWeight:700,marginBottom:16,fontFamily:"'JetBrains Mono',monospace"}}>{plan.price}</div>
                  {plan.features.map((f,i)=>(
                    <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
                      <span style={{color:plan.color,fontSize:10,marginTop:2,flexShrink:0}}>✓</span>
                      <span style={{fontSize:11,color:'#64748b'}}>{f}</span>
                    </div>
                  ))}
                  <button onClick={key==='free'?()=>setShowPlans(false):()=>alert('İletişim: @deeptradescan')}
                    style={{width:'100%',marginTop:16,background:key==='free'?'#0f1923':`linear-gradient(135deg,${plan.color},${plan.color}cc)`,border:'none',borderRadius:9,padding:'11px',color:key==='free'?'#475569':'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>
                    {key==='free'?'Ücretsiz Devam Et':`${plan.name} Seç →`}
                  </button>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center'}}>
              <button onClick={()=>setShowPlans(false)} style={{background:'none',border:'none',color:'#475569',fontSize:13,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>✕ Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP LAYOUT */}
      <div className="app-layout">
        {/* TOP BAR */}
        <div className="top-bar" style={{background:'#04080f',borderBottom:'1px solid #0f1923',padding:'0 20px',display:'flex',alignItems:'center',justifyContent:'space-between',height:60,position:'sticky',top:0,zIndex:100}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="mobile-only" onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:'none',border:'none',cursor:'pointer',padding:4,color:'#475569'}}>
              ☰
            </button>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#0f1f3d,#1a3a6a)',border:'1px solid rgba(59,130,246,0.25)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src="/logo.webp" style={{width:28,height:28,objectFit:'cover',borderRadius:7}} alt="DTS" onError={e=>{e.target.style.display='none';}}/>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,letterSpacing:1}}>DEEP TRADE SCAN</div>
                <div style={{fontSize:8,color:'#3b82f6',letterSpacing:3,fontWeight:600}}>CHARTOS APEX 4.0</div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {['TR','EN'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{background:lang===l?'rgba(59,130,246,0.1)':'transparent',border:`1px solid ${lang===l?'rgba(59,130,246,0.3)':'#0f1923'}`,borderRadius:6,padding:'4px 9px',color:lang===l?'#60a5fa':'#475569',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>
                {l}
              </button>
            ))}
            {quota&&(
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',background:'#080f1a',border:'1px solid #0f1923',borderRadius:8}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:PLANS[profile?.plan||'free'].color,animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:10,color:PLANS[profile?.plan||'free'].color,fontWeight:700,letterSpacing:1}}>{(profile?.plan||'free').toUpperCase()}</span>
                {quota.plan==='free'&&<span style={{fontSize:10,color:'#334155'}}>{quota.used}/{quota.limit}</span>}
              </div>
            )}
          </div>
        </div>

        {/* LEFT */}
        <div className="left-panel desktop-only"><LeftPanel/></div>
        {/* CENTER */}
        <div className="center-panel"><CenterPanel/></div>
        {/* RIGHT */}
        <div className="right-panel desktop-only"><RightPanel/></div>
      </div>

      {/* MOBİL DRAWER */}
      {sidebarOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:9998,display:'flex'}} className="mobile-only">
          <div onClick={()=>setSidebarOpen(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.8)'}}/>
          <div style={{position:'relative',width:280,height:'100%',background:'#04080f',borderRight:'1px solid #0f1923',overflowY:'auto',zIndex:1,animation:'fadeIn 0.2s ease'}}>
            <div style={{padding:'14px',borderBottom:'1px solid #0f1923',display:'flex',justifyContent:'flex-end'}}>
              <button onClick={()=>setSidebarOpen(false)} style={{background:'none',border:'none',color:'#475569',fontSize:18,cursor:'pointer'}}>✕</button>
            </div>
            <LeftPanel/>
            <div style={{padding:'16px'}}>
              <RightPanel/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
