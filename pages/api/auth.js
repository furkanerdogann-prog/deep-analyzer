async function sbFetch(path, method, body, token) {
  const key = path.includes('/admin/') ? SERVICE_KEY : ANON_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${token || key}`,
  };
  const r = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  try { return { status: r.status, data: JSON.parse(text) }; }
  catch { return { status: r.status, data: { error: text } }; }
}

async function dbFetch(path, method, body, token) {
  const key = token ? SERVICE_KEY : SERVICE_KEY;
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  try { return { status: r.status, data: JSON.parse(text) }; }
  catch { return { status: r.status, data: [] }; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action } = req.query;

  // KAYIT
  if (action === 'register') {
    const { email, password, full_name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' });

    const { status, data } = await sbFetch('/signup', 'POST', {
      email, password,
      data: { full_name }
    });

    if (status >= 400) {
      const msg = data?.msg || data?.message || data?.error_description || data?.error || 'Kayıt hatası';
      return res.status(400).json({ error: msg });
    }

    // Kayıt başarılı — otomatik giriş yap
    const login = await sbFetch('/token?grant_type=password', 'POST', { email, password });
    if (login.status >= 400) {
      return res.status(200).json({ success: true, message: 'Kayıt başarılı, giriş yapın' });
    }

    return res.status(200).json({
      success: true,
      session: login.data,
      user: login.data.user
    });
  }

  // GİRİŞ
  if (action === 'login') {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' });

    const { status, data } = await sbFetch('/token?grant_type=password', 'POST', { email, password });

    if (status >= 400) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    return res.status(200).json({ success: true, session: data, user: data.user });
  }

  // PROFİL
  if (action === 'profile') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token gerekli' });

    const { status, data } = await sbFetch('/user', 'GET', null, token);
    if (status >= 400) return res.status(401).json({ error: 'Geçersiz token' });

    const user = data;
    const { data: profiles } = await dbFetch(`/profiles?id=eq.${user.id}&select=*`);
    const profile = Array.isArray(profiles) ? profiles[0] : null;

    // Profil yoksa oluştur
    if (!profile) {
      await dbFetch('/profiles', 'POST', {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        plan: 'free',
        daily_analyses: 0,
      });
      return res.status(200).json({ user, profile: { id: user.id, email: user.email, plan: 'free', daily_analyses: 0 } });
    }

    return res.status(200).json({ user, profile });
  }

  // ANALİZ KOTA KONTROL
  if (action === 'check-analysis') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Giriş yapmanız gerekli' });

    const { status, data: user } = await sbFetch('/user', 'GET', null, token);
    if (status >= 400) return res.status(401).json({ error: 'Geçersiz oturum' });

    const { data: profiles } = await dbFetch(`/profiles?id=eq.${user.id}&select=*`);
    let profile = Array.isArray(profiles) ? profiles[0] : null;

    if (!profile) {
      await dbFetch('/profiles', 'POST', {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        plan: 'free',
        daily_analyses: 0,
      });
      profile = { plan: 'free', daily_analyses: 0, last_analysis_date: null };
    }

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = profile.last_analysis_date !== today;
    const currentCount = isNewDay ? 0 : (profile.daily_analyses || 0);
    const limits = { free: 3, pro: 999999, elite: 999999 };
    const limit = limits[profile.plan] || 3;

    if (currentCount >= limit) {
      return res.status(429).json({
        error: `Günlük ${limit} analiz hakkınız doldu`,
        plan: profile.plan, limit, used: currentCount, upgrade: true
      });
    }

    // Sayacı artır
    await dbFetch(`/profiles?id=eq.${user.id}`, 'PATCH', {
      daily_analyses: currentCount + 1,
      last_analysis_date: today
    });

    return res.status(200).json({
      allowed: true, plan: profile.plan,
      used: currentCount + 1, limit,
      remaining: limit - currentCount - 1
    });
  }

  return res.status(400).json({ error: 'Geçersiz action' });
}
