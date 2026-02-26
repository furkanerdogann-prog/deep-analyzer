import { useState, useEffect } from 'react';
import Head from 'next/head';

const T = {
  TR:{ flag:'🇹🇷', color:'#ef4444', hero1:'YAPAY ZEKA', hero2:'KRİPTO ANALİZİ', sub:'CHARTOS Engine ile 200+ coin için Smart Money Concepts, Wyckoff ve ICT metodolojilerini kullanan kurumsal düzeyde yapay zeka analizi.', cta:'Ücretsiz Analiz Yap', tg:'Telegram Kanalı', f1:'Özellikler', f2:'Nasıl Çalışır', f3:'Fiyatlar', statA:'ANALİZ', statB:'COİN', statC:'KULLANICI', statD:'KATMAN', step1:'Coin Seç', step1d:'200+ coin arasından seçin.', step2:'AI Analiz Et', step2d:'7 katmanlı engine saniyeler içinde tamamlar.', step3:'Sinyal Al', step3d:"Giriş, stop ve hedefler Telegram'a gönderilir.", pTitle:'PLAN SEÇİN', free:'Ücretsiz Başla', pro:'Pro\'ya Geç', elite:'Elite\'ye Geç', perMonth:'/ay', forever:'Sonsuza kadar ücretsiz', ctaTitle:'YAPAY ZEKAYA GEÇ', ctaSub:'200+ coin için CHARTOS analizi.', disc:'Kripto yatırımları risk içerir. Finansal tavsiye değildir.',
    feats:[['🧠','Smart Money Concepts','Order block, FVG, liquidity sweep otomatik tespit.'],['📊','Wyckoff Metodolojisi','Accumulation/distribution fazları, spring ve upthrust.'],['🎯','ICT Konseptleri','OTE, Breaker Block ve Mitigation Block gerçek zamanlı.'],['🔗','On-Chain Analiz','Whale hareketleri ve exchange flows ile doğrulama.'],['⚡','Manipülasyon Tespiti','Stop hunt ve liquidity grab önceden gösterir.'],['📱','Telegram Sinyalleri','Her analiz otomatik kanala gönderilir.']],
    plans:[{n:'BAŞLANGIÇ',p:'$0',per:'Sonsuza kadar',f:['Günde 5 analiz','200+ coin','Telegram sinyalleri','TradingView grafik']},{n:'PRO',p:'$29',per:'/ay',f:['Sınırsız analiz','Öncelikli kuyruk','Özel Telegram','Portföy takibi']},{n:'ELİT',p:'$79',per:'/ay',f:["Pro'daki her şey",'1:1 danışmanlık','API erişimi','Strateji raporu']}],
  },
  EN:{ flag:'🇬🇧', color:'#3b82f6', hero1:'AI-POWERED', hero2:'CRYPTO ANALYSIS', sub:'Institutional-grade AI analysis for 200+ coins using Smart Money Concepts, Wyckoff and ICT methodologies.', cta:'Free Analysis', tg:'Telegram Channel', f1:'Features', f2:'How It Works', f3:'Pricing', statA:'ANALYSES', statB:'COINS', statC:'USERS', statD:'LAYERS', step1:'Select Coin', step1d:'Choose from 200+ coins.', step2:'AI Analyzes', step2d:'7-layer engine completes in seconds.', step3:'Get Signal', step3d:'Entry, stop and targets sent to Telegram.', pTitle:'CHOOSE A PLAN', free:'Start Free', pro:'Go Pro', elite:'Go Elite', perMonth:'/month', forever:'Free forever', ctaTitle:'GO AI MODE', ctaSub:'CHARTOS analysis for 200+ coins.', disc:'Crypto investments carry risk. Not financial advice.',
    feats:[['🧠','Smart Money Concepts','Auto-detection of order blocks, FVG, liquidity sweeps.'],['📊','Wyckoff Methodology','Accumulation/distribution phases, spring and upthrust.'],['🎯','ICT Concepts','OTE, Breaker Block and Mitigation Block in real time.'],['🔗','On-Chain Analysis','Whale movements and exchange flows for confirmation.'],['⚡','Manipulation Detection','Detects stop hunts and liquidity grabs in advance.'],['📱','Telegram Signals','Every analysis automatically sent to channel.']],
    plans:[{n:'STARTER',p:'$0',per:'Free forever',f:['5 analyses/day','200+ coins','Telegram signals','TradingView chart']},{n:'PRO',p:'$29',per:'/month',f:['Unlimited analyses','Priority queue','Custom Telegram','Portfolio tracking']},{n:'ELITE',p:'$79',per:'/month',f:['Everything in Pro','1:1 consulting','API access','Strategy report']}],
  },
  DE:{ flag:'🇩🇪', color:'#f59e0b', hero1:'KI-GESTÜTZTE', hero2:'KRYPTO-ANALYSE', sub:'Institutionelle KI-Analyse für 200+ Coins mit Smart Money Concepts, Wyckoff und ICT Methoden über CHARTOS Engine.', cta:'Kostenlose Analyse', tg:'Telegram Kanal', f1:'Funktionen', f2:'Wie es Funktioniert', f3:'Preise', statA:'ANALYSEN', statB:'COINS', statC:'NUTZER', statD:'SCHICHTEN', step1:'Coin Wählen', step1d:'Wählen Sie aus 200+ Coins.', step2:'KI Analysiert', step2d:'7-Schichten-Engine in Sekunden.', step3:'Signal Erhalten', step3d:'Einstieg, Stop und Ziele an Telegram.', pTitle:'PLAN WÄHLEN', free:'Kostenlos Starten', pro:'Pro Werden', elite:'Elite Werden', perMonth:'/Monat', forever:'Für immer kostenlos', ctaTitle:'KI-MODUS AKTIVIEREN', ctaSub:'CHARTOS-Analyse für 200+ Coins.', disc:'Krypto-Investitionen sind risikobehaftet. Keine Finanzberatung.',
    feats:[['🧠','Smart Money Concepts','Automatische Erkennung von Order Blocks, FVG, Liquiditätssweeps.'],['📊','Wyckoff-Methodik','Akkumulations/Distributions-Phasen, Spring und Upthrust.'],['🎯','ICT-Konzepte','OTE, Breaker Block in Echtzeit.'],['🔗','On-Chain-Analyse','Whale-Bewegungen zur Signalbestätigung.'],['⚡','Manipulationserkennung','Erkennt Stop-Hunts im Voraus.'],['📱','Telegram-Signale','Jede Analyse automatisch an Telegram.']],
    plans:[{n:'STARTER',p:'$0',per:'Für immer',f:['5 Analysen/Tag','200+ Coins','Telegram-Signale','TradingView-Chart']},{n:'PRO',p:'$29',per:'/Monat',f:['Unbegrenzte Analysen','Prioritätswarteschlange','Benutzerdefiniert TG','Portfolio']},{n:'ELITE',p:'$79',per:'/Monat',f:['Alles in Pro','1:1 Beratung','API-Zugang','Strategiebericht']}],
  },
  FR:{ flag:'🇫🇷', color:'#8b5cf6', hero1:'ANALYSE CRYPTO', hero2:'PROPULSÉE PAR IA', sub:"Analyse IA institutionnelle pour 200+ cryptos avec Smart Money Concepts, Wyckoff et méthodes ICT via CHARTOS Engine.", cta:'Analyse Gratuite', tg:'Canal Telegram', f1:'Fonctionnalités', f2:'Comment ça Marche', f3:'Tarifs', statA:'ANALYSES', statB:'COINS', statC:'UTILISATEURS', statD:'COUCHES', step1:'Choisir Coin', step1d:'Choisissez parmi 200+ coins.', step2:"L'IA Analyse", step2d:'Le moteur à 7 couches en secondes.', step3:'Recevoir Signal', step3d:'Entrée, stop et objectifs envoyés à Telegram.', pTitle:'CHOISIR UN PLAN', free:'Commencer Gratuitement', pro:'Passer Pro', elite:'Passer Élite', perMonth:'/mois', forever:'Gratuit pour toujours', ctaTitle:"ACTIVER L'IA", ctaSub:'Analyse CHARTOS pour 200+ coins.', disc:"Les investissements crypto comportent des risques. Pas de conseils financiers.",
    feats:[['🧠','Smart Money Concepts','Détection automatique des blocs, FVG, balayages de liquidité.'],['📊','Méthodologie Wyckoff','Phases accumulation/distribution, spring et upthrust.'],['🎯','Concepts ICT','OTE, Breaker Block en temps réel.'],['🔗','Analyse On-Chain','Mouvements des baleines pour confirmation.'],['⚡','Détection de Manipulation','Détecte stop hunts à l\'avance.'],['📱','Signaux Telegram','Chaque analyse envoyée automatiquement.']],
    plans:[{n:'DÉBUTANT',p:'$0',per:'Gratuit toujours',f:['5 analyses/jour','200+ coins','Signaux Telegram','Graphique TradingView']},{n:'PRO',p:'$29',per:'/mois',f:['Analyses illimitées','File prioritaire','Telegram personnalisé','Portefeuille']},{n:'ÉLITE',p:'$79',per:'/mois',f:["Tout dans Pro",'Conseil 1:1','Accès API','Rapport stratégique']}],
  },
};

export default function Landing() {
  const [market, setMarket] = useState(null);
  const [fg, setFg] = useState(null);
  const [count, setCount] = useState({a:0,u:0});
  const [lang, setLang] = useState('TR');

  // Aktif dil paketi
  const L = T[lang];

  useEffect(() => {
    try { const s = localStorage.getItem('dts_lang'); if(s && T[s]) setLang(s); } catch {}
    fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()).then(d=>setMarket(d.data)).catch(()=>{});
    fetch('https://api.alternative.me/fng/?limit=1').then(r=>r.json()).then(d=>setFg(d.data?.[0])).catch(()=>{});
    let a=0,u=0;
    const t=setInterval(()=>{a=Math.min(a+215,12847);u=Math.min(u+54,3200);setCount({a,u});if(a>=12847)clearInterval(t);},16);
    return()=>clearInterval(t);
  },[]);

  // Dil değiştir — doğrudan string key
  function setLangAndSave(code) {
    setLang(code);
    try { localStorage.setItem('dts_lang', code); } catch {}
  }

  const fmtB=n=>n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:'...';
  const fgColor=v=>v<25?'#ef4444':v<45?'#f97316':v<55?'#f59e0b':v<75?'#22c55e':'#00d4aa';

  // Dil butonları — 4 ayrı buton, dropdown yok
  const LangBar = () => (
    <div style={{display:'flex',gap:4}}>
      {['TR','EN','DE','FR'].map(code => {
        const active = lang === code;
        const meta = T[code];
        return (
          <button
            key={code}
            onClick={() => setLangAndSave(code)}
            style={{
              padding:'6px 10px',
              borderRadius:8,
              border: active ? `1px solid ${meta.color}` : '1px solid #162440',
              background: active ? `${meta.color}22` : '#0d1421',
              color: active ? meta.color : '#475569',
              fontSize:12,
              fontWeight: active ? 800 : 500,
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              gap:4,
              transition:'all .15s',
            }}
          >
            <span>{meta.flag}</span>
            <span>{code}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#04070f',color:'#e2e8f0',fontFamily:"-apple-system,system-ui,sans-serif",overflowX:'hidden'}}>
      <Head><title>Deep Trade Scan — CHARTOS AI</title></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#162440;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(18px)}}
        .hov:hover{opacity:0.85;transform:translateY(-2px);transition:all .2s}
        .hov2:hover{border-color:#1a6aff!important;transition:border-color .2s}
        .card:hover{border-color:#1a3060!important;transform:translateY(-4px);transition:all .3s}
        @media(max-width:768px){.nl{display:none!important}.fg{grid-template-columns:1fr!important}.pg{grid-template-columns:1fr!important}.sg{grid-template-columns:1fr!important}.fi{grid-template-columns:1fr 1fr!important}.lbar{gap:3px!important}}
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:200,height:60,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',background:'rgba(4,7,15,0.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid #0f1e35',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <img src="/logo.webp" style={{width:32,height:32,borderRadius:8,objectFit:'cover'}} alt="DTS"/>
          <span style={{fontSize:14,fontWeight:900,letterSpacing:2,color:'#fff'}}>DEEP TRADE SCAN</span>
        </div>
        <ul style={{display:'flex',gap:24,listStyle:'none'}} className="nl">
          <li><a href="#features" style={{color:'#475569',fontSize:13}}>{L.f1}</a></li>
          <li><a href="#how" style={{color:'#475569',fontSize:13}}>{L.f2}</a></li>
          <li><a href="#pricing" style={{color:'#475569',fontSize:13}}>{L.f3}</a></li>
          <li><a href="https://t.me/deeptradescan" style={{color:'#475569',fontSize:13}}>Telegram</a></li>
        </ul>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <div className="lbar"><LangBar/></div>
          <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:9,padding:'9px 18px',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0}} className="hov">🔱 {L.cta}</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 24px 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none'}}>
          <div style={{position:'absolute',top:'8%',left:'10%',width:500,height:500,background:'radial-gradient(ellipse,rgba(26,106,255,0.09),transparent 70%)',animation:'float 8s ease-in-out infinite'}}/>
          <div style={{position:'absolute',bottom:'5%',right:'8%',width:400,height:400,background:'radial-gradient(ellipse,rgba(124,58,237,0.07),transparent 70%)',animation:'float2 10s ease-in-out infinite'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(26,106,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,106,255,0.04) 1px,transparent 1px)',backgroundSize:'80px 80px',maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)'}}/>
        </div>
        <div style={{position:'relative',zIndex:2,maxWidth:880}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(26,106,255,0.1)',border:'1px solid rgba(26,106,255,0.3)',borderRadius:100,padding:'6px 18px',fontSize:11,fontWeight:600,color:'#60a5fa',letterSpacing:2,marginBottom:24}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981',display:'block',animation:'pulse 2s ease infinite'}}/>LIVE — 7/24
          </div>
          <div style={{marginBottom:18}}>
            <img src="/logo.webp" style={{width:88,height:88,borderRadius:20,objectFit:'cover',boxShadow:'0 0 50px rgba(26,106,255,0.3)'}} alt="DTS"/>
          </div>
          <h1 style={{fontSize:'clamp(44px,8vw,96px)',fontWeight:900,lineHeight:0.92,letterSpacing:4,marginBottom:10}}>
            <span style={{display:'block',color:'#fff'}}>{L.hero1}</span>
            <span style={{display:'block',background:'linear-gradient(135deg,#1a6aff,#06b6d4,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{L.hero2}</span>
          </h1>
          <p style={{fontSize:15,color:'#475569',lineHeight:1.75,maxWidth:540,margin:'18px auto 36px'}}>{L.sub}</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:52}}>
            <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:13,padding:'14px 34px',color:'#fff',fontSize:15,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8,boxShadow:'0 8px 32px rgba(26,106,255,0.3)'}} className="hov">🔱 {L.cta}</a>
            <a href="https://t.me/deeptradescan" style={{background:'transparent',border:'1px solid #162440',borderRadius:13,padding:'14px 34px',color:'#e2e8f0',fontSize:15,fontWeight:600,display:'inline-flex',alignItems:'center',gap:8}} className="hov2">✈️ {L.tg}</a>
          </div>
          <div style={{display:'flex',maxWidth:760,margin:'0 auto 16px',border:'1px solid #162440',borderRadius:18,overflow:'hidden',background:'#0a1220'}}>
            {[[Math.floor(count.a).toLocaleString()+'+',L.statA],['200+',L.statB],[Math.floor(count.u).toLocaleString()+'+',L.statC],['7',L.statD]].map(([n,l],i)=>(
              <div key={i} style={{flex:1,padding:'20px 10px',textAlign:'center',borderRight:i<3?'1px solid #0f1e35':'none'}}>
                <div style={{fontSize:30,fontWeight:900,background:'linear-gradient(135deg,#1a6aff,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{n}</div>
                <div style={{fontSize:9,color:'#475569',letterSpacing:1.5,marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>
          {market&&fg&&(
            <div style={{display:'flex',justifyContent:'center',gap:20,fontSize:12,flexWrap:'wrap'}}>
              <span style={{color:'#334155'}}>MCap <span style={{color:'#3b82f6',fontWeight:700}}>{fmtB(market.total_market_cap?.usd)}</span></span>
              <span style={{color:'#334155'}}>BTC <span style={{color:'#f59e0b',fontWeight:700}}>{market.market_cap_percentage?.btc?.toFixed(1)}%</span></span>
              <span style={{color:'#334155'}}>F&G <span style={{color:fgColor(+fg.value),fontWeight:700}}>{fg.value}</span></span>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:'80px 24px',maxWidth:1100,margin:'0 auto'}} id="features">
        <div style={{fontSize:10,color:'#1a6aff',letterSpacing:4,marginBottom:12,display:'flex',alignItems:'center',gap:10}}><span style={{width:28,height:1,background:'#1a6aff',display:'block'}}/>{L.f1.toUpperCase()}</div>
        <h2 style={{fontSize:'clamp(30px,4vw,52px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>CHARTOS ENGINE — {L.statD === 'KATMAN' ? '7 KATMAN' : L.statD === 'LAYERS' ? '7 LAYERS' : L.statD === 'SCHICHTEN' ? '7 SCHICHTEN' : '7 COUCHES'}</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:44}} className="fg">
          {L.feats.map(([icon,title,desc],i)=>(
            <div key={i} style={{background:'#0a1220',border:'1px solid #0f1e35',borderRadius:16,padding:26,transition:'all .3s'}} className="card">
              <div style={{width:42,height:42,background:'rgba(26,106,255,0.1)',border:'1px solid rgba(26,106,255,0.2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,marginBottom:14}}>{icon}</div>
              <div style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:7}}>{title}</div>
              <div style={{fontSize:12,color:'#475569',lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section style={{padding:'80px 24px',maxWidth:1100,margin:'0 auto'}} id="how">
        <div style={{fontSize:10,color:'#1a6aff',letterSpacing:4,marginBottom:12,display:'flex',alignItems:'center',gap:10}}><span style={{width:28,height:1,background:'#1a6aff',display:'block'}}/>{L.f2.toUpperCase()}</div>
        <h2 style={{fontSize:'clamp(30px,4vw,52px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>{L.step1} → {L.step2} → {L.step3}</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32,marginTop:44,position:'relative'}} className="sg">
          <div style={{position:'absolute',top:26,left:'16%',right:'16%',height:1,background:'linear-gradient(90deg,transparent,#162440,#162440,transparent)'}}/>
          {[[L.step1,L.step1d,'01'],[L.step2,L.step2d,'02'],[L.step3,L.step3d,'03']].map(([title,desc,num],i)=>(
            <div key={i} style={{textAlign:'center'}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:'#0a1220',border:'1px solid #162440',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:'#1a6aff',margin:'0 auto 18px',position:'relative',zIndex:1}}>{num}</div>
              <div style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:7}}>{title}</div>
              <div style={{fontSize:12,color:'#475569',lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{padding:'80px 24px',maxWidth:1100,margin:'0 auto'}} id="pricing">
        <div style={{fontSize:10,color:'#1a6aff',letterSpacing:4,marginBottom:12,display:'flex',alignItems:'center',gap:10}}><span style={{width:28,height:1,background:'#1a6aff',display:'block'}}/>{L.f3.toUpperCase()}</div>
        <h2 style={{fontSize:'clamp(30px,4vw,52px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>{L.pTitle}</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:44}} className="pg">
          {L.plans.map((plan,i)=>{
            const isPro = i===1;
            return (
              <div key={i} style={{background:isPro?'linear-gradient(135deg,rgba(26,106,255,0.08),rgba(124,58,237,0.08))':'#0a1220',border:isPro?'1px solid #1a6aff':'1px solid #0f1e35',borderRadius:20,padding:'32px 24px',position:'relative'}} className="card">
                {isPro&&<div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:100,padding:'3px 14px',fontSize:9,fontWeight:800,letterSpacing:2,color:'#fff',whiteSpace:'nowrap'}}>★ TOP</div>}
                <div style={{fontSize:10,color:'#475569',letterSpacing:3,marginBottom:12}}>{plan.n}</div>
                <div style={{fontSize:44,fontWeight:900,color:'#fff',lineHeight:1}}>{plan.p}</div>
                <div style={{fontSize:12,color:'#475569',marginBottom:24}}>{plan.per}</div>
                <ul style={{listStyle:'none',marginBottom:24}}>
                  {plan.f.map((f,j)=>(
                    <li key={j} style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'#64748b',padding:'6px 0',borderBottom:'1px solid #0f1e35'}}>
                      <span style={{color:'#10b981',fontSize:14}}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href={isPro||i===2?'https://t.me/deeptradescan':'/app'} style={{display:'block',padding:12,borderRadius:10,fontSize:13,fontWeight:700,textAlign:'center',background:isPro?'linear-gradient(135deg,#1a6aff,#7c3aed)':'transparent',border:isPro?'none':'1px solid #162440',color:'#fff'}} className="hov">
                  {i===0?L.free:i===1?L.pro:L.elite}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'100px 24px',textAlign:'center',background:'radial-gradient(ellipse 60% 60% at 50% 50%,rgba(26,106,255,0.06),transparent)'}}>
        <h2 style={{fontSize:'clamp(36px,5vw,68px)',fontWeight:900,letterSpacing:3,color:'#fff',marginBottom:16,lineHeight:1}}>{L.ctaTitle}</h2>
        <p style={{fontSize:15,color:'#475569',marginBottom:36,lineHeight:1.75,maxWidth:480,margin:'0 auto 36px'}}>{L.ctaSub}</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:13,padding:'14px 34px',color:'#fff',fontSize:15,fontWeight:700,boxShadow:'0 8px 32px rgba(26,106,255,0.3)'}} className="hov">🔱 {L.cta}</a>
          <a href="https://t.me/deeptradescan" style={{background:'transparent',border:'1px solid #162440',borderRadius:13,padding:'14px 34px',color:'#e2e8f0',fontSize:15,fontWeight:600}} className="hov2">✈️ {L.tg}</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#080e1a',borderTop:'1px solid #0f1e35',padding:'48px 24px 28px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,marginBottom:36}} className="fi">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <img src="/logo.webp" style={{width:30,height:30,borderRadius:8,objectFit:'cover'}} alt="DTS"/>
              <span style={{fontSize:13,fontWeight:900,letterSpacing:2,color:'#fff'}}>DEEP TRADE SCAN</span>
            </div>
            <p style={{fontSize:12,color:'#475569',lineHeight:1.7,maxWidth:240,marginBottom:16}}>{L.sub}</p>
            <div style={{display:'flex',gap:8}}>
              <a href="https://t.me/deeptradescan" style={{width:36,height:36,background:'#0a1220',border:'1px solid #162440',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✈️</a>
              <a href="https://twitter.com/deeptradescan" style={{width:36,height:36,background:'#0a1220',border:'1px solid #162440',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#e2e8f0'}}>𝕏</a>
            </div>
          </div>
          {[['PLATFORM',[[L.cta,'/app'],[L.f1,'#features'],[L.f3,'#pricing']]],['ANALYSIS',[['BTC','/app'],['ETH','/app'],['SOL','/app'],['200+','/app']]],['SOCIAL',[['Telegram','https://t.me/deeptradescan'],['Twitter','https://twitter.com/deeptradescan']]]].map(([title,links])=>(
            <div key={title}>
              <h4 style={{fontSize:10,fontWeight:700,color:'#fff',letterSpacing:2,marginBottom:14}}>{title}</h4>
              <ul style={{listStyle:'none'}}>
                {links.map(([text,href])=>(
                  <li key={text} style={{marginBottom:9}}><a href={href} style={{fontSize:12,color:'#475569'}}>{text}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',paddingTop:18,borderTop:'1px solid #0f1e35',flexWrap:'wrap',gap:6}}>
          <span style={{fontSize:11,color:'#334155'}}>© 2026 Deep Trade Scan</span>
          <span style={{fontSize:10,color:'#1e293b'}}>⚠️ {L.disc}</span>
        </div>
      </footer>
    </div>
  );
}
