// pages/api/admin.js
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SVC = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'furkan@deeptradescan.com';

const db = async (path, method = 'GET', body) => {
  const r = await fetch(`${SB_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SVC,
      'Authorization': `Bearer ${SVC}`,
      'Prefer': 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  try { return { ok: r.ok, status: r.status, data: JSON.parse(t) }; }
  catch { return { ok: false, status: r.status, data: [] }; }
};

const getUser = async (token) => {
  if (!token) return null;
  const r = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { 'apikey': SVC, 'Authorization': `Bearer ${token}` }
  });
  const d = await r.json();
  return d?.email ? d : null;
};

const verifyAdmin = async (token) => {
  const user = await getUser(token);
  if (!user) return null;
  // Email kontrolü — admins tablosu veya env ADMIN_EMAIL
  if (user.email === ADMIN_EMAIL) return user;
  const { data } = await db(`/admins?email=eq.${encodeURIComponent(user.email)}&select=email`);
  if (Array.isArray(data) && data.length > 0) return user;
  return null;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  const { action } = req.query;

  const admin = await verifyAdmin(token);
  if (!admin) return res.status(403).json({ error: 'Yetkisiz erişim' });

  // ── STATS ────────────────────────────────────────────────────────
  if (action === 'stats') {
    const [profRes, ticketRes, authRes] = await Promise.all([
      db('/profiles?select=plan,created_at,banned'),
      db('/support_messages?status=eq.open&is_from_admin=eq.false&select=id'),
      fetch(`${SB_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
        headers: { 'apikey': SVC, 'Authorization': `Bearer ${SVC}` }
      }).then(r => r.json()),
    ]);

    const profiles = Array.isArray(profRes.data) ? profRes.data : [];
    const totalAuthUsers = authRes?.users?.length || profiles.length;

    return res.status(200).json({
      totalUsers: totalAuthUsers,
      freeUsers: profiles.filter(p => (p.plan || 'free') === 'free').length,
      proUsers: profiles.filter(p => p.plan === 'pro').length,
      eliteUsers: profiles.filter(p => p.plan === 'elite').length,
      bannedUsers: profiles.filter(p => p.banned).length,
      openTickets: Array.isArray(ticketRes.data) ? ticketRes.data.length : 0,
    });
  }

  // ── ALL USERS (auth + profiles joined) ──────────────────────────
  if (action === 'users') {
    // Supabase admin users API
    const authRes = await fetch(`${SB_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: { 'apikey': SVC, 'Authorization': `Bearer ${SVC}` }
    });
    const authData = await authRes.json();
    const authUsers = authData?.users || [];

    const { data: profiles } = await db('/profiles?select=*');
    const profileMap = {};
    if (Array.isArray(profiles)) profiles.forEach(p => { profileMap[p.id] = p; });

    const merged = authUsers.map(u => ({
      id: u.id,
      email: u.email,
      full_name: profileMap[u.id]?.full_name || u.user_metadata?.full_name || '',
      plan: profileMap[u.id]?.plan || 'free',
      daily_analyses: profileMap[u.id]?.daily_analyses || 0,
      last_analysis_date: profileMap[u.id]?.last_analysis_date || null,
      banned: profileMap[u.id]?.banned || false,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      provider: u.app_metadata?.provider || 'email',
    }));

    return res.status(200).json({ users: merged });
  }

  // ── SET PLAN ─────────────────────────────────────────────────────
  if (action === 'set-plan') {
    const { userId, plan } = req.body || {};
    if (!userId || !['free','pro','elite'].includes(plan))
      return res.status(400).json({ error: 'Geçersiz parametre' });

    // Profil yoksa oluştur
    const { data: existing } = await db(`/profiles?id=eq.${userId}&select=id`);
    if (!Array.isArray(existing) || existing.length === 0) {
      await db('/profiles', 'POST', { id: userId, plan, daily_analyses: 0 });
    } else {
      await db(`/profiles?id=eq.${userId}`, 'PATCH', { plan, daily_analyses: 0 });
    }
    return res.status(200).json({ success: true });
  }

  // ── BAN / UNBAN ──────────────────────────────────────────────────
  if (action === 'ban-user') {
    const { userId, banned } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId gerekli' });
    const { data: existing } = await db(`/profiles?id=eq.${userId}&select=id`);
    if (!Array.isArray(existing) || existing.length === 0) {
      await db('/profiles', 'POST', { id: userId, banned: !!banned });
    } else {
      await db(`/profiles?id=eq.${userId}`, 'PATCH', { banned: !!banned });
    }
    // Supabase auth ban
    await fetch(`${SB_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'apikey': SVC, 'Authorization': `Bearer ${SVC}` },
      body: JSON.stringify({ ban_duration: banned ? '876000h' : 'none' })
    });
    return res.status(200).json({ success: true });
  }

  // ── DELETE USER ──────────────────────────────────────────────────
  if (action === 'delete-user') {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId gerekli' });
    await db(`/profiles?id=eq.${userId}`, 'DELETE');
    await fetch(`${SB_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'apikey': SVC, 'Authorization': `Bearer ${SVC}` }
    });
    return res.status(200).json({ success: true });
  }

  // ── RESET LIMIT ──────────────────────────────────────────────────
  if (action === 'reset-limit') {
    const { userId } = req.body || {};
    await db(`/profiles?id=eq.${userId}`, 'PATCH', { daily_analyses: 0, last_analysis_date: null });
    return res.status(200).json({ success: true });
  }

  // ── SUPPORT LIST ─────────────────────────────────────────────────
  if (action === 'support-list') {
    const { status } = req.query;
    const filter = status && status !== 'all' ? `&status=eq.${status}` : '';
    const { data } = await db(`/support_messages?select=*${filter}&order=created_at.desc&limit=200`);
    return res.status(200).json({ messages: Array.isArray(data) ? data : [] });
  }

  // ── SUPPORT REPLY ────────────────────────────────────────────────
  if (action === 'support-reply') {
    const { messageId, reply, conversationId } = req.body || {};
    if (!reply?.trim()) return res.status(400).json({ error: 'Cevap gerekli' });

    await db(`/support_messages?id=eq.${messageId}`, 'PATCH', {
      status: 'replied',
      replied_at: new Date().toISOString(),
    });

    const { data: orig } = await db(`/support_messages?id=eq.${messageId}&select=user_id,user_email`);
    const o = Array.isArray(orig) ? orig[0] : {};

    await db('/support_messages', 'POST', {
      user_id: o?.user_id || null,
      user_email: o?.user_email || null,
      message: reply,
      status: 'admin_reply',
      is_from_admin: true,
      conversation_id: conversationId || messageId,
    });

    return res.status(200).json({ success: true });
  }

  // ── SUPPORT CLOSE ────────────────────────────────────────────────
  if (action === 'support-close') {
    const { messageId } = req.body || {};
    await db(`/support_messages?id=eq.${messageId}`, 'PATCH', { status: 'closed' });
    return res.status(200).json({ success: true });
  }

  // ── BROADCAST ────────────────────────────────────────────────────
  if (action === 'broadcast') {
    const { message } = req.body || {};
    if (!message?.trim()) return res.status(400).json({ error: 'Mesaj gerekli' });
    const { data: profiles } = await db('/profiles?select=id,email');
    let sent = 0;
    if (Array.isArray(profiles)) {
      await Promise.all(profiles.map(u => {
        sent++;
        return db('/support_messages', 'POST', {
          user_id: u.id,
          user_email: u.email,
          message,
          status: 'broadcast',
          is_from_admin: true,
        });
      }));
    }
    return res.status(200).json({ success: true, sent });
  }

  // ── ANALYSIS LOG ─────────────────────────────────────────────────
  if (action === 'analysis-log') {
    const { data } = await db('/profiles?select=*&order=daily_analyses.desc&limit=100');
    return res.status(200).json({ log: Array.isArray(data) ? data : [] });
  }

  return res.status(400).json({ error: 'Geçersiz action' });
}
