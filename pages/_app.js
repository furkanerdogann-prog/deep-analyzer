// pages/_app.js — Google Analytics
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const GA_ID = 'G-5GKNTT4ZKG';

function gtag(...args) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // GA script yükle
    const script1 = document.createElement('script');
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    `;
    document.head.appendChild(script2);

    // Sayfa değişikliklerini takip et
    const handleRoute = (url) => {
      if (typeof window.gtag === 'function') {
        window.gtag('config', '${GA_ID}', { page_path: url });
      }
    };
    router.events.on('routeChangeComplete', handleRoute);
    return () => router.events.off('routeChangeComplete', handleRoute);
  }, [router.events]);

  return <Component {...pageProps} />;
}
