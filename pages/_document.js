import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔱</text></svg>" />
        <meta name="description" content="Deep Trade Scan - CHARTOS Engine ile profesyonel kripto analizi" />
        <meta property="og:title" content="Deep Trade Scan" />
        <meta property="og:description" content="CHARTOS Engine ile 7 katmanlı tanrısal kripto analizi" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
