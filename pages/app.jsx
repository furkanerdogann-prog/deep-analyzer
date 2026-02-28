import { useState, useEffect, useCallback } from 'react';

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
  free:  { name:'FREE',  price:'$0',    color:'#475569', bg:'rgba(71,85,105,0.15)',  border:'rgba(71,85,105,0.3)',  limit:3,      features:['Günlük 3 Analiz','CHARTOS APEX 4.0','Temel Sinyal'] },
  pro:   { name:'PRO',   price:'$100',  color:'#1a6aff', bg:'rgba(26,106,255,0.12)', border:'rgba(26,106,255,0.4)', limit:999999, features:['Sınırsız Analiz','Öncelikli Kuyruk','Özel Telegram Grubu','Portföy Takibi','7/24 Destek'] },
  elite: { name:'ELITE', price:'$500',  color:'#a855f7', bg:'rgba(168,85,247,0.12)', border:'rgba(168,85,247,0.4)', limit:999999, features:['Her Şey Pro\'da +','1-1 Özel Danışmanlık','Kişisel Portföy Yönetimi','Özel Telegram Kanalı','VIP Sinyal Önceliği','Aylık Strateji Toplantısı'] },
};

const T = {
  TR:{ flag:'🇹🇷', login:'Giriş Yap', register:'Kayıt Ol', logout:'Çıkış', email:'E-posta', password:'Şifre', name:'Ad Soyad', analyze:'Analiz Et', searching:'Analiz ediliyor...', noResult:'Coin bulunamadı', daily:'Günlük Kota', remaining:'Kalan', upgrade:'Yükselt', planTitle:'Plan Seç', footer:'Bu analiz finansal tavsiye değildir. DYOR.' },
  EN:{ flag:'🇬🇧', login:'Login', register:'Register', logout:'Logout', email:'Email', password:'Password', name:'Full Name', analyze:'Analyze', searching:'Analyzing...', noResult:'No coin found', daily:'Daily Quota', remaining:'Remaining', upgrade:'Upgrade', planTitle:'Choose Plan', footer:'This is not financial advice. DYOR.' },
};

// ─── PARSE ──────────────────────────────────────────────────────────────────
function parseAnalysis(text) {
  if (!text) return [];
  const clean = text.replace(/\*\*/g,'').replace(/\*/g,'').replace(/#{1,6}\s*/g,'');
  const lines = clean.split('\n').map(l=>l.trim()).filter(l=>l.length>0);
  const sections = [];
  let current = null;
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
  if (t.includes('MARKET MAKER')) return {icon:'🎯',color:'#7c3aed',bg:'rgba(124,58,237,0.10)',border:'rgba(124,58,237,0.35)'};
  if (t.includes('PİYASA'))       return {icon:'📊',color:'#3b82f6',bg:'rgba(59,130,246,0.08)',border:'rgba(59,130,246,0.30)'};
  if (t.includes('SEVİYE'))       return {icon:'📍',color:'#06b6d4',bg:'rgba(6,182,212,0.08)',border:'rgba(6,182,212,0.30)'};
  if (t.includes('SETUP')||t.includes('KALDIRAÇLI')) return {icon:'⚡',color:'#10b981',bg:'rgba(16,185,129,0.10)',border:'rgba(16,185,129,0.35)'};
  if (t.includes('SENARYO'))      return {icon:'🎭',color:'#f59e0b',bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.30)'};
  if (t.includes('İÇGÖRÜ')||t.includes('TANRISAL')) return {icon:'🔮',color:'#a855f7',bg:'rgba(168,85,247,0.10)',border:'rgba(168,85,247,0.35)'};
  if (t.includes('RISK'))         return {icon:'⚠️',color:'#ef4444',bg:'rgba(239,68,68,0.08)',border:'rgba(239,68,68,0.25)'};
  return {icon:'📋',color:'#475569',bg:'rgba(148,163,184,0.05)',border:'rgba(148,163,184,0.20)'};
}

function kvColor(key='') {
  const k = key.toLowerCase();
  if (k.includes('giriş')||k.includes('entry'))   return {c:'#10b981',bg:'rgba(16,185,129,0.08)'};
  if (k.includes('stop')||k.includes('invalid'))  return {c:'#ef4444',bg:'rgba(239,68,68,0.08)'};
  if (k.includes('hedef 1')||k.includes('target 1')) return {c:'#06b6d4',bg:'rgba(6,182,212,0.07)'};
  if (k.includes('hedef 2')||k.includes('target 2')) return {c:'#22d3ee',bg:'rgba(34,211,238,0.06)'};
  if (k.includes('hedef 3')||k.includes('target 3')) return {c:'#67e8f9',bg:'rgba(103,232,249,0.05)'};
  if (k.includes('r:r'))                          return {c:'#a78bfa',bg:'rgba(167,139,250,0.08)'};
  if (k.includes('bias')||k.includes('win prob')||k.includes('edge')) return {c:'#f59e0b',bg:'rgba(245,158,11,0.08)'};
  if (k.includes('max leverage'))                 return {c:'#fb923c',bg:'rgba(251,146,60,0.08)'};
  if (k.includes('setup tipi'))                   return {c:'#818cf8',bg:'rgba(129,140,248,0.08)'};
  if (k.includes('demand'))                       return {c:'#34d399',bg:'rgba(52,211,153,0.06)'};
  if (k.includes('supply'))                       return {c:'#f87171',bg:'rgba(248,113,113,0.06)'};
  return {c:'#94a3b8',bg:'transparent'};
}

// ─── API HELPERS ─────────────────────────────────────────────────────────────
async function apiAuth(action, body={}, token=null) {
  const headers = {'Content-Type':'application/json'};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`/api/auth?action=${action}`, {method:'POST',headers,body:JSON.stringify(body)});
  return r.json();
}

async function supabaseSignInGoogle() {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin+'/app')}`, {
    headers: {'apikey': SUPABASE_ANON}
  });
  // Redirect
  const url = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin+'/app')}`;
  window.location.href = url;
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState('TR');
  const t = T[lang] || T.TR;

  // AUTH STATE
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // login | register | plans
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState({email:'',password:'',name:''});

  // APP STATE
  const [coin, setCoin] = useState('BTC');
  const [search, setSearch] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState([]);
  const [quota, setQuota] = useState(null);

  const sections = parseAnalysis(result);

  // Oturum yükle
  useEffect(() => {
    const stored = localStorage.getItem('dts_session');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        setSession(s);
        loadProfile(s.access_token);
      } catch {}
    }
    // Google callback kontrolü
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token) {
        const s = {access_token, refresh_token};
        localStorage.setItem('dts_session', JSON.stringify(s));
        setSession(s);
        loadProfile(access_token);
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
      const limit = PLANS[d.profile.plan]?.limit || 3;
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
    setSession(d.session);
    loadProfile(d.session.access_token);
  }

  async function handleRegister(e) {
    e?.preventDefault();
    if (!form.email||!form.password) { setAuthError('Tüm alanları doldurun'); return; }
    if (form.password.length < 6) { setAuthError('Şifre en az 6 karakter olmalı'); return; }
    setAuthLoading(true); setAuthError('');
    const d = await apiAuth('register', {email:form.email, password:form.password, full_name:form.name});
    setAuthLoading(false);
    if (d.error) { setAuthError(d.error); return; }
    // Otomatik giriş yap
    await handleLogin();
  }

  function handleLogout() {
    localStorage.removeItem('dts_session');
    setSession(null); setProfile(null); setResult(''); setQuota(null);
  }

  async function handleAnalyze(symbol) {
    if (!session) { setAuthMode('login'); return; }
    const s = symbol || coin;
    setResult(''); setError(''); setLoading(true); setDrawer(false);

    // Kota kontrol
    const check = await apiAuth('check-analysis', {}, session.access_token);
    if (check.error && check.upgrade) {
      setLoading(false);
      setError(`Günlük ${check.limit} analiz hakkınız doldu. Pro'ya geçin → Sınırsız analiz!`);
      setAuthMode('plans');
      return;
    }
    if (check.error) {
      setLoading(false);
      if (check.error.includes('oturum')||check.error.includes('Token')) {
        handleLogout();
        setAuthMode('login');
      }
      setError(check.error);
      return;
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
      } else {
        setError(data.error || 'Analiz alınamadı');
      }
    } catch { setError('Bağlantı hatası'); }
    setLoading(false);
  }

  const filtered = COINS.filter(c=>c.includes(search.toUpperCase()));

  // ─── AUTH SCREEN ──────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div style={{minHeight:'100vh',background:'#04070F',color:'#f1f5f9',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px'}}>
        <style>{`
          @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(26,106,255,0.3)}50%{box-shadow:0 0 40px rgba(26,106,255,0.6)}}
          input{background:#0a1220!important;border:1px solid #0f1923!important;border-radius:12px!important;color:#f1f5f9!important;padding:14px 16px!important;width:100%!important;font-size:14px!important;outline:none!important;box-sizing:border-box!important;transition:border-color .2s!important}
          input:focus{border-color:#1a6aff!important}
        `}</style>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32,animation:'fadeIn .5s ease'}}>
          <img src="/logo.webp" style={{width:64,height:64,borderRadius:18,objectFit:'cover',marginBottom:12}} alt="DTS"/>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:2}}>DEEP TRADE SCAN</div>
          <div style={{fontSize:11,color:'#1a6aff',letterSpacing:3,marginTop:4}}>CHARTOS APEX 4.0</div>
        </div>

        {/* Plan seçim modal */}
        {authMode === 'plans' ? (
          <div style={{width:'100%',maxWidth:420,animation:'fadeIn .3s ease'}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div style={{fontSize:18,fontWeight:900,marginBottom:6}}>Plan Seç</div>
              <div style={{fontSize:12,color:'#475569'}}>Günlük analizinizi artırın</div>
            </div>
            {Object.entries(PLANS).map(([key,plan])=>(
              <div key={key} style={{background:plan.bg,border:`1px solid ${plan.border}`,borderRadius:16,padding:20,marginBottom:12,animation:'fadeIn .3s ease'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div style={{fontSize:16,fontWeight:900,color:plan.color}}>{plan.name}</div>
                  <div style={{fontSize:20,fontWeight:900,color:plan.color}}>{plan.price}<span style={{fontSize:11,color:'#475569'}}>/ay</span></div>
                </div>
                {plan.features.map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <span style={{color:plan.color,fontSize:12}}>✓</span>
                    <span style={{fontSize:12,color:'#94a3b8'}}>{f}</span>
                  </div>
                ))}
                {key!=='free'&&(
                  <button onClick={()=>alert('Ödeme sistemi yakında aktif olacak. İletişim: @deeptradescan')}
                    style={{width:'100%',marginTop:14,background:plan.color,border:'none',borderRadius:10,padding:'12px',color:'#fff',fontSize:13,fontWeight:800,cursor:'pointer'}}>
                    {plan.name} Seç →
                  </button>
                )}
              </div>
            ))}
            <button onClick={()=>setAuthMode('login')} style={{width:'100%',background:'transparent',border:'1px solid #0f1923',borderRadius:10,padding:12,color:'#475569',fontSize:12,cursor:'pointer',marginTop:8}}>← Geri Dön</button>
          </div>
        ) : (
          <div style={{width:'100%',maxWidth:380,background:'#080c14',border:'1px solid #0f1923',borderRadius:20,padding:28,animation:'fadeIn .4s ease',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
            {/* Tab */}
            <div style={{display:'flex',background:'#04070F',borderRadius:12,padding:4,marginBottom:24}}>
              {['login','register'].map(m=>(
                <button key={m} onClick={()=>{setAuthMode(m);setAuthError('');}}
                  style={{flex:1,padding:'10px',border:'none',borderRadius:9,cursor:'pointer',fontSize:12,fontWeight:700,
                    background:authMode===m?'#1a6aff':'transparent',
                    color:authMode===m?'#fff':'#475569',transition:'all .2s'}}>
                  {m==='login'?t.login:t.register}
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {authMode==='register'&&(
                <div>
                  <div style={{fontSize:11,color:'#475569',marginBottom:6,letterSpacing:1}}>{t.name.toUpperCase()}</div>
                  <input placeholder="Adınız Soyadınız" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
              )}
              <div>
                <div style={{fontSize:11,color:'#475569',marginBottom:6,letterSpacing:1}}>{t.email.toUpperCase()}</div>
                <input type="email" placeholder="ornek@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                  onKeyDown={e=>e.key==='Enter'&&(authMode==='login'?handleLogin():handleRegister())}/>
              </div>
              <div>
                <div style={{fontSize:11,color:'#475569',marginBottom:6,letterSpacing:1}}>{t.password.toUpperCase()}</div>
                <input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                  onKeyDown={e=>e.key==='Enter'&&(authMode==='login'?handleLogin():handleRegister())}/>
              </div>

              {authError&&(
                <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#f87171'}}>{authError}</div>
              )}

              <button onClick={authMode==='login'?handleLogin:handleRegister} disabled={authLoading}
                style={{background:authLoading?'#1a3a6a':'linear-gradient(135deg,#1a6aff,#7c3aed)',border:'none',borderRadius:12,padding:'14px',color:'#fff',fontSize:14,fontWeight:800,cursor:authLoading?'wait':'pointer',animation:authLoading?'none':'glow 2s infinite',transition:'all .2s'}}>
                {authLoading?'Yükleniyor...':authMode==='login'?'🔐 '+t.login:'🚀 '+t.register}
              </button>

              <div style={{display:'flex',alignItems:'center',gap:8,margin:'4px 0'}}>
                <div style={{flex:1,height:1,background:'#0f1923'}}/>
                <span style={{fontSize:11,color:'#334155'}}>VEYA</span>
                <div style={{flex:1,height:1,background:'#0f1923'}}/>
              </div>

              <button onClick={supabaseSignInGoogle}
                style={{background:'#fff',border:'none',borderRadius:12,padding:'13px',color:'#1a1a1a',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.52V5.45H1.83a8 8 0 0 0 0 7.1l2.67-2.07z"/><path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.54A8 8 0 0 0 1.83 5.45L4.5 7.52A4.77 4.77 0 0 1 8.98 3.58z"/></svg>
                Google ile {authMode==='login'?'Giriş':'Kayıt'}
              </button>
            </div>

            <div style={{textAlign:'center',marginTop:18}}>
              <button onClick={()=>setAuthMode('plans')} style={{background:'none',border:'none',color:'#1a6aff',fontSize:12,cursor:'pointer'}}>
                📊 Planları Görüntüle
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── MAIN APP (GİRİŞ YAPILMIŞ) ──────────────────────────────────────────
  const planInfo = PLANS[profile?.plan || 'free'];

  return (
    <div style={{minHeight:'100vh',background:'#04070F',color:'#f1f5f9',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:480,margin:'0 auto',position:'relative'}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes slide{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        * {box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#04070F} ::-webkit-scrollbar-thumb{background:#0f1923;border-radius:2px}
      `}</style>

      {/* HEADER */}
      <div style={{position:'sticky',top:0,zIndex:100,background:'rgba(4,7,15,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid #0f1923',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setDrawer(true)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {[0,1,2].map(i=><div key={i} style={{width:i===1?16:22,height:2,background:'#475569',borderRadius:1}}/>)}
          </div>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/logo.webp" style={{width:28,height:28,borderRadius:8,objectFit:'cover'}} alt="DTS"/>
          <div>
            <div style={{fontSize:12,fontWeight:900,letterSpacing:1.5}}>DEEP TRADE SCAN</div>
            <div style={{fontSize:8,color:'#1a6aff',letterSpacing:2}}>CHARTOS APEX 4.0</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {/* Dil */}
          {['TR','EN'].map(l=>(
            <button key={l} onClick={()=>setLang(l)}
              style={{background:lang===l?'rgba(26,106,255,0.15)':'transparent',border:`1px solid ${lang===l?'rgba(26,106,255,0.4)':'#0f1923'}`,borderRadius:6,padding:'3px 7px',color:lang===l?'#60a5fa':'#334155',fontSize:9,fontWeight:700,cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* KOTA BAR */}
      {quota && (
        <div style={{padding:'8px 14px',background:'rgba(26,106,255,0.04)',borderBottom:'1px solid #0a0f1a',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:planInfo.color}}/>
            <span style={{fontSize:10,color:planInfo.color,fontWeight:700,letterSpacing:1}}>{(profile?.plan||'free').toUpperCase()}</span>
            <span style={{fontSize:10,color:'#334155'}}>
              {quota.plan==='free' ? `${quota.used}/${quota.limit} analiz` : 'Sınırsız'}
            </span>
          </div>
          {quota.plan==='free'&&(
            <button onClick={()=>{ handleLogout(); setAuthMode('plans'); }}
              style={{background:'rgba(26,106,255,0.15)',border:'1px solid rgba(26,106,255,0.3)',borderRadius:6,padding:'3px 10px',color:'#60a5fa',fontSize:9,fontWeight:700,cursor:'pointer'}}>
              ⚡ UPGRADE
            </button>
          )}
        </div>
      )}

      <div style={{padding:'16px 14px',paddingBottom:80}}>

        {/* SEÇİLİ COİN */}
        <div style={{background:'linear-gradient(135deg,rgba(26,106,255,0.08),rgba(124,58,237,0.08))',border:'1px solid rgba(99,102,241,0.2)',borderRadius:16,padding:'14px 18px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:1}}>{coin}<span style={{fontSize:12,color:'#334155',marginLeft:4}}>/USDT</span></div>
            <div style={{fontSize:10,color:'#334155',letterSpacing:1,marginTop:2}}>CHARTOS APEX 4.0 HAZIR</div>
          </div>
          <button onClick={()=>handleAnalyze(coin)} disabled={loading}
            style={{background:loading?'rgba(26,106,255,0.3)':'linear-gradient(135deg,#1a6aff,#7c3aed)',border:'none',borderRadius:12,padding:'12px 20px',color:'#fff',fontSize:13,fontWeight:800,cursor:loading?'wait':'pointer',minWidth:110,transition:'all .2s'}}>
            {loading ? <span style={{display:'inline-flex',alignItems:'center',gap:6}}><span style={{width:12,height:12,border:'2px solid #fff',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/>{t.searching}</span> : `⚡ ${t.analyze}`}
          </button>
        </div>

        {/* SEARCH */}
        <div style={{position:'relative',marginBottom:14}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#334155',fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Coin ara... BTC, ETH, SOL"
            style={{width:'100%',background:'#080c14',border:'1px solid #0f1923',borderRadius:12,padding:'11px 14px 11px 36px',color:'#f1f5f9',fontSize:13,outline:'none'}}/>
        </div>

        {/* COİN LİSTESİ */}
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
          {filtered.slice(0,50).map(c=>(
            <button key={c} onClick={()=>{setCoin(c);setSearch('');}}
              style={{background:coin===c?'rgba(26,106,255,0.2)':'rgba(255,255,255,0.02)',border:`1px solid ${coin===c?'rgba(26,106,255,0.5)':'#0f1923'}`,borderRadius:8,padding:'6px 11px',color:coin===c?'#60a5fa':'#475569',fontSize:11,fontWeight:coin===c?800:400,cursor:'pointer',transition:'all .15s'}}>
              {c}
            </button>
          ))}
        </div>

        {/* HATA */}
        {error&&!loading&&(
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:12,padding:'14px 16px',marginBottom:14,animation:'fadeIn .3s ease'}}>
            <div style={{fontSize:12,color:'#f87171',lineHeight:1.6}}>{error}</div>
            {error.includes('limit')||error.includes('doldu') ? (
              <button onClick={()=>{ handleLogout(); setAuthMode('plans'); }}
                style={{marginTop:10,background:'linear-gradient(135deg,#1a6aff,#7c3aed)',border:'none',borderRadius:8,padding:'9px 16px',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                ⚡ Pro'ya Geç → Sınırsız Analiz
              </button>
            ) : null}
          </div>
        )}

        {/* ANALİZ SONUCU */}
        {result&&!loading&&(
          <div style={{animation:'fadeIn .3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:11,color:'#334155',letterSpacing:1}}>CHARTOS ANALİZ</div>
              <button onClick={()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
                style={{background:copied?'rgba(16,185,129,0.15)':'rgba(255,255,255,0.03)',border:`1px solid ${copied?'rgba(16,185,129,0.3)':'#0f1923'}`,borderRadius:8,padding:'5px 12px',color:copied?'#34d399':'#475569',fontSize:11,cursor:'pointer'}}>
                {copied?'✓ Kopyalandı':'📋 Kopyala'}
              </button>
            </div>
            {sections.map((sec,si)=>{
              if(sec.type==='header') return (
                <div key={si} style={{background:'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(26,106,255,0.12))',border:'1px solid rgba(124,58,237,0.3)',borderRadius:14,padding:'14px 18px',marginBottom:12,textAlign:'center',boxShadow:'0 0 25px rgba(124,58,237,0.1)'}}>
                  <div style={{fontSize:12,fontWeight:900,color:'#fff',letterSpacing:2}}>🔱 {sec.text}</div>
                </div>
              );
              if(sec.type==='text') return (
                <div key={si} style={{fontSize:11,color:'#334155',padding:'2px 0',lineHeight:1.5}}>{sec.text}</div>
              );
              const m = sectionMeta(sec.title);
              const isRisk = sec.title?.match(/Risk/i);
              return (
                <div key={si} style={{background:m.bg,border:`1px solid ${m.border}`,borderRadius:14,marginBottom:10,overflow:'hidden',animation:'fadeIn .3s ease'}}>
                  <div style={{padding:'10px 16px',borderBottom:`1px solid ${m.border}`,display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:13}}>{m.icon}</span>
                    <div style={{width:3,height:12,borderRadius:2,background:m.color,boxShadow:`0 0 6px ${m.color}`}}/>
                    <span style={{fontSize:10,fontWeight:800,color:m.color,letterSpacing:1.5,textTransform:'uppercase'}}>{sec.title?.replace(/[🔱📊⚡🎯🎭🔮📍⚠️]/g,'').trim()}</span>
                  </div>
                  <div style={{padding:'4px 0'}}>
                    {sec.items?.map((item,ii)=>{
                      if(item.type==='kv'){const kv=kvColor(item.key);return(
                        <div key={ii} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'8px 16px',borderBottom:'1px solid rgba(255,255,255,0.02)',gap:10,background:kv.bg}}>
                          <span style={{fontSize:10,color:'#475569',fontWeight:600,letterSpacing:0.5,flexShrink:0,minWidth:100}}>{item.key}</span>
                          <span style={{fontSize:12,fontWeight:800,color:kv.c,textAlign:'right',lineHeight:1.4,textShadow:`0 0 8px ${kv.c}40`}}>{item.value}</span>
                        </div>
                      );}
                      if(item.type==='bullet') return(
                        <div key={ii} style={{display:'flex',gap:8,padding:'6px 16px',alignItems:'flex-start'}}>
                          <span style={{color:m.color,fontSize:9,marginTop:4,flexShrink:0}}>▸</span>
                          <span style={{fontSize:11,color:'#64748b',lineHeight:1.6}}>{item.text}</span>
                        </div>
                      );
                      if(item.type==='text') return(
                        <div key={ii} style={{padding:'6px 16px',fontSize:11,color:isRisk?'#fca5a5':'#64748b',lineHeight:1.7}}>
                          {isRisk&&<span style={{marginRight:4}}>⚠️</span>}{item.text}
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

        {/* SON ANALİZLER */}
        {!result&&!loading&&recent.length>0&&(
          <div style={{marginTop:8}}>
            <div style={{fontSize:10,color:'#334155',letterSpacing:1.5,marginBottom:10}}>SON ANALİZLER</div>
            {recent.map((r,i)=>(
              <div key={i} onClick={()=>handleAnalyze(r.coin)}
                style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'#080c14',border:'1px solid #0f1923',borderRadius:10,marginBottom:6,cursor:'pointer'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'#1a6aff'}}/>
                  <span style={{fontSize:13,fontWeight:700}}>{r.coin}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:11,color:'#334155'}}>{r.price}</span>
                  <span style={{fontSize:10,color:'#1e3a5f'}}>{r.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {!loading&&(
        <div style={{background:'#040609',borderTop:'1px solid #0f1923',padding:'16px 14px'}}>
          <div style={{maxWidth:400,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <img src="/logo.webp" style={{width:24,height:24,borderRadius:6,objectFit:'cover'}} alt="DTS"/>
              <div>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1}}>DEEP TRADE SCAN</div>
                <div style={{fontSize:8,color:'#1e3a5f',letterSpacing:1}}>CHARTOS APEX 4.0</div>
              </div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <a href="https://t.me/deeptradescan" target="_blank" style={{background:'rgba(41,168,235,0.08)',border:'1px solid rgba(41,168,235,0.15)',borderRadius:8,padding:'5px 10px',color:'#29A8EB',fontSize:10,fontWeight:700}}>✈️ Telegram</a>
              <button onClick={handleLogout} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'5px 10px',color:'#f87171',fontSize:10,fontWeight:700,cursor:'pointer'}}>Çıkış</button>
            </div>
          </div>
          <div style={{textAlign:'center',marginTop:10,fontSize:9,color:'#1e3a5f'}}>⚠️ {t.footer}</div>
        </div>
      )}

      {/* DRAWER */}
      {drawer&&(
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex'}}>
          <div onClick={()=>setDrawer(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.85)'}}/>
          <div style={{position:'relative',width:280,height:'100%',background:'#08111e',borderRight:'1px solid #0f1923',display:'flex',flexDirection:'column',animation:'slide .2s ease',zIndex:1,overflowY:'auto'}}>
            <div style={{padding:'16px 14px',borderBottom:'1px solid #0f1923',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <img src="/logo.webp" style={{width:30,height:30,borderRadius:9,objectFit:'cover'}} alt="DTS"/>
                <div>
                  <div style={{fontSize:11,fontWeight:900,letterSpacing:1}}>DEEP TRADE SCAN</div>
                  <div style={{fontSize:8,color:'#1e3a5f',letterSpacing:1}}>CHARTOS APEX 4.0</div>
                </div>
              </div>
              <button onClick={()=>setDrawer(false)} style={{background:'none',border:'none',color:'#334155',fontSize:18,cursor:'pointer'}}>✕</button>
            </div>

            {/* Kullanıcı bilgisi */}
            <div style={{padding:'14px',borderBottom:'1px solid #0f1923'}}>
              <div style={{background:planInfo.bg,border:`1px solid ${planInfo.border}`,borderRadius:12,padding:'12px 14px'}}>
                <div style={{fontSize:10,color:planInfo.color,fontWeight:800,letterSpacing:1,marginBottom:4}}>{(profile?.plan||'free').toUpperCase()} PLAN</div>
                <div style={{fontSize:11,color:'#94a3b8',marginBottom:8}}>{profile?.email || session?.user?.email || 'Kullanıcı'}</div>
                {quota && quota.plan==='free' && (
                  <div style={{fontSize:10,color:'#475569'}}>
                    Günlük: {quota.used}/{quota.limit} analiz kullanıldı
                    <div style={{marginTop:6,height:4,background:'#0a1220',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${(quota.used/quota.limit)*100}%`,background:'linear-gradient(90deg,#1a6aff,#7c3aed)',borderRadius:2,transition:'width .3s'}}/>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coin listesi drawer'da */}
            <div style={{padding:'12px 14px',flex:1}}>
              <div style={{fontSize:10,color:'#334155',letterSpacing:1.5,marginBottom:10}}>TÜM COİNLER</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {COINS.map(c=>(
                  <button key={c} onClick={()=>{setCoin(c);setDrawer(false);}}
                    style={{background:coin===c?'rgba(26,106,255,0.2)':'rgba(255,255,255,0.02)',border:`1px solid ${coin===c?'rgba(26,106,255,0.4)':'#0f1923'}`,borderRadius:7,padding:'5px 9px',color:coin===c?'#60a5fa':'#475569',fontSize:10,fontWeight:coin===c?700:400,cursor:'pointer'}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Plans */}
            <div style={{padding:'12px 14px',borderTop:'1px solid #0f1923'}}>
              <button onClick={()=>{setDrawer(false);handleLogout();setAuthMode('plans');}}
                style={{width:'100%',background:'linear-gradient(135deg,rgba(26,106,255,0.15),rgba(124,58,237,0.15))',border:'1px solid rgba(99,102,241,0.3)',borderRadius:10,padding:'11px',color:'#818cf8',fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:8}}>
                ⚡ Planları Görüntüle
              </button>
              <button onClick={()=>{setDrawer(false);handleLogout();}}
                style={{width:'100%',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'10px',color:'#f87171',fontSize:12,cursor:'pointer'}}>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
