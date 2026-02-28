import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { action } = req.query;

  // KAYIT
  if (action === 'register') {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' });
    const { data, error } = await supabase.auth.admin.createUser({
      email, password,
      user_metadata: { full_name },
      email_confirm: true
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true, user: data.user });
  }

  // GİRİŞ
  if (action === 'login') {
    const { email, password } = req.body;
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Email veya şifre hatalı' });
    return res.status(200).json({ success: true, session: data.session, user: data.user });
  }

  // PROFIL GETİR
  if (action === 'profile') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token gerekli' });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Geçersiz token' });
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return res.status(200).json({ user, profile });
  }

  // ANALİZ HAKKI KONTROL & GÜNCELLE
  if (action === 'check-analysis') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Giriş yapmanız gerekli' });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Geçersiz oturum' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profil bulunamadı' });

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = profile.last_analysis_date !== today;
    const currentCount = isNewDay ? 0 : (profile.daily_analyses || 0);

    const limits = { free: 3, pro: 999999, elite: 999999 };
    const limit = limits[profile.plan] || 3;

    if (currentCount >= limit) {
      return res.status(429).json({
        error: 'Günlük limit doldu',
        plan: profile.plan,
        limit,
        used: currentCount,
        upgrade: true
      });
    }

    // Sayacı artır
    await supabase.from('profiles').update({
      daily_analyses: currentCount + 1,
      last_analysis_date: today
    }).eq('id', user.id);

    return res.status(200).json({
      allowed: true,
      plan: profile.plan,
      used: currentCount + 1,
      limit,
      remaining: limit - currentCount - 1
    });
  }

  // ÇIKIŞ
  if (action === 'logout') {
    return res.status(200).json({ success: true });
  }

  return res.status(400).json({ error: 'Geçersiz action' });
}
