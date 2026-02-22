// pages/_document.js — SEO Meta Tagları
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔱</text></svg>" />

        {/* Temel SEO */}
        <meta name="description" content="Deep Trade Scan - CHARTOS Engine ile profesyonel kripto analizi. BTC, ETH, SOL ve 200+ coin için 7 katmanlı AI destekli teknik analiz. Smart Money, Wyckoff, ICT." />
        <meta name="keywords" content="kripto analiz, bitcoin analiz, teknik analiz, smart money, wyckoff, ICT, BTC, ETH, SOL, coin analiz, chartos" />
        <meta name="author" content="Deep Trade Scan" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://deeptradescan.com" />
        <meta property="og:title" content="Deep Trade Scan — CHARTOS Kripto Analiz" />
        <meta property="og:description" content="200+ coin için 7 katmanlı AI destekli kripto analizi. Smart Money, Wyckoff, ICT metodolojileri ile tanrısal teknik analiz." />
        <meta property="og:image" content="https://deeptradescan.com/og-image.png" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:site_name" content="Deep Trade Scan" />

        {/* Twitter/X Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@deeptradescan" />
        <meta name="twitter:title" content="Deep Trade Scan — CHARTOS Kripto Analiz" />
        <meta name="twitter:description" content="200+ coin için 7 katmanlı AI destekli kripto analizi. Smart Money • Wyckoff • ICT" />
        <meta name="twitter:image" content="https://deeptradescan.com/og-image.png" />

        {/* Tema rengi */}
        <meta name="theme-color" content="#030712" />

        {/* Canonical */}
        <link rel="canonical" href="https://deeptradescan.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}