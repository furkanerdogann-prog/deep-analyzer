import { useState, useEffect, useRef } from "react";
import Head from "next/head";

/* ═══════════════════════════════════════════════════════════════
   DEEP ANALYZER - 16 Katmanlı Profesyonel Kripto Analiz UI
   ═══════════════════════════════════════════════════════════════ */

const QUICK_COINS = ["BTC","ETH","SOL","PENGU","ONDO","PEPE","WIF","SUI","DOGE","INJ","FET","RENDER"];

// 50+ coin CoinGecko ID mapping
const GECKO_MAP = {
  BTC:"bitcoin",ETH:"ethereum",SOL:"solana",BNB:"binancecoin",XRP:"ripple",
  ADA:"cardano",AVAX:"avalanche-2",DOT:"polkadot",MATIC:"matic-network",
  LINK:"chainlink",UNI:"uniswap",ATOM:"cosmos",FIL:"filecoin",APT:"aptos",
  ARB:"arbitrum",OP:"optimism",SEI:"sei-network",TIA:"celestia",SUI:"sui",
  NEAR:"near",ICP:"internet-computer",IMX:"immutable-x",STX:"blockstack",
  INJ:"injective-protocol",FET:"fetch-ai",RENDER:"render-token",RNDR:"render-token",
  DOGE:"dogecoin",SHIB:"shiba-inu",PEPE:"pepe",WIF:"dogwifcoin",FLOKI:"floki",
  BONK:"bonk",PENGU:"pudgy-penguins",ONDO:"ondo-finance",MKR:"maker",
  AAVE:"aave",CRV:"curve-dao-token",LDO:"lido-dao",SNX:"synthetix-network-token",
  DYDX:"dydx-chain",GMX:"gmx",RUNE:"thorchain",OSMO:"osmosis",JUP:"jupiter-exchange-solana",
  JTO:"jito-governance-token",PYTH:"pyth-network",W:"wormhole",WLD:"worldcoin-wld",
  TAO:"bittensor",OLAS:"autonolas",AGIX:"singularitynet",OCEAN:"ocean-protocol",
  GRT:"the-graph",AR:"arweave",ROSE:"oasis-network",ALGO:"algorand",
  XLM:"stellar",EOS:"eos",VET:"vechain",HBAR:"hedera-hashgraph",
  LTC:"litecoin",BCH:"bitcoin-cash",ETC:"ethereum-classic",TRX:"tron",
  TON:"the-open-network",MINA:"mina-protocol",KAS:"kaspa",CFX:"conflux-token",
  CAKE:"pancakeswap-token",SUSHI:"sushi",COMP:"compound-governance-token",
};

const TABS = [
  { key:"genel",         label:"Genel",         icon:"📊" },
  { key:"yapi",          label:"Yapı",          icon:"🏗" },
  { key:"manipulasyon",  label:"Manipülasyon",  icon:"🕵" },
  { key:"sinyaller",     label:"Sinyaller",     icon:"📡" },
  { key:"onchain",       label:"On-Chain",      icon:"⛓" },
  { key:"trade",         label:"Trade",         icon:"🎯" },
  { key:"mm",            label:"MM",            icon:"🏦" },
  { key:"skorlar",       label:"Skorlar",       icon:"📈" },
];

const LOADING_STEPS = [
  { text:"Piyasa verileri çekiliyor...",              detail:"Fiyat, hacim, market cap" },
  { text:"Teknik analiz taranıyor...",                detail:"RSI, MACD, EMA, Ichimoku" },
  { text:"On-chain metrikler analiz ediliyor...",     detail:"Balina hareketleri, borsa akışları" },
  { text:"Türev verileri işleniyor...",               detail:"Funding rate, open interest, long/short" },
  { text:"Sentiment analizi yapılıyor...",            detail:"Korku/açgözlülük, sosyal medya" },
  { text:"Destek/direnç seviyeleri çıkarılıyor...",  detail:"Fibonacci, pivot, volume profile" },
  { text:"Haberler ve katalizörler taranıyor...",     detail:"Son haberler, yaklaşan etkinlikler" },
  { text:"Makro korelasyonlar değerlendiriliyor...",  detail:"BTC dominans, DXY, FED" },
  { text:"Balina alertleri kontrol ediliyor...",      detail:"Büyük transferler, cüzdan hareketleri" },
  { text:"Orderflow verileri işleniyor...",           detail:"Emir defteri derinliği, CVD" },
  { text:"Wyckoff fazı belirleniyor...",              detail:"Akümülasyon/Dağıtım analizi" },
  { text:"SMC yapısı taranıyor...",                   detail:"Order blocks, FVG, BOS/CHoCH" },
  { text:"ICT konseptleri uygulanıyor...",            detail:"Likidite havuzları, killzone" },
  { text:"Manipülasyon tespiti yapılıyor...",         detail:"Spoofing, wash trading, stop hunt" },
  { text:"Pattern tanıma çalıştırılıyor...",         detail:"Harmonik, Elliott, mum formasyonları" },
  { text:"Final sentez hazırlanıyor...",              detail:"16 katman birleştiriliyor" },
];

const LAYER_NAMES = [
  "Wyckoff","SMC","ICT","Manipülasyon","On-Chain","Orderflow",
  "Volatilite","Diverjans","Teknik","S/R","Sentiment","Makro",
  "Likidasyon","Pattern","Risk Yönetimi","Final Sentez",
];

/* ─── UTIL FUNCTIONS ─── */
function sColor(s) {
  if (!s) return "#555a70";
  const u = s.toUpperCase();
  if (u === "STRONG_BUY")  return "#00e676";
  if (u === "BUY")         return "#4caf50";
  if (u === "NEUTRAL" || u === "WAIT") return "#ffc107";
  if (u === "SELL")        return "#ff5722";
  if (u === "STRONG_SELL") return "#d50000";
  if (u === "BULLISH")     return "#00e676";
  if (u === "BEARISH")     return "#ef5350";
  return "#8b8fa3";
}

function sLabel(s) {
  if (!s) return "—";
  const m = {
    STRONG_BUY:"GÜÇLÜ AL", BUY:"AL", NEUTRAL:"NÖTR", WAIT:"BEKLE",
    SELL:"SAT", STRONG_SELL:"GÜÇLÜ SAT", BULLISH:"BOĞA", BEARISH:"AYI",
  };
  return m[s.toUpperCase()] || s;
}

function mColor(v) {
  if (v == null) return "#555";
  if (v <= 20) return "#00e676";
  if (v <= 40) return "#4caf50";
  if (v <= 60) return "#ffc107";
  if (v <= 80) return "#ff9800";
  return "#ef5350";
}

function sBarColor(v) {
  if (v <= 2.5) return "#ef5350";
  if (v <= 4.5) return "#ff9800";
  if (v <= 6.5) return "#ffc107";
  if (v <= 8)   return "#4caf50";
  return "#00e676";
}

function trendData(t) {
  if (!t) return { sym:"—", col:"#555a70" };
  const u = t.toUpperCase();
  if (u.includes("BULL") || u.includes("UP"))   return { sym:"▲", col:"#00e676" };
  if (u.includes("BEAR") || u.includes("DOWN")) return { sym:"▼", col:"#ef5350" };
  return { sym:"◆", col:"#ffc107" };
}

function riskColor(r) {
  if (!r) return "#555";
  const u = r.toUpperCase();
  if (u === "LOW")    return "#00e676";
  if (u === "MEDIUM") return "#ffc107";
  if (u === "HIGH")   return "#ff9800";
  return "#ef5350";
}

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  return "$" + n.toLocaleString("en-US");
}

/* ─── REUSABLE UI COMPONENTS ─── */
function Badge({ text, color, large }) {
  return (
    <span style={{
      display:"inline-block", padding: large ? "6px 18px" : "4px 12px",
      borderRadius:6, background: color + "1a", color,
      fontWeight:700, fontSize: large ? 14 : 12,
      border:`1px solid ${color}33`, letterSpacing:0.3,
      fontFamily:"'JetBrains Mono',monospace",
    }}>{text}</span>
  );
}

function Card({ title, subtitle, children, glow, style }) {
  return (
    <div style={{
      background:"#0d0f15", borderRadius:14, padding:"22px 26px",
      border:`1px solid ${glow || "#161928"}`, marginBottom:16,
      boxShadow: glow ? `0 0 20px ${glow}15` : "none", ...style,
    }}>
      {title && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: subtitle ? 4 : 14 }}>
          <div style={{ fontSize:13, color:"#8b8fa3", fontWeight:700, textTransform:"uppercase", letterSpacing:1.2 }}>{title}</div>
        </div>
      )}
      {subtitle && <div style={{ fontSize:11, color:"#555a70", marginBottom:14 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function StatBox({ label, value, color, mono }) {
  return (
    <div style={{
      padding:"14px 18px", background:"#0a0c12", borderRadius:10,
      border:`1px solid ${(color || "#161928")}22`, flex:"1 1 140px", minWidth:120,
    }}>
      <div style={{ fontSize:10, color:"#555a70", marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</div>
      <div style={{
        fontSize:15, color: color || "#e1e3ea", fontWeight:700,
        fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit", wordBreak:"break-word",
      }}>{value || "—"}</div>
    </div>
  );
}

function SignalBar({ bullish, bearish }) {
  const total = 10;
  const b = Math.min(bullish || 0, total);
  const s = Math.min(bearish || 0, total);
  const n = Math.max(0, total - b - s);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <span style={{ color:"#00e676", fontSize:13, fontWeight:700, width:20, textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>{b}</span>
      <div style={{ display:"flex", gap:3, flex:1 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex:1, height:22, borderRadius:3, minWidth:8,
            background: i < b ? "#00e676" : i < b + n ? "#1a1d2e" : "#ef5350",
            transition:"background 0.4s",
          }} />
        ))}
      </div>
      <span style={{ color:"#ef5350", fontSize:13, fontWeight:700, width:20, fontFamily:"'JetBrains Mono',monospace" }}>{s}</span>
    </div>
  );
}

function ScoreBar({ label, value, index }) {
  const v = Math.max(0, Math.min(10, value || 0));
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
      <div style={{ width:130, fontSize:12, color:"#8b8fa3", flexShrink:0, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ color:"#555a70", fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>
          #{(index + 1).toString().padStart(2, "0")}
        </span>
        {label}
      </div>
      <div style={{ flex:1, height:10, background:"#0a0c12", borderRadius:5, overflow:"hidden", border:"1px solid #161928" }}>
        <div style={{
          width:`${v * 10}%`, height:"100%", borderRadius:5,
          background:`linear-gradient(90deg, ${sBarColor(v)}88, ${sBarColor(v)})`,
          transition:"width 0.8s ease",
        }} />
      </div>
      <div style={{ width:36, fontSize:13, color: sBarColor(v), fontWeight:700, textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>
        {v.toFixed(1)}
      </div>
    </div>
  );
}

function TrendBox({ label, trend }) {
  const { sym, col } = trendData(trend);
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"12px 18px", background:"#0a0c12", borderRadius:10,
      border:`1px solid ${col}22`, minWidth:75, flex:"1 1 75px",
    }}>
      <div style={{ fontSize:10, color:"#555a70", marginBottom:6, letterSpacing:0.5 }}>{label}</div>
      <div style={{ fontSize:26, color:col, fontWeight:800, lineHeight:1 }}>{sym}</div>
      <div style={{ fontSize:10, color:col, marginTop:6, fontWeight:600 }}>{sLabel(trend)}</div>
    </div>
  );
}

function LevelPills({ label, values, color }) {
  if (!values || !values.length) return null;
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:11, color:"#555a70", marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {values.map((v, i) => (
          <span key={i} style={{
            padding:"5px 12px", borderRadius:6, fontSize:13,
            background: color + "12", color, border:`1px solid ${color}28`,
            fontFamily:"'JetBrains Mono',monospace", fontWeight:600,
          }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <div style={{ display:"flex", gap:8, marginBottom:8, fontSize:13, lineHeight:1.6 }}>
      <span style={{ color:"#555a70", flexShrink:0, minWidth:140 }}>{label}</span>
      <span style={{ color: color || "#c0c3d1", wordBreak:"break-word" }}>{value || "—"}</span>
    </div>
  );
}

function LayerCard({ title, icon, signal, score, children }) {
  return (
    <Card glow={sColor(signal) + "44"}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#e1e3ea" }}>{icon} {title}</div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {score != null && <Badge text={`${score}/10`} color={sBarColor(score)} />}
          <Badge text={sLabel(signal)} color={sColor(signal)} large />
        </div>
      </div>
      {children}
    </Card>
  );
}

function DetailText({ text }) {
  if (!text || text === "—") return null;
  return (
    <p style={{
      fontSize:12, color:"#8b8fa3", marginTop:12, lineHeight:1.7,
      borderTop:"1px solid #161928", paddingTop:12,
    }}>{text}</p>
  );
}

/* ─── DATA NORMALIZER ─── */
function normalize(raw) {
  if (!raw) return null;
  const L = raw.layers || {};
  const l = (k) => L[k] || {};
  const layerKeys = Object.keys(L).sort();
  const scores = raw.layer_scores && Array.isArray(raw.layer_scores)
    ? raw.layer_scores
    : layerKeys.map(k => { const s = L[k]?.score; return typeof s === "number" ? s : 5; });
  while (scores.length < 16) scores.push(5);

  const bullCount = raw.bullish_signals_count ?? layerKeys.filter(k => L[k]?.signal === "BULLISH").length;
  const bearCount = raw.bearish_signals_count ?? layerKeys.filter(k => L[k]?.signal === "BEARISH").length;
  const overallScore = raw.overall_score ?? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10);

  const syn = l("16_final_synthesis");
  const rm = l("15_risk_management");
  const sr = l("10_support_resistance");
  const mm = raw.mm_strategy || {};

  return {
    coin: raw.coin || "",
    current_price: raw.current_price || "",
    price_change_24h: raw.price_change_24h || "",
    high_24h: raw.high_24h || "",
    low_24h: raw.low_24h || "",
    volume_24h: raw.volume_24h || "",
    market_cap: raw.market_cap || "",

    signal: raw.overall_verdict || raw.signal || "NEUTRAL",
    confidence: raw.confidence_score ?? raw.confidence ?? 0,
    risk_level: raw.risk_level || "MEDIUM",
    overall_score: overallScore,
    manipulation_score: raw.manipulation_score ?? l("4_manipulation_detection").wash_trading_score ?? 0,
    bullish_signals_count: bullCount,
    bearish_signals_count: bearCount,
    layer_scores: scores,

    trend_daily: raw.trend_daily || "—",
    trend_4h: raw.trend_4h || "—",
    trend_1h: raw.trend_1h || "—",
    trend_15m: raw.trend_15m || "—",

    supports: raw.supports || sr.key_support_levels || [],
    resistances: raw.resistances || sr.key_resistance_levels || [],

    entry_sniper: raw.entry_sniper || rm.suggested_entry || "—",
    stop_loss: raw.stop_loss || rm.stop_loss || "—",
    tp1: raw.tp1 || (rm.take_profit_targets || [])[0] || "—",
    tp2: raw.tp2 || (rm.take_profit_targets || [])[1] || "—",
    tp3: raw.tp3 || (rm.take_profit_targets || [])[2] || "—",
    leverage: raw.leverage || "—",
    risk_reward: raw.risk_reward || rm.risk_reward_ratio || "—",
    position_size: raw.position_size || rm.position_size_suggestion || "—",
    max_drawdown: rm.max_drawdown_estimate || "—",
    invalidation: rm.invalidation_level || "—",

    wyckoff: l("1_wyckoff_analysis"),
    smc: l("2_smc_analysis"),
    ict: l("3_ict_concepts"),
    manip: l("4_manipulation_detection"),
    onchain: l("5_onchain_analysis"),
    orderflow: l("6_orderflow_analysis"),
    volatility: l("7_volatility_analysis"),
    divergence: l("8_divergence_analysis"),
    tech: l("9_technical_indicators"),
    sr: l("10_support_resistance"),
    sentiment: l("11_sentiment_analysis"),
    macro: l("12_macro_analysis"),
    liquidation: l("13_liquidation_analysis"),
    pattern: l("14_pattern_recognition"),
    risk: l("15_risk_management"),
    synthesis: syn,

    mm_pattern: mm.detected_mm_pattern || "—",
    mm_next: mm.next_likely_move || "—",
    mm_zones: mm.accumulation_distribution_zones || "—",
    mm_trap: mm.retail_trap_warning || "—",
    mm_direction: mm.smart_money_direction || "—",

    bull_scenario: syn.primary_scenario || "—",
    bear_scenario: syn.alternative_scenario || "—",
    worst_scenario: syn.worst_case_scenario || "—",
    bullish_factors: syn.bullish_factors || [],
    bearish_factors: syn.bearish_factors || [],
    catalyst_watch: syn.catalyst_watch || "—",
    timeframe: syn.timeframe || "—",
    summary: raw.analysis_summary || syn.summary || "",
    warnings: raw.warnings || [],
    meta: raw._meta || {},
    raw,
  };
}

/* ─── COINGECKO PRICE FETCH ─── */
async function getPrice(coin) {
  const id = GECKO_MAP[coin.toUpperCase()] || coin.toLowerCase();
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    const d = await r.json();
    const e = d[id];
    if (!e) return null;
    return { usd: e.usd, change24h: e.usd_24h_change, vol: e.usd_24h_vol, mcap: e.usd_market_cap };
  } catch {
    return null;
  }
}

/* ─── ANALYZE API CALL ─── */
async function run(coin) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coin }),
  });
  return res.json();
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [coin, setCoin] = useState("");
  const [price, setPrice] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState("genel");
  const [history, setHistory] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const stepRef = useRef(null);
  const timerRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem("da_history_v3");
      if (s) setHistory(JSON.parse(s));
    } catch {}
  }, []);

  function saveHistory(entry) {
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, 20);
      try { localStorage.setItem("da_history_v3", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  async function handleAnalyze(c) {
    const target = (c || coin).trim().toUpperCase();
    if (!target) return;
    setCoin(target);
    setLoading(true);
    setLoadingStep(0);
    setResult(null);
    setActiveTab("genel");
    setElapsed(0);

    const startTime = Date.now();
    stepRef.current = setInterval(() => setLoadingStep(s => s < LOADING_STEPS.length - 1 ? s + 1 : s), 3200);
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);

    const priceData = await getPrice(target);
    setPrice(priceData);

    try {
      const data = await run(target);

      if (data.error) {
        setResult({ error: data.error, details: data.details });
        return;
      }
      if (data.parse_error) {
        setResult({ error: "API yanıtı parse edilemedi", details: { raw: data.raw_response?.substring(0, 300) } });
        return;
      }

      const d = normalize(data);
      setResult(d);
      saveHistory({
        coin: target,
        signal: d?.signal,
        confidence: d?.confidence,
        score: d?.overall_score,
        time: new Date().toLocaleString("tr-TR"),
        price: priceData?.usd,
        searches: d?.meta?.searches_performed,
      });
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      clearInterval(stepRef.current);
      clearInterval(timerRef.current);
      setLoading(false);
    }
  }

  const d = result;

  return (
    <>
      <Head>
        <title>Deep Analyzer | Pro Kripto Analiz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight:"100vh", background:"#08090d", color:"#e1e3ea", fontFamily:"'Inter',system-ui,sans-serif" }}>

        {/* ═══ HEADER ═══ */}
        <header style={{
          padding:"28px 0 22px", textAlign:"center",
          borderBottom:"1px solid #161928",
          background:"linear-gradient(180deg,#0c0e14,#08090d)",
        }}>
          <h1 style={{
            fontSize:30, fontWeight:900, margin:0,
            background:"linear-gradient(135deg,#00e676 0%,#00b0ff 50%,#7c4dff 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:-1,
          }}>
            DEEP ANALYZER
          </h1>
          <p style={{ color:"#3a3f55", fontSize:12, margin:"8px 0 0", letterSpacing:2, textTransform:"uppercase" }}>
            16 Katmanlı AI Destekli Profesyonel Kripto Analiz Sistemi
          </p>
        </header>

        <main style={{ maxWidth:960, margin:"0 auto", padding:"24px 16px 80px" }}>

          {/* ═══ INPUT SECTION ═══ */}
          <Card>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <input
                value={coin}
                onChange={e => setCoin(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                placeholder="Coin sembolü girin (ör: BTC, ETH, SOL)"
                style={{
                  flex:1, minWidth:180, padding:"14px 18px", borderRadius:10,
                  border:"1px solid #1a1d2e", background:"#0a0c12", color:"#e1e3ea",
                  fontSize:15, fontFamily:"'JetBrains Mono',monospace", outline:"none",
                  transition:"border 0.3s",
                }}
                onFocus={e => (e.target.style.borderColor = "#00e67666")}
                onBlur={e => (e.target.style.borderColor = "#1a1d2e")}
              />
              <button
                onClick={() => handleAnalyze()}
                disabled={loading || !coin.trim()}
                style={{
                  padding:"14px 32px", borderRadius:10, border:"none", fontWeight:800,
                  fontSize:14, cursor: loading ? "not-allowed" : "pointer",
                  background: loading ? "#161928" : "linear-gradient(135deg,#00e676,#00b0ff)",
                  color: loading ? "#555" : "#000", transition:"all 0.3s", letterSpacing:0.5,
                }}
              >
                {loading ? "Analiz Ediliyor..." : "Derin Analiz Başlat"}
              </button>
            </div>

            {/* Quick coin buttons */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:14 }}>
              {QUICK_COINS.map(c => (
                <button
                  key={c}
                  onClick={() => { setCoin(c); handleAnalyze(c); }}
                  disabled={loading}
                  style={{
                    padding:"7px 14px", borderRadius:6,
                    border:`1px solid ${coin === c ? "#00e67644" : "#161928"}`,
                    background: coin === c ? "#00e67612" : "transparent",
                    color: coin === c ? "#00e676" : "#555a70",
                    fontSize:12, cursor:"pointer",
                    fontFamily:"'JetBrains Mono',monospace", fontWeight:600,
                    transition:"all 0.2s",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </Card>

          {/* ═══ LOADING ANIMATION ═══ */}
          {loading && (
            <Card glow="#00e67644">
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                {/* Triple spinner */}
                <div style={{ position:"relative", width:56, height:56, margin:"0 auto 20px" }}>
                  <div style={{
                    position:"absolute", inset:0, border:"3px solid #161928",
                    borderTopColor:"#00e676", borderRadius:"50%",
                    animation:"spin 0.8s linear infinite",
                  }} />
                  <div style={{
                    position:"absolute", inset:6, border:"3px solid #161928",
                    borderBottomColor:"#00b0ff", borderRadius:"50%",
                    animation:"spin 1.2s linear infinite reverse",
                  }} />
                  <div style={{
                    position:"absolute", inset:12, border:"3px solid #161928",
                    borderLeftColor:"#7c4dff", borderRadius:"50%",
                    animation:"spin 1.6s linear infinite",
                  }} />
                </div>

                <div style={{ fontSize:15, color:"#00e676", fontWeight:700, marginBottom:4 }}>
                  {LOADING_STEPS[loadingStep]?.text}
                </div>
                <div style={{ fontSize:11, color:"#555a70", marginBottom:16 }}>
                  {LOADING_STEPS[loadingStep]?.detail}
                </div>

                {/* Progress bar */}
                <div style={{
                  width:"100%", height:6, background:"#0a0c12", borderRadius:3,
                  overflow:"hidden", maxWidth:500, margin:"0 auto", border:"1px solid #161928",
                }}>
                  <div style={{
                    width:`${((loadingStep + 1) / LOADING_STEPS.length) * 100}%`,
                    height:"100%",
                    background:"linear-gradient(90deg,#00e676,#00b0ff,#7c4dff)",
                    borderRadius:3, transition:"width 0.6s ease",
                  }} />
                </div>

                <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:12, fontSize:11, color:"#555a70" }}>
                  <span>Adım {loadingStep + 1}/{LOADING_STEPS.length}</span>
                  <span>Geçen süre: {elapsed}s</span>
                </div>
              </div>
            </Card>
          )}

          {/* ═══ RESULTS ═══ */}
          {d && !d.error && (
            <>
              {/* ── TOP SUMMARY ── */}
              <Card glow={sColor(d.signal) + "44"}>
                {/* Row 1: Coin + Price + Badges */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:16, alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:12, flexWrap:"wrap" }}>
                      <span style={{ fontSize:28, fontWeight:900, fontFamily:"'JetBrains Mono',monospace" }}>
                        {d.coin || coin}
                      </span>
                      <span style={{ fontSize:22, fontWeight:700, color:"#e1e3ea", fontFamily:"'JetBrains Mono',monospace" }}>
                        {d.current_price || (price?.usd != null ? `$${price.usd.toLocaleString("en-US")}` : "")}
                      </span>
                      {(d.price_change_24h || price?.change24h != null) && (
                        <span style={{
                          fontSize:14, fontWeight:700,
                          color: String(d.price_change_24h || "").includes("-") || (price?.change24h < 0) ? "#ef5350" : "#00e676",
                        }}>
                          {d.price_change_24h || (price?.change24h >= 0 ? "+" : "") + price?.change24h?.toFixed(2) + "%"}
                        </span>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:12, marginTop:8, flexWrap:"wrap", fontSize:11, color:"#555a70" }}>
                      {d.high_24h && <span>24H Yüksek: <span style={{ color:"#00e676" }}>{d.high_24h}</span></span>}
                      {d.low_24h && <span>24H Düşük: <span style={{ color:"#ef5350" }}>{d.low_24h}</span></span>}
                      {d.volume_24h && <span>Hacim: <span style={{ color:"#00b0ff" }}>{d.volume_24h}</span></span>}
                      {d.market_cap && <span>MCap: <span style={{ color:"#7c4dff" }}>{d.market_cap}</span></span>}
                      {!d.volume_24h && price?.vol && <span>Hacim: <span style={{ color:"#00b0ff" }}>{fmt(price.vol)}</span></span>}
                      {!d.market_cap && price?.mcap && <span>MCap: <span style={{ color:"#7c4dff" }}>{fmt(price.mcap)}</span></span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    <Badge text={sLabel(d.signal)} color={sColor(d.signal)} large />
                    <Badge text={`Güven: %${d.confidence}`} color="#00b0ff" large />
                    <Badge text={`Skor: ${d.overall_score}/100`} color="#7c4dff" large />
                    <Badge text={`Risk: ${d.risk_level}`} color={riskColor(d.risk_level)} large />
                  </div>
                </div>

                {/* Row 2: Manipulation + Signal Bar */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:20, alignItems:"center", marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:10, color:"#555a70", marginBottom:4, textTransform:"uppercase", letterSpacing:0.8 }}>
                      Manipülasyon Skoru
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:80, height:8, background:"#0a0c12", borderRadius:4, overflow:"hidden", border:"1px solid #161928" }}>
                        <div style={{
                          width:`${d.manipulation_score}%`, height:"100%",
                          background: mColor(d.manipulation_score), borderRadius:4, transition:"width 0.6s",
                        }} />
                      </div>
                      <Badge text={`${d.manipulation_score}/100`} color={mColor(d.manipulation_score)} />
                    </div>
                  </div>
                  <div style={{ flex:1, minWidth:220 }}>
                    <div style={{ fontSize:10, color:"#555a70", marginBottom:4, textTransform:"uppercase", letterSpacing:0.8 }}>
                      Boğa / Ayı Sinyal Dağılımı ({d.bullish_signals_count + d.bearish_signals_count}/16 katman)
                    </div>
                    <SignalBar bullish={d.bullish_signals_count} bearish={d.bearish_signals_count} />
                  </div>
                </div>

                {/* Row 3: Multi-timeframe trend */}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <TrendBox label="GÜNLÜK" trend={d.trend_daily} />
                  <TrendBox label="4 SAAT" trend={d.trend_4h} />
                  <TrendBox label="1 SAAT" trend={d.trend_1h} />
                  <TrendBox label="15 DAK" trend={d.trend_15m} />
                </div>

                {/* Warnings */}
                {d.warnings && d.warnings.length > 0 && (
                  <div style={{
                    marginTop:16, padding:"12px 16px", background:"#ef535010",
                    borderRadius:10, border:"1px solid #ef535025",
                  }}>
                    <div style={{ fontSize:11, color:"#ef5350", fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>
                      Uyarılar
                    </div>
                    {d.warnings.map((w, i) => (
                      <div key={i} style={{ fontSize:12, color:"#ef9a9a", marginBottom:2, lineHeight:1.5 }}>⚠ {w}</div>
                    ))}
                  </div>
                )}

                {/* Meta */}
                {d.meta?.searches_performed != null && (
                  <div style={{ marginTop:12, fontSize:10, color:"#3a3f55", display:"flex", gap:16, flexWrap:"wrap" }}>
                    <span>Web araması: {d.meta.searches_performed}</span>
                    <span>Model: {d.meta.model}</span>
                    {d.meta.input_tokens && <span>Token: {(d.meta.input_tokens + d.meta.output_tokens).toLocaleString()}</span>}
                  </div>
                )}
              </Card>

              {/* ── TAB NAVIGATION ── */}
              <div style={{
                display:"flex", gap:2, overflowX:"auto", marginBottom:16, padding:4,
                background:"#0a0c12", borderRadius:12, border:"1px solid #161928",
              }}>
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    style={{
                      padding:"11px 16px", borderRadius:9, border:"none",
                      background: activeTab === t.key ? "linear-gradient(135deg,#161928,#1a1d2e)" : "transparent",
                      color: activeTab === t.key ? "#e1e3ea" : "#3a3f55",
                      fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
                      transition:"all 0.2s", display:"flex", alignItems:"center", gap:5,
                    }}
                  >
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>

              {/* ═══ TAB: GENEL ═══ */}
              {activeTab === "genel" && (
                <>
                  <Card title="Analiz Özeti" subtitle="Yapay zeka tarafından oluşturulan profesyonel değerlendirme">
                    <p style={{ fontSize:14, lineHeight:1.8, color:"#c0c3d1", margin:0 }}>
                      {d.summary || "Detaylı özet mevcut değil."}
                    </p>
                    {d.timeframe !== "—" && (
                      <div style={{ marginTop:12, fontSize:12, color:"#555a70" }}>
                        Beklenen Zaman Dilimi: <span style={{ color:"#00b0ff", fontWeight:600 }}>{d.timeframe}</span>
                      </div>
                    )}
                    {d.catalyst_watch !== "—" && (
                      <div style={{ marginTop:6, fontSize:12, color:"#555a70" }}>
                        Katalizör Takibi: <span style={{ color:"#ffc107", fontWeight:600 }}>{d.catalyst_watch}</span>
                      </div>
                    )}
                  </Card>

                  <Card title="Destek / Direnç Seviyeleri">
                    <LevelPills label="Destek" values={d.supports} color="#00e676" />
                    <LevelPills label="Direnç" values={d.resistances} color="#ef5350" />
                    <InfoRow label="Fibonacci" value={d.sr.fibonacci_levels} />
                    <InfoRow label="Pivot Noktaları" value={d.sr.pivot_points} />
                    <InfoRow label="Volume Profile POC" value={d.sr.volume_profile_poc} color="#7c4dff" />
                    <InfoRow label="Value Area" value={d.sr.value_area} />
                  </Card>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
                    <Card title="Boğa Faktörleri" glow="#00e67622">
                      {(d.bullish_factors || []).map((f, i) => (
                        <div key={i} style={{ fontSize:13, color:"#a5d6a7", marginBottom:6, lineHeight:1.5 }}>
                          <span style={{ color:"#00e676", marginRight:6 }}>+</span>{f}
                        </div>
                      ))}
                    </Card>
                    <Card title="Ayı Faktörleri" glow="#ef535022">
                      {(d.bearish_factors || []).map((f, i) => (
                        <div key={i} style={{ fontSize:13, color:"#ef9a9a", marginBottom:6, lineHeight:1.5 }}>
                          <span style={{ color:"#ef5350", marginRight:6 }}>−</span>{f}
                        </div>
                      ))}
                    </Card>
                  </div>
                </>
              )}

              {/* ═══ TAB: YAPI (Wyckoff, SMC, ICT) ═══ */}
              {activeTab === "yapi" && (
                <>
                  <LayerCard title="Wyckoff Analizi" icon="📐" signal={d.wyckoff.signal} score={d.wyckoff.score}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:8 }}>
                      <InfoRow label="Faz" value={d.wyckoff.current_phase} color="#e1e3ea" />
                      <InfoRow label="Alt Faz" value={d.wyckoff.sub_phase} color="#ffc107" />
                      <InfoRow label="Kompozit Operatör" value={d.wyckoff.composite_operator_action} />
                      <InfoRow label="Hacim Analizi" value={d.wyckoff.volume_analysis} />
                    </div>
                    <DetailText text={d.wyckoff.details} />
                  </LayerCard>

                  <LayerCard title="SMC Yapısı" icon="🏗" signal={d.smc.signal} score={d.smc.score}>
                    <InfoRow label="Piyasa Yapısı" value={d.smc.market_structure} color="#e1e3ea" />
                    <InfoRow label="Order Blocks" value={d.smc.order_blocks} color="#ffc107" />
                    <InfoRow label="Fair Value Gaps" value={d.smc.fair_value_gaps} color="#00b0ff" />
                    <InfoRow label="BOS / CHoCH" value={d.smc.break_of_structure} />
                    <InfoRow label="Premium/Discount" value={d.smc.premium_discount} />
                    <DetailText text={d.smc.details} />
                  </LayerCard>

                  <LayerCard title="ICT Konseptleri" icon="🎯" signal={d.ict.signal} score={d.ict.score}>
                    <InfoRow label="Likidite Havuzları" value={d.ict.liquidity_pools} color="#ffc107" />
                    <InfoRow label="OTE Bölgesi" value={d.ict.optimal_trade_entry} color="#00e676" />
                    <InfoRow label="Killzone" value={d.ict.killzones} />
                    <InfoRow label="Judas Swing" value={d.ict.judas_swing} />
                    <InfoRow label="MM Modeli" value={d.ict.market_maker_model} color="#7c4dff" />
                    <DetailText text={d.ict.details} />
                  </LayerCard>
                </>
              )}

              {/* ═══ TAB: MANIPULASYON ═══ */}
              {activeTab === "manipulasyon" && (
                <LayerCard title="Manipülasyon Tespiti" icon="🕵" signal={d.manip.signal} score={d.manip.score}>
                  <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
                    <Badge
                      text={`Wash Trading: ${d.manip.wash_trading_score ?? d.manipulation_score}/100`}
                      color={mColor(d.manip.wash_trading_score ?? d.manipulation_score)}
                      large
                    />
                  </div>
                  <InfoRow label="Spoofing Sinyalleri" value={d.manip.spoofing_signals} />
                  <InfoRow label="Stop Hunt Bölgeleri" value={d.manip.stop_hunt_zones} color="#ffc107" />
                  <InfoRow label="Balina Manipülasyonu" value={d.manip.whale_manipulation} />
                  <InfoRow label="Anormal Hacim" value={d.manip.unusual_volume_spikes} color="#ff9800" />
                  <DetailText text={d.manip.details} />
                </LayerCard>
              )}

              {/* ═══ TAB: SINYALLER ═══ */}
              {activeTab === "sinyaller" && (
                <>
                  <LayerCard title="Teknik İndikatörler" icon="📊" signal={d.tech.signal} score={d.tech.score}>
                    <InfoRow label="RSI (14)" value={d.tech.rsi_14} color="#e1e3ea" />
                    <InfoRow label="MACD" value={d.tech.macd} />
                    <InfoRow label="EMA Ribbon" value={d.tech.ema_ribbon} />
                    <InfoRow label="Stoch RSI" value={d.tech.stochastic_rsi} />
                    <InfoRow label="ADX" value={d.tech.adx} />
                    <InfoRow label="Ichimoku" value={d.tech.ichimoku} />
                    <InfoRow label="VWAP" value={d.tech.vwap} color="#7c4dff" />
                    <DetailText text={d.tech.details} />
                  </LayerCard>

                  <LayerCard title="Diverjans Analizi" icon="🔀" signal={d.divergence.signal} score={d.divergence.score}>
                    <InfoRow label="RSI Diverjans" value={d.divergence.rsi_divergence} />
                    <InfoRow label="MACD Diverjans" value={d.divergence.macd_divergence} />
                    <InfoRow label="Hacim/Fiyat" value={d.divergence.volume_price_divergence} />
                    <InfoRow label="OI/Fiyat" value={d.divergence.oi_price_divergence} />
                    <InfoRow label="Gizli Diverjanslar" value={d.divergence.hidden_divergences} color="#ffc107" />
                    <DetailText text={d.divergence.details} />
                  </LayerCard>

                  <LayerCard title="Volatilite" icon="🌊" signal={d.volatility.signal} score={d.volatility.score}>
                    <InfoRow label="Volatilite Rejimi" value={d.volatility.volatility_regime} color="#e1e3ea" />
                    <InfoRow label="IV / HV" value={d.volatility.current_volatility} />
                    <InfoRow label="Bollinger Bandı" value={d.volatility.bollinger_band_position} />
                    <InfoRow label="ATR" value={d.volatility.atr_assessment} />
                    <InfoRow label="IV Yüzdeliği" value={d.volatility.iv_percentile} color="#7c4dff" />
                    <DetailText text={d.volatility.details} />
                  </LayerCard>

                  <LayerCard title="Sentiment ve Makro" icon="🌐" signal={d.sentiment.signal} score={d.sentiment.score}>
                    <InfoRow label="Korku/Açgözlülük" value={d.sentiment.fear_greed_index} color="#ffc107" />
                    <InfoRow label="Sosyal Medya" value={d.sentiment.social_media_sentiment} />
                    <InfoRow label="Funding Rate" value={d.sentiment.funding_rate} color="#00b0ff" />
                    <InfoRow label="Long/Short Oranı" value={d.sentiment.long_short_ratio} />
                    <InfoRow label="Sosyal Hacim" value={d.sentiment.social_volume} />
                    <InfoRow label="Haber Etkisi" value={d.sentiment.news_sentiment} />
                    <DetailText text={d.sentiment.details} />
                  </LayerCard>

                  <LayerCard title="Makro Ortam" icon="🏛" signal={d.macro.signal} score={d.macro.score}>
                    <InfoRow label="BTC Dominansı" value={d.macro.btc_dominance_trend} />
                    <InfoRow label="DXY Korelasyonu" value={d.macro.dxy_correlation} />
                    <InfoRow label="FED Politikası" value={d.macro.fed_policy_impact} />
                    <InfoRow label="Piyasa Döngüsü" value={d.macro.market_cycle_position} color="#7c4dff" />
                    <InfoRow label="Toplam MCap" value={d.macro.total_crypto_mcap} color="#00b0ff" />
                    <InfoRow label="Altseason Index" value={d.macro.altseason_index} />
                    <DetailText text={d.macro.details} />
                  </LayerCard>

                  <LayerCard title="Pattern Tanıma" icon="🔍" signal={d.pattern.signal} score={d.pattern.score}>
                    <InfoRow label="Grafik Formasyonu" value={d.pattern.chart_patterns} />
                    <InfoRow label="Mum Formasyonu" value={d.pattern.candlestick_patterns} />
                    <InfoRow label="Harmonik Pattern" value={d.pattern.harmonic_patterns} />
                    <InfoRow label="Elliott Dalga" value={d.pattern.elliott_wave_count} />
                    <InfoRow label="Ölçülü Hedef" value={d.pattern.measured_move_target} color="#00e676" />
                    <DetailText text={d.pattern.details} />
                  </LayerCard>
                </>
              )}

              {/* ═══ TAB: ON-CHAIN ═══ */}
              {activeTab === "onchain" && (
                <>
                  <LayerCard title="On-Chain Metrikleri" icon="⛓" signal={d.onchain.signal} score={d.onchain.score}>
                    <InfoRow label="Balina Hareketleri" value={d.onchain.whale_movements} />
                    <InfoRow label="Borsa Net Akış" value={d.onchain.exchange_netflow}
                      color={String(d.onchain.exchange_netflow).toLowerCase().includes("out") ? "#00e676" : "#ef5350"} />
                    <InfoRow label="Aktif Adresler" value={d.onchain.active_addresses_trend} />
                    <InfoRow label="NVT Oranı" value={d.onchain.nvt_ratio} />
                    <InfoRow label="HODL Dalgaları" value={d.onchain.hodl_waves} />
                    <InfoRow label="MVRV Z-Score" value={d.onchain.mvrv_zscore} color="#7c4dff" />
                    <InfoRow label="Realized Price" value={d.onchain.realized_price} color="#ffc107" />
                    <DetailText text={d.onchain.details} />
                  </LayerCard>

                  <LayerCard title="Orderflow Analizi" icon="📈" signal={d.orderflow.signal} score={d.orderflow.score}>
                    <InfoRow label="Bid/Ask Dengesizliği" value={d.orderflow.bid_ask_imbalance} />
                    <InfoRow label="Agresif Al/Sat" value={d.orderflow.aggressive_buying_selling} />
                    <InfoRow label="CVD Trendi" value={d.orderflow.cumulative_volume_delta} />
                    <InfoRow label="Absorpsiyon" value={d.orderflow.absorption_detection} />
                    <InfoRow label="OI Değişimi (24s)" value={d.orderflow.open_interest_change} color="#00b0ff" />
                    <DetailText text={d.orderflow.details} />
                  </LayerCard>

                  <LayerCard title="Likidasyon Haritası" icon="💥" signal={d.liquidation.signal} score={d.liquidation.score}>
                    <div style={{ marginBottom:12 }}>
                      <Badge
                        text={`Kaskad Riski: ${d.liquidation.cascade_risk || "—"}`}
                        color={d.liquidation.cascade_risk === "High" ? "#ef5350" : d.liquidation.cascade_risk === "Medium" ? "#ffc107" : "#00e676"}
                        large
                      />
                    </div>
                    <InfoRow label="Likidasyon Kümeleri" value={d.liquidation.liquidation_heatmap} />
                    <InfoRow label="Kaldıraç Oranı" value={d.liquidation.leverage_ratio} />
                    <InfoRow label="Funding Aşırılığı" value={d.liquidation.funding_rate_extremes} />
                    <InfoRow label="24s Büyük Likidasyonlar" value={d.liquidation.largest_liquidations_24h} color="#ff9800" />
                    <DetailText text={d.liquidation.details} />
                  </LayerCard>
                </>
              )}

              {/* ═══ TAB: TRADE ═══ */}
              {activeTab === "trade" && (
                <Card title="Trade Planı" subtitle="Risk yönetimi parametreleri ile profesyonel giriş planı" glow="#00b0ff22">
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:10, marginBottom:16 }}>
                    <StatBox label="Sniper Giriş" value={d.entry_sniper} color="#00b0ff" mono />
                    <StatBox label="Stop Loss" value={d.stop_loss} color="#ef5350" mono />
                    <StatBox label="TP1" value={d.tp1} color="#00e676" mono />
                    <StatBox label="TP2" value={d.tp2} color="#00e676" mono />
                    <StatBox label="TP3" value={d.tp3} color="#00e676" mono />
                    <StatBox label="Kaldıraç" value={d.leverage} color="#ffc107" mono />
                    <StatBox label="Risk / Ödül" value={d.risk_reward} color="#7c4dff" mono />
                    <StatBox label="Pozisyon Boyutu" value={d.position_size} color="#00b0ff" mono />
                    <StatBox label="Max Drawdown" value={d.max_drawdown} color="#ff9800" mono />
                    <StatBox label="İptal Seviyesi" value={d.invalidation} color="#ef5350" mono />
                  </div>
                  <DetailText text={d.risk.details} />
                </Card>
              )}

              {/* ═══ TAB: MM ═══ */}
              {activeTab === "mm" && (
                <>
                  <Card title="Market Maker Stratejisi" subtitle="Kurumsal akıllı para analizi" glow="#7c4dff22">
                    <InfoRow label="Tespit Edilen MM Pattern" value={d.mm_pattern} color="#e1e3ea" />
                    <InfoRow label="Sonraki Hamle" value={d.mm_next} color="#ffc107" />
                    <InfoRow label="Akümülasyon/Dağıtım" value={d.mm_zones} />
                    <InfoRow label="Perakende Tuzağı" value={d.mm_trap} color="#ef5350" />
                    <InfoRow label="Akıllı Para Yönü" value={d.mm_direction} color="#00e676" />
                  </Card>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
                    <Card glow="#00e67622">
                      <div style={{ fontSize:13, color:"#00e676", fontWeight:700, marginBottom:10 }}>
                        Boğa Senaryosu (Birincil)
                      </div>
                      <div style={{ fontSize:13, color:"#c0c3d1", lineHeight:1.7 }}>{d.bull_scenario}</div>
                    </Card>
                    <Card glow="#ef535022">
                      <div style={{ fontSize:13, color:"#ef5350", fontWeight:700, marginBottom:10 }}>
                        Ayı Senaryosu (Alternatif)
                      </div>
                      <div style={{ fontSize:13, color:"#c0c3d1", lineHeight:1.7 }}>{d.bear_scenario}</div>
                    </Card>
                  </div>

                  {d.worst_scenario !== "—" && (
                    <Card glow="#d5000022">
                      <div style={{ fontSize:13, color:"#d50000", fontWeight:700, marginBottom:10 }}>
                        En Kötü Senaryo
                      </div>
                      <div style={{ fontSize:13, color:"#ef9a9a", lineHeight:1.7 }}>{d.worst_scenario}</div>
                    </Card>
                  )}
                </>
              )}

              {/* ═══ TAB: SKORLAR ═══ */}
              {activeTab === "skorlar" && (
                <Card title="16 Katman Performans Skorları" subtitle="Her katmanın boğa gücü (0=güçlü ayı, 5=nötr, 10=güçlü boğa)">
                  {LAYER_NAMES.map((name, i) => (
                    <ScoreBar key={name} label={name} value={d.layer_scores[i]} index={i} />
                  ))}
                  <div style={{
                    marginTop:16, padding:"12px 16px", background:"#0a0c12", borderRadius:8,
                    border:"1px solid #161928", display:"flex", justifyContent:"space-between",
                    flexWrap:"wrap", gap:10,
                  }}>
                    <div style={{ fontSize:12, color:"#555a70" }}>
                      Ortalama:{" "}
                      <span style={{ color:"#e1e3ea", fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>
                        {(d.layer_scores.reduce((a, b) => a + b, 0) / 16).toFixed(2)}/10
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:"#555a70" }}>
                      En Güçlü:{" "}
                      <span style={{ color:"#00e676", fontWeight:700 }}>
                        {LAYER_NAMES[d.layer_scores.indexOf(Math.max(...d.layer_scores))]}
                      </span>
                      {" "}({Math.max(...d.layer_scores).toFixed(1)})
                    </div>
                    <div style={{ fontSize:12, color:"#555a70" }}>
                      En Zayıf:{" "}
                      <span style={{ color:"#ef5350", fontWeight:700 }}>
                        {LAYER_NAMES[d.layer_scores.indexOf(Math.min(...d.layer_scores))]}
                      </span>
                      {" "}({Math.min(...d.layer_scores).toFixed(1)})
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* ═══ ERROR STATE ═══ */}
          {d && d.error && (
            <Card glow="#ef535044">
              <div style={{ color:"#ef5350", fontSize:16, fontWeight:700, marginBottom:8 }}>
                Hata: {d.error}
              </div>
              {d.details && (
                <pre style={{
                  fontSize:12, color:"#8b8fa3", marginTop:8, overflow:"auto",
                  whiteSpace:"pre-wrap", maxHeight:300, background:"#0a0c12",
                  padding:12, borderRadius:8,
                }}>
                  {typeof d.details === "string" ? d.details : JSON.stringify(d.details, null, 2)}
                </pre>
              )}
              <div style={{ marginTop:12, fontSize:12, color:"#555a70" }}>
                Rate limit hatası alıyorsanız 1 dakika bekleyip tekrar deneyin.
              </div>
            </Card>
          )}

          {/* ═══ HISTORY (son 20) ═══ */}
          {history.length > 0 && (
            <Card title="Analiz Geçmişi" subtitle={`Son ${history.length} analiz`} style={{ marginTop:24 }}>
              <div style={{ display:"grid", gap:6 }}>
                {history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => { setCoin(h.coin); handleAnalyze(h.coin); }}
                    style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"12px 16px", background:"#0a0c12", borderRadius:10,
                      cursor:"pointer", transition:"all 0.2s", fontSize:13,
                      border:"1px solid #161928",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#12141e"; e.currentTarget.style.borderColor = "#1a1d2e"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#0a0c12"; e.currentTarget.style.borderColor = "#161928"; }}
                  >
                    <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontWeight:800, fontFamily:"'JetBrains Mono',monospace", fontSize:14 }}>{h.coin}</span>
                      {h.price && (
                        <span style={{ color:"#555a70", fontFamily:"'JetBrains Mono',monospace" }}>
                          ${h.price.toLocaleString("en-US")}
                        </span>
                      )}
                      <Badge text={sLabel(h.signal)} color={sColor(h.signal)} />
                      {h.score != null && <Badge text={`${h.score}/100`} color="#7c4dff" />}
                    </div>
                    <div style={{ display:"flex", gap:12, alignItems:"center", color:"#3a3f55", fontSize:11, flexShrink:0 }}>
                      {h.searches && <span>🔍 {h.searches}</span>}
                      <span>{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>

        {/* ═══ GLOBAL STYLES ═══ */}
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { margin: 0; background: #08090d; -webkit-font-smoothing: antialiased; }
          ::-webkit-scrollbar { width: 5px; height: 5px; }
          ::-webkit-scrollbar-track { background: #08090d; }
          ::-webkit-scrollbar-thumb { background: #1a1d2e; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #2a2d3e; }
          ::selection { background: #00e67633; color: #e1e3ea; }
          input:focus { border-color: #00e67666 !important; box-shadow: 0 0 0 3px #00e67611 !important; }
          button:hover:not(:disabled) { filter: brightness(1.1); }
          @media (max-width: 640px) {
            h1 { font-size: 22px !important; }
          }
        `}</style>
      </div>
    </>
  );
}
