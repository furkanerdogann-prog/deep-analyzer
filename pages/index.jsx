import { useState, useEffect, useRef } from "react";
import Head from "next/head";

/* ═══════════════════════════════════════════════════════════════
   DEEP ANALYZER - 16 Katmanlı Profesyonel Kripto Analiz UI
   ═══════════════════════════════════════════════════════════════ */

const QUICK_COINS = ["BTC","ETH","SOL","PENGU","ONDO","PEPE","WIF","SUI","DOGE","INJ","FET","RENDER"];

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
  { key:"genel",        label:"Genel",         icon:"📊" },
  { key:"yapi",         label:"Yapı",          icon:"🏗" },
  { key:"manipulasyon", label:"Manipülasyon",  icon:"🕵" },
  { key:"sinyaller",    label:"Sinyaller",     icon:"📡" },
  { key:"onchain",      label:"Zincir",        icon:"⛓" },
  { key:"trade",        label:"İşlem",         icon:"🎯" },
  { key:"mm",           label:"Yapıcı",        icon:"🏦" },
  { key:"skorlar",      label:"Skorlar",       icon:"📈" },
];

const LOADING_STEPS = [
  { text:"Piyasa verileri çekiliyor...",              detail:"Fiyat, hacim, piyasa değeri" },
  { text:"Teknik analiz hesaplanıyor...",             detail:"RSI, MACD, EMA, Ichimoku" },
  { text:"Zincir üstü metrikler analiz ediliyor...", detail:"Hacim dengesi, borsa akışları" },
  { text:"Türev verileri işleniyor...",               detail:"Fonlama oranı, açık pozisyon" },
  { text:"Duygu analizi yapılıyor...",                detail:"Korku/açgözlülük, sosyal medya" },
  { text:"Destek/direnç seviyeleri çıkarılıyor...",  detail:"Fibonacci, pivot, hacim profili" },
  { text:"Haberler ve katalizörler taranıyor...",     detail:"Son haberler, yaklaşan etkinlikler" },
  { text:"Makro korelasyonlar değerlendiriliyor...",  detail:"BTC dominans, DXY, FED" },
  { text:"Balina hareketleri kontrol ediliyor...",    detail:"Büyük transferler, cüzdan değişimleri" },
  { text:"Emir akışı verileri işleniyor...",          detail:"Emir defteri derinliği, kümülatif delta" },
  { text:"Wyckoff fazı belirleniyor...",              detail:"Birikim/dağıtım analizi" },
  { text:"Akıllı para yapısı taranıyor...",           detail:"Emir blokları, adil değer boşlukları" },
  { text:"ICT konseptleri uygulanıyor...",            detail:"Likidite havuzları, işlem pencereleri" },
  { text:"Manipülasyon tespiti yapılıyor...",         detail:"Sahte emir, sahte hacim, stop avı" },
  { text:"Formasyon tanıma çalıştırılıyor...",        detail:"Harmonik, Elliott, mum formasyonları" },
  { text:"Final sentez hazırlanıyor...",              detail:"16 katman birleştiriliyor" },
];

const LAYER_NAMES = [
  "Wyckoff","Akıllı Para","ICT","Manipülasyon","Zincir Verisi","Emir Akışı",
  "Volatilite","Diverjans","Teknik","D/D Seviyeleri","Duygu","Makro",
  "Likidasyon","Formasyon","Risk Yönetimi","Final Sentez",
];

/* ─── YARDIMCI FONKSİYONLAR ─── */
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
    SELL:"SAT", STRONG_SELL:"GÜÇLÜ SAT", BULLISH:"YÜKSELIŞ", BEARISH:"DÜŞÜŞ",
  };
  return m[s.toUpperCase()] || s;
}

function riskLabel(r) {
  if (!r) return "—";
  const m = { LOW:"DÜŞÜK", MEDIUM:"ORTA", HIGH:"YÜKSEK", EXTREME:"AŞIRI" };
  return m[r.toUpperCase()] || r;
}

function phaseLabel(p) {
  if (!p) return "—";
  const m = {
    ACCUMULATION:"BİRİKİM", MARKUP:"YÜKSELIŞ", DISTRIBUTION:"DAĞITIM",
    MARKDOWN:"DÜŞÜŞ", RE_ACCUMULATION:"YENİDEN BİRİKİM", UNKNOWN:"BELİRSİZ",
  };
  return m[p.toUpperCase()] || p;
}

function cloudLabel(c) {
  if (!c) return "—";
  if (c === "ABOVE") return "Bulut Üstünde";
  if (c === "BELOW") return "Bulut Altında";
  if (c === "INSIDE") return "Bulut İçinde";
  return c;
}

function fgLabel(label) {
  if (!label) return "—";
  const m = {
    "Fear":"Korku", "Greed":"Açgözlülük",
    "Extreme Fear":"Aşırı Korku", "Extreme Greed":"Aşırı Açgözlülük", "Neutral":"Nötr",
  };
  return m[label] || label;
}

function trendLabel(t) {
  if (!t) return "—";
  const u = t.toUpperCase();
  if (u === "BULLISH") return "YÜKSELİŞ";
  if (u === "BEARISH") return "DÜŞÜŞ";
  return "NÖTR";
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
  return "$" + n.toLocaleString("tr-TR");
}

/* ─── YENİDEN KULLANILABILIR BİLEŞENLER ─── */
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
      <div style={{ width:140, fontSize:12, color:"#8b8fa3", flexShrink:0, display:"flex", alignItems:"center", gap:6 }}>
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
      <div style={{ fontSize:10, color:col, marginTop:6, fontWeight:600 }}>{trendLabel(trend)}</div>
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
      <span style={{ color:"#555a70", flexShrink:0, minWidth:160 }}>{label}</span>
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

function FgGauge({ value, label }) {
  if (value == null) return null;
  const clampedVal = Math.max(0, Math.min(100, value));
  const color = clampedVal <= 25 ? "#ef5350" : clampedVal <= 45 ? "#ff9800" : clampedVal <= 55 ? "#ffc107" : clampedVal <= 75 ? "#4caf50" : "#00e676";
  return (
    <div style={{ padding:"16px 20px", background:"#0a0c12", borderRadius:10, border:`1px solid ${color}22` }}>
      <div style={{ fontSize:10, color:"#555a70", marginBottom:8, textTransform:"uppercase", letterSpacing:0.8 }}>
        Korku / Açgözlülük Endeksi
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ flex:1, height:10, background:"#161928", borderRadius:5, overflow:"hidden" }}>
          <div style={{ width:`${clampedVal}%`, height:"100%", background:`linear-gradient(90deg,#ef5350,#ffc107,#00e676)`, borderRadius:5 }} />
        </div>
        <span style={{ color, fontWeight:800, fontSize:18, fontFamily:"'JetBrains Mono',monospace", minWidth:36 }}>{value}</span>
        <span style={{ color, fontWeight:700, fontSize:13 }}>{fgLabel(label)}</span>
      </div>
    </div>
  );
}

/* ─── VERİ NORMALİZATÖRÜ (hem eski hem hibrit API destekli) ─── */
function normalize(raw) {
  if (!raw) return null;
  const L = raw.layers || {};
  const l = (k) => L[k] || {};
  const layerKeys = Object.keys(L).sort();
  const isHybrid = !raw.layers && !!raw.technical_indicators;

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
  const ti = raw.technical_indicators || {};
  const wy = raw.wyckoff || {};
  const md = raw.manipulation_detection || {};

  // ── Wyckoff: eski API veya hibrit API ──
  const wyckoffData = isHybrid ? {
    current_phase: phaseLabel(wy.phase),
    signal: wy.signal,
    score: wy.score,
    price_position_pct: wy.price_position_pct,
    vol_ratio: wy.vol_ratio,
    trend_30d_pct: wy.trend_30d_pct,
  } : l("1_wyckoff_analysis");

  // ── Manipülasyon ──
  const manipSignals = (md.signals || []).join(" | ") || "Tespit edilmedi";
  const manipData = isHybrid ? {
    signal: md.risk === "HIGH" ? "BEARISH" : md.risk === "MEDIUM" ? "NEUTRAL" : "BULLISH",
    score: md.score,
    wash_trading_score: md.score,
    spoofing_signals: manipSignals,
    stop_hunt_zones: md.avg_wick_ratio > 50
      ? `Fitil oranı %${md.avg_wick_ratio} — stop avı riski yüksek`
      : `Fitil oranı %${md.avg_wick_ratio} — normal`,
    whale_manipulation: "— (hibrit modda mevcut değil)",
    unusual_volume_spikes: md.vol_spike_ratio > 1.5
      ? `${md.vol_spike_ratio}x ortalama üzerinde`
      : `${md.vol_spike_ratio}x (normal seviye)`,
    vol_spike_ratio: md.vol_spike_ratio,
    avg_wick_ratio: md.avg_wick_ratio,
  } : l("4_manipulation_detection");

  // ── Teknik göstergeler ──
  const macdObj = ti.macd || {};
  const emaObj = ti.ema || {};
  const stochObj = ti.stochastic || {};
  const adxObj = ti.adx || {};
  const ichObj = ti.ichimoku || {};
  const bbObj = ti.bollinger_bands || {};
  const obvObj = ti.obv || {};

  const techData = isHybrid ? {
    signal: macdObj.trend || "NEUTRAL",
    score: scores[8],
    rsi_14: ti.rsi_14,
    macd: macdObj.histogram != null
      ? `Hat: ${macdObj.line} | Sinyal: ${macdObj.signal_line} | Histogram: ${macdObj.histogram > 0 ? "+" : ""}${macdObj.histogram}`
      : "—",
    ema_ribbon: emaObj.ema_8 != null
      ? `EMA8: ${Number(emaObj.ema_8).toFixed(4)} | EMA21: ${Number(emaObj.ema_21).toFixed(4)} | EMA50: ${Number(emaObj.ema_50).toFixed(4)}`
      : "—",
    stochastic_rsi: stochObj.k != null ? `%K: ${stochObj.k} | %D: ${stochObj.d}` : "—",
    adx: adxObj.adx != null ? `ADX: ${adxObj.adx} | +DI: ${adxObj.plus_di} | -DI: ${adxObj.minus_di}` : "—",
    ichimoku: ichObj.price_vs_cloud ? cloudLabel(ichObj.price_vs_cloud) : "—",
    vwap: ti.vwap != null ? `${Number(ti.vwap).toFixed(4)}` : "—",
  } : l("9_technical_indicators");

  // ── Volatilite ──
  const volatilityData = isHybrid ? {
    signal: bbObj.bandwidth > 0.15 ? "BEARISH" : bbObj.bandwidth < 0.04 ? "NEUTRAL" : "BULLISH",
    score: scores[6],
    volatility_regime: bbObj.bandwidth < 0.04
      ? "Düşük — Sıkışma (kırılım bekle)"
      : bbObj.bandwidth > 0.2
      ? "Yüksek volatilite"
      : "Normal",
    bollinger_band_position: bbObj.upper != null
      ? `Üst: ${Number(bbObj.upper).toFixed(4)} | Orta: ${Number(bbObj.middle).toFixed(4)} | Alt: ${Number(bbObj.lower).toFixed(4)} | %B: ${bbObj.percent_b}`
      : "—",
    current_volatility: bbObj.bandwidth != null ? `Bant genişliği: %${(bbObj.bandwidth * 100).toFixed(2)}` : "—",
    atr_assessment: "— (hibrit modda mevcut değil)",
    iv_percentile: "— (hibrit modda mevcut değil)",
  } : l("7_volatility_analysis");

  // ── On-chain (OBV proxy) ──
  const onchainData = isHybrid ? {
    signal: obvObj.trend === "POSITIVE" ? "BULLISH" : "BEARISH",
    score: scores[4],
    whale_movements: obvObj.value != null
      ? `Denge Hacmi (OBV): ${obvObj.trend === "POSITIVE" ? "Pozitif" : "Negatif"} | 5 Günlük Değişim: %${obvObj.change_5d}`
      : "—",
    exchange_netflow: obvObj.trend === "POSITIVE" ? "Net Çıkış (Boğa)" : "Net Giriş (Ayı)",
    active_addresses_trend: "— (hibrit modda mevcut değil)",
    nvt_ratio: "— (hibrit modda mevcut değil)",
    hodl_waves: "— (hibrit modda mevcut değil)",
    mvrv_zscore: "— (hibrit modda mevcut değil)",
    realized_price: "— (hibrit modda mevcut değil)",
  } : l("5_onchain_analysis");

  // ── Duygu ──
  const fg = raw.fear_greed_index;
  const sentimentData = isHybrid ? {
    signal: fg ? (fg.value > 60 ? "BULLISH" : fg.value < 40 ? "BEARISH" : "NEUTRAL") : "NEUTRAL",
    score: scores[10],
    fear_greed_index: fg ? `${fg.value} — ${fgLabel(fg.label)}` : "—",
    social_media_sentiment: "— (hibrit modda mevcut değil)",
    funding_rate: "— (hibrit modda mevcut değil)",
    long_short_ratio: "— (hibrit modda mevcut değil)",
    social_volume: "— (hibrit modda mevcut değil)",
    news_sentiment: "— (hibrit modda mevcut değil)",
  } : l("11_sentiment_analysis");

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
    manipulation_score: raw.manipulation_score ?? manipData.wash_trading_score ?? 0,
    bullish_signals_count: bullCount,
    bearish_signals_count: bearCount,
    layer_scores: scores,
    trade_direction: raw.trade_direction || "",
    risk_pct: raw.risk_pct,

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

    wyckoff: wyckoffData,
    smc: l("2_smc_analysis"),
    ict: l("3_ict_concepts"),
    manip: manipData,
    onchain: onchainData,
    orderflow: l("6_orderflow_analysis"),
    volatility: volatilityData,
    divergence: l("8_divergence_analysis"),
    tech: techData,
    sr: l("10_support_resistance"),
    sentiment: sentimentData,
    macro: l("12_macro_analysis"),
    liquidation: l("13_liquidation_analysis"),
    pattern: l("14_pattern_recognition"),
    risk: l("15_risk_management"),
    synthesis: syn,

    mm_pattern: mm.detected_mm_pattern || "—",
    mm_next: raw.ai_mm_move || mm.next_likely_move || "—",
    mm_zones: mm.accumulation_distribution_zones || "—",
    mm_trap: mm.retail_trap_warning || "—",
    mm_direction: mm.smart_money_direction || "—",

    bull_scenario: raw.ai_bull_scenario || syn.primary_scenario || "—",
    bear_scenario: raw.ai_bear_scenario || syn.alternative_scenario || "—",
    worst_scenario: syn.worst_case_scenario || "—",
    bullish_factors: syn.bullish_factors || [],
    bearish_factors: syn.bearish_factors || [],
    catalyst_watch: syn.catalyst_watch || "—",
    timeframe: syn.timeframe || "—",
    summary: raw.analysis_summary || syn.summary || raw.ai_commentary || "",

    fear_greed: raw.fear_greed_index,
    ai_used: raw.ai_used,
    warnings: raw.warnings || [],
    ai_onchain_summary: raw.ai_onchain_summary || "",
    ai_orderflow_summary: raw.ai_orderflow_summary || "",
    meta: raw._meta || {},
    isHybrid,
    raw,
  };
}

/* ─── COINGECKO FIYAT SORGULAMA ─── */
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

/* ─── ANALİZ API ÇAĞRISI ─── */
async function run(coin) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coin }),
  });
  return res.json();
}

/* ═══════════════════════════════════════════════════════════════
   ANA BİLEŞEN
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
        setResult({ error: data.error, details: data.detay || data.details });
        return;
      }
      if (data.parse_error) {
        setResult({ error: "API yanıtı işlenemedi", details: { ham: data.raw_response?.substring(0, 300) } });
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
        candles: d?.meta?.candles_analyzed,
        ai_used: d?.ai_used,
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
        <title>Deep Analyzer | Profesyonel Kripto Analiz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight:"100vh", background:"#08090d", color:"#e1e3ea", fontFamily:"'Inter',system-ui,sans-serif" }}>

        {/* ═══ BAŞLIK ═══ */}
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
            16 Katmanlı Yapay Zeka Destekli Profesyonel Kripto Analiz Sistemi
          </p>
        </header>

        <main style={{ maxWidth:960, margin:"0 auto", padding:"24px 16px 80px" }}>

          {/* ═══ GİRİŞ ALANI ═══ */}
          <Card>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <input
                value={coin}
                onChange={e => setCoin(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                placeholder="Coin sembolü girin (örn: BTC, ETH, SOL)"
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

            {/* Hızlı coin butonları */}
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

          {/* ═══ YÜKLEME ANİMASYONU ═══ */}
          {loading && (
            <Card glow="#00e67644">
              <div style={{ textAlign:"center", padding:"24px 0" }}>
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

          {/* ═══ SONUÇLAR ═══ */}
          {d && !d.error && (
            <>
              {/* ── ÜST ÖZET KARTI ── */}
              <Card glow={sColor(d.signal) + "44"}>
                {/* Satır 1: Coin + Fiyat + Rozetler */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:16, alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:12, flexWrap:"wrap" }}>
                      <span style={{ fontSize:28, fontWeight:900, fontFamily:"'JetBrains Mono',monospace" }}>
                        {d.coin || coin}
                      </span>
                      <span style={{ fontSize:22, fontWeight:700, color:"#e1e3ea", fontFamily:"'JetBrains Mono',monospace" }}>
                        {d.current_price || (price?.usd != null ? `$${price.usd.toLocaleString("tr-TR")}` : "")}
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
                      {d.high_24h && <span>24S Yüksek: <span style={{ color:"#00e676" }}>{d.high_24h}</span></span>}
                      {d.low_24h && <span>24S Düşük: <span style={{ color:"#ef5350" }}>{d.low_24h}</span></span>}
                      {d.volume_24h && <span>Hacim: <span style={{ color:"#00b0ff" }}>{d.volume_24h}</span></span>}
                      {d.market_cap && <span>Piy. Değeri: <span style={{ color:"#7c4dff" }}>{d.market_cap}</span></span>}
                      {!d.volume_24h && price?.vol && <span>Hacim: <span style={{ color:"#00b0ff" }}>{fmt(price.vol)}</span></span>}
                      {!d.market_cap && price?.mcap && <span>Piy. Değeri: <span style={{ color:"#7c4dff" }}>{fmt(price.mcap)}</span></span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    <Badge text={sLabel(d.signal)} color={sColor(d.signal)} large />
                    <Badge text={`Güven: %${d.confidence}`} color="#00b0ff" large />
                    <Badge text={`Skor: ${d.overall_score}/100`} color="#7c4dff" large />
                    <Badge text={`Risk: ${riskLabel(d.risk_level)}`} color={riskColor(d.risk_level)} large />
                  </div>
                </div>

                {/* Satır 2: Manipülasyon + Sinyal Çubuğu */}
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
                      Yükseliş / Düşüş Sinyal Dağılımı (10 sinyal üzerinden)
                    </div>
                    <SignalBar bullish={d.bullish_signals_count} bearish={d.bearish_signals_count} />
                  </div>
                </div>

                {/* Satır 3: Çoklu zaman dilimi trendi */}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <TrendBox label="GÜNLÜK" trend={d.trend_daily} />
                  <TrendBox label="4 SAAT" trend={d.trend_4h} />
                  <TrendBox label="1 SAAT" trend={d.trend_1h} />
                  <TrendBox label="15 DAK" trend={d.trend_15m} />
                </div>

                {/* Uyarılar */}
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

                {/* Meta bilgisi */}
                <div style={{ marginTop:12, fontSize:10, color:"#3a3f55", display:"flex", gap:16, flexWrap:"wrap" }}>
                  {d.meta.searches_performed != null && <span>Arama: {d.meta.searches_performed}</span>}
                  {d.meta.candles_analyzed != null && <span>📊 Mum: {d.meta.candles_analyzed}</span>}
                  {(d.meta.model || d.meta.ai_model) && <span>Model: {d.meta.model || d.meta.ai_model}</span>}
                  {d.ai_used != null && <span>{d.ai_used ? "🤖 YZ Yorumu Aktif" : "🤖 Otomatik Yorum"}</span>}
                  {d.meta.input_tokens && <span>Token: {(d.meta.input_tokens + (d.meta.output_tokens || 0)).toLocaleString("tr-TR")}</span>}
                </div>
              </Card>

              {/* ── SEKME NAVİGASYONU ── */}
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

              {/* ═══ SEKME: GENEL ═══ */}
              {activeTab === "genel" && (
                <>
                  {/* Korku/Açgözlülük */}
                  {d.fear_greed && (
                    <div style={{ marginBottom:16 }}>
                      <FgGauge value={d.fear_greed.value} label={d.fear_greed.label} />
                    </div>
                  )}

                  <Card
                    title={d.ai_used ? "YZ Destekli Analiz Yorumu" : "Otomatik Analiz Özeti"}
                    subtitle={d.ai_used ? "Yapay zeka tarafından oluşturulan kısa teknik değerlendirme" : "Teknik göstergelerden otomatik üretilen özet"}
                  >
                    <p style={{ fontSize:14, lineHeight:1.8, color:"#c0c3d1", margin:0 }}>
                      {d.summary || "Analiz özeti henüz mevcut değil."}
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
                    {d.sr.fibonacci_levels && <InfoRow label="Fibonacci" value={d.sr.fibonacci_levels} />}
                    {d.sr.pivot_points && <InfoRow label="Pivot Noktaları" value={d.sr.pivot_points} />}
                    {d.sr.volume_profile_poc && <InfoRow label="Hacim Profili POC" value={d.sr.volume_profile_poc} color="#7c4dff" />}
                    {d.sr.value_area && <InfoRow label="Değer Alanı" value={d.sr.value_area} />}
                  </Card>

                  {(d.bullish_factors.length > 0 || d.bearish_factors.length > 0) && (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
                      {d.bullish_factors.length > 0 && (
                        <Card title="Yükseliş Faktörleri" glow="#00e67622">
                          {d.bullish_factors.map((f, i) => (
                            <div key={i} style={{ fontSize:13, color:"#a5d6a7", marginBottom:6, lineHeight:1.5 }}>
                              <span style={{ color:"#00e676", marginRight:6 }}>+</span>{f}
                            </div>
                          ))}
                        </Card>
                      )}
                      {d.bearish_factors.length > 0 && (
                        <Card title="Düşüş Faktörleri" glow="#ef535022">
                          {d.bearish_factors.map((f, i) => (
                            <div key={i} style={{ fontSize:13, color:"#ef9a9a", marginBottom:6, lineHeight:1.5 }}>
                              <span style={{ color:"#ef5350", marginRight:6 }}>−</span>{f}
                            </div>
                          ))}
                        </Card>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ═══ SEKME: YAPI (Wyckoff, SMC, ICT) ═══ */}
              {activeTab === "yapi" && (
                <>
                  <LayerCard title="Wyckoff Analizi" icon="📐" signal={d.wyckoff.signal} score={d.wyckoff.score}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:8 }}>
                      <InfoRow label="Wyckoff Fazı" value={d.wyckoff.current_phase} color="#e1e3ea" />
                      {d.wyckoff.price_position_pct != null && (
                        <InfoRow label="60G Aralık Konumu" value={`%${d.wyckoff.price_position_pct}`} />
                      )}
                      {d.wyckoff.vol_ratio != null && (
                        <InfoRow label="Hacim Oranı (7G/21G)" value={`${d.wyckoff.vol_ratio}x`} color={d.wyckoff.vol_ratio > 1.2 ? "#00e676" : "#c0c3d1"} />
                      )}
                      {d.wyckoff.trend_30d_pct != null && (
                        <InfoRow
                          label="60 Günlük Trend"
                          value={`${d.wyckoff.trend_30d_pct > 0 ? "+" : ""}${d.wyckoff.trend_30d_pct}%`}
                          color={d.wyckoff.trend_30d_pct > 0 ? "#00e676" : "#ef5350"}
                        />
                      )}
                      {d.wyckoff.sub_phase && <InfoRow label="Alt Faz" value={d.wyckoff.sub_phase} color="#ffc107" />}
                      {d.wyckoff.composite_operator_action && <InfoRow label="Bileşik Operatör" value={d.wyckoff.composite_operator_action} />}
                      {d.wyckoff.volume_analysis && <InfoRow label="Hacim Analizi" value={d.wyckoff.volume_analysis} />}
                    </div>
                    <DetailText text={d.wyckoff.details} />
                  </LayerCard>

                  <LayerCard title="Akıllı Para Yapısı (SMC)" icon="🏗" signal={d.smc.signal} score={d.smc.score}>
                    <InfoRow label="Piyasa Yapısı" value={d.smc.market_structure} color="#e1e3ea" />
                    <InfoRow label="Emir Blokları" value={d.smc.order_blocks} color="#ffc107" />
                    <InfoRow label="Adil Değer Boşlukları" value={d.smc.fair_value_gaps} color="#00b0ff" />
                    <InfoRow label="Yapı Kırılması / Karakter Değişimi" value={d.smc.break_of_structure} />
                    <InfoRow label="Prim / İskonto Bölgesi" value={d.smc.premium_discount} />
                    <DetailText text={d.smc.details} />
                    {d.isHybrid && !d.smc.market_structure && (
                      <div style={{ fontSize:12, color:"#3a3f55", textAlign:"center", padding:"12px 0" }}>
                        Bu katman hibrit analiz modunda otomatik hesaplanmamaktadır.
                      </div>
                    )}
                  </LayerCard>

                  <LayerCard title="ICT Konseptleri" icon="🎯" signal={d.ict.signal} score={d.ict.score}>
                    <InfoRow label="Likidite Havuzları" value={d.ict.liquidity_pools} color="#ffc107" />
                    <InfoRow label="Optimal Giriş Bölgesi" value={d.ict.optimal_trade_entry} color="#00e676" />
                    <InfoRow label="İşlem Penceresi" value={d.ict.killzones} />
                    <InfoRow label="Sahte Hamle" value={d.ict.judas_swing} />
                    <InfoRow label="Yapıcı Modeli" value={d.ict.market_maker_model} color="#7c4dff" />
                    <DetailText text={d.ict.details} />
                    {d.isHybrid && !d.ict.liquidity_pools && (
                      <div style={{ fontSize:12, color:"#3a3f55", textAlign:"center", padding:"12px 0" }}>
                        Bu katman hibrit analiz modunda otomatik hesaplanmamaktadır.
                      </div>
                    )}
                  </LayerCard>
                </>
              )}

              {/* ═══ SEKME: MANİPÜLASYON ═══ */}
              {activeTab === "manipulasyon" && (
                <LayerCard title="Manipülasyon Tespiti" icon="🕵" signal={d.manip.signal} score={d.manip.score}>
                  <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
                    <Badge
                      text={`Manipülasyon Skoru: ${d.manip.wash_trading_score ?? d.manipulation_score}/100`}
                      color={mColor(d.manip.wash_trading_score ?? d.manipulation_score)}
                      large
                    />
                    {d.manip.vol_spike_ratio != null && (
                      <Badge
                        text={`Hacim Artışı: ${d.manip.vol_spike_ratio}x`}
                        color={d.manip.vol_spike_ratio > 2 ? "#ef5350" : d.manip.vol_spike_ratio > 1.5 ? "#ffc107" : "#4caf50"}
                        large
                      />
                    )}
                  </div>
                  <InfoRow label="Tespit Edilen Sinyaller" value={d.manip.spoofing_signals} color="#ffc107" />
                  <InfoRow label="Stop Avı Bölgeleri" value={d.manip.stop_hunt_zones} color="#ff9800" />
                  <InfoRow label="Balina Manipülasyonu" value={d.manip.whale_manipulation} />
                  <InfoRow label="Anormal Hacim" value={d.manip.unusual_volume_spikes} color="#ff9800" />
                  {d.manip.avg_wick_ratio != null && (
                    <InfoRow label="Ortalama Fitil Oranı" value={`%${d.manip.avg_wick_ratio}`} color={d.manip.avg_wick_ratio > 50 ? "#ef5350" : "#c0c3d1"} />
                  )}
                  <DetailText text={d.manip.details} />
                </LayerCard>
              )}

              {/* ═══ SEKME: SİNYALLER ═══ */}
              {activeTab === "sinyaller" && (
                <>
                  <LayerCard title="Teknik Göstergeler" icon="📊" signal={d.tech.signal} score={d.tech.score}>
                    <InfoRow label="RSI (14)" value={d.tech.rsi_14 != null ? String(d.tech.rsi_14) + (d.tech.rsi_14 < 30 ? " — Aşırı Satım" : d.tech.rsi_14 > 70 ? " — Aşırı Alım" : " — Nötr") : "—"} color={d.tech.rsi_14 < 30 ? "#00e676" : d.tech.rsi_14 > 70 ? "#ef5350" : "#e1e3ea"} />
                    <InfoRow label="MACD" value={d.tech.macd} />
                    <InfoRow label="EMA Şeridi (8/21/50)" value={d.tech.ema_ribbon} />
                    <InfoRow label="Stokastik Osilatör" value={d.tech.stochastic_rsi} />
                    <InfoRow label="ADX (Trend Gücü)" value={d.tech.adx} />
                    <InfoRow label="Ichimoku Bulutu" value={d.tech.ichimoku} />
                    <InfoRow label="VWAP" value={d.tech.vwap} color="#7c4dff" />
                    <DetailText text={d.tech.details} />
                  </LayerCard>

                  <LayerCard title="Volatilite Analizi" icon="🌊" signal={d.volatility.signal} score={d.volatility.score}>
                    <InfoRow label="Volatilite Rejimi" value={d.volatility.volatility_regime} color="#e1e3ea" />
                    <InfoRow label="Bollinger Bandı" value={d.volatility.bollinger_band_position} />
                    <InfoRow label="Mevcut Volatilite" value={d.volatility.current_volatility} />
                    <InfoRow label="Ortalama Gerçek Aralık" value={d.volatility.atr_assessment} />
                    <InfoRow label="Örtük Volatilite Yüzdesi" value={d.volatility.iv_percentile} color="#7c4dff" />
                    <DetailText text={d.volatility.details} />
                  </LayerCard>

                  <LayerCard title="Diverjans Analizi" icon="🔀" signal={d.divergence.signal} score={d.divergence.score}>
                    <InfoRow label="RSI Diverjansı" value={d.divergence.rsi_divergence} />
                    <InfoRow label="MACD Diverjansı" value={d.divergence.macd_divergence} />
                    <InfoRow label="Hacim / Fiyat" value={d.divergence.volume_price_divergence} />
                    <InfoRow label="Açık Pozisyon / Fiyat" value={d.divergence.oi_price_divergence} />
                    <InfoRow label="Gizli Diverjanslar" value={d.divergence.hidden_divergences} color="#ffc107" />
                    <DetailText text={d.divergence.details} />
                    {d.isHybrid && !d.divergence.rsi_divergence && (
                      <div style={{ fontSize:12, color:"#3a3f55", textAlign:"center", padding:"12px 0" }}>
                        Bu katman hibrit analiz modunda otomatik hesaplanmamaktadır.
                      </div>
                    )}
                  </LayerCard>

                  <LayerCard title="Duygu ve Makro" icon="🌐" signal={d.sentiment.signal} score={d.sentiment.score}>
                    <InfoRow label="Korku / Açgözlülük" value={d.sentiment.fear_greed_index} color="#ffc107" />
                    <InfoRow label="Sosyal Medya Duygusu" value={d.sentiment.social_media_sentiment} />
                    <InfoRow label="Fonlama Oranı" value={d.sentiment.funding_rate} color="#00b0ff" />
                    <InfoRow label="Uzun / Kısa Oranı" value={d.sentiment.long_short_ratio} />
                    <InfoRow label="Sosyal Hacim" value={d.sentiment.social_volume} />
                    <InfoRow label="Haber Etkisi" value={d.sentiment.news_sentiment} />
                    <DetailText text={d.sentiment.details} />
                  </LayerCard>

                  <LayerCard title="Makro Ortam" icon="🏛" signal={d.macro.signal} score={d.macro.score}>
                    <InfoRow label="BTC Dominansı" value={d.macro.btc_dominance_trend} />
                    <InfoRow label="DXY Korelasyonu" value={d.macro.dxy_correlation} />
                    <InfoRow label="FED Politikası" value={d.macro.fed_policy_impact} />
                    <InfoRow label="Piyasa Döngüsü" value={d.macro.market_cycle_position} color="#7c4dff" />
                    <InfoRow label="Toplam Kripto Piy. Değeri" value={d.macro.total_crypto_mcap} color="#00b0ff" />
                    <InfoRow label="Altcoin Sezonu Endeksi" value={d.macro.altseason_index} />
                    <DetailText text={d.macro.details} />
                    {d.isHybrid && !d.macro.btc_dominance_trend && (
                      <div style={{ fontSize:12, color:"#3a3f55", textAlign:"center", padding:"12px 0" }}>
                        Bu katman hibrit analiz modunda otomatik hesaplanmamaktadır.
                      </div>
                    )}
                  </LayerCard>

                  <LayerCard title="Formasyon Tanıma" icon="🔍" signal={d.pattern.signal} score={d.pattern.score}>
                    <InfoRow label="Grafik Formasyonu" value={d.pattern.chart_patterns} />
                    <InfoRow label="Mum Formasyonu" value={d.pattern.candlestick_patterns} />
                    <InfoRow label="Harmonik Formasyon" value={d.pattern.harmonic_patterns} />
                    <InfoRow label="Elliott Dalgası" value={d.pattern.elliott_wave_count} />
                    <InfoRow label="Ölçülü Hedef" value={d.pattern.measured_move_target} color="#00e676" />
                    <DetailText text={d.pattern.details} />
                    {d.isHybrid && !d.pattern.chart_patterns && (
                      <div style={{ fontSize:12, color:"#3a3f55", textAlign:"center", padding:"12px 0" }}>
                        Bu katman hibrit analiz modunda otomatik hesaplanmamaktadır.
                      </div>
                    )}
                  </LayerCard>
                </>
              )}

              {/* ═══ SEKME: ZİNCİR VERİSİ ═══ */}
              {activeTab === "onchain" && (
                <>
                  <LayerCard title="Zincir Üstü Metrikler" icon="⛓" signal={d.onchain.signal} score={d.onchain.score}>
                    <InfoRow label="Balina / Denge Hacmi" value={d.onchain.whale_movements} />
                    <InfoRow label="Borsa Net Akışı" value={d.onchain.exchange_netflow}
                      color={String(d.onchain.exchange_netflow).includes("Çıkış") || String(d.onchain.exchange_netflow).includes("Boğa") ? "#00e676" : "#ef5350"} />
                    <InfoRow label="Aktif Adres Trendi" value={d.onchain.active_addresses_trend} />
                    <InfoRow label="NVT Oranı" value={d.onchain.nvt_ratio} />
                    <InfoRow label="HODL Dalgaları" value={d.onchain.hodl_waves} />
                    <InfoRow label="MVRV Z-Skoru" value={d.onchain.mvrv_zscore} color="#7c4dff" />
                    <InfoRow label="Gerçekleşmiş Fiyat" value={d.onchain.realized_price} color="#ffc107" />
                    <DetailText text={d.onchain.details} />
                  </LayerCard>

                  <LayerCard title="Emir Akışı Analizi" icon="📈" signal={d.orderflow.signal} score={d.orderflow.score}>
                    <InfoRow label="Alış / Satış Dengesizliği" value={d.orderflow.bid_ask_imbalance} />
                    <InfoRow label="Agresif Alım / Satım" value={d.orderflow.aggressive_buying_selling} />
                    <InfoRow label="Kümülatif Hacim Deltası" value={d.orderflow.cumulative_volume_delta} />
                    <InfoRow label="Absorpsiyon Tespiti" value={d.orderflow.absorption_detection} />
                    <InfoRow label="Açık Pozisyon Değişimi" value={d.orderflow.open_interest_change} color="#00b0ff" />
                    <DetailText text={d.orderflow.details} />
                    {d.isHybrid && !d.orderflow.bid_ask_imbalance && (
                      <div style={{ fontSize:12, color:"#3a3f55", textAlign:"center", padding:"12px 0" }}>
                        Bu katman hibrit analiz modunda otomatik hesaplanmamaktadır.
                      </div>
                    )}
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
                    <InfoRow label="Fonlama Oranı Aşırılığı" value={d.liquidation.funding_rate_extremes} />
                    <InfoRow label="24S Büyük Likidasyonlar" value={d.liquidation.largest_liquidations_24h} color="#ff9800" />
                    <DetailText text={d.liquidation.details} />
                    {d.isHybrid && !d.liquidation.liquidation_heatmap && (
                      <div style={{ fontSize:12, color:"#3a3f55", textAlign:"center", padding:"12px 0" }}>
                        Bu katman hibrit analiz modunda otomatik hesaplanmamaktadır.
                      </div>
                    )}
                  </LayerCard>
                </>
              )}

              {/* ═══ SEKME: İŞLEM PLANI ═══ */}
              {activeTab === "trade" && (
                <Card title="İşlem Planı" subtitle="Risk yönetimi parametreleri ile profesyonel giriş stratejisi" glow="#00b0ff22">
                  {d.trade_direction && (
                    <div style={{ marginBottom:16 }}>
                      <Badge
                        text={d.trade_direction === "LONG" ? "📈 UZUN POZİSYON (LONG)" : "📉 KISA POZİSYON (SHORT)"}
                        color={d.trade_direction === "LONG" ? "#00e676" : "#ef5350"}
                        large
                      />
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:10, marginBottom:16 }}>
                    <StatBox label="Keskin Giriş" value={d.entry_sniper} color="#00b0ff" mono />
                    <StatBox label="Zarar Kes" value={d.stop_loss} color="#ef5350" mono />
                    <StatBox label="Hedef 1" value={d.tp1} color="#00e676" mono />
                    <StatBox label="Hedef 2" value={d.tp2} color="#00e676" mono />
                    <StatBox label="Hedef 3" value={d.tp3} color="#00e676" mono />
                    <StatBox label="Kaldıraç" value={d.leverage} color="#ffc107" mono />
                    <StatBox label="Risk / Ödül" value={d.risk_reward} color="#7c4dff" mono />
                    <StatBox label="Pozisyon Büyüklüğü" value={d.position_size} color="#00b0ff" mono />
                    {d.risk_pct != null && <StatBox label="Risk %" value={`%${d.risk_pct}`} color="#ff9800" mono />}
                    {d.max_drawdown && d.max_drawdown !== "—" && <StatBox label="Max Kayıp" value={d.max_drawdown} color="#ff9800" mono />}
                    {d.invalidation && d.invalidation !== "—" && <StatBox label="İptal Seviyesi" value={d.invalidation} color="#ef5350" mono />}
                  </div>
                  <DetailText text={d.risk.details} />
                </Card>
              )}

              {/* ═══ SEKME: PİYASA YAPICISI ═══ */}
              {activeTab === "mm" && (
                <>
                  <Card title="Piyasa Yapıcısı Stratejisi" subtitle="Kurumsal akıllı para analizi" glow="#7c4dff22">
                    <InfoRow label="Tespit Edilen YP Formasyonu" value={d.mm_pattern} color="#e1e3ea" />
                    <InfoRow label="Sonraki Olası Hamle" value={d.mm_next} color="#ffc107" />
                    <InfoRow label="Birikim / Dağıtım Bölgeleri" value={d.mm_zones} />
                    <InfoRow label="Perakende Tuzağı Uyarısı" value={d.mm_trap} color="#ef5350" />
                    <InfoRow label="Akıllı Para Yönü" value={d.mm_direction} color="#00e676" />
                    {d.isHybrid && d.mm_pattern === "—" && (
                      <div style={{ fontSize:12, color:"#3a3f55", textAlign:"center", padding:"12px 0", marginTop:8 }}>
                        Bu sekme hibrit analiz modunda otomatik hesaplanmamaktadır.
                      </div>
                    )}
                  </Card>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
                    <Card glow="#00e67622">
                      <div style={{ fontSize:13, color:"#00e676", fontWeight:700, marginBottom:10 }}>
                        Yükseliş Senaryosu (Birincil)
                      </div>
                      <div style={{ fontSize:13, color:"#c0c3d1", lineHeight:1.7 }}>{d.bull_scenario}</div>
                    </Card>
                    <Card glow="#ef535022">
                      <div style={{ fontSize:13, color:"#ef5350", fontWeight:700, marginBottom:10 }}>
                        Düşüş Senaryosu (Alternatif)
                      </div>
                      <div style={{ fontSize:13, color:"#c0c3d1", lineHeight:1.7 }}>{d.bear_scenario}</div>
                    </Card>
                  </div>

                  {d.worst_scenario !== "—" && (
                    <Card glow="#d5000022">
                      <div style={{ fontSize:13, color:"#d50000", fontWeight:700, marginBottom:10 }}>
                        En Kötü Durum Senaryosu
                      </div>
                      <div style={{ fontSize:13, color:"#ef9a9a", lineHeight:1.7 }}>{d.worst_scenario}</div>
                    </Card>
                  )}
                </>
              )}

              {/* ═══ SEKME: SKORLAR ═══ */}
              {activeTab === "skorlar" && (
                <Card title="16 Katman Performans Skorları" subtitle="Her katmanın yükseliş gücü (0=güçlü düşüş, 5=nötr, 10=güçlü yükseliş)">
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

          {/* ═══ HATA DURUMU ═══ */}
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
                İstek sınırı aştıysanız 1 dakika bekleyip tekrar deneyebilirsiniz.
              </div>
            </Card>
          )}

          {/* ═══ GEÇMİŞ (son 20 analiz) ═══ */}
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
                          ${h.price.toLocaleString("tr-TR")}
                        </span>
                      )}
                      <Badge text={sLabel(h.signal)} color={sColor(h.signal)} />
                      {h.score != null && <Badge text={`${h.score}/100`} color="#7c4dff" />}
                    </div>
                    <div style={{ display:"flex", gap:12, alignItems:"center", color:"#3a3f55", fontSize:11, flexShrink:0 }}>
                      {h.candles && <span>📊 {h.candles} mum</span>}
                      {h.ai_used != null && <span>{h.ai_used ? "🤖" : "📊"}</span>}
                      <span>{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>

        {/* ═══ GLOBAL STİLLER ═══ */}
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
