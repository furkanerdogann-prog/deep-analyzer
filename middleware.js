import { NextResponse } from 'next/server';

// Güvenlik middleware — tüm API rotalarını korur
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // API güvenlik katmanı
  if (pathname.startsWith('/api/')) {
    const res = NextResponse.next();

    // Rate limiting headers
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // /api/analyze ve /api/telegram-bot sadece kendi domain'den erişilebilir
    if (pathname === '/api/analyze' || pathname === '/api/telegram-bot') {
      const origin = request.headers.get('origin') || '';
      const referer = request.headers.get('referer') || '';
      const userAgent = request.headers.get('user-agent') || '';

      const allowedOrigins = [
        'https://deeptradescan.com',
        'https://www.deeptradescan.com',
        'http://localhost:3000',
        'http://localhost:3001',
      ];

      // telegram-bot sadece cron-job veya internal çağrı
      if (pathname === '/api/telegram-bot') {
        const key = request.nextUrl.searchParams.get('key');
        const cronSecret = process.env.CRON_SECRET || 'chartos-secret-2024';
        if (key !== cronSecret) {
          return new NextResponse(JSON.stringify({ error: 'Yetkisiz erişim' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return res;
      }

      // analyze — sadece kendi sitesinden POST
      if (pathname === '/api/analyze') {
        const method = request.method;
        if (method !== 'POST') {
          return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        // Bot/scraper engelle
        const botPatterns = ['curl', 'wget', 'python-requests', 'scrapy', 'httpclient', 'okhttp'];
        const isBot = botPatterns.some(p => userAgent.toLowerCase().includes(p));
        const isAllowedOrigin = allowedOrigins.some(o => origin.startsWith(o) || referer.startsWith(o));

        if (isBot && !isAllowedOrigin) {
          return new NextResponse(JSON.stringify({ error: 'Erişim reddedildi' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return res;
      }
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
