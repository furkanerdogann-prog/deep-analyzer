// pages/admin.jsx
import { useState, useEffect, useRef, useCallback } from 'react';

const ADMIN_EMAIL = 'furkan@deeptradescan.com';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #020509; color: #e2e8f0; font-family: 'Space Grotesk', sans-serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #020509; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes slideIn { from{transform:translateX(100%)}to{transform:translateX(0)} }
  .card { background: #080f1a; border: 1px solid #0f1923; border-radius: 14px; padding: 20px; transition: all 0.2s; }
  .card:hover { border-color: #1e293b; }
  .btn { border: none; border-radius: 9px; padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.15s; }
  .btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-blue { background: #1d4ed8; color: #fff; }
  .btn-green { background: #059669; color: #fff; }
  .btn-red { background: #dc2626; color: #fff; }
  .btn-purple { background: #7c3aed; color: #fff; }
  .btn-gray { background: #1e293b; color: #64748b; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
  .badge-free { background: rgba(71,85,105,0.2); color: #64748b; border: 1px solid #1e293b; }
  .badge-pro { background: rgba(29,78,216,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
  .badge-elite { background: rgba(124,58,237,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); }
  .tab { padding: 8px 16px; border: none; background: transparent; color: #475569; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Space Grotesk', sans-serif; border-bottom: 2px solid transparent; transition: all 0.2s; }
  .tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
  .inp { width: 100%; background: #020509; border: 1px solid #0f1923; border-radius: 9px; color: #e2e8f0; padding: 10px 14px; font-size: 13px; font-family: 'Space Grotesk', sans-serif; outline: none; transition: border-color 0.2s; }
  .inp:focus { border-color: #3b82f6; }
  .inp::placeholder { color: #1e293b; }
  .msg-bubble { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; word-break: break-word; animation: fadeIn 0.2s ease; }
  .msg-user { background: #0f1923; color: #94a3b8; border-radius: 12px 12px 12px 2px; }
  .msg-admin { background: linear-gradient(135deg,#1d4ed8,#6d28d9); color: #fff; border-radius: 12px 12px 2px 12px; }
  tr:hover td { background: rgba(59,130,246,0.04) !important; }
  .notification { position:fixed; top:70px; right:20px; z-index:9999; animation:slideIn 0.3s ease; }
`;

const api = async (action, body={}, token, method='POST') => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`/api/admin?action=${action}`, { method, headers, body: JSON.stringify(body) });
  return r.json();
};

const authApi = async (action, body={}) => {
  const r = await fetch(`/api/auth?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
};

export default function AdminPanel() {
  const [token, setToken] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [supportMsgs, setSupportMsgs] = useState([]);
  const [analysisLog, setAnalysisLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [supportFilter, setSupportFilter] = useState('all');
  const [selectedConv, setSelectedConv] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [convMessages, setConvMessages] = useState([]);
  const pollRef = useRef(null);

  useEffect(() => {
    const s = localStorage.getItem('dts_admin_session');
    if (s) { try { const d = JSON.parse(s); setToken(d.access_token); setAdminUser(d.user); } catch {} }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadAll();
    // Poll her 10 sn
    pollRef.current = setInterval(() => { loadSupport(); loadStats(); }, 10000);
    return () => clearInterval(pollRef.current);
  }, [token]);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadSupport(), loadAnalysisLog()]);
    setLoading(false);
  }

  async function loadStats() {
    const d = await api('stats', {}, token);
    if (!d.error) setStats(d);
  }

  async function loadUsers() {
    const d = await api('users', {}, token);
    if (d.users) setUsers(d.users);
  }

  async function loadSupport() {
    const d = await api('support-list', {}, token);
    if (d.messages) setSupportMsgs(d.messages);
  }

  async function loadAnalysisLog() {
    const d = await api('analysis-log', {}, token);
    if (d.log) setAnalysisLog(d.log);
  }

  async function loadConversation(msg) {
    setSelectedConv(msg);
    const r = await fetch(`/api/support?action=get&conversationId=${msg.conversation_id||msg.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await r.json();
    setConvMessages(d.messages || []);
  }

  function notify(text, type='success') {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  }

  async function handleLogin(e) {
    e?.preventDefault();
    setLoginLoading(true); setLoginErr('');
    const d = await authApi('login', { email: loginForm.email, password: loginForm.password });
    setLoginLoading(false);
    if (d.error) { setLoginErr(d.error); return; }
    if (d.session?.user?.email !== ADMIN_EMAIL) {
      setLoginErr('Admin yetkisi yok'); return;
    }
    localStorage.setItem('dts_admin_session', JSON.stringify({ ...d.session, user: d.user }));
    setToken(d.session.access_token);
    setAdminUser(d.user);
  }

  async function handleSetPlan(userId, plan) {
    setActionLoading(p => ({...p, [userId]: true}));
    const d = await api('set-plan', { userId, plan }, token);
    setActionLoading(p => ({...p, [userId]: false}));
    if (d.success) { notify(`Plan → ${plan.toUpperCase()}`); loadUsers(); loadStats(); }
    else notify(d.error || 'Hata', 'error');
  }

  async function handleDeleteUser(userId, email) {
    if (!confirm(`${email} silinsin mi?`)) return;
    setActionLoading(p => ({...p, [userId+'_del']: true}));
    const d = await api('delete-user', { userId }, token);
    setActionLoading(p => ({...p, [userId+'_del']: false}));
    if (d.success) { notify('Kullanıcı silindi'); loadUsers(); loadStats(); }
    else notify(d.error || 'Hata', 'error');
  }

  async function handleResetLimit(userId) {
    const d = await api('reset-limit', { userId }, token);
    if (d.success) { notify('Limit sıfırlandı'); loadUsers(); }
  }

  async function handleReply(msg) {
    if (!replyText.trim()) return;
    setActionLoading(p => ({...p, reply: true}));
    const d = await api('support-reply', { messageId: msg.id, reply: replyText, conversationId: msg.conversation_id || msg.id }, token);
    setActionLoading(p => ({...p, reply: false}));
    if (d.success) { notify('Cevap gönderildi'); setReplyText(''); loadConversation(msg); loadSupport(); }
    else notify(d.error || 'Hata', 'error');
  }

  async function handleCloseTicket(msgId) {
    const d = await api('support-close', { messageId: msgId }, token);
    if (d.success) { notify('Ticket kapatıldı'); loadSupport(); setSelectedConv(null); }
  }

  async function handleBroadcast() {
    if (!broadcastText.trim()) return;
    if (!confirm(`Tüm kullanıcılara mesaj gönderilsin mi?`)) return;
    const d = await api('broadcast', { message: broadcastText }, token);
    if (d.success) { notify(`Broadcast gönderildi (${d.sent} kullanıcı)`); setBroadcastText(''); }
    else notify(d.error || 'Hata', 'error');
  }

  // ── LOGIN SCREEN ─────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{minHeight:'100vh',background:'#020509',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <style>{CSS}</style>
        <div style={{width:'100%',maxWidth:380,background:'#080f1a',border:'1px solid #0f1923',borderRadius:20,padding:36,boxShadow:'0 25px 60px rgba(0,0,0,0.5)'}}>
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#7c3aed,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:22}}>🛡</div>
            <div style={{fontSize:18,fontWeight:800,letterSpacing:1}}>ADMIN PANELİ</div>
            <div style={{fontSize:10,color:'#334155',letterSpacing:3,marginTop:4}}>DEEP TRADE SCAN</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:700,display:'block',marginBottom:7}}>E-POSTA</label>
              <input className="inp" type="email" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="admin@deeptradescan.com"/>
            </div>
            <div>
              <label style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:700,display:'block',marginBottom:7}}>ŞİFRE</label>
              <input className="inp" type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="••••••••"/>
            </div>
            {loginErr && <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#f87171'}}>{loginErr}</div>}
            <button className="btn btn-blue" onClick={handleLogin} disabled={loginLoading} style={{padding:'13px',fontSize:14,borderRadius:12,marginTop:4}}>
              {loginLoading ? '...' : '→ Güvenli Giriş'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FILTERED DATA ────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase());
    const matchFilter = userFilter === 'all' || u.plan === userFilter;
    return matchSearch && matchFilter;
  });

  const filteredMsgs = supportMsgs.filter(m => {
    if (supportFilter === 'all') return !m.is_from_admin;
    return m.status === supportFilter && !m.is_from_admin;
  });

  const openCount = supportMsgs.filter(m=>m.status==='open'&&!m.is_from_admin).length;

  // ── MAIN PANEL ──────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:'100vh',background:'#020509'}}>
      <style>{CSS}</style>

      {/* NOTIFICATION */}
      {notification && (
        <div className="notification">
          <div style={{background:notification.type==='error'?'#dc2626':'#059669',borderRadius:10,padding:'10px 18px',fontSize:13,fontWeight:600,color:'#fff',boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>
            {notification.type==='error'?'✕':'✓'} {notification.text}
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div style={{background:'#04080f',borderBottom:'1px solid #0f1923',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#7c3aed,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🛡</div>
          <div>
            <div style={{fontSize:13,fontWeight:800,letterSpacing:1}}>ADMIN PANELİ</div>
            <div style={{fontSize:8,color:'#7c3aed',letterSpacing:3,fontWeight:600}}>DEEP TRADE SCAN</div>
          </div>
          {openCount>0 && (
            <div style={{background:'#dc2626',borderRadius:100,padding:'2px 8px',fontSize:10,fontWeight:800,color:'#fff',animation:'pulse 2s infinite'}}>
              {openCount} AÇIK TİCKET
            </div>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn btn-gray" onClick={loadAll}>{loading?'...':'↻ Yenile'}</button>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#080f1a',border:'1px solid #0f1923',borderRadius:9,padding:'7px 12px'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#10b981',animation:'pulse 2s infinite'}}/>
            <span style={{fontSize:11,color:'#64748b'}}>{adminUser?.email || ADMIN_EMAIL}</span>
          </div>
          <button className="btn btn-gray" onClick={()=>{localStorage.removeItem('dts_admin_session');setToken(null);setAdminUser(null);}}>Çıkış</button>
        </div>
      </div>

      <div style={{display:'flex',height:'calc(100vh - 60px)'}}>

        {/* SIDEBAR */}
        <div style={{width:220,background:'#04080f',borderRight:'1px solid #0f1923',padding:'20px 12px',flexShrink:0,overflowY:'auto'}}>
          {[
            {id:'dashboard',icon:'◈',label:'Dashboard'},
            {id:'users',icon:'◉',label:'Kullanıcılar',badge:stats?.totalUsers},
            {id:'support',icon:'◆',label:'Canlı Destek',badge:openCount,badgeColor:'#dc2626'},
            {id:'analysis',icon:'◎',label:'Analiz Log'},
            {id:'broadcast',icon:'◐',label:'Broadcast'},
          ].map(item=>(
            <button key={item.id} onClick={()=>setActiveTab(item.id)}
              style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:activeTab===item.id?'rgba(59,130,246,0.1)':'transparent',border:`1px solid ${activeTab===item.id?'rgba(59,130,246,0.25)':'transparent'}`,borderRadius:10,color:activeTab===item.id?'#60a5fa':'#475569',fontSize:12,fontWeight:activeTab===item.id?700:500,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",transition:'all 0.2s',textAlign:'left',gap:8,marginBottom:4}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{item.icon}</span>
                {item.label}
              </div>
              {item.badge>0 && <span style={{background:item.badgeColor||'#1e293b',borderRadius:100,padding:'1px 7px',fontSize:9,fontWeight:800,color:'#fff'}}>{item.badge}</span>}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex:1,overflowY:'auto',padding:24}}>

          {/* ── DASHBOARD ── */}
          {activeTab==='dashboard' && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              <div style={{marginBottom:24}}>
                <div style={{fontSize:10,color:'#334155',letterSpacing:3,fontWeight:700,marginBottom:4}}>GENEL BAKIŞ</div>
                <div style={{fontSize:22,fontWeight:800}}>Dashboard</div>
              </div>

              {/* Stat Cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:24}}>
                {[
                  {label:'Toplam Kullanıcı',value:stats?.totalUsers||0,color:'#3b82f6',icon:'◉'},
                  {label:'Free Üyeler',value:stats?.freeUsers||0,color:'#64748b',icon:'○'},
                  {label:'Pro Üyeler',value:stats?.proUsers||0,color:'#3b82f6',icon:'◈'},
                  {label:'Elite Üyeler',value:stats?.eliteUsers||0,color:'#a855f7',icon:'◉'},
                  {label:'Açık Ticket',value:stats?.openTickets||0,color:'#ef4444',icon:'◆'},
                ].map((s,i)=>(
                  <div key={i} className="card" style={{borderColor:s.value>0&&i>3?'rgba(239,68,68,0.3)':'#0f1923'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                      <span style={{fontSize:16,color:s.color,fontFamily:"'JetBrains Mono',monospace"}}>{s.icon}</span>
                      <span style={{fontSize:10,color:'#334155',fontWeight:600,letterSpacing:1}}>{s.label.toUpperCase()}</span>
                    </div>
                    <div style={{fontSize:36,fontWeight:800,color:'#f1f5f9',fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Son kayıtlar */}
              <div className="card">
                <div style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:700,marginBottom:16}}>SON KAYITLAR</div>
                {users.slice(0,8).map((u,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #0a0f1a'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:28,height:28,borderRadius:8,background:'#0f1923',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#475569'}}>{u.email?.[0]?.toUpperCase()||'?'}</div>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:'#94a3b8'}}>{u.email}</div>
                        <div style={{fontSize:10,color:'#334155'}}>{u.full_name}</div>
                      </div>
                    </div>
                    <span className={`badge badge-${u.plan||'free'}`}>{(u.plan||'free').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab==='users' && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{fontSize:10,color:'#334155',letterSpacing:3,fontWeight:700,marginBottom:4}}>YÖNETİM</div>
                  <div style={{fontSize:22,fontWeight:800}}>Kullanıcılar</div>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <input className="inp" style={{width:220}} placeholder="Email veya isim ara..." value={userSearch} onChange={e=>setUserSearch(e.target.value)}/>
                  {['all','free','pro','elite'].map(f=>(
                    <button key={f} className="btn" onClick={()=>setUserFilter(f)}
                      style={{background:userFilter===f?'#1d4ed8':'#0f1923',color:userFilter===f?'#fff':'#475569'}}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card" style={{padding:0,overflow:'hidden'}}>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{background:'#04080f'}}>
                        {['Email','İsim','Plan','Analiz','Kayıt','İşlemler'].map(h=>(
                          <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:10,color:'#334155',letterSpacing:1.5,fontWeight:700,borderBottom:'1px solid #0f1923',whiteSpace:'nowrap'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u,i)=>(
                        <tr key={i}>
                          <td style={{padding:'12px 16px',fontSize:12,color:'#94a3b8',borderBottom:'1px solid #0a0f1a',fontFamily:"'JetBrains Mono',monospace"}}>{u.email}</td>
                          <td style={{padding:'12px 16px',fontSize:12,color:'#64748b',borderBottom:'1px solid #0a0f1a'}}>{u.full_name||'—'}</td>
                          <td style={{padding:'12px 16px',borderBottom:'1px solid #0a0f1a'}}>
                            <span className={`badge badge-${u.plan||'free'}`}>{(u.plan||'free').toUpperCase()}</span>
                          </td>
                          <td style={{padding:'12px 16px',fontSize:12,color:'#475569',borderBottom:'1px solid #0a0f1a',fontFamily:"'JetBrains Mono',monospace"}}>{u.daily_analyses||0}</td>
                          <td style={{padding:'12px 16px',fontSize:11,color:'#334155',borderBottom:'1px solid #0a0f1a',whiteSpace:'nowrap'}}>{u.created_at?new Date(u.created_at).toLocaleDateString('tr-TR'):'—'}</td>
                          <td style={{padding:'12px 16px',borderBottom:'1px solid #0a0f1a'}}>
                            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                              {['free','pro','elite'].filter(p=>p!==u.plan).map(p=>(
                                <button key={p} className={`btn btn-${p==='pro'?'blue':p==='elite'?'purple':'gray'}`}
                                  disabled={actionLoading[u.id]}
                                  onClick={()=>handleSetPlan(u.id, p)}
                                  style={{padding:'5px 10px',fontSize:10}}>
                                  {actionLoading[u.id]?'...':p.toUpperCase()}
                                </button>
                              ))}
                              <button className="btn btn-gray" onClick={()=>handleResetLimit(u.id)} style={{padding:'5px 10px',fontSize:10}}>↺</button>
                              <button className="btn btn-red" disabled={actionLoading[u.id+'_del']} onClick={()=>handleDeleteUser(u.id, u.email)} style={{padding:'5px 10px',fontSize:10}}>✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length===0&&<div style={{padding:40,textAlign:'center',color:'#1e293b',fontSize:13}}>Kullanıcı bulunamadı</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── SUPPORT ── */}
          {activeTab==='support' && (
            <div style={{animation:'fadeIn 0.3s ease',display:'grid',gridTemplateColumns:selectedConv?'1fr 380px':'1fr',gap:16,height:'calc(100vh - 140px)'}}>
              {/* Ticket listesi */}
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                  <div>
                    <div style={{fontSize:10,color:'#334155',letterSpacing:3,fontWeight:700,marginBottom:4}}>DESTEK</div>
                    <div style={{fontSize:22,fontWeight:800}}>Canlı Destek Mesajları</div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {['all','open','replied','closed'].map(f=>(
                      <button key={f} className="btn" onClick={()=>setSupportFilter(f)}
                        style={{background:supportFilter===f?'#1d4ed8':'#0f1923',color:supportFilter===f?'#fff':'#475569',fontSize:10}}>
                        {f==='all'?'TÜMÜ':f==='open'?'AÇIK':f==='replied'?'CEVAPLANDı':'KAPALI'}
                        {f==='open'&&openCount>0&&<span style={{marginLeft:6,background:'#dc2626',borderRadius:100,padding:'1px 5px',fontSize:8}}>{openCount}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card" style={{flex:1,overflowY:'auto',padding:0}}>
                  {filteredMsgs.length===0&&<div style={{padding:40,textAlign:'center',color:'#1e293b',fontSize:13}}>Mesaj yok</div>}
                  {filteredMsgs.map((msg,i)=>(
                    <div key={i} onClick={()=>loadConversation(msg)}
                      style={{padding:'14px 18px',borderBottom:'1px solid #0a0f1a',cursor:'pointer',background:selectedConv?.id===msg.id?'rgba(59,130,246,0.06)':'transparent',transition:'background 0.2s'}}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:6}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:8,height:8,borderRadius:'50%',background:msg.status==='open'?'#ef4444':msg.status==='replied'?'#10b981':'#334155',flexShrink:0,animation:msg.status==='open'?'pulse 2s infinite':'none'}}/>
                          <span style={{fontSize:12,fontWeight:600,color:'#94a3b8',fontFamily:"'JetBrains Mono',monospace"}}>{msg.user_email||'Anonim'}</span>
                        </div>
                        <span style={{fontSize:10,color:'#334155',whiteSpace:'nowrap'}}>{new Date(msg.created_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                      <div style={{fontSize:12,color:'#475569',lineHeight:1.5,paddingLeft:16,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{msg.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Konuşma detay */}
              {selectedConv && (
                <div style={{background:'#080f1a',border:'1px solid #0f1923',borderRadius:14,display:'flex',flexDirection:'column',overflow:'hidden',animation:'fadeIn 0.2s ease'}}>
                  <div style={{padding:'14px 18px',borderBottom:'1px solid #0f1923',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#94a3b8'}}>{selectedConv.user_email||'Anonim'}</div>
                      <div style={{fontSize:10,color:'#334155',marginTop:2}}>{new Date(selectedConv.created_at).toLocaleString('tr-TR')}</div>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-gray" onClick={()=>handleCloseTicket(selectedConv.id)} style={{fontSize:10}}>Kapat</button>
                      <button className="btn btn-gray" onClick={()=>setSelectedConv(null)} style={{fontSize:10}}>✕</button>
                    </div>
                  </div>

                  <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:8}}>
                    {convMessages.map((m,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:m.is_from_admin?'flex-end':'flex-start'}}>
                        <div className={`msg-bubble ${m.is_from_admin?'msg-admin':'msg-user'}`}>
                          {m.message}
                          <div style={{fontSize:9,opacity:0.5,marginTop:4}}>{new Date(m.created_at).toLocaleTimeString('tr-TR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{padding:12,borderTop:'1px solid #0f1923',flexShrink:0}}>
                    <div style={{display:'flex',gap:8}}>
                      <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
                        onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleReply(selectedConv);}}}
                        placeholder="Cevap yaz... (Enter: gönder)" rows={2}
                        style={{flex:1,background:'#020509',border:'1px solid #0f1923',borderRadius:9,color:'#e2e8f0',padding:'9px 12px',fontSize:12,fontFamily:"'Space Grotesk',sans-serif",outline:'none',resize:'none'}}/>
                      <button className="btn btn-blue" onClick={()=>handleReply(selectedConv)} disabled={actionLoading.reply} style={{padding:'9px 14px',alignSelf:'flex-end',fontSize:12}}>
                        {actionLoading.reply?'...':'→'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ANALİZ LOG ── */}
          {activeTab==='analysis' && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,color:'#334155',letterSpacing:3,fontWeight:700,marginBottom:4}}>İZLEME</div>
                <div style={{fontSize:22,fontWeight:800}}>Analiz Aktivitesi</div>
              </div>
              <div className="card" style={{padding:0,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#04080f'}}>
                      {['Email','Plan','Günlük Analiz','Son Analiz','Kayıt'].map(h=>(
                        <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:10,color:'#334155',letterSpacing:1.5,fontWeight:700,borderBottom:'1px solid #0f1923'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysisLog.map((u,i)=>(
                      <tr key={i}>
                        <td style={{padding:'11px 16px',fontSize:12,color:'#94a3b8',borderBottom:'1px solid #0a0f1a',fontFamily:"'JetBrains Mono',monospace"}}>{u.email}</td>
                        <td style={{padding:'11px 16px',borderBottom:'1px solid #0a0f1a'}}><span className={`badge badge-${u.plan||'free'}`}>{(u.plan||'free').toUpperCase()}</span></td>
                        <td style={{padding:'11px 16px',fontSize:14,fontWeight:700,color:'#f1f5f9',borderBottom:'1px solid #0a0f1a',fontFamily:"'JetBrains Mono',monospace"}}>{u.daily_analyses||0}</td>
                        <td style={{padding:'11px 16px',fontSize:11,color:'#475569',borderBottom:'1px solid #0a0f1a'}}>{u.last_analysis_date||'—'}</td>
                        <td style={{padding:'11px 16px',fontSize:11,color:'#334155',borderBottom:'1px solid #0a0f1a'}}>{u.created_at?new Date(u.created_at).toLocaleDateString('tr-TR'):'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {analysisLog.length===0&&<div style={{padding:40,textAlign:'center',color:'#1e293b',fontSize:13}}>Veri yok</div>}
              </div>
            </div>
          )}

          {/* ── BROADCAST ── */}
          {activeTab==='broadcast' && (
            <div style={{animation:'fadeIn 0.3s ease',maxWidth:600}}>
              <div style={{marginBottom:24}}>
                <div style={{fontSize:10,color:'#334155',letterSpacing:3,fontWeight:700,marginBottom:4}}>İLETİŞİM</div>
                <div style={{fontSize:22,fontWeight:800}}>Broadcast Mesaj</div>
                <div style={{fontSize:13,color:'#475569',marginTop:6}}>Tüm kullanıcılara aynı anda mesaj gönderin</div>
              </div>
              <div className="card">
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:10,color:'#334155',letterSpacing:2,fontWeight:700,display:'block',marginBottom:8}}>MESAJ</label>
                  <textarea value={broadcastText} onChange={e=>setBroadcastText(e.target.value)} rows={5} placeholder="Tüm kullanıcılara gönderilecek mesaj..."
                    style={{width:'100%',background:'#020509',border:'1px solid #0f1923',borderRadius:10,color:'#e2e8f0',padding:'12px 14px',fontSize:13,fontFamily:"'Space Grotesk',sans-serif",outline:'none',resize:'vertical'}}/>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{fontSize:12,color:'#334155'}}>Toplam {stats?.totalUsers||0} kullanıcıya gönderilecek</div>
                  <button className="btn btn-blue" onClick={handleBroadcast} style={{padding:'11px 24px',fontSize:13}}>
                    ⚡ Gönder
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
