// pages/api/support.js
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SVC = process.env.SUPABASE_SERVICE_KEY;

const db = async (path, method='GET', body) => {
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
  try { return { ok: r.ok, data: JSON.parse(t) }; }
  catch { return { ok: r.ok, data: [] }; }
};

async function getUser(token) {
  const r = await fetch(`${SB_URL}/auth/v1/user`, {
    headers: { 'apikey': SVC, 'Authorization': `Bearer ${token}` }
  });
  return r.json();
}

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { action } = req.query;

  // MESAJ GÖNDER (giriş yapmış veya anonim)
  if (action === 'send') {
    const { message, email, conversationId } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Mesaj gerekli' });

    let userId = null;
    let userEmail = email || null;

    if (token) {
      const user = await getUser(token);
      if (user?.id) { userId = user.id; userEmail = user.email; }
    }

    const { data, ok } = await db('/support_messages', 'POST', {
      user_id: userId,
      user_email: userEmail,
      message,
      status: 'open',
      is_from_admin: false,
      conversation_id: conversationId || null,
    });

    if (!ok) return res.status(500).json({ error: 'Mesaj gönderilemedi' });
    const msg = Array.isArray(data) ? data[0] : data;
    return res.status(200).json({ success: true, id: msg?.id, conversationId: conversationId || msg?.id });
  }

  // KONUŞMA GETİR
  if (action === 'get') {
    const { conversationId } = req.query;
    if (!conversationId) return res.status(400).json({ error: 'conversationId gerekli' });

    const { data } = await db(
      `/support_messages?or=(id.eq.${conversationId},conversation_id.eq.${conversationId})&order=created_at.asc`
    );
    return res.status(200).json({ messages: Array.isArray(data) ? data : [] });
  }

  // KENDİ TİCKETLARI (giriş yapmış kullanıcı)
  if (action === 'my-tickets') {
    if (!token) return res.status(401).json({ error: 'Token gerekli' });
    const user = await getUser(token);
    if (!user?.id) return res.status(401).json({ error: 'Geçersiz token' });

    const { data } = await db(
      `/support_messages?user_id=eq.${user.id}&order=created_at.desc`
    );
    return res.status(200).json({ messages: Array.isArray(data) ? data : [] });
  }

  return res.status(400).json({ error: 'Geçersiz action' });
}
