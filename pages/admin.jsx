// pages/admin.jsx — deeptradescan.com/admin/profs
import { useState, useEffect, useRef } from 'react';

const ADMIN_EMAIL = 'furkan@deeptradescan.com';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html,body { background:#020509; color:#e2e8f0; font-family:'Space Grotesk',sans-serif; }
  ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#020509}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideR{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
  .card{background:#08111e;border:1px solid #0f1923;border-radius:14px;transition:border-color .2s}
  .card:hover{border-color:#1e293b}
  .btn{border:none;border-radius:8px;padding:7px 14px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:all .15s;letter-spacing:.3px}
  .btn:hover:not(:disabled){opacity:.85;transform:translateY(-1px)}
  .btn:disabled{opacity:.4;cursor:not-allowed}
  .btn-blue{background:#1d4ed8;color:#fff}
  .btn-green{background:#059669;color:#fff}
  .btn-red{background:#dc2626;color:#fff}
  .btn-orange{background:#d97706;color:#fff}
  .btn-purple{background:#7c3aed;color:#fff}
  .btn-gray{background:#1e293b;color:#64748b}
  .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.5px}
  .badge-free{background:rgba(71,85,105,.2);color:#64748b;border:1px solid #1e293b}
  .badge-pro{background:rgba(29,78,216,.15);color:#60a5fa;border:1px solid rgba(59,130,246,.3)}
  .badge-elite{background:rgba(124,58,237,.15);color:#c084fc;border:1px solid rgba(168,85,247,.3)}
  .badge-banned{background:rgba(220,38,38,.15);color:#f87171;border:1px solid rgba(239,68,68,.3)}
  .inp{width:100%;background:#020509;border:1px solid #0f1923;border-radius:9px;color:#e2e8f0;padding:10px 14px;font-size:13px;font-family:'Space Grotesk',sans-serif;outline:none;transition:border-color .2s}
  .inp:focus{border-color:#3b82f6}
  .inp::placeholder{color:#1e293b}
  .nav-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid transparent;border-radius:10px;font-size:12px;font-weight:500;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:all .15s;text-align:left;gap:8px;margin-bottom:3px}
  .nav-btn.active{background:rgba(59,130,246,.1);border-color:rgba(59,130,246,.25);color:#60a5fa;font-weight:700}
  .nav-btn:not(.active){background:transparent;color:#475569}
  .nav-btn:hover:not(.active){background:rgba(255,255,255,.02);color:#64748b}
  th{padding:11px 14px;text-align:left;font-size:10px;color:#334155;letter-spacing:1.5px;font-weight:700;border-bottom:1px solid #0f1923;white-space:nowrap;background:#04080f}
  td{padding:10px 14px;font-size:12px;border-bottom:1px solid #08111e;vertical-align:middle}
  tr:hover td{background:rgba(59,130,246,.03)}
  .msg-user{background:#0f1923;color:#94a3b8;border-radius:12px 12px 12px 2px;padding:9px 13px;font-size:12px;line-height:1.5;max-width:78%;word-break:break-word}
  .msg-admin{background:linear-gradient(135deg,#1d4ed8,#6d28d9);color:#fff;border-radius:12px 12px 2px 12px;padding:9px 13px;font-size:12px;line-height:1.5;max-width:78%;word-break:break-word}
  .notif{position:fixed;top:68px;right:20px;z-index:9999;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:600;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:popIn .2s ease}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:8888;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{background:#080f1a;border:1px solid #0f1923;border-radius:18px;padding:28px;max-width:500px;width:100%;animation:popIn .2s ease}
`;

const api = async (action, body = {}, token) => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`/api/admin?action=${action}`, { method: 'POST', headers: h, body: JSON.stringify(body) });
  return r.json();
};

const apiGet = async (action, params = {}, token) => {
  const q = new URLSearchParams({ action, ...params }).toString();
  const r = await fetch(`/api/admin?${q}`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
  return r.json();
};

const authLogin = async (email, password) => {
  const r = await fetch('/api/auth?action=login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return r.json();
};

export default function AdminPanel() {
  const [token, setToken] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [supportMsgs, setSupportMsgs] = useState([]);
  const [analysisLog, setAnalysisLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null);

  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState('all');
  const [supportFilter, setSupportFilter] = useState('all');
  const [selectedConv, setSelectedConv] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const pollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const s = localStorage.getItem('dts_admin');
    if (s) { try { setToken(JSON.parse(s)); } catch {} }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadAll();
    pollRef.current = setInterval(() => { loadStats(); loadSupport(); }, 10000);
    return () => clearInterval(pollRef.current);
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  const setAL = (key, val) => setActionLoading(p => ({ ...p, [key]: val }));
  const toast = (text, type = 'success') => { setNotif({ text, type }); setTimeout(() => setNotif(null), 3000); };

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadSupport(), loadAnalysisLog()]);
    setLoading(false);
  }

  async function loadStats() {
    const d = await apiGet('stats', {}, token);
    if (!d.error) setStats(d);
  }
  async function loadUsers() {
    const d = await apiGet('users', {}, token);
    if (d.users) setUsers(d.users);
  }
  async function loadSupport() {
    const d = await apiGet('support-list', { status: 'all' }, token);
    if (d.messages) setSupportMsgs(d.messages);
  }
  async function loadAnalysisLog() {
    const d = await apiGet('analysis-log', {}, token);
    if (d.log) setAnalysisLog(d.log);
  }

  async function loadConv(msg) {
    setSelectedConv(msg);
    const r = await fetch(`/api/support?action=get&conversationId=${msg.conversation_id || msg.id}`);
    const d = await r.json();
    setConvMessages(d.messages || []);
  }

  async function handleLogin(e) {
    e?.preventDefault();
    setLoginLoading(true); setLoginErr('');
    const d = await authLogin(loginForm.email, loginForm.password);
    setLoginLoading(false);
    if (d.error) { setLoginErr(d.error); return; }
    if (d.session?.user?.email !== ADMIN_EMAIL && d.user?.email !== ADMIN_EMAIL) {
      setLoginErr('Admin yetkisi yok'); return;
    }
    localStorage.setItem('dts_admin', JSON.stringify(d.session.access_token));
    setToken(d.session.access_token);
  }

  async function handleSetPlan(userId, plan) {
    setAL(userId + '_plan', true);
    const d = await api('set-plan', { userId, plan }, token);
    setAL(userId + '_plan', false);
    if (d.success) { toast(`Plan → ${plan.toUpperCase()}`); loadUsers(); loadStats(); }
    else toast(d.error || 'Hata', 'error');
  }

  async function handleBan(userId, banned) {
    setAL(userId + '_ban', true);
    const d = await api('ban-user', { userId, banned }, token);
    setAL(userId + '_ban', false);
    if (d.success) { toast(banned ? 'Kullanıcı banlandı' : 'Ban kaldırıldı'); loadUsers(); }
    else toast(d.error || 'Hata', 'error');
  }

  async function handleDelete(userId, email) {
    setConfirmModal({
      title: 'Kullanıcıyı Sil',
      text: `${email} kalıcı olarak silinecek. Geri alınamaz!`,
      onConfirm: async () => {
        setConfirmModal(null);
        setAL(userId + '_del', true);
        const d = await api('delete-user', { userId }, token);
        setAL(userId + '_del', false);
        if (d.success) { toast('Silindi'); loadUsers(); loadStats(); }
        else toast(d.error || 'Hata', 'error');
      }
    });
  }

  async function handleResetLimit(userId) {
    const d = await api('reset-limit', { userId }, token);
    if (d.success) { toast('Limit sıfırlandı'); loadUsers(); }
  }

  async function handleReply() {
    if (!replyText.trim() || !selectedConv) return;
    setAL('reply', true);
    const d = await api('support-reply', {
      messageId: selectedConv.id,
      reply: replyText,
      conversationId: selectedConv.conversation_id || selectedConv.id
    }, token);
    setAL('reply', false);
    if (d.success) { toast('Cevap gönderildi'); setReplyText(''); loadConv(selectedConv); loadSupport(); }
    else toast(d.error || 'Hata', 'error');
  }

  async function handleClose(msgId) {
    const d = await api('support-close', { messageId: msgId }, token);
    if (d.success) { toast('Ticket kapatıldı'); loadSupport(); setSelectedConv(null); }
  }

  async function handleBroadcast() {
    if (!broadcastText.trim()) return;
    setAL('broadcast', true);
    const d = await api('broadcast', { message: broadcastText }, token);
    setAL('broadcast', false);
    if (d.success) { toast(`${d.sent} kullanıcıya gönderildi`); setBroadcastText(''); }
    else toast(d.error || 'Hata', 'error');
  }

  // ── FILTERED ─────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const s = userSearch.toLowerCase();
    const matchS = !s || u.email?.toLowerCase().includes(s) || u.full_name?.toLowerCase().includes(s) || u.id?.includes(s);
    const matchP = userPlanFilter === 'all' || (userPlanFilter === 'banned' ? u.banned : (u.plan || 'free') === userPlanFilter);
    return matchS && matchP;
  });

  const userMsgs = supportMsgs.filter(m => !m.is_from_admin);
  const filteredMsgs = supportMsgs.filter(m => {
    if (m.is_from_admin) return false;
    if (supportFilter === 'all') return true;
    return m.status === supportFilter;
  });
  const openCount = supportMsgs.filter(m => m.status === 'open' && !m.is_from_admin).length;

  // ── LOGIN SCREEN ─────────────────────────────────────────────────────────
  if (!token) return (
    <div style={{ minHeight: '100vh', background: '#020509', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{CSS}</style>
      <div style={{ width: '100%', maxWidth: 380, background: '#080f1a', border: '1px solid #0f1923', borderRadius: 20, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#7c3aed,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>🛡</div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>ADMIN PANELİ</div>
          <div style={{ fontSize: 9, color: '#334155', letterSpacing: 3, marginTop: 4 }}>DEEP TRADE SCAN — /profs</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={{ fontSize: 10, color: '#334155', letterSpacing: 2, fontWeight: 700, display: 'block', marginBottom: 7 }}>E-POSTA</label>
            <input className="inp" type="email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="admin@deeptradescan.com" /></div>
          <div><label style={{ fontSize: 10, color: '#334155', letterSpacing: 2, fontWeight: 700, display: 'block', marginBottom: 7 }}>ŞİFRE</label>
            <input className="inp" type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••" /></div>
          {loginErr && <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f87171' }}>{loginErr}</div>}
          <button className="btn btn-blue" onClick={handleLogin} disabled={loginLoading} style={{ padding: '13px', fontSize: 13, borderRadius: 11, marginTop: 4 }}>
            {loginLoading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> Giriş yapılıyor...</span> : '→ Güvenli Giriş'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── MAIN PANEL ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#020509' }}>
      <style>{CSS}</style>

      {/* NOTIF */}
      {notif && <div className="notif" style={{ background: notif.type === 'error' ? '#dc2626' : '#059669' }}>{notif.type === 'error' ? '✕' : '✓'} {notif.text}</div>}

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{confirmModal.title}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>{confirmModal.text}</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-gray" onClick={() => setConfirmModal(null)}>İptal</button>
              <button className="btn btn-red" onClick={confirmModal.onConfirm}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL MODAL */}
      {userDetail && (
        <div className="modal-overlay" onClick={() => setUserDetail(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Kullanıcı Detayı</div>
              <button className="btn btn-gray" onClick={() => setUserDetail(null)}>✕</button>
            </div>
            {[
              ['ID', userDetail.id],
              ['Email', userDetail.email],
              ['İsim', userDetail.full_name || '—'],
              ['Plan', userDetail.plan || 'free'],
              ['Günlük Analiz', userDetail.daily_analyses || 0],
              ['Son Analiz', userDetail.last_analysis_date || '—'],
              ['Kayıt Tarihi', userDetail.created_at ? new Date(userDetail.created_at).toLocaleString('tr-TR') : '—'],
              ['Son Giriş', userDetail.last_sign_in_at ? new Date(userDetail.last_sign_in_at).toLocaleString('tr-TR') : '—'],
              ['Giriş Yöntemi', userDetail.provider || 'email'],
              ['Ban Durumu', userDetail.banned ? '🚫 Banlı' : '✓ Aktif'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0a0f1a' }}>
                <span style={{ fontSize: 11, color: '#334155', fontWeight: 600, letterSpacing: 0.5 }}>{k}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', maxWidth: 300, wordBreak: 'break-all' }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ background: '#04080f', borderBottom: '1px solid #0f1923', padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>ADMIN PANELİ</div>
            <div style={{ fontSize: 8, color: '#7c3aed', letterSpacing: 3, fontWeight: 600 }}>DEEP TRADE SCAN</div>
          </div>
          {openCount > 0 && <div style={{ background: '#dc2626', borderRadius: 100, padding: '2px 9px', fontSize: 10, fontWeight: 800, color: '#fff', animation: 'pulse 2s infinite' }}>{openCount} AÇIK</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-gray" onClick={loadAll} style={{ fontSize: 11 }}>{loading ? '...' : '↻ Yenile'}</button>
          <div style={{ background: '#080f1a', border: '1px solid #0f1923', borderRadius: 9, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 10, color: '#475569', fontFamily: "'JetBrains Mono',monospace" }}>{ADMIN_EMAIL}</span>
          </div>
          <button className="btn btn-gray" onClick={() => { localStorage.removeItem('dts_admin'); setToken(null); }}>Çıkış</button>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 58px)' }}>

        {/* SIDEBAR */}
        <div style={{ width: 210, background: '#04080f', borderRight: '1px solid #0f1923', padding: '16px 10px', flexShrink: 0, overflowY: 'auto' }}>
          {[
            { id: 'dashboard', icon: '◈', label: 'Dashboard' },
            { id: 'users', icon: '◉', label: 'Kullanıcılar', badge: stats?.totalUsers },
            { id: 'support', icon: '◆', label: 'Canlı Destek', badge: openCount, bColor: '#dc2626' },
            { id: 'analysis', icon: '◎', label: 'Analiz Log' },
            { id: 'broadcast', icon: '◐', label: 'Broadcast' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`nav-btn ${tab === item.id ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>{item.icon}</span>
                {item.label}
              </div>
              {item.badge > 0 && <span style={{ background: item.bColor || '#1e293b', borderRadius: 100, padding: '1px 7px', fontSize: 9, fontWeight: 800, color: '#fff' }}>{item.badge}</span>}
            </button>
          ))}

          <div style={{ marginTop: 20, padding: '12px 10px', borderTop: '1px solid #0f1923' }}>
            <div style={{ fontSize: 9, color: '#1e293b', letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>ÖZET</div>
            {stats && [
              { l: 'Toplam', v: stats.totalUsers, c: '#60a5fa' },
              { l: 'Free', v: stats.freeUsers, c: '#64748b' },
              { l: 'Pro', v: stats.proUsers, c: '#3b82f6' },
              { l: 'Elite', v: stats.eliteUsers, c: '#a855f7' },
              { l: 'Banlı', v: stats.bannedUsers || 0, c: '#ef4444' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: '#334155' }}>{s.l}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div style={{ animation: 'fadeIn .3s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 9, color: '#334155', letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>GENEL BAKIŞ</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>Dashboard</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  { l: 'Toplam Üye', v: stats?.totalUsers || 0, c: '#3b82f6', icon: '◉' },
                  { l: 'Free', v: stats?.freeUsers || 0, c: '#64748b', icon: '○' },
                  { l: 'Pro', v: stats?.proUsers || 0, c: '#3b82f6', icon: '◈' },
                  { l: 'Elite', v: stats?.eliteUsers || 0, c: '#a855f7', icon: '◉' },
                  { l: 'Banlı', v: stats?.bannedUsers || 0, c: '#ef4444', icon: '⊘' },
                  { l: 'Açık Ticket', v: stats?.openTickets || 0, c: '#f59e0b', icon: '◆' },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ color: s.c, fontFamily: "'JetBrains Mono',monospace", fontSize: 14 }}>{s.icon}</span>
                      <span style={{ fontSize: 9, color: '#334155', letterSpacing: 1, fontWeight: 700 }}>{s.l.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Son 10 kayıt */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #0f1923' }}>
                  <span style={{ fontSize: 10, color: '#334155', letterSpacing: 2, fontWeight: 700 }}>SON KAYITLAR</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {users.slice(0, 10).map((u, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#475569', flexShrink: 0 }}>
                              {u.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace" }}>{u.email}</div>
                              <div style={{ fontSize: 10, color: '#334155' }}>{u.full_name || '—'} · {u.provider || 'email'}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge badge-${u.banned ? 'banned' : u.plan || 'free'}`}>{u.banned ? 'BANLANDI' : (u.plan || 'free').toUpperCase()}</span></td>
                        <td style={{ color: '#334155', fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <div style={{ animation: 'fadeIn .3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#334155', letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>YÖNETİM</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>Kullanıcılar <span style={{ fontSize: 13, color: '#334155', fontWeight: 400 }}>({filteredUsers.length})</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input className="inp" style={{ width: 200 }} placeholder="Email, isim, ID..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  {['all', 'free', 'pro', 'elite', 'banned'].map(f => (
                    <button key={f} className="btn" onClick={() => setUserPlanFilter(f)}
                      style={{ background: userPlanFilter === f ? '#1d4ed8' : '#0f1923', color: userPlanFilter === f ? '#fff' : '#475569' }}>
                      {f === 'all' ? 'TÜMÜ' : f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                    <thead>
                      <tr><th>Kullanıcı</th><th>Plan</th><th>Günlük Analiz</th><th>Son Giriş</th><th>Kayıt</th><th>Yöntem</th><th>İşlemler</th></tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: u.banned ? 'rgba(239,68,68,.15)' : '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: u.banned ? '#f87171' : '#475569', flexShrink: 0 }}>
                                {u.banned ? '🚫' : (u.email?.[0]?.toUpperCase() || '?')}
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace" }}>{u.email}</div>
                                <div style={{ fontSize: 10, color: '#334155' }}>{u.full_name || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`badge badge-${u.banned ? 'banned' : u.plan || 'free'}`}>{u.banned ? 'BANLANDI' : (u.plan || 'free').toUpperCase()}</span></td>
                          <td style={{ fontFamily: "'JetBrains Mono',monospace", color: (u.daily_analyses || 0) > 0 ? '#f1f5f9' : '#334155', fontWeight: (u.daily_analyses || 0) > 0 ? 700 : 400 }}>{u.daily_analyses || 0}</td>
                          <td style={{ color: '#334155', fontSize: 11 }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('tr-TR') : '—'}</td>
                          <td style={{ color: '#334155', fontSize: 11 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '—'}</td>
                          <td style={{ color: '#475569', fontSize: 11 }}>{u.provider || 'email'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              <button className="btn btn-gray" onClick={() => setUserDetail(u)} style={{ fontSize: 10 }}>👁</button>
                              {!u.banned && (u.plan || 'free') !== 'pro' && <button className="btn btn-blue" disabled={actionLoading[u.id + '_plan']} onClick={() => handleSetPlan(u.id, 'pro')} style={{ fontSize: 10 }}>PRO</button>}
                              {!u.banned && (u.plan || 'free') !== 'elite' && <button className="btn btn-purple" disabled={actionLoading[u.id + '_plan']} onClick={() => handleSetPlan(u.id, 'elite')} style={{ fontSize: 10 }}>ELITE</button>}
                              {!u.banned && (u.plan || 'free') !== 'free' && <button className="btn btn-gray" disabled={actionLoading[u.id + '_plan']} onClick={() => handleSetPlan(u.id, 'free')} style={{ fontSize: 10 }}>FREE</button>}
                              <button className="btn btn-gray" onClick={() => handleResetLimit(u.id)} style={{ fontSize: 10 }} title="Limit sıfırla">↺</button>
                              {u.banned
                                ? <button className="btn btn-green" disabled={actionLoading[u.id + '_ban']} onClick={() => handleBan(u.id, false)} style={{ fontSize: 10 }}>Çöz</button>
                                : <button className="btn btn-orange" disabled={actionLoading[u.id + '_ban']} onClick={() => handleBan(u.id, true)} style={{ fontSize: 10 }}>BAN</button>
                              }
                              <button className="btn btn-red" disabled={actionLoading[u.id + '_del']} onClick={() => handleDelete(u.id, u.email)} style={{ fontSize: 10 }}>✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#1e293b', fontSize: 13 }}>Kullanıcı bulunamadı</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── SUPPORT ── */}
          {tab === 'support' && (
            <div style={{ animation: 'fadeIn .3s ease', display: 'grid', gridTemplateColumns: selectedConv ? '1fr 360px' : '1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#334155', letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>DESTEK</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>Canlı Destek</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[['all', 'TÜMÜ'], ['open', 'AÇIK'], ['replied', 'CEVAPLANDı'], ['closed', 'KAPALI']].map(([f, l]) => (
                      <button key={f} className="btn" onClick={() => setSupportFilter(f)}
                        style={{ background: supportFilter === f ? '#1d4ed8' : '#0f1923', color: supportFilter === f ? '#fff' : '#475569', fontSize: 10 }}>
                        {l}{f === 'open' && openCount > 0 && <span style={{ marginLeft: 5, background: '#dc2626', borderRadius: 100, padding: '0 5px', fontSize: 9 }}>{openCount}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {filteredMsgs.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#1e293b', fontSize: 13 }}>Mesaj yok</div>}
                    {filteredMsgs.map((msg, i) => (
                      <div key={i} onClick={() => loadConv(msg)}
                        style={{ padding: '12px 16px', borderBottom: '1px solid #0a0f1a', cursor: 'pointer', background: selectedConv?.id === msg.id ? 'rgba(59,130,246,.06)' : 'transparent', transition: 'background .15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: msg.status === 'open' ? '#ef4444' : msg.status === 'replied' ? '#10b981' : '#334155', flexShrink: 0, animation: msg.status === 'open' ? 'pulse 2s infinite' : 'none' }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace" }}>{msg.user_email || 'Anonim'}</span>
                          </div>
                          <span style={{ fontSize: 10, color: '#1e293b', flexShrink: 0 }}>{new Date(msg.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', paddingLeft: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedConv && (
                <div style={{ background: '#080f1a', border: '1px solid #0f1923', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn .2s ease', minHeight: 0 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #0f1923', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace" }}>{selectedConv.user_email || 'Anonim'}</div>
                      <div style={{ fontSize: 10, color: '#334155', marginTop: 2 }}>{new Date(selectedConv.created_at).toLocaleString('tr-TR')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-gray" onClick={() => handleClose(selectedConv.id)} style={{ fontSize: 10 }}>Kapat</button>
                      <button className="btn btn-gray" onClick={() => setSelectedConv(null)} style={{ fontSize: 10 }}>✕</button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {convMessages.map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: m.is_from_admin ? 'flex-end' : 'flex-start' }}>
                        <div className={m.is_from_admin ? 'msg-admin' : 'msg-user'}>
                          {m.message}
                          <div style={{ fontSize: 9, opacity: .5, marginTop: 3 }}>{new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                  <div style={{ padding: '10px 12px', borderTop: '1px solid #0f1923', flexShrink: 0, display: 'flex', gap: 8 }}>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                      placeholder="Cevap... (Enter gönder)" rows={2}
                      style={{ flex: 1, background: '#020509', border: '1px solid #0f1923', borderRadius: 8, color: '#e2e8f0', padding: '8px 11px', fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", outline: 'none', resize: 'none' }} />
                    <button className="btn btn-blue" onClick={handleReply} disabled={actionLoading.reply} style={{ alignSelf: 'flex-end', padding: '9px 14px' }}>
                      {actionLoading.reply ? '...' : '→'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ANALİZ LOG ── */}
          {tab === 'analysis' && (
            <div style={{ animation: 'fadeIn .3s ease' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: '#334155', letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>İZLEME</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Analiz Aktivitesi</div>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th>Email</th><th>Plan</th><th>Günlük Analiz</th><th>Son Analiz</th><th>Kayıt</th></tr></thead>
                  <tbody>
                    {analysisLog.map((u, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", color: '#94a3b8' }}>{u.email}</td>
                        <td><span className={`badge badge-${u.plan || 'free'}`}>{(u.plan || 'free').toUpperCase()}</span></td>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: (u.daily_analyses || 0) > 0 ? '#f1f5f9' : '#334155', fontSize: 14 }}>{u.daily_analyses || 0}</td>
                        <td style={{ color: '#475569' }}>{u.last_analysis_date || '—'}</td>
                        <td style={{ color: '#334155' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {analysisLog.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#1e293b' }}>Veri yok</div>}
              </div>
            </div>
          )}

          {/* ── BROADCAST ── */}
          {tab === 'broadcast' && (
            <div style={{ animation: 'fadeIn .3s ease', maxWidth: 580 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 9, color: '#334155', letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>İLETİŞİM</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Broadcast Mesaj</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>Tüm kullanıcılara aynı anda mesaj gönder</div>
              </div>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, color: '#334155', letterSpacing: 2, fontWeight: 700, display: 'block', marginBottom: 8 }}>MESAJ İÇERİĞİ</label>
                  <textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)} rows={5} placeholder="Tüm kullanıcılara gönderilecek mesaj..."
                    style={{ width: '100%', background: '#020509', border: '1px solid #0f1923', borderRadius: 10, color: '#e2e8f0', padding: '12px 14px', fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", outline: 'none', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, color: '#334155' }}>Toplam <span style={{ color: '#60a5fa', fontWeight: 700 }}>{stats?.totalUsers || 0}</span> kullanıcı</div>
                  <button className="btn btn-blue" onClick={handleBroadcast} disabled={actionLoading.broadcast} style={{ padding: '11px 22px', fontSize: 13 }}>
                    {actionLoading.broadcast ? '...' : '⚡ Gönder'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
