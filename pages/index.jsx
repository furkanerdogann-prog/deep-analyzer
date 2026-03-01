import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import SupportWidget from '../components/SupportWidget';

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

      {/* HOW IT WORKS — kurumsal MM analiz görünümü */}
      <section id="how" style={{padding:'110px 5%',borderTop:'1px solid #080e18',background:'#030711',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'5%',width:400,height:400,background:'radial-gradient(ellipse,rgba(109,40,217,0.05),transparent 70%)',pointerEvents:'none'}}/>

        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:70}}>
            <div style={{fontSize:10,color:'#3b82f6',letterSpacing:5,fontWeight:700,marginBottom:14}}>{L.howTitle}</div>
            <h2 style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:800,letterSpacing:'-1.5px',marginBottom:14}}>
              Market Maker <span style={{background:'linear-gradient(135deg,#3b82f6,#a855f7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Algoritması</span> Nasıl Çalışır?
            </h2>
            <p style={{fontSize:14,color:'#475569',maxWidth:560,margin:'0 auto',lineHeight:1.7}}>CHARTOS APEX 4.0, kurumsal oyuncuların bıraktığı ayak izlerini 10 katmanlı analiz motoru ile gerçek zamanlı tespit eder</p>
          </div>

          {/* STEP 1 — büyük görsel blok */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'center',marginBottom:20}}>
            <div style={{background:'#08111e',border:'1px solid #0f1923',borderRadius:20,padding:32,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#3b82f6,#6d28d9)'}}/>
              <div style={{fontSize:10,color:'#334155',letterSpacing:3,fontWeight:700,marginBottom:20}}>ADIM 01 — GİRİŞ NOKTASI</div>

              {/* Coin seçim mockup */}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
                {['BTC','ETH','SOL','BNB','XRP','ARB'].map((c,i)=>(
                  <div key={i} style={{padding:'7px 14px',background:c==='BTC'?'rgba(59,130,246,0.15)':'#04080f',border:`1px solid ${c==='BTC'?'rgba(59,130,246,0.4)':'#0f1923'}`,borderRadius:8,fontSize:11,fontWeight:700,color:c==='BTC'?'#60a5fa':'#334155',fontFamily:"'JetBrains Mono',monospace"}}>
                    {c}
                  </div>
                ))}
              </div>

              {/* Price ticker */}
              <div style={{background:'#04080f',borderRadius:12,padding:'16px 20px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:11,color:'#334155',letterSpacing:2,marginBottom:4}}>BTC/USDT</div>
                  <div style={{fontSize:28,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:'#f1f5f9'}}>$94,820</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,color:'#10b981',fontWeight:700}}>▲ +2.34%</div>
                  <div style={{fontSize:10,color:'#334155',marginTop:4}}>24H VOLUME: $42.1B</div>
                </div>
              </div>

              {/* HTF bias bar */}
              <div style={{display:'flex',gap:8}}>
                {[['1H','LONG','#10b981'],['4H','LONG','#10b981'],['1D','NEUTRAL','#f59e0b'],['1W','LONG','#10b981']].map(([tf,bias,c])=>(
                  <div key={tf} style={{flex:1,background:'#04080f',border:`1px solid ${c}20`,borderRadius:8,padding:'8px',textAlign:'center'}}>
                    <div style={{fontSize:9,color:'#334155',marginBottom:3}}>{tf}</div>
                    <div style={{fontSize:10,fontWeight:700,color:c}}>{bias}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{padding:'0 16px'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:8,padding:'6px 14px',marginBottom:20}}>
                <span style={{fontSize:10,color:'#3b82f6',fontWeight:700,letterSpacing:2}}>STEP 01</span>
              </div>
              <h3 style={{fontSize:'clamp(22px,3vw,32px)',fontWeight:800,letterSpacing:'-0.5px',marginBottom:14,lineHeight:1.2}}>Varlık Seç,<br/>Piyasayı İzle</h3>
              <p style={{fontSize:14,color:'#64748b',lineHeight:1.8,marginBottom:24}}>200+ kripto varlık arasından seçim yapın. Sistem anlık fiyat, hacim ve çoklu zaman dilimi HTF bias verilerini otomatik olarak çeker.</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {['200+ desteklenen coin','Gerçek zamanlı fiyat akışı','HTF Bias: 1H / 4H / 1D / 1W','Otomatik veri senkronizasyonu'].map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:5,height:5,borderRadius:'50%',background:'#3b82f6',flexShrink:0}}/>
                    <span style={{fontSize:13,color:'#475569'}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2 — MM algoritması */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'center',marginBottom:20}}>
            <div style={{padding:'0 16px',order:1}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(168,85,247,0.08)',border:'1px solid rgba(168,85,247,0.2)',borderRadius:8,padding:'6px 14px',marginBottom:20}}>
                <span style={{fontSize:10,color:'#a855f7',fontWeight:700,letterSpacing:2}}>STEP 02</span>
              </div>
              <h3 style={{fontSize:'clamp(22px,3vw,32px)',fontWeight:800,letterSpacing:'-0.5px',marginBottom:14,lineHeight:1.2}}>Market Maker<br/>Algoritması Devrede</h3>
              <p style={{fontSize:14,color:'#64748b',lineHeight:1.8,marginBottom:24}}>10 katmanlı APEX engine, kurumsal oyuncuların bıraktığı ayak izlerini tespit eder. Order Block, FVG, Liquidity Sweep ve Phase analizi eş zamanlı çalışır.</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {['Phase A-B-C-D Market Maker döngüsü','Unmitigated Order Block tespiti','Fair Value Gap dolum analizi','Liquidity Pool & Stop Hunt haritası','On-chain whale wallet tracking'].map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:5,height:5,borderRadius:'50%',background:'#a855f7',flexShrink:0}}/>
                    <span style={{fontSize:13,color:'#475569'}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:'#08111e',border:'1px solid #0f1923',borderRadius:20,padding:28,position:'relative',overflow:'hidden',order:2}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#a855f7,#6d28d9)'}}/>
              <div style={{fontSize:10,color:'#334155',letterSpacing:3,fontWeight:700,marginBottom:18}}>ADIM 02 — MM ANALİZİ</div>

              {/* Phase göstergesi */}
              <div style={{display:'flex',gap:6,marginBottom:18}}>
                {[['A','ACCUMULATION','#ef4444'],['B','MANIPULATION','#f59e0b'],['C','DISTRIBUTION','#a855f7'],['D','MARKUP','#10b981']].map(([p,label,c],i)=>(
                  <div key={i} style={{flex:1,background:p==='B'?`${c}18`:'#04080f',border:`1px solid ${p==='B'?c+'40':'#0f1923'}`,borderRadius:8,padding:'8px 4px',textAlign:'center'}}>
                    <div style={{fontSize:14,fontWeight:800,color:p==='B'?c:'#334155',fontFamily:"'JetBrains Mono',monospace"}}>{p}</div>
                    <div style={{fontSize:7,color:p==='B'?c:'#1e293b',marginTop:2,letterSpacing:0.5}}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Detay listesi */}
              {[
                {label:'Order Block',value:'$93,200 — $94,100',color:'#10b981',status:'UNMITIGATED'},
                {label:'Fair Value Gap',value:'$95,400 — $96,800',color:'#f59e0b',status:'OPEN'},
                {label:'Liquidity Pool',value:'$91,500 (BSL)',color:'#ef4444',status:'AKTIF'},
                {label:'HTF Structure',value:'BOS → Bullish',color:'#3b82f6',status:'CONFIRMED'},
                {label:'Whale Flow',value:'$2.4B Net Buy',color:'#a855f7',status:'7 GÜN'},
              ].map((row,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',background:'#04080f',borderRadius:8,marginBottom:5}}>
                  <div>
                    <div style={{fontSize:10,color:'#475569',fontWeight:600}}>{row.label}</div>
                    <div style={{fontSize:11,color:row.color,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{row.value}</div>
                  </div>
                  <div style={{fontSize:8,color:row.color,background:`${row.color}15`,border:`1px solid ${row.color}30`,borderRadius:4,padding:'2px 7px',fontWeight:700,letterSpacing:0.5}}>{row.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3 — sinyal */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'center'}}>
            <div style={{background:'#08111e',border:'1px solid rgba(16,185,129,0.2)',borderRadius:20,padding:28,position:'relative',overflow:'hidden',boxShadow:'0 0 40px rgba(16,185,129,0.05)'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#10b981,#3b82f6)'}}/>
              <div style={{fontSize:10,color:'#334155',letterSpacing:3,fontWeight:700,marginBottom:18}}>ADIM 03 — SINYAL ÇIKTISI</div>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                <div>
                  <div style={{fontSize:20,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>BTC/USDT</div>
                  <div style={{fontSize:11,color:'#10b981',fontWeight:700,marginTop:2}}>⬆ LONG — YÜKSEK KONFİDANS</div>
                </div>
                <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:10,padding:'10px 16px',textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:800,color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>1:3.8</div>
                  <div style={{fontSize:8,color:'#475569',letterSpacing:1}}>R:R ORANI</div>
                </div>
              </div>

              {[
                {l:'GİRİŞ BÖLGESİ',v:'$93.800 — $94.200',c:'#10b981'},
                {l:'STOP LOSS',v:'$91.500',c:'#ef4444'},
                {l:'HEDEF 1',v:'$98.500 (+4.6%)',c:'#06b6d4'},
                {l:'HEDEF 2',v:'$102.300 (+8.5%)',c:'#3b82f6'},
                {l:'HEDEF 3',v:'$107.000 (+13.5%)',c:'#a855f7'},
              ].map((r,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 12px',background:`rgba(${r.c==='#10b981'?'16,185,129':r.c==='#ef4444'?'239,68,68':'59,130,246'},0.04)`,borderRadius:8,marginBottom:5,borderLeft:`2px solid ${r.c}40`}}>
                  <span style={{fontSize:10,color:'#475569',fontWeight:600,letterSpacing:0.5}}>{r.l}</span>
                  <span style={{fontSize:12,fontWeight:700,color:r.c,fontFamily:"'JetBrains Mono',monospace"}}>{r.v}</span>
                </div>
              ))}

              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginTop:14}}>
                {[['EDGE','94.2','#a855f7'],['WIN RATE','%87.4','#f59e0b'],['LEVERAGE','5x MAX','#06b6d4']].map(([l,v,c])=>(
                  <div key={l} style={{background:'#04080f',borderRadius:8,padding:'9px',textAlign:'center'}}>
                    <div style={{fontSize:14,fontWeight:800,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
                    <div style={{fontSize:8,color:'#334155',marginTop:2,letterSpacing:1}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{padding:'0 16px'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,padding:'6px 14px',marginBottom:20}}>
                <span style={{fontSize:10,color:'#10b981',fontWeight:700,letterSpacing:2}}>STEP 03</span>
              </div>
              <h3 style={{fontSize:'clamp(22px,3vw,32px)',fontWeight:800,letterSpacing:'-0.5px',marginBottom:14,lineHeight:1.2}}>Kurumsal Sinyal,<br/>Anında Telegram'da</h3>
              <p style={{fontSize:14,color:'#64748b',lineHeight:1.8,marginBottom:24}}>Giriş bölgesi, stop loss ve 3 kademeli hedef ile tam R:R hesaplı profesyonel sinyal otomatik olarak Telegram kanalına iletilir.</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {['Giriş, Stop ve 3 Hedef seviyesi','Risk/Reward oranı hesaplı','Max kaldıraç önerisi','Otomatik Telegram bildirimi','Backtested Win Rate & Edge Skoru'].map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:5,height:5,borderRadius:'50%',background:'#10b981',flexShrink:0}}/>
                    <span style={{fontSize:13,color:'#475569'}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — elit kurumsal teknoloji showcase */}
      <section id="features" style={{padding:'120px 5%',background:'#020509',position:'relative',overflow:'hidden'}}>
        {/* Arka plan efektleri */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(168,85,247,0.4),transparent)'}}/>
        <div style={{position:'absolute',top:'30%',left:'-5%',width:500,height:500,background:'radial-gradient(ellipse,rgba(168,85,247,0.04),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'20%',right:'-5%',width:400,height:400,background:'radial-gradient(ellipse,rgba(59,130,246,0.05),transparent 70%)',pointerEvents:'none'}}/>

        <div style={{maxWidth:1200,margin:'0 auto'}}>
          {/* Başlık */}
          <div style={{display:'grid',gridTemplateColumns:'1fr auto',alignItems:'flex-end',marginBottom:70,gap:24}}>
            <div>
              <div style={{fontSize:10,color:'#a855f7',letterSpacing:5,fontWeight:700,marginBottom:14}}>{L.featTitle}</div>
              <h2 style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:800,letterSpacing:'-2px',lineHeight:1,marginBottom:16}}>
                CHARTOS <span style={{background:'linear-gradient(135deg,#a855f7,#6d28d9)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>APEX</span> 4.0
              </h2>
              <p style={{fontSize:15,color:'#475569',maxWidth:520,lineHeight:1.7}}>
                2026 yılının en gelişmiş Market Maker algoritması. Kurumsal oyuncuların her hamlesini 10 katmanlı analiz motoru ile saniyeler içinde tespit eder.
              </p>
            </div>
            <div style={{background:'#080f1a',border:'1px solid rgba(168,85,247,0.2)',borderRadius:14,padding:'16px 24px',textAlign:'center',flexShrink:0}}>
              <div style={{fontSize:32,fontWeight:800,color:'#a855f7',fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>10</div>
              <div style={{fontSize:9,color:'#475569',letterSpacing:2,marginTop:4}}>ANALİZ KATMANI</div>
            </div>
          </div>

          {/* Büyük featured kart — Market Maker */}
          <div style={{background:'#08111e',border:'1px solid rgba(168,85,247,0.15)',borderRadius:24,padding:40,marginBottom:16,position:'relative',overflow:'hidden',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#a855f7,#6d28d9,transparent)'}}/>
            <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,background:'radial-gradient(ellipse,rgba(168,85,247,0.08),transparent 70%)',pointerEvents:'none'}}/>

            <div>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(168,85,247,0.1)',border:'1px solid rgba(168,85,247,0.25)',borderRadius:8,padding:'5px 14px',marginBottom:20}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#a855f7',boxShadow:'0 0 8px #a855f7'}}/>
                <span style={{fontSize:9,color:'#a855f7',fontWeight:700,letterSpacing:2}}>CORE ENGINE</span>
              </div>
              <h3 style={{fontSize:'clamp(22px,3vw,32px)',fontWeight:800,letterSpacing:'-0.5px',marginBottom:16,lineHeight:1.2}}>Market Maker<br/>Algoritması</h3>
              <p style={{fontSize:14,color:'#64748b',lineHeight:1.8,marginBottom:24}}>Phase A-B-C-D döngüsünü takip eden kurumsal manipülasyon tespit motoru. Weak hand liquidation, stop hunt ve accumulation/distribution fazlarını gerçek zamanlı analiz eder.</p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {['Phase A–D Motor','Stop Hunt Tespiti','Weak Hand Liquidation','Accumulation/Distribution'].map((t,i)=>(
                  <div key={i} style={{background:'rgba(168,85,247,0.08)',border:'1px solid rgba(168,85,247,0.15)',borderRadius:6,padding:'5px 12px',fontSize:11,color:'#c084fc',fontWeight:600}}>{t}</div>
                ))}
              </div>
            </div>

            {/* Phase diagram */}
            <div>
              <div style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:700,marginBottom:16}}>MM PHASE DÖNGÜSÜ</div>
              <div style={{display:'flex',gap:3,marginBottom:20,alignItems:'stretch'}}>
                {[
                  {p:'A',l:'ACCUMULATION',c:'#3b82f6',h:60,d:'Kurumsal alım'},
                  {p:'B',l:'MANIPULATION',c:'#f59e0b',h:80,d:'Stop hunt'},
                  {p:'C',l:'DISTRIBUTION',c:'#a855f7',h:50,d:'Fiyat baskısı'},
                  {p:'D',l:'MARKUP',c:'#10b981',h:100,d:'Fiyat yükselişi'},
                ].map((ph,i)=>(
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                    <div style={{fontSize:8,color:'#334155',letterSpacing:1,textAlign:'center',height:28,display:'flex',alignItems:'flex-end'}}>{ph.d}</div>
                    <div style={{width:'100%',height:ph.h,background:`linear-gradient(180deg,${ph.c}40,${ph.c}15)`,border:`1px solid ${ph.c}40`,borderRadius:'6px 6px 0 0',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'40%',background:`linear-gradient(0deg,${ph.c}30,transparent)`}}/>
                      <span style={{fontSize:16,fontWeight:800,color:ph.c,fontFamily:"'JetBrains Mono',monospace",zIndex:1}}>{ph.p}</span>
                    </div>
                    <div style={{fontSize:7,color:ph.c,letterSpacing:0.5,fontWeight:700,textAlign:'center'}}>{ph.l}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'#04080f',borderRadius:10,padding:'12px 16px'}}>
                <div style={{fontSize:10,color:'#334155',marginBottom:8,letterSpacing:1}}>MEVCUT DURUM</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontSize:13,color:'#f59e0b',fontWeight:700}}>Phase B — Manipulation</div>
                  <div style={{fontSize:11,color:'#10b981',fontWeight:600}}>Next: Phase C →</div>
                </div>
                <div style={{marginTop:8,height:3,background:'#0f1923',borderRadius:2}}>
                  <div style={{width:'60%',height:'100%',background:'linear-gradient(90deg,#3b82f6,#f59e0b)',borderRadius:2}}/>
                </div>
              </div>
            </div>
          </div>

          {/* 3 orta kart */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:16}}>
            {[
              {
                badge:'ICT METHODOLOGY',badgeColor:'#06b6d4',
                title:'ICT + Wyckoff Füzyon',
                desc:'Silver Bullet, Judas Swing, Turtle Soup Pro ve Wyckoff Spring/Upthrust gerçek zamanlı. OTE bölgesi ve Breaker Block otomatik tespit.',
                metrics:[{l:'Silver Bullet',v:'07:00–08:00'},{ l:'Judas Swing',v:'%87 doğruluk'},{l:'Spring/Upthrust',v:'4H+'}],
                color:'#06b6d4',
              },
              {
                badge:'ON-CHAIN DATA',badgeColor:'#10b981',
                title:'On-Chain Entegrasyon',
                desc:'SOPR, MVRV-Z, Puell Multiple, exchange inflow/outflow ve whale wallet hareketleri gerçek zamanlı veri akışı.',
                metrics:[{l:'MVRV-Z',v:'2.34 (Nötr)'},{l:'Exchange Flow',v:'-$2.1B'},{l:'Whale Txn',v:'$500M+'}],
                color:'#10b981',
              },
              {
                badge:'QUANTITATIVE',badgeColor:'#f59e0b',
                title:'Quantitative Edge',
                desc:'Backtested winrate, expectancy, Sharpe ratio ve max drawdown hesaplama. Kanıtlanmış istatistiksel üstünlük.',
                metrics:[{l:'Win Rate',v:'%87.4'},{l:'Sharpe Ratio',v:'2.84'},{l:'Max DD',v:'%12.3'}],
                color:'#f59e0b',
              },
            ].map((card,i)=>(
              <div key={i} style={{background:'#08111e',border:`1px solid ${card.color}18`,borderRadius:18,padding:24,position:'relative',overflow:'hidden',transition:'all 0.3s'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${card.color},transparent)`}}/>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,background:`${card.color}10`,border:`1px solid ${card.color}25`,borderRadius:6,padding:'4px 10px',marginBottom:16}}>
                  <span style={{fontSize:8,color:card.color,fontWeight:700,letterSpacing:1.5}}>{card.badge}</span>
                </div>
                <div style={{fontSize:16,fontWeight:700,color:'#f1f5f9',marginBottom:10,letterSpacing:'-0.3px'}}>{card.title}</div>
                <div style={{fontSize:12,color:'#475569',lineHeight:1.7,marginBottom:18}}>{card.desc}</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {card.metrics.map((m,j)=>(
                    <div key={j} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 10px',background:'#04080f',borderRadius:7}}>
                      <span style={{fontSize:10,color:'#475569'}}>{m.l}</span>
                      <span style={{fontSize:11,fontWeight:700,color:card.color,fontFamily:"'JetBrains Mono',monospace"}}>{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Alt 2 kart */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[
              {
                badge:'TELEGRAM AUTOMATION',badgeColor:'#3b82f6',
                title:'Otomatik Sinyal Dağıtımı',
                desc:'Her analiz tamamlandığında kurumsal format ile Telegram kanalına iletilir. Giriş, stop, 3 hedef ve R:R oranı otomatik hesaplı.',
                tags:['Anlık Bildirim','Kanal Otomasyonu','Format Şablonu','IFTTT Entegrasyonu'],
                color:'#3b82f6',
                stat:{l:'Ortalama İletim',v:'< 2sn'},
              },
              {
                badge:'RISK MANAGEMENT',badgeColor:'#ef4444',
                title:'Kurumsal Risk Yönetimi',
                desc:'Position sizing, max kaldıraç hesaplama, Kelly Criterion ve correlated risk analizi. Portföyünüzü kurumsal standartlarda koruyun.',
                tags:['Kelly Criterion','Correlated Risk','Max Drawdown','Position Sizing'],
                color:'#ef4444',
                stat:{l:'Risk/Reward Minimum',v:'1:2.5'},
              },
            ].map((card,i)=>(
              <div key={i} style={{background:'#08111e',border:`1px solid ${card.color}18`,borderRadius:18,padding:28,position:'relative',overflow:'hidden',display:'flex',gap:24,alignItems:'flex-start'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${card.color},transparent)`}}/>
                <div style={{flex:1}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,background:`${card.color}10`,border:`1px solid ${card.color}25`,borderRadius:6,padding:'4px 10px',marginBottom:16}}>
                    <span style={{fontSize:8,color:card.color,fontWeight:700,letterSpacing:1.5}}>{card.badge}</span>
                  </div>
                  <div style={{fontSize:18,fontWeight:700,color:'#f1f5f9',marginBottom:10,letterSpacing:'-0.3px'}}>{card.title}</div>
                  <div style={{fontSize:13,color:'#475569',lineHeight:1.7,marginBottom:18}}>{card.desc}</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {card.tags.map((t,j)=>(
                      <div key={j} style={{background:`${card.color}08`,border:`1px solid ${card.color}20`,borderRadius:6,padding:'4px 10px',fontSize:11,color:card.color,fontWeight:600}}>{t}</div>
                    ))}
                  </div>
                </div>
                <div style={{background:'#04080f',border:`1px solid ${card.color}20`,borderRadius:12,padding:'16px 20px',textAlign:'center',flexShrink:0,minWidth:110}}>
                  <div style={{fontSize:11,color:'#334155',letterSpacing:1,marginBottom:8}}>{card.stat.l}</div>
                  <div style={{fontSize:18,fontWeight:800,color:card.color,fontFamily:"'JetBrains Mono',monospace"}}>{card.stat.v}</div>
                </div>
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

      {/* CANLI DESTEK — her sayfada */}
      <SupportWidget session={null} />
    </>
  );
}
