import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Landing() {
  const [market, setMarket] = useState(null);
  const [fg, setFg] = useState(null);
  const [count, setCount] = useState({analyses:0, users:0});

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()).then(d=>setMarket(d.data)).catch(()=>{});
    fetch('https://api.alternative.me/fng/?limit=1').then(r=>r.json()).then(d=>setFg(d.data?.[0])).catch(()=>{});
    let a=0,u=0;
    const timer=setInterval(()=>{a=Math.min(a+215,12847);u=Math.min(u+54,3200);setCount({analyses:a,users:u});if(a>=12847&&u>=3200)clearInterval(timer);},16);
    return()=>clearInterval(timer);
  },[]);

  const fmtB=n=>n>=1e12?`$${(n/1e12).toFixed(2)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:'...';
  const fgColor=v=>v<25?'#ef4444':v<45?'#f97316':v<55?'#f59e0b':v<75?'#22c55e':'#00d4aa';
  const fgText=v=>v<25?'Aşırı Korku':v<45?'Korku':v<55?'Nötr':v<75?'Açgözlülük':'Aşırı Açgözlülük';

  return (
    <div style={{minHeight:'100vh',background:'#04070f',color:'#e2e8f0',fontFamily:"'Segoe UI',system-ui,sans-serif",overflowX:'hidden'}}>
      <Head><title>Deep Trade Scan — CHARTOS AI Modu</title></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#162440;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(20px)}}
        .hov-card:hover{border-color:#162440!important;transform:translateY(-4px)!important;transition:all .3s}
        .hov-btn:hover{opacity:0.85!important;transform:translateY(-2px)!important;transition:all .2s}
        .hov-btn2:hover{border-color:#1a6aff!important;background:rgba(26,106,255,0.05)!important;transition:all .2s}
        .nav-link:hover{color:#e2e8f0!important;transition:color .2s}
        @media(max-width:768px){
          .nav-links{display:none!important}.feat-grid{grid-template-columns:1fr!important}
          .pricing-grid{grid-template-columns:1fr!important}.steps-grid{grid-template-columns:1fr!important}
          .signal-inner{grid-template-columns:1fr!important}.footer-inner{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(4,7,15,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #0f1e35'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.webp" style={{width:38,height:38,borderRadius:10,objectFit:'cover'}} alt="DTS"/>
          <span style={{fontSize:18,fontWeight:900,letterSpacing:3,color:'#fff'}}>DEEP TRADE SCAN</span>
        </div>
        <ul style={{display:'flex',gap:32,listStyle:'none'}} className="nav-links">
          {[['#features','Özellikler'],['#how','Nasıl Çalışır'],['#pricing','Fiyatlar'],['https://t.me/deeptradescan','Telegram']].map(([href,text])=>(
            <li key={text}><a href={href} style={{color:'#475569',fontSize:14,fontWeight:500}} className="nav-link">{text}</a></li>
          ))}
        </ul>
        <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:10,padding:'10px 24px',color:'#fff',fontSize:14,fontWeight:700}} className="hov-btn">🔱 Analiz Başlat</a>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 40px 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,zIndex:0}}>
          <div style={{position:'absolute',top:'10%',left:'15%',width:600,height:600,background:'radial-gradient(ellipse,rgba(26,106,255,0.09) 0%,transparent 70%)',animation:'float 8s ease-in-out infinite'}}/>
          <div style={{position:'absolute',bottom:'5%',right:'10%',width:500,height:500,background:'radial-gradient(ellipse,rgba(124,58,237,0.07) 0%,transparent 70%)',animation:'float2 10s ease-in-out infinite'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(26,106,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,106,255,0.04) 1px,transparent 1px)',backgroundSize:'80px 80px',maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)'}}/>
        </div>

        <div style={{position:'relative',zIndex:2,maxWidth:960,width:'100%'}}>
          {/* Badge */}
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(26,106,255,0.1)',border:'1px solid rgba(26,106,255,0.3)',borderRadius:100,padding:'6px 18px',fontSize:12,fontWeight:600,color:'#60a5fa',letterSpacing:2,marginBottom:32}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981',animation:'pulse 2s ease infinite',display:'block'}}/>
            Canlı Sinyaller Aktif — 7/24
          </div>

          {/* Logo büyük */}
          <div style={{marginBottom:24}}>
            <img src="/logo.webp" style={{width:100,height:100,borderRadius:20,objectFit:'cover',boxShadow:'0 0 60px rgba(26,106,255,0.3)'}} alt="DTS Logo"/>
          </div>

          <h1 style={{fontSize:'clamp(52px,9vw,108px)',fontWeight:900,lineHeight:0.92,letterSpacing:4,marginBottom:12}}>
            <span style={{display:'block',color:'#fff'}}>YAPAY ZEKA</span>
            <span style={{display:'block',background:'linear-gradient(135deg,#1a6aff,#06b6d4,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>KRİPTO ANALİZİ</span>
          </h1>

          <p style={{fontSize:18,color:'#475569',lineHeight:1.7,maxWidth:600,margin:'24px auto 48px'}}>
            CHARTOS Engine ile 200+ coin için Smart Money Concepts, Wyckoff ve ICT metodolojilerini kullanan kurumsal düzeyde yapay zeka analizi.
          </p>

          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginBottom:60}}>
            <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:14,padding:'16px 40px',color:'#fff',fontSize:16,fontWeight:700,display:'flex',alignItems:'center',gap:10,boxShadow:'0 8px 32px rgba(26,106,255,0.3)'}} className="hov-btn">🔱 Ücretsiz Analiz Yap</a>
            <a href="https://t.me/deeptradescan" style={{background:'transparent',border:'1px solid #162440',borderRadius:14,padding:'16px 40px',color:'#e2e8f0',fontSize:16,fontWeight:600,display:'flex',alignItems:'center',gap:10}} className="hov-btn2">✈️ Telegram Kanalı</a>
          </div>

          {/* Stats */}
          <div style={{display:'flex',maxWidth:800,margin:'0 auto',border:'1px solid #162440',borderRadius:20,overflow:'hidden',background:'#0a1220'}}>
            {[
              [Math.floor(count.analyses).toLocaleString('tr-TR')+'+','ANALİZ YAPILDI'],
              ['200+','COIN DESTEKLENİYOR'],
              [Math.floor(count.users).toLocaleString('tr-TR')+'+','AKTİF KULLANICI'],
              ['7','ANALİZ KATMANI'],
            ].map(([num,label],i)=>(
              <div key={i} style={{flex:1,padding:'28px 16px',textAlign:'center',borderRight:i<3?'1px solid #0f1e35':'none'}}>
                <div style={{fontSize:36,fontWeight:900,background:'linear-gradient(135deg,#1a6aff,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{num}</div>
                <div style={{fontSize:10,color:'#475569',letterSpacing:2,marginTop:4}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Market bar */}
          {market && (
            <div style={{marginTop:24,display:'flex',justifyContent:'center',gap:24,flexWrap:'wrap',fontSize:13}}>
              <span style={{color:'#334155'}}>MCap: <span style={{color:'#3b82f6',fontWeight:700}}>{fmtB(market.total_market_cap?.usd)}</span></span>
              <span style={{color:'#334155'}}>BTC Dom: <span style={{color:'#f59e0b',fontWeight:700}}>{market.market_cap_percentage?.btc?.toFixed(1)}%</span></span>
              {fg&&<span style={{color:'#334155'}}>F&G: <span style={{color:fgColor(+fg.value),fontWeight:700}}>{fg.value} — {fgText(+fg.value)}</span></span>}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:'100px 40px',maxWidth:1200,margin:'0 auto'}} id="features">
        <div style={{fontSize:11,color:'#1a6aff',letterSpacing:4,textTransform:'uppercase',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:30,height:1,background:'#1a6aff',display:'block'}}/>ÖZELLİKLER
        </div>
        <h2 style={{fontSize:'clamp(36px,5vw,60px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>CHARTOS ENGINE<br/>7 KATMAN ANALİZ</h2>
        <p style={{fontSize:16,color:'#475569',maxWidth:500,lineHeight:1.7,marginTop:16}}>Her analiz yedi farklı metodoloji katmanından geçer. Kurumsal alıcıların kullandığı aynı framework.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginTop:60}} className="feat-grid">
          {[
            ['🧠','Smart Money Concepts','Order block, Fair Value Gap, liquidity sweep ve market structure shift otomatik tespit.'],
            ['📊','Wyckoff Metodolojisi','Accumulation ve distribution fazları, spring ve upthrust noktaları Market Maker tarzında.'],
            ['🎯','ICT Konseptleri','Optimal Trade Entry, Breaker Block ve Mitigation Block gerçek zamanlı hesaplama.'],
            ['🔗','On-Chain Analiz','Whale hareketleri, exchange flows ve realized P/L ile güçlü sinyal doğrulaması.'],
            ['⚡','Manipülasyon Tespiti','Stop hunt, liquidity grab ve wash trading örüntülerini önceden gösterir.'],
            ['📱','Telegram Sinyalleri','Her analiz otomatik Telegram kanalına gönderilir. Giriş, stop ve hedeflerle.'],
          ].map(([icon,title,desc],i)=>(
            <div key={i} style={{background:'#0a1220',border:'1px solid #0f1e35',borderRadius:20,padding:32,transition:'all .3s'}} className="hov-card">
              <div style={{width:48,height:48,background:'rgba(26,106,255,0.1)',border:'1px solid rgba(26,106,255,0.2)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:20}}>{icon}</div>
              <div style={{fontSize:17,fontWeight:700,color:'#fff',marginBottom:10}}>{title}</div>
              <div style={{fontSize:14,color:'#475569',lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SIGNAL PREVIEW */}
      <div style={{padding:'80px 40px',background:'#080e1a',borderTop:'1px solid #0f1e35',borderBottom:'1px solid #0f1e35'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}} className="signal-inner">
          <div>
            <div style={{fontSize:11,color:'#1a6aff',letterSpacing:4,textTransform:'uppercase',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
              <span style={{width:30,height:1,background:'#1a6aff',display:'block'}}/>CANLI SİNYAL ÖRNEĞİ
            </div>
            <h2 style={{fontSize:'clamp(32px,4vw,52px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>KURUMSAL<br/>KALİTE SİNYAL</h2>
            <p style={{fontSize:16,color:'#475569',maxWidth:400,lineHeight:1.7,marginTop:16}}>Her sinyal giriş bölgesi, hard stop, üç hedef ve R:R oranı içerir.</p>
            <div style={{marginTop:32,display:'flex',flexDirection:'column',gap:12}}>
              {['Anlık CoinGecko fiyat entegrasyonu','Fear & Greed Index dahil','Market Maker senaryo analizi','Otomatik Telegram paylaşımı'].map((t,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,fontSize:14,color:'#475569'}}>
                  <span style={{color:'#10b981',fontSize:18}}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
          <div style={{background:'#0a1220',border:'1px solid #162440',borderRadius:24,padding:32,position:'relative'}}>
            <div style={{position:'absolute',top:-1,left:'20%',right:'20%',height:1,background:'linear-gradient(90deg,transparent,#1a6aff,transparent)'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,paddingBottom:20,borderBottom:'1px solid #0f1e35'}}>
              <span style={{fontSize:24,fontWeight:900,letterSpacing:2,color:'#fff'}}>⚔️ BTC/USDT</span>
              <span style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:700,color:'#ef4444'}}>🔴 AYI SİNYAL</span>
            </div>
            {[
              ['💰 FİYAT','$65,662.00','#e2e8f0'],
              ['📍 GİRİŞ','$63,800 – $64,300','#10b981'],
              ['🛑 HARD STOP','$62,700','#ef4444'],
              ['🎯 HEDEF 1','$68,500','#06b6d4'],
              ['🎯 HEDEF 2','$72,800','#06b6d4'],
              ['🎯 HEDEF 3','$78,000 – $82,000','#06b6d4'],
              ['😱 F&G','5/100 — Aşırı Korku','#ef4444'],
            ].map(([k,v,c],i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:i===6?'none':'1px solid #0f1e35'}}>
                <span style={{fontSize:12,color:'#475569',letterSpacing:1}}>{k}</span>
                <span style={{fontSize:15,fontWeight:700,color:c,fontFamily:'monospace'}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:20,textAlign:'center',background:'linear-gradient(135deg,rgba(26,106,255,0.1),rgba(124,58,237,0.1))',border:'1px solid rgba(99,102,241,0.3)',borderRadius:14,padding:20}}>
              <div style={{fontSize:11,color:'#475569',letterSpacing:3,marginBottom:8}}>R:R ORAN</div>
              <div style={{fontSize:48,fontWeight:900,background:'linear-gradient(135deg,#1a6aff,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>1:5.2+</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW */}
      <section style={{padding:'100px 40px',maxWidth:1200,margin:'0 auto'}} id="how">
        <div style={{fontSize:11,color:'#1a6aff',letterSpacing:4,textTransform:'uppercase',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:30,height:1,background:'#1a6aff',display:'block'}}/>NASIL ÇALIŞIR
        </div>
        <h2 style={{fontSize:'clamp(36px,5vw,60px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>3 ADIMDA<br/>YAPAY ZEKA ANALİZİ</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:40,marginTop:60,position:'relative'}} className="steps-grid">
          <div style={{position:'absolute',top:32,left:'16%',right:'16%',height:1,background:'linear-gradient(90deg,transparent,#162440,#162440,transparent)'}}/>
          {[
            ['01','Coin Seç','200+ coin arasından analiz etmek istediğinizi seçin. BTC, ETH, meme coinler — hepsi destekleniyor.'],
            ['02','AI Analiz Et','7 katmanlı yapay zeka engine saniyeler içinde SMC, Wyckoff ve ICT analizini tamamlar.'],
            ['03','Sinyal Al','Giriş, stop ve üç hedef seviyesi ile R:R oranı belirlenir. Telegram\'a otomatik gönderilir.'],
          ].map(([num,title,desc],i)=>(
            <div key={i} style={{textAlign:'center'}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'#0a1220',border:'1px solid #162440',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:900,color:'#1a6aff',margin:'0 auto 24px',position:'relative',zIndex:1}}>{num}</div>
              <div style={{fontSize:18,fontWeight:700,color:'#fff',marginBottom:10}}>{title}</div>
              <div style={{fontSize:14,color:'#475569',lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{padding:'0 40px 100px',maxWidth:1200,margin:'0 auto'}} id="pricing">
        <div style={{fontSize:11,color:'#1a6aff',letterSpacing:4,textTransform:'uppercase',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:30,height:1,background:'#1a6aff',display:'block'}}/>FİYATLANDIRMA
        </div>
        <h2 style={{fontSize:'clamp(36px,5vw,60px)',fontWeight:900,letterSpacing:2,color:'#fff',lineHeight:1.1}}>SIZE UYGUN<br/>PLAN SEÇİN</h2>
        <p style={{fontSize:16,color:'#475569',maxWidth:500,lineHeight:1.7,marginTop:16}}>Ücretsiz başlayın. Gizli ücret yok.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginTop:60}} className="pricing-grid">
          {[
            {name:'BAŞLANGIÇ',price:'$0',period:'/ ay — Sonsuza kadar',featured:false,
             features:[['✓','Günde 5 analiz',true],['✓','200+ coin',true],['✓','Telegram sinyalleri',true],['✓','TradingView grafik',true],['✗','Öncelikli analiz',false],['✗','Premium sinyaller',false]],
             btn:'Ücretsiz Başla',primary:false,href:'/app'},
            {name:'PRO',price:'$29',period:'/ ay — Aylık fatura',featured:true,
             features:[['✓','Sınırsız analiz',true],['✓','200+ coin',true],['✓','Öncelikli analiz kuyruğu',true],['✓','Özel Telegram sinyalleri',true],['✓','Portföy takibi',true],['✗','Özel danışmanlık',false]],
             btn:"Pro'ya Geç",primary:true,href:'https://t.me/deeptradescan'},
            {name:'ELİT',price:'$79',period:'/ ay — Aylık fatura',featured:false,
             features:[['✓',"Pro'daki her şey",true],['✓','1:1 danışmanlık',true],['✓','Özel sinyal alarmları',true],['✓','API erişimi',true],['✓','Öncelikli destek',true],['✓','Özel strateji raporu',true]],
             btn:"Elit'e Geç",primary:false,href:'https://t.me/deeptradescan'},
          ].map((plan,i)=>(
            <div key={i} style={{background:plan.featured?'linear-gradient(135deg,rgba(26,106,255,0.08),rgba(124,58,237,0.08))':'#0a1220',border:plan.featured?'1px solid #1a6aff':'1px solid #0f1e35',borderRadius:24,padding:40,position:'relative',transition:'transform .3s'}} className="hov-card">
              {plan.featured&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:100,padding:'4px 16px',fontSize:10,fontWeight:800,letterSpacing:2,color:'#fff',whiteSpace:'nowrap'}}>EN POPÜLER</div>}
              <div style={{fontSize:12,color:'#475569',letterSpacing:3,marginBottom:16}}>{plan.name}</div>
              <div style={{fontSize:52,fontWeight:900,color:'#fff',lineHeight:1}}>{plan.price}</div>
              <div style={{fontSize:14,color:'#475569',marginBottom:32}}>{plan.period}</div>
              <ul style={{listStyle:'none',marginBottom:32}}>
                {plan.features.map(([icon,text,active],j)=>(
                  <li key={j} style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:'#475569',padding:'8px 0',borderBottom:'1px solid #0f1e35'}}>
                    <span style={{color:active?'#10b981':'#1e293b',fontSize:16}}>{icon}</span>
                    <span style={{opacity:active?1:0.3}}>{text}</span>
                  </li>
                ))}
              </ul>
              <a href={plan.href} style={{display:'block',padding:14,borderRadius:12,fontSize:15,fontWeight:700,textAlign:'center',background:plan.primary?'linear-gradient(135deg,#1a6aff,#7c3aed)':'transparent',border:plan.primary?'none':'1px solid #162440',color:plan.primary?'#fff':'#e2e8f0'}} className="hov-btn">{plan.btn}</a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'120px 40px',textAlign:'center',background:'radial-gradient(ellipse 60% 60% at 50% 50%,rgba(26,106,255,0.06),transparent)'}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <h2 style={{fontSize:'clamp(44px,6vw,76px)',fontWeight:900,letterSpacing:3,color:'#fff',marginBottom:20,lineHeight:1}}>YAPAY ZEKAYA<br/>GEÇ</h2>
          <p style={{fontSize:18,color:'#475569',marginBottom:48,lineHeight:1.7}}>200+ coin için kurumsal kalite CHARTOS analizi. Ücretsiz başla, bugün ilk analizini yap.</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/app" style={{background:'linear-gradient(135deg,#1a6aff,#7c3aed)',borderRadius:14,padding:'16px 40px',color:'#fff',fontSize:16,fontWeight:700,display:'flex',alignItems:'center',gap:10,boxShadow:'0 8px 32px rgba(26,106,255,0.3)'}} className="hov-btn">🔱 Hemen Başla — Ücretsiz</a>
            <a href="https://t.me/deeptradescan" style={{background:'transparent',border:'1px solid #162440',borderRadius:14,padding:'16px 40px',color:'#e2e8f0',fontSize:16,fontWeight:600,display:'flex',alignItems:'center',gap:10}} className="hov-btn2">✈️ Telegram</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#080e1a',borderTop:'1px solid #0f1e35',padding:'60px 40px 40px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:60,marginBottom:48}} className="footer-inner">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <img src="/logo.webp" style={{width:36,height:36,borderRadius:10,objectFit:'cover'}} alt="DTS"/>
              <span style={{fontSize:16,fontWeight:900,letterSpacing:3,color:'#fff'}}>DEEP TRADE SCAN</span>
            </div>
            <p style={{fontSize:14,color:'#475569',lineHeight:1.7,maxWidth:280}}>CHARTOS Engine ile 200+ kripto varlık için SMC, Wyckoff ve ICT metodolojileri kullanan kurumsal yapay zeka analizi.</p>
            <div style={{display:'flex',gap:12,marginTop:24}}>
              <a href="https://t.me/deeptradescan" style={{width:40,height:40,background:'#0a1220',border:'1px solid #162440',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>✈️</a>
              <a href="https://twitter.com/deeptradescan" style={{width:40,height:40,background:'#0a1220',border:'1px solid #162440',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:900,color:'#e2e8f0'}}>𝕏</a>
            </div>
          </div>
          {[
            ['PLATFORM',[['Analiz Aracı','/app'],['Özellikler','#features'],['Fiyatlar','#pricing'],['Nasıl Çalışır','#how']]],
            ['ANALİZ',[['BTC Analiz','/app'],['ETH Analiz','/app'],['SOL Analiz','/app'],['Altcoin','/app']]],
            ['TOPLULUK',[['Telegram','https://t.me/deeptradescan'],['Twitter','https://twitter.com/deeptradescan']]],
          ].map(([title,links])=>(
            <div key={title}>
              <h4 style={{fontSize:13,fontWeight:700,color:'#fff',letterSpacing:1,marginBottom:20}}>{title}</h4>
              <ul style={{listStyle:'none'}}>
                {links.map(([text,href])=>(
                  <li key={text} style={{marginBottom:12}}>
                    <a href={href} style={{fontSize:14,color:'#475569'}} className="nav-link">{text}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:24,borderTop:'1px solid #0f1e35',flexWrap:'wrap',gap:12}}>
          <span style={{fontSize:13,color:'#475569'}}>© 2026 Deep Trade Scan. Tüm hakları saklıdır.</span>
          <span style={{fontSize:12,color:'#1e293b',maxWidth:400,textAlign:'right'}}>⚠️ Kripto yatırımları risk içerir. CHARTOS sinyalleri finansal tavsiye değildir.</span>
        </div>
      </footer>
    </div>
  );
}
