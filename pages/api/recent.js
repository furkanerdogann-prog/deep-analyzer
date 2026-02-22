// pages/api/recent.js — Son analizler

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return res.status(200).json({ recent: [] });

    const r = await fetch(`${url}/lrange/chartos:recent/0/9`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await r.json();
    const recent = (d.result || []).map(item => {
      try { return JSON.parse(item); } catch { return null; }
    }).filter(Boolean);

    return res.status(200).json({ recent });
  } catch {
    return res.status(200).json({ recent: [] });
  }
}
