import { useState, useEffect } from 'react';
import Head from 'next/head';

const LANGS = {
  TR: { flag:'🇹🇷', label:'Türkçe', hero1:'YAPAY ZEKA', hero2:'KRİPTO ANALİZİ', sub:'CHARTOS Engine ile 200+ coin için Smart Money Concepts, Wyckoff ve ICT metodolojilerini kullanan kurumsal düzeyde yapay zeka analizi.', cta:'Ücretsiz Analiz Yap', tg:'Telegram Kanalı', f1:'Özellikler', f2:'Nasıl Çalışır', f3:'Fiyatlar', statA:'ANALİZ YAPILDI', statB:'COIN DESTEKLENİYOR', statC:'AKTİF KULLANICI', statD:'ANALİZ KATMANI', featTitle:'7 KATMAN ANALİZ', featSub:'Her analiz yedi farklı metodoloji katmanından geçer. Kurumsal alıcıların kullandığı aynı framework.', howTitle:'3 ADIMDA ANALİZ', howSub:'Dakikalar içinde kurumsal kalite analiz alın.', pricingTitle:'PLAN SEÇİN', pricingSub:'Ücretsiz başlayın. Gizli ücret yok.', ctaTitle:'YAPAY ZEKAYA GEÇ', ctaSub:'200+ coin için CHARTOS analizi. Ücretsiz başla.', disclaimer:'Kripto yatırımları risk içerir. CHARTOS sinyalleri finansal tavsiye değildir.' },
  EN: { flag:'🇬🇧', label:'English', hero1:'AI-POWERED', hero2:'CRYPTO ANALYSIS', sub:'Institutional-grade AI analysis for 200+ coins using Smart Money Concepts, Wyckoff and ICT methodologies with CHARTOS Engine.', cta:'Free Analysis', tg:'Telegram Channel', f1:'Features', f2:'How It Works', f3:'Pricing', statA:'ANALYSES DONE', statB:'COINS SUPPORTED', statC:'ACTIVE USERS', statD:'ANALYSIS LAYERS', featTitle:'7-LAYER ANALYSIS', featSub:'Every analysis passes through seven different methodology layers. The same framework used by institutional traders.', howTitle:'3-STEP ANALYSIS', howSub:'Get institutional quality analysis in minutes.', pricingTitle:'CHOOSE A PLAN', pricingSub:'Start free. No hidden fees.', ctaTitle:'GO AI MODE', ctaSub:'CHARTOS analysis for 200+ coins. Start free.', disclaimer:'Crypto investments carry risk. CHARTOS signals are not financial advice.' },
  DE: { flag:'🇩🇪', label:'Deutsch', hero1:'KI-GESTÜTZTE', hero2:'KRYPTO-ANALYSE', sub:'Institutionelle KI-Analyse für 200+ Coins mit Smart Money Concepts, Wyckoff und ICT Methoden über CHARTOS Engine.', cta:'Kostenlose Analyse', tg:'Telegram Kanal', f1:'Funktionen', f2:'Wie es Funktioniert', f3:'Preise', statA:'ANALYSEN DURCHGEFÜHRT', statB:'COINS UNTERSTÜTZT', statC:'AKTIVE NUTZER', statD:'ANALYSE-SCHICHTEN', featTitle:'7-SCHICHTEN ANALYSE', featSub:'Jede Analyse durchläuft sieben verschiedene Methodologieschichten.', howTitle:'3-SCHRITT ANALYSE', howSub:'Erhalten Sie in Minuten institutionelle Qualitätsanalysen.', pricingTitle:'PLAN WÄHLEN', pricingSub:'Kostenlos starten. Keine versteckten Gebühren.', ctaTitle:'KI-MODUS AKTIVIEREN', ctaSub:'CHARTOS-Analyse für 200+ Coins. Kostenlos starten.', disclaimer:'Krypto-Investitionen sind risikobehaftet. CHARTOS-Signale sind keine Finanzberatung.' },
  FR: { flag:'🇫🇷', label:'Français', hero1:'ANALYSE CRYPTO', hero2:'PROPULSÉE PAR IA', sub:"Analyse IA institutionnelle pour 200+ cryptos avec Smart Money Concepts, Wyckoff et méthodologies ICT via CHARTOS Engine.", cta:'Analyse Gratuite', tg:'Canal Telegram', f1:'Fonctionnalités', f2:'Comment ça Marche', f3:'Tarifs', statA:'ANALYSES EFFECTUÉES', statB:'COINS SUPPORTÉS', statC:'UTILISATEURS ACTIFS', statD:'COUCHES D\'ANALYSE', featTitle:'ANALYSE 7 COUCHES', featSub:'Chaque analyse passe par sept couches de méthodologie différentes.', howTitle:'ANALYSE EN 3 ÉTAPES', howSub:"Obtenez une analyse de qualité institutionnelle en quelques minutes.", pricingTitle:'CHOISIR UN PLAN', pricingSub:'Commencez gratuitement. Pas de frais cachés.', ctaTitle:"ACTIVER L'IA", ctaSub:'Analyse CHARTOS pour 200+ coins. Commencez gratuitement.', disclaimer:"Les investissements crypto comportent des risques. Les signaux CHARTOS ne sont pas des conseils financiers." },
};

export default function Landing() {
  const [market, setMarket] = useState(null);
  const [fg, setFg] = useState(null);
  const [count, setCount] = useState({analyses:0, users:0});
  const [lang, setLang] = useState('TR');
  const [showLang, setShowLang] = useState(false);

  const T = LANGS[lang];

  useEffect(() => {
    const saved = typeof window!=='undefined' ? localStorage.getItem('dts_lang') : null;
    if (saved && LANGS[saved]) setLang(saved);
    fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()).then(d=>setMarket(d.data)).catch(()=>{});
    fetch('https://api.alternative.me/fng/?limit=1').then(r=>r.json()).then(d=>setFg(d.data?.[0])).catch(()=>{});
    let a=0,u=0;
    const timer=setInterval(()=>{a=Math.min(a+215,12847);u=Math.min(u+54,3200);setCount({analyses:a,users:u});if(a>=12847&&u>=3200)clearInterval(timer);},16);
    return()=>clearInterval(timer);
  }, []);

  function changeLang(code) {
    setLang(code);
    setShowLang(false);
    if (typeof window!=='undefined') localStorage.setItem('dts_lang', code);
  }

  const fmtB=n=>n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:'...';
  const fgColor=v=>v<25?'#ef4444':v<45?'#f97316':v<55?'#f59e0b':v<75?'#22c55e':'#00d4aa';
  const fgText=v=>v<25?'Aşırı Korku':v<45?'Korku':v<55?'Nötr':v<75?'Açgözlülük':'Aşırı Açgözlülük';

  const features = {
    TR:[['🧠','Smart Money Concepts','Order block, Fair Value Gap, liquidity sweep ve market structure shift otomatik tespit.'],['📊','Wyckoff Metodolojisi','Accumulation ve distribution fazları, spring ve upthrust noktaları.'],['🎯','ICT Konseptleri','Optimal Trade Entry, Breaker Block ve Mitigation Block gerçek zamanlı.'],['🔗','On-Chain Analiz','Whale hareketleri, exchange flows ve realized P/L ile sinyal doğrulama.'],['⚡','Manipülasyon Tespiti','Stop hunt, liquidity grab ve wash trading örüntülerini önceden gösterir.'],['📱','Telegram Sinyalleri','Her analiz otomatik Telegram kanalına gönderilir.']],
    EN:[['🧠','Smart Money Concepts','Automatic detection of order blocks, Fair Value Gaps, liquidity sweeps.'],['📊','Wyckoff Methodology','Accumulation and distribution phases, spring and upthrust points.'],['🎯','ICT Concepts','Optimal Trade Entry, Breaker Block and Mitigation Block in real time.'],['🔗','On-Chain Analysis','Whale movements, exchange flows and realized P/L for signal confirmation.'],['⚡','Manipulation Detection','Detects stop hunts, liquidity grabs and wash trading patterns.'],['📱','Telegram Signals','Every analysis is automatically sent to Telegram channel.']],
    DE:[['🧠','Smart Money Concepts','Automatische Erkennung von Order Blocks, Fair Value Gaps, Liquiditätssweeps.'],['📊','Wyckoff-Methodik','Akkumulations- und Distributionsphasen, Spring- und Upthrust-Punkte.'],['🎯','ICT-Konzepte','Optimaler Trade-Einstieg, Breaker Block und Mitigation Block in Echtzeit.'],['🔗','On-Chain-Analyse','Whale-Bewegungen, Exchange-Flows für Signalbestätigung.'],['⚡','Manipulationserkennung','Erkennt Stop-Hunts, Liquiditäts-Grabs und Wash-Trading-Muster.'],['📱','Telegram-Signale','Jede Analyse wird automatisch an den Telegram-Kanal gesendet.']],
    FR:[['🧠','Smart Money Concepts','Détection automatique des blocs d\'ordres, Fair Value Gaps, balayages de liquidité.'],['📊','Méthodologie Wyckoff','Phases d\'accumulation et de distribution, points spring et upthrust.'],['🎯','Concepts ICT','Entrée Optimale, Breaker Block et Mitigation Block en temps réel.'],['🔗','Analyse On-Chain','Mouvements des baleines, flux d\'échanges pour confirmation de signal.'],['⚡','Détection de Manipulation','Détecte les stop hunts, liquidity grabs et wash trading.'],['📱','Signaux Telegram','Chaque analyse est envoyée automatiquement au canal Telegram.']],
  };

  const steps = {
    TR:[['01','Coin Seç','200+ coin arasından analiz etmek istediğinizi seçin.'],['02','AI Analiz Et','7 katmanlı yapay zeka engine saniyeler içinde analizi tamamlar.'],['03','Sinyal Al','Giriş, stop ve hedeflerle Telegram\'a otomatik gönderilir.']],
    EN:[['01','Select Coin','Choose from 200+ coins to analyze.'],['02','AI Analyzes','7-layer AI engine completes analysis in seconds.'],['03','Get Signal','Entry, stop and targets automatically sent to Telegram.']],
    DE:[['01','Coin Wählen','Wählen Sie aus 200+ Coins zum Analysieren.'],['02','KI Analysiert','7-Schichten KI-Engine schließt die Analyse in Sekunden ab.'],['03','Signal Erhalten','Einstieg, Stop und Ziele automatisch an Telegram gesendet.']],
    FR:[['01','Choisir Coin','Choisissez parmi 200+ coins à analyser.'],['02','IA Analyse','Le moteur IA à 7 couches termine l\'analyse en secondes.'],['03','Recevoir Signal','Entrée, stop et objectifs envoyés automatiquement à Telegram.']],
  };

  const plans = {
    TR:[{name:'BAŞLANGIÇ',price:'$0',period:'/ ay',features:['Günde 5 analiz','200+ coin','Telegram sinyalleri','TradingView grafik'],btn:'Ücretsiz Başla',primary:false},{name:'PRO',price:'$29',period:'/ ay',features:['Sınırsız analiz','200+ coin','Öncelikli analiz','Özel Telegram','Portföy takibi'],btn:"Pro'ya Geç",primary:true},{name:'ELİT',price:'$79',period:'/ ay',features:["Pro'daki her şey",'1:1 danışmanlık','Özel alarmlar','API erişimi','Strateji raporu'],btn:"Elit'e Geç",primary:false}],
    EN:[{name:'STARTER',price:'$0',period:'/ month',features:['5 analyses/day','200+ coins','Telegram signals','TradingView chart'],btn:'Start Free',primary:false},{name:'PRO',price:'$29',period:'/ month',features:['Unlimited analyses','200+ coins','Priority queue','Custom Telegram','Portfolio tracking'],btn:'Go Pro',primary:true},{name:'ELITE',price:'$79',period:'/ month',features:['Everything in Pro','1:1 consulting','Custom alerts','API access','Strategy report'],btn:'Go Elite',primary:false}],
    DE:[{name:'STARTER',price:'$0',period:'/ Monat',features:['5 Analysen/Tag','200+ Coins','Telegram-Signale','TradingView-Chart'],btn:'Kostenlos Starten',primary:false},{name:'PRO',price:'$29',period:'/ Monat',features:['Unbegrenzte Analysen','200+ Coins','Prioritätswarteschlange','Benutzerdefiniertes Telegram','Portfolio-Tracking'],btn:'Pro werden',primary:true},{name:'ELITE',price:'$79',period:'/ Monat',features:['Alles in Pro','1:1 Beratung','Benutzerdefinierte Alarme','API-Zugang','Strategiebericht'],btn:'Elite werden',primary:false}],
    FR:[{name:'DÉBUTANT',price:'$0',period:'/ mois',features:['5 analyses/jour','200+ coins','Signaux Telegram','Graphique TradingView'],btn:'Commencer Gratuitement',primary:false},{name:'PRO',price:'$29',period:'/ mois',features:['Analyses illimitées','200+ coins','File prioritaire','Telegram personnalisé','Suivi de portefeuille'],btn:'Passer Pro',primary:true},{name:'ÉLITE',price:'$79',period:'/ mois',features:['Tout dans Pro','Conseil 1:1','Alertes personnalisées','Accès API','Rapport stratégique'],btn:'Passer Élite',primary:false}],
  };

  const S = {
    page:{minHeight:'100vh',background:'#04070f',color:'#e2e8f0',fontFamily:"'SF Pro Display',-apple-system,system-ui,sans-serif",overflowX:'hidden'},
    nav:{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(4,7,15,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #0f1e35'},
  };

  return (
    <div style={S.page}>
      <Head><title>Deep Trade Scan — CHARTOS AI</title></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#162440;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(20px)}}
        @keyframes langDrop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .hov:hover{opacity:0.85!important;transform:translateY(-2px)!important;transition:all .2s}
        .hov2:hover{border-color:#1a6aff!important;background:rgba(26,106,255,0.05)!important;transition:all .2s}
        .card:hover{border-color:#162440!important;transform:translateY(-4px)!important;transition:all .3s}
        @media(max-width:768px){.nav-links{display:none!important}.feat-grid{grid-template-columns:1fr!important}.pricing-grid{grid-template-columns:1fr!important}.steps-grid{grid-template-columns:1fr!important}.signal-inner{grid-template-columns:1fr!important}.footer-inner{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* NAV */}
      <nav style={S.nav}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <img src="/logo.webp" style={{width:34,height:34,borderRadius:9,objectFit:'cover'}} alt="DTS"/>
          <span style={{fontSize:16,fontWeight:900,letterSpacing:2,color:'#fff'}}>DEEP TRADE SCAN</span>
        </div>
        <ul style={{display:'flex',gap:28,listStyle:'none'}} className="nav-links">
          {[[`#features`,T.f1],[`#how`,T.f2],[`#pricing`,T.f3],['https://t.me/deeptradescan','Telegram']].map(([href,text])=>(
            <li key={text}><a href={href} style={{color:'#475569',fontSize:13,fontWeight:500}}>{text}</a></li>
          ))}
        </ul>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {/* DİL SEÇİCİ */}
          <div style={{position:'relative'}}>
            <button onClick={()=>setShowLang(!showLang)} style={{background:'#0d1421',border:'1px solid #162440',borderRadius:8,padding:'7px 12px',color:'#94a3b8',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:5,cursor:'pointer'}}>
              {LANGS[lang].flag} {lang} <span style={{fontSize:9}}>▾</span>
            </button>
            {showLang&&(
              <div style={{position:'absolute',right:0,top:44,background:'#0d1421',border:'1px solid #162440',borderRadius:10,overflow:'hidden',zIndex:999,minWidth:150,animation:'langDrop .15s ease'}}>
                {Object.values(LANGS).map(l=>(
                  <button key={l.code||l.flag} onClick={()=>changeLang(Object.keys(LANGS).find(k=>LANGS[k]===l))}
                    style={{width:'100%',padding:'10px 14px',background:lang===Object.keys(LANGS).find(k=>LANGS[k]===l)?'rgba(26,106,255,0.1)':'transparent',color:'#94a3b8',fontSize:13,fontWeight:400,textAlign:'left',display:'flex',alignItems:'center',gap:8,borderBottom:'1px solid #0f1e35',cursor:'pointer'}}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:9,padding:'9px 20px',color:'#fff',fontSize:13,fontWeight:700}} className="hov">🔱 {T.cta}</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 24px 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,zIndex:0}}>
          <div style={{position:'absolute',top:'10%',left:'15%',width:500,height:500,background:'radial-gradient(ellipse,rgba(26,106,255,0.09) 0%,transparent 70%)',animation:'float 8s ease-in-out infinite'}}/>
          <div style={{position:'absolute',bottom:'5%',right:'10%',width:400,height:400,background:'radial-gradient(ellipse,rgba(124,58,237,0.07) 0%,transparent 70%)',animation:'float2 10s ease-in-out infinite'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(26,106,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,106,255,0.04) 1px,transparent 1px)',backgroundSize:'80px 80px',maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)'}}/>
        </div>
        <div style={{position:'relative',zIndex:2,maxWidth:900,width:'100%'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(26,106,255,0.1)',border:'1px solid rgba(26,106,255,0.3)',borderRadius:100,padding:'6px 18px',fontSize:11,fontWeight:600,color:'#60a5fa',letterSpacing:2,marginBottom:28}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981',animation:'pulse 2s ease infinite',display:'block'}}/>
            LIVE — 7/24
          </div>
          <div style={{marginBottom:20}}>
            <img src="/logo.webp" style={{width:90,height:90,borderRadius:20,objectFit:'cover',boxShadow:'0 0 50px rgba(26,106,255,0.3)'}} alt="DTS"/>
          </div>
          <h1 style={{fontSize:'clamp(48px,8vw,100px)',fontWeight:900,lineHeight:0.92,letterSpacing:4,marginBottom:12}}>
            <span style={{display:'block',color:'#fff'}}>{T.hero1}</span>
            <span style={{display:'block',background:'linear-gradient(135deg,#1a6aff,#06b6d4,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{T.hero2}</span>
          </h1>
          <p style={{fontSize:16,color:'#475569',lineHeight:1.7,maxWidth:560,margin:'20px auto 40px'}}>{T.sub}</p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:56}}>
            <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:13,padding:'15px 36px',color:'#fff',fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:9,boxShadow:'0 8px 32px rgba(26,106,255,0.3)'}} className="hov">🔱 {T.cta}</a>
            <a href="https://t.me/deeptradescan" style={{background:'transparent',border:'1px solid #162440',borderRadius:13,padding:'15px 36px',color:'#e2e8f0',fontSize:15,fontWeight:600,display:'flex',alignItems:'center',gap:9}} className="hov2">✈️ {T.tg}</a>
          </div>
          {/* STATS */}
          <div style={{display:'flex',maxWidth:780,margin:'0 auto',border:'1px solid #162440',borderRadius:18,overflow:'hidden',background:'#0a1220'}}>
            {[[Math.floor(count.analyses).toLocaleString('tr-TR')+'+',T.statA],['200+',T.statB],[Math.floor(count.users).toLocaleString('tr-TR')+'+',T.statC],['7',T.statD]].map(([num,label],i)=>(
              <div key={i} style={{flex:1,padding:'22px 12px',textAlign:'center',borderRight:i<3?'1px solid #0f1e35':'none'}}>
                <div style={{fontSize:32,fontWeight:900,background:'linear-gradient(135deg,#1a6aff,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{num}</div>
                <div style={{fontSize:9,color:'#475569',letterSpacing:1.5,marginTop:4}}>{label}</div>
              </div>
            ))}
          </div>
          {market&&(
            <div style={{marginTop:20,display:'flex',justifyContent:'center',gap:20,flexWrap:'wrap',fontSize:12}}>
              <span style={{color:'#334155'}}>MCap: <span style={{color:'#3b82f6',fontWeight:700}}>{fmtB(market.total_market_cap?.usd)}</span></span>
              <span style={{color:'#334155'}}>BTC: <span style={{color:'#f59e0b',fontWeight:700}}>{market.market_cap_percentage?.btc?.toFixed(1)}%</span></span>
              {fg&&<span style={{color:'#334155'}}>F&G: <span style={{color:fgColor(+fg.value),fontWeight:700}}>{fg.value}</span></span>}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:'80px 24px',maxWidth:1100,margin:'0 auto'}} id="features">
        <div style={{fontSize:10,color:'#1a6aff',letterSpacing:4,textTransform:'uppercase',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:28,height:1,background:'#1a6aff',display:'block'}}/>{T.f1}
        </div>
        <h2 style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>CHARTOS ENGINE<br/>{T.featTitle}</h2>
        <p style={{fontSize:15,color:'#475569',maxWidth:480,lineHeight:1.7,marginTop:14}}>{T.featSub}</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginTop:48}} className="feat-grid">
          {(features[lang]||features.TR).map(([icon,title,desc],i)=>(
            <div key={i} style={{background:'#0a1220',border:'1px solid #0f1e35',borderRadius:18,padding:28,transition:'all .3s'}} className="card">
              <div style={{width:44,height:44,background:'rgba(26,106,255,0.1)',border:'1px solid rgba(26,106,255,0.2)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:16}}>{icon}</div>
              <div style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:8}}>{title}</div>
              <div style={{fontSize:13,color:'#475569',lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{padding:'80px 24px',maxWidth:1100,margin:'0 auto'}} id="how">
        <div style={{fontSize:10,color:'#1a6aff',letterSpacing:4,textTransform:'uppercase',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:28,height:1,background:'#1a6aff',display:'block'}}/>{T.f2}
        </div>
        <h2 style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>{T.howTitle}</h2>
        <p style={{fontSize:15,color:'#475569',maxWidth:480,lineHeight:1.7,marginTop:14}}>{T.howSub}</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:36,marginTop:48,position:'relative'}} className="steps-grid">
          <div style={{position:'absolute',top:28,left:'16%',right:'16%',height:1,background:'linear-gradient(90deg,transparent,#162440,#162440,transparent)'}}/>
          {(steps[lang]||steps.TR).map(([num,title,desc],i)=>(
            <div key={i} style={{textAlign:'center'}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'#0a1220',border:'1px solid #162440',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:900,color:'#1a6aff',margin:'0 auto 20px',position:'relative',zIndex:1}}>{num}</div>
              <div style={{fontSize:16,fontWeight:700,color:'#fff',marginBottom:8}}>{title}</div>
              <div style={{fontSize:13,color:'#475569',lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{padding:'80px 24px',maxWidth:1100,margin:'0 auto'}} id="pricing">
        <div style={{fontSize:10,color:'#1a6aff',letterSpacing:4,textTransform:'uppercase',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:28,height:1,background:'#1a6aff',display:'block'}}/>{T.f3}
        </div>
        <h2 style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>{T.pricingTitle}</h2>
        <p style={{fontSize:15,color:'#475569',maxWidth:480,lineHeight:1.7,marginTop:14}}>{T.pricingSub}</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginTop:48}} className="pricing-grid">
          {(plans[lang]||plans.TR).map((plan,i)=>(
            <div key={i} style={{background:plan.primary?'linear-gradient(135deg,rgba(26,106,255,0.08),rgba(124,58,237,0.08))':'#0a1220',border:plan.primary?'1px solid #1a6aff':'1px solid #0f1e35',borderRadius:22,padding:'36px 28px',position:'relative',transition:'transform .3s'}} className="card">
              {plan.primary&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:100,padding:'3px 14px',fontSize:9,fontWeight:800,letterSpacing:2,color:'#fff',whiteSpace:'nowrap'}}>★ TOP</div>}
              <div style={{fontSize:11,color:'#475569',letterSpacing:3,marginBottom:14}}>{plan.name}</div>
              <div style={{fontSize:48,fontWeight:900,color:'#fff',lineHeight:1}}>{plan.price}</div>
              <div style={{fontSize:13,color:'#475569',marginBottom:28}}>{plan.period}</div>
              <ul style={{listStyle:'none',marginBottom:28}}>
                {plan.features.map((f,j)=>(
                  <li key={j} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#64748b',padding:'7px 0',borderBottom:'1px solid #0f1e35'}}>
                    <span style={{color:'#10b981'}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href={plan.primary?'https://t.me/deeptradescan':'/app'} style={{display:'block',padding:13,borderRadius:11,fontSize:14,fontWeight:700,textAlign:'center',background:plan.primary?'linear-gradient(135deg,#1a6aff,#7c3aed)':'transparent',border:plan.primary?'none':'1px solid #162440',color:'#fff'}} className="hov">{plan.btn}</a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'100px 24px',textAlign:'center',background:'radial-gradient(ellipse 60% 60% at 50% 50%,rgba(26,106,255,0.06),transparent)'}}>
        <h2 style={{fontSize:'clamp(40px,6vw,72px)',fontWeight:900,letterSpacing:3,color:'#fff',marginBottom:18,lineHeight:1}}>{T.ctaTitle}</h2>
        <p style={{fontSize:16,color:'#475569',marginBottom:40,lineHeight:1.7,maxWidth:500,margin:'0 auto 40px'}}>{T.ctaSub}</p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:13,padding:'15px 36px',color:'#fff',fontSize:15,fontWeight:700,boxShadow:'0 8px 32px rgba(26,106,255,0.3)'}} className="hov">🔱 {T.cta}</a>
          <a href="https://t.me/deeptradescan" style={{background:'transparent',border:'1px solid #162440',borderRadius:13,padding:'15px 36px',color:'#e2e8f0',fontSize:15,fontWeight:600}} className="hov2">✈️ {T.tg}</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#080e1a',borderTop:'1px solid #0f1e35',padding:'48px 24px 32px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:48,marginBottom:40}} className="footer-inner">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <img src="/logo.webp" style={{width:32,height:32,borderRadius:9,objectFit:'cover'}} alt="DTS"/>
              <span style={{fontSize:14,fontWeight:900,letterSpacing:2,color:'#fff'}}>DEEP TRADE SCAN</span>
            </div>
            <p style={{fontSize:13,color:'#475569',lineHeight:1.7,maxWidth:260}}>{T.sub}</p>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <a href="https://t.me/deeptradescan" style={{width:38,height:38,background:'#0a1220',border:'1px solid #162440',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>✈️</a>
              <a href="https://twitter.com/deeptradescan" style={{width:38,height:38,background:'#0a1220',border:'1px solid #162440',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#e2e8f0'}}>𝕏</a>
            </div>
          </div>
          {[['PLATFORM',[[T.cta,'/app'],[T.f1,'#features'],[T.f3,'#pricing'],[T.f2,'#how']]],['ANALYSIS',[['BTC','/app'],['ETH','/app'],['SOL','/app'],['Altcoin','/app']]],['COMMUNITY',[['Telegram','https://t.me/deeptradescan'],['Twitter','https://twitter.com/deeptradescan']]]].map(([title,links])=>(
            <div key={title}>
              <h4 style={{fontSize:11,fontWeight:700,color:'#fff',letterSpacing:2,marginBottom:16}}>{title}</h4>
              <ul style={{listStyle:'none'}}>
                {links.map(([text,href])=>(
                  <li key={text} style={{marginBottom:10}}>
                    <a href={href} style={{fontSize:13,color:'#475569'}}>{text}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:20,borderTop:'1px solid #0f1e35',flexWrap:'wrap',gap:8}}>
          <span style={{fontSize:12,color:'#334155'}}>© 2026 Deep Trade Scan</span>
          <span style={{fontSize:11,color:'#1e293b',textAlign:'right'}}>⚠️ {T.disclaimer}</span>
        </div>
      </footer>

      {showLang&&<div onClick={()=>setShowLang(false)} style={{position:'fixed',inset:0,zIndex:998}}/>}
    </div>
  );
}
