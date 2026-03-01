import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const PLANS = {
  TR: [
    { name:'BAŞLANGIÇ', price:'$0', period:'Sonsuza ücretsiz', color:'#475569', popular:false,
      features:['Günlük 3 Analiz','CHARTOS APEX 4.0','200+ Coin','Temel Sinyaller','Topluluk Erişimi'] },
    { name:'PRO', price:'$100', period:'/ay', color:'#3b82f6', popular:true,
      features:['Sınırsız Analiz','Öncelikli Kuyruk','Özel Telegram Grubu','Portföy Takip Sistemi','7/24 Destek','Haftalık Strateji Raporu','TradingView Entegrasyonu'] },
    { name:'ELİTE', price:'$500', period:'/ay', color:'#a855f7', popular:false,
      features:['PRO\'daki Her Şey','1-1 Özel Danışmanlık','Kişisel Portföy Yönetimi','VIP Telegram Kanalı','Aylık Strateji Toplantısı','Dedicated Account Manager','Kurumsal API Erişimi','Öncelikli Telefon Desteği'] },
  ],
  EN: [
    { name:'STARTER', price:'$0', period:'Free forever', color:'#475569', popular:false,
      features:['3 Daily Analyses','CHARTOS APEX 4.0','200+ Coins','Basic Signals','Community Access'] },
    { name:'PRO', price:'$100', period:'/mo', color:'#3b82f6', popular:true,
      features:['Unlimited Analyses','Priority Queue','Private Telegram Group','Portfolio Tracker','24/7 Support','Weekly Strategy Report','TradingView Integration'] },
    { name:'ELITE', price:'$500', period:'/mo', color:'#a855f7', popular:false,
      features:['Everything in PRO','1-1 Private Consulting','Personal Portfolio Management','VIP Telegram Channel','Monthly Strategy Meeting','Dedicated Account Manager','Enterprise API Access','Priority Phone Support'] },
  ],
};

const COPY = {
  TR: {
    nav: ['Özellikler','Nasıl Çalışır','Fiyatlar','Telegram'],
    cta: 'Ücretsiz Başla',
    ctaSub: 'Kredi kartı gerekmez',
    badge: 'CANLI — 7/24 AKTİF',
    hero1: 'KURUMSAL SEVİYE',
    hero2: 'KRİPTO ANALİZİ',
    heroSub: 'Market Maker algoritmalarını, ICT konseptlerini ve Wyckoff metodolojisini birleştiren CHARTOS APEX 4.0 ile 200+ coin için gerçek zamanlı kurumsal analiz.',
    statLabels: ['Tamamlanan Analiz','Desteklenen Coin','Aktif Kullanıcı','Analiz Katmanı'],
    stats: ['47.200+','200+','8.400+','10'],
    trustBadges: ['256-bit SSL','Gerçek Zamanlı Veri','%99.9 Uptime','7/24 Destek'],
    howTitle: 'NASIL ÇALIŞIR',
    howSteps: [
      { n:'01', t:'Coin Seçin', d:'200+ kripto varlık arasından analiz etmek istediğinizi seçin.' },
      { n:'02', t:'APEX Analiz', d:'10 katmanlı algoritma Market Maker hareketlerini, likidite havuzlarını ve kurumsal footprint\'i saniyeler içinde tespit eder.' },
      { n:'03', t:'Sinyal Alın', d:'Giriş bölgesi, stop loss ve 3 hedef seviyesi ile R:R hesaplı profesyonel sinyal Telegram kanalına iletilir.' },
    ],
    featTitle: 'TEKNOLOJİ',
    feats: [
      { icon:'⬡', t:'Market Maker Algoritması', d:'Phase A-B-C-D motoru ile kurumsal manipülasyon tespiti ve weak hand liquidation analizi.' },
      { icon:'◈', t:'ICT + Wyckoff Füzyon', d:'Silver Bullet, Judas Swing, Turtle Soup Pro ve Wyckoff Spring/Upthrust gerçek zamanlı tespit.' },
      { icon:'◉', t:'10 Katmanlı Analiz', d:'HTF structure\'dan on-chain veriye, funding rate\'den whale hareketlerine tam spektrum analiz.' },
      { icon:'◆', t:'Quantitative Edge', d:'Backtested winrate, expectancy, Sharpe ratio ve max drawdown hesaplama ile kanıtlanmış edge.' },
      { icon:'◎', t:'On-Chain Entegrasyon', d:'SOPR, MVRV-Z, Puell Multiple, exchange flow ve whale wallet tracking gerçek zamanlı.' },
      { icon:'◐', t:'Telegram Otomasyon', d:'Her analiz otomatik olarak sinyal kanalına iletilir. IFTTT ile tweet akışı aktif.' },
    ],
    planTitle: 'FİYATLAR',
    planSub: 'Kripto piyasalarında kurumsal avantaj edinin',
    ctaTitle: 'KURUMSAL AVANTAJI YAKALAYIN',
    ctaDesc: 'Retail yatırımcıların %90\'ı piyasayı kaybeder. CHARTOS APEX 4.0 ile Market Maker\'ların gördüğünü görün.',
    ctaBtn: 'Ücretsiz Analiz Başlat',
    footer: 'Bu platform finansal tavsiye vermez. Kripto yatırımları yüksek risk içerir. DYOR.',
  },
  EN: {
    nav: ['Features','How It Works','Pricing','Telegram'],
    cta: 'Start Free',
    ctaSub: 'No credit card required',
    badge: 'LIVE — 24/7 ACTIVE',
    hero1: 'INSTITUTIONAL-GRADE',
    hero2: 'CRYPTO ANALYSIS',
    heroSub: 'Real-time institutional analysis for 200+ coins powered by CHARTOS APEX 4.0, combining Market Maker algorithms, ICT concepts and Wyckoff methodology.',
    statLabels: ['Analyses Done','Coins Supported','Active Users','Analysis Layers'],
    stats: ['47,200+','200+','8,400+','10'],
    trustBadges: ['256-bit SSL','Real-Time Data','99.9% Uptime','24/7 Support'],
    howTitle: 'HOW IT WORKS',
    howSteps: [
      { n:'01', t:'Select Coin', d:'Choose from 200+ crypto assets to analyze.' },
      { n:'02', t:'APEX Analysis', d:'10-layer algorithm detects Market Maker moves, liquidity pools and institutional footprint in seconds.' },
      { n:'03', t:'Get Signal', d:'Professional signal with entry zone, stop loss and 3 targets with R:R calculation sent to Telegram.' },
    ],
    featTitle: 'TECHNOLOGY',
    feats: [
      { icon:'⬡', t:'Market Maker Algorithm', d:'Phase A-B-C-D engine for institutional manipulation detection and weak hand liquidation analysis.' },
      { icon:'◈', t:'ICT + Wyckoff Fusion', d:'Silver Bullet, Judas Swing, Turtle Soup Pro and Wyckoff Spring/Upthrust real-time detection.' },
      { icon:'◉', t:'10-Layer Analysis', d:'Full spectrum from HTF structure to on-chain data, funding rate to whale movements.' },
      { icon:'◆', t:'Quantitative Edge', d:'Backtested winrate, expectancy, Sharpe ratio and max drawdown with proven edge.' },
      { icon:'◎', t:'On-Chain Integration', d:'SOPR, MVRV-Z, Puell Multiple, exchange flow and whale wallet tracking in real-time.' },
      { icon:'◐', t:'Telegram Automation', d:'Every analysis automatically sent to signal channel. IFTTT tweet flow active.' },
    ],
    planTitle: 'PRICING',
    planSub: 'Gain institutional advantage in crypto markets',
    ctaTitle: 'SEIZE THE INSTITUTIONAL EDGE',
    ctaDesc: '90% of retail investors lose to the market. See what Market Makers see with CHARTOS APEX 4.0.',
    ctaBtn: 'Start Free Analysis',
    footer: 'This platform does not provide financial advice. Crypto investments carry high risk. DYOR.',
  },
};

function Counter({ target, duration=2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const num = parseInt(target.replace(/\D/g,''));
    const step = num / (duration / 16);
    let cur = 0;
    ref.current = setInterval(() => {
      cur = Math.min(cur + step, num);
      setVal(Math.floor(cur));
      if (cur >= num) clearInterval(ref.current);
    }, 16);
    return () => clearInterval(ref.current);
  }, [target]);
  return <span>{val.toLocaleString()}{target.includes('+') ? '+' : ''}</span>;
}

export default function Landing() {
  const [lang, setLang] = useState('TR');
  const [scrolled, setScrolled] = useState(false);
  const [started, setStarted] = useState(false);
  const L = COPY[lang] || COPY.TR;
  const plans = PLANS[lang] || PLANS.TR;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    const t = setTimeout(() => setStarted(true), 300);
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(t); };
  }, []);

  const goApp = () => window.location.href = '/app';

  return (
    <>
      <Head>
        <title>Deep Trade Scan — Kurumsal Kripto Analizi</title>
        <meta name="description" content="CHARTOS APEX 4.0 ile 200+ coin için Market Maker algoritması, ICT ve Wyckoff tabanlı kurumsal kripto analizi."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #020509; color: #e2e8f0; font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #020509; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes scanH { 0% { transform:translateX(-100%); } 100% { transform:translateX(400%); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes gradShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        .hero-title { animation: fadeUp 0.8s ease both; }
        .hero-sub { animation: fadeUp 0.8s ease 0.15s both; }
        .hero-cta { animation: fadeUp 0.8s ease 0.3s both; }
        .hero-stats { animation: fadeUp 0.8s ease 0.45s both; }
        .logo-float { animation: float 4s ease-in-out infinite; }
        .nav-link { color: #475569; font-size: 13px; font-weight: 500; text-decoration: none; transition: color 0.2s; letter-spacing: 0.3px; }
        .nav-link:hover { color: #e2e8f0; }
        .btn-primary { background: linear-gradient(135deg, #1d4ed8, #6d28d9); border: none; border-radius: 12px; padding: 15px 28px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.5px; transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(59,130,246,0.4); }
        .btn-ghost { background: transparent; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 24px; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
        .btn-ghost:hover { border-color: #3b82f6; color: #93c5fd; }
        .feat-card { background: #080f1a; border: 1px solid #0f1923; border-radius: 16px; padding: 28px; transition: all 0.3s; }
        .feat-card:hover { border-color: rgba(59,130,246,0.3); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .plan-card { background: #08111e; border-radius: 20px; padding: 32px; transition: all 0.3s; position: relative; overflow: hidden; }
        .plan-card:hover { transform: translateY(-6px); }
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .feat-grid { grid-template-columns: 1fr !important; }
          .plan-grid { grid-template-columns: 1fr !important; }
          .stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .step-grid { grid-template-columns: 1fr !important; }
          .cta-section { padding: 60px 20px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,padding:'0 5%',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',background:scrolled?'rgba(2,5,9,0.95)':'transparent',backdropFilter:scrolled?'blur(20px)':'none',borderBottom:scrolled?'1px solid #0f1923':'1px solid transparent',transition:'all 0.3s'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#0f1f3d,#1a3a6a)',border:'1px solid rgba(59,130,246,0.3)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <img src="/logo.webp" style={{width:30,height:30,objectFit:'cover',borderRadius:7}} alt="DTS" onError={e=>e.target.style.display='none'}/>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:800,letterSpacing:1,lineHeight:1}}>DEEP TRADE SCAN</div>
            <div style={{fontSize:8,color:'#3b82f6',letterSpacing:3,fontWeight:600}}>CHARTOS APEX 4.0</div>
          </div>
        </div>

        <div className="nav-links" style={{display:'flex',alignItems:'center',gap:32}}>
          {L.nav.map((n,i)=>(
            <a key={i} className="nav-link" href={`#${['features','how','pricing','telegram'][i]}`}>{n}</a>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',background:'#0a1220',border:'1px solid #0f1923',borderRadius:8,padding:3,gap:2}}>
            {['TR','EN'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{background:lang===l?'#1d4ed8':'transparent',border:'none',borderRadius:6,padding:'5px 10px',color:lang===l?'#fff':'#475569',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",transition:'all 0.2s'}}>
                {l}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={goApp} style={{padding:'9px 18px',fontSize:12}}>
            {L.cta}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'120px 5% 80px',position:'relative',overflow:'hidden'}}>
        {/* BG */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(59,130,246,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.025) 1px,transparent 1px)',backgroundSize:'80px 80px'}}/>
        <div style={{position:'absolute',top:'30%',left:'20%',width:500,height:500,background:'radial-gradient(ellipse,rgba(29,78,216,0.08),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:'20%',right:'15%',width:400,height:400,background:'radial-gradient(ellipse,rgba(109,40,217,0.06),transparent 70%)',pointerEvents:'none'}}/>

        <div style={{maxWidth:1200,width:'100%',position:'relative',zIndex:1}}>

          {/* Badge */}
          <div style={{display:'flex',justifyContent:'center',marginBottom:40}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(59,130,246,0.07)',border:'1px solid rgba(59,130,246,0.18)',borderRadius:100,padding:'7px 18px'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#10b981',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:11,color:'#60a5fa',fontWeight:700,letterSpacing:2}}>{L.badge}</span>
            </div>
          </div>

          {/* 2-col layout: LEFT text + RIGHT mockup */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center',marginBottom:80}} className="hero-grid">

            {/* LEFT — text */}
            <div>
              <div className="hero-title">
                <div style={{fontSize:11,color:'#3b82f6',fontWeight:700,letterSpacing:5,marginBottom:14}}>{L.hero1}</div>
                <h1 style={{fontSize:'clamp(36px,5vw,72px)',fontWeight:800,lineHeight:1,letterSpacing:'-2px',marginBottom:20,background:'linear-gradient(135deg,#f1f5f9 40%,#64748b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                  {L.hero2}
                </h1>
                <div style={{width:60,height:3,background:'linear-gradient(90deg,#3b82f6,#6d28d9)',borderRadius:2,marginBottom:24}}/>
              </div>
              <div className="hero-sub">
                <p style={{fontSize:'clamp(14px,1.5vw,16px)',color:'#64748b',lineHeight:1.8,marginBottom:36}}>{L.heroSub}</p>
              </div>
              <div className="hero-cta" style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:40}}>
                <button className="btn-primary" onClick={goApp}>⚡ {L.ctaBtn}</button>
                <a href="https://t.me/deeptradescan" target="_blank" className="btn-ghost" style={{display:'inline-flex',alignItems:'center',gap:8,textDecoration:'none'}}>✈️ Telegram</a>
              </div>
              <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                {L.trustBadges.map((b,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:4,height:4,borderRadius:'50%',background:'#10b981'}}/>
                    <span style={{fontSize:11,color:'#334155',fontWeight:500}}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — animasyonlu analiz mockup */}
            <div style={{position:'relative'}}>
              {/* Glow arkası */}
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:400,height:400,background:'radial-gradient(ellipse,rgba(59,130,246,0.12),transparent 70%)',pointerEvents:'none'}}/>

              {/* Ana kart */}
              <div style={{background:'#08111e',border:'1px solid #1e293b',borderRadius:20,padding:24,boxShadow:'0 30px 80px rgba(0,0,0,0.6)',position:'relative',overflow:'hidden'}}>
                {/* Scan line animasyonu */}
                <div style={{position:'absolute',left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent)',animation:'scanH 3s linear infinite',pointerEvents:'none'}}/>

                {/* Header */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,paddingBottom:16,borderBottom:'1px solid #0f1923'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981',animation:'pulse 2s infinite'}}/>
                    <span style={{fontSize:11,fontWeight:700,color:'#60a5fa',letterSpacing:2,fontFamily:"'JetBrains Mono',monospace"}}>CHARTOS APEX 4.0</span>
                  </div>
                  <div style={{display:'flex',gap:5}}>
                    {['#ef4444','#f59e0b','#10b981'].map((c,i)=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:c}}/>)}
                  </div>
                </div>

                {/* Coin + bias */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                  <div>
                    <div style={{fontSize:24,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:'#f1f5f9'}}>BTC<span style={{fontSize:13,color:'#334155',fontWeight:400}}>/USDT</span></div>
                    <div style={{fontSize:11,color:'#10b981',fontWeight:600,marginTop:2}}>▲ LONG BIAS — 87.4% WIN RATE</div>
                  </div>
                  <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:10,padding:'8px 14px',textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:800,color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>1:3.8</div>
                    <div style={{fontSize:9,color:'#475569',letterSpacing:1}}>R:R</div>
                  </div>
                </div>

                {/* Levels */}
                {[
                  {label:'GIRIŞ',value:'$94,820',color:'#10b981',bg:'rgba(16,185,129,0.06)'},
                  {label:'STOP',value:'$92,100',color:'#ef4444',bg:'rgba(239,68,68,0.06)'},
                  {label:'HEDEF 1',value:'$98,500',color:'#06b6d4',bg:'rgba(6,182,212,0.06)'},
                  {label:'HEDEF 2',value:'$102,300',color:'#3b82f6',bg:'rgba(59,130,246,0.06)'},
                  {label:'HEDEF 3',value:'$107,000',color:'#8b5cf6',bg:'rgba(139,92,246,0.06)'},
                ].map((row,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:row.bg,borderRadius:8,marginBottom:6}}>
                    <span style={{fontSize:10,color:'#475569',fontWeight:600,letterSpacing:1}}>{row.label}</span>
                    <span style={{fontSize:13,fontWeight:700,color:row.color,fontFamily:"'JetBrains Mono',monospace"}}>{row.value}</span>
                  </div>
                ))}

                {/* Bottom metrics */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginTop:16,paddingTop:16,borderTop:'1px solid #0f1923'}}>
                  {[
                    {l:'EDGE',v:'94.2',c:'#a855f7'},
                    {l:'CONFLUENCE',v:'%91',c:'#f59e0b'},
                    {l:'LEVERAGE',v:'5x',c:'#06b6d4'},
                  ].map((m,i)=>(
                    <div key={i} style={{background:'#04080f',borderRadius:8,padding:'10px',textAlign:'center'}}>
                      <div style={{fontSize:16,fontWeight:800,color:m.c,fontFamily:"'JetBrains Mono',monospace"}}>{m.v}</div>
                      <div style={{fontSize:9,color:'#334155',letterSpacing:1,marginTop:3}}>{m.l}</div>
                    </div>
                  ))}
                </div>

                {/* Watermark */}
                <div style={{textAlign:'center',marginTop:14,fontSize:9,color:'#1e293b',letterSpacing:2}}>DEEP TRADE SCAN — CHARTOS APEX 4.0</div>
              </div>

              {/* Floating badge sağ alt */}
              <div style={{position:'absolute',bottom:-16,right:-16,background:'#080f1a',border:'1px solid rgba(16,185,129,0.3)',borderRadius:12,padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
                <div style={{fontSize:10,color:'#10b981',fontWeight:700,letterSpacing:1}}>✓ MARKET MAKER TESPİT</div>
                <div style={{fontSize:9,color:'#334155',marginTop:2}}>ICT Phase B Sweep</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats stat-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'#0f1923',borderRadius:16,overflow:'hidden',border:'1px solid #0f1923'}}>
            {L.stats.map((s,i)=>(
              <div key={i} style={{background:'#080f1a',padding:'24px 20px',textAlign:'center'}}>
                <div style={{fontSize:'clamp(24px,3vw,36px)',fontWeight:800,color:'#f1f5f9',fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>
                  {started ? <Counter target={s}/> : '0'}
                </div>
                <div style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:600,marginTop:6}}>{L.statLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{padding:'100px 5%',borderTop:'1px solid #0a0f1a'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:11,color:'#3b82f6',letterSpacing:4,fontWeight:700,marginBottom:12}}>{L.howTitle}</div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-1px'}}>3 Adımda Kurumsal Analiz</h2>
          </div>
          <div className="step-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,position:'relative'}}>
            {L.howSteps.map((step,i)=>(
              <div key={i} style={{background:'#080f1a',border:'1px solid #0f1923',padding:'36px 28px',position:'relative',borderRadius:i===0?'16px 0 0 16px':i===2?'0 16px 16px 0':'0'}}>
                <div style={{fontSize:'clamp(48px,5vw,72px)',fontWeight:800,color:'#0a1628',fontFamily:"'JetBrains Mono',monospace",lineHeight:1,marginBottom:20,letterSpacing:'-2px'}}>{step.n}</div>
                <div style={{width:32,height:2,background:'linear-gradient(90deg,#3b82f6,#6d28d9)',borderRadius:1,marginBottom:16}}/>
                <div style={{fontSize:16,fontWeight:700,color:'#f1f5f9',marginBottom:10}}>{step.t}</div>
                <div style={{fontSize:13,color:'#64748b',lineHeight:1.7}}>{step.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:'100px 5%',background:'#030711'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:11,color:'#a855f7',letterSpacing:4,fontWeight:700,marginBottom:12}}>{L.featTitle}</div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-1px'}}>CHARTOS APEX 4.0</h2>
            <p style={{fontSize:15,color:'#475569',marginTop:12,maxWidth:500,margin:'12px auto 0'}}>2026 Market Maker algoritması ile 10 katmanlı ultra analiz motoru</p>
          </div>
          <div className="feat-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {L.feats.map((f,i)=>(
              <div key={i} className="feat-card">
                <div style={{fontSize:24,marginBottom:16,color:'#3b82f6',fontFamily:"'JetBrains Mono',monospace"}}>{f.icon}</div>
                <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9',marginBottom:8}}>{f.t}</div>
                <div style={{fontSize:13,color:'#475569',lineHeight:1.7}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:'100px 5%'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:11,color:'#3b82f6',letterSpacing:4,fontWeight:700,marginBottom:12}}>{L.planTitle}</div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-1px'}}>{L.planSub}</h2>
          </div>
          <div className="plan-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,alignItems:'start'}}>
            {plans.map((plan,i)=>(
              <div key={i} className="plan-card" style={{border:`1px solid ${plan.popular?plan.color+'60':'#0f1923'}`,boxShadow:plan.popular?`0 0 50px rgba(59,130,246,0.12)`:''  ,marginTop:plan.popular?0:16}}>
                {plan.popular&&(
                  <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%) translateY(-50%)',background:'linear-gradient(135deg,#1d4ed8,#6d28d9)',borderRadius:100,padding:'5px 16px',fontSize:10,fontWeight:800,letterSpacing:2,whiteSpace:'nowrap'}}>
                    EN POPÜLER
                  </div>
                )}
                <div style={{fontSize:10,color:plan.color,letterSpacing:3,fontWeight:700,marginBottom:10}}>{plan.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:6}}>
                  <span style={{fontSize:42,fontWeight:800,color:'#f1f5f9',fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{plan.price}</span>
                  <span style={{fontSize:13,color:'#475569'}}>{plan.period}</span>
                </div>
                <div style={{height:1,background:'#0f1923',margin:'20px 0'}}/>
                <div style={{marginBottom:28}}>
                  {plan.features.map((f,fi)=>(
                    <div key={fi} style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                      <div style={{width:18,height:18,borderRadius:5,background:`${plan.color}18`,border:`1px solid ${plan.color}35`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                        <div style={{width:5,height:5,borderRadius:'50%',background:plan.color}}/>
                      </div>
                      <span style={{fontSize:13,color:'#94a3b8',lineHeight:1.5}}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={i===0?goApp:()=>alert('İletişim için: @deeptradescan')}
                  style={{width:'100%',background:plan.popular?'linear-gradient(135deg,#1d4ed8,#6d28d9)':plan.name==='ELİTE'||plan.name==='ELITE'?`linear-gradient(135deg,${plan.color}cc,${plan.color}88)`:'#0f1923',border:`1px solid ${plan.popular?'transparent':plan.name==='ELİTE'||plan.name==='ELITE'?plan.color+'60':'#1e293b'}`,borderRadius:12,padding:'14px',color:plan.popular||plan.name==='ELİTE'||plan.name==='ELITE'?'#fff':'#475569',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",transition:'all 0.2s'}}>
                  {i===0?`→ ${L.cta}`:`→ ${plan.name} Seç`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{padding:'100px 5%',background:'#030711',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:700,height:400,background:'radial-gradient(ellipse,rgba(29,78,216,0.08),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{maxWidth:700,margin:'0 auto',textAlign:'center',position:'relative',zIndex:1}} className="cta-section">
          <div style={{fontSize:11,color:'#3b82f6',letterSpacing:4,fontWeight:700,marginBottom:20}}>CHARTOS APEX 4.0</div>
          <h2 style={{fontSize:'clamp(28px,5vw,52px)',fontWeight:800,letterSpacing:'-1.5px',marginBottom:20,lineHeight:1.1}}>{L.ctaTitle}</h2>
          <p style={{fontSize:16,color:'#64748b',lineHeight:1.7,marginBottom:36}}>{L.ctaDesc}</p>
          <div style={{display:'flex',justifyContent:'center',gap:12,flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={goApp} style={{fontSize:15,padding:'16px 36px'}}>
              ⚡ {L.ctaBtn}
            </button>
            <a href="https://t.me/deeptradescan" target="_blank" className="btn-ghost" style={{display:'inline-flex',alignItems:'center',gap:8,textDecoration:'none',fontSize:14,padding:'15px 24px'}}>
              ✈️ Telegram
            </a>
          </div>
          <div style={{marginTop:20,fontSize:12,color:'#1e293b'}}>{L.ctaSub}</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid #0a0f1a',padding:'32px 5%'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#0f1f3d,#1a3a6a)',border:'1px solid rgba(59,130,246,0.2)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <img src="/logo.webp" style={{width:26,height:26,objectFit:'cover',borderRadius:6}} alt="DTS" onError={e=>e.target.style.display='none'}/>
            </div>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:1}}>DEEP TRADE SCAN</div>
          </div>
          <div style={{fontSize:11,color:'#1e293b',textAlign:'center'}}>⚠️ {L.footer}</div>
          <div style={{display:'flex',gap:16}}>
            <a href="https://t.me/deeptradescan" target="_blank" style={{fontSize:12,color:'#334155',textDecoration:'none'}}>Telegram</a>
            <a href="/app" style={{fontSize:12,color:'#334155',textDecoration:'none'}}>Analiz</a>
          </div>
        </div>
      </footer>
    </>
  );
}
