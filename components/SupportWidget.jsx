// components/SupportWidget.jsx
import { useState, useEffect, useRef } from 'react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  @keyframes sw-popIn { from{opacity:0;transform:scale(0.85) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes sw-fadeUp { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
  @keyframes sw-pulse { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.7} }
  @keyframes sw-spin { to{transform:rotate(360deg)} }
  @keyframes sw-scan { 0%{transform:translateX(-100%)}100%{transform:translateX(500%)} }
  .sw-fab { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
  .sw-fab:hover { transform: scale(1.08) translateY(-2px); box-shadow: 0 16px 40px rgba(29,78,216,0.6) !important; }
  .sw-msg-user { background: #0d1829; border: 1px solid #1e293b; border-radius: 14px 14px 14px 2px; padding: 10px 14px; font-size: 13px; line-height: 1.5; color: #94a3b8; max-width: 80%; word-break: break-word; animation: sw-fadeUp 0.2s ease; font-family: 'Space Grotesk', sans-serif; }
  .sw-msg-admin { background: linear-gradient(135deg, #1d4ed8, #6d28d9); border-radius: 14px 14px 2px 14px; padding: 10px 14px; font-size: 13px; line-height: 1.5; color: #fff; max-width: 80%; word-break: break-word; animation: sw-fadeUp 0.2s ease; font-family: 'Space Grotesk', sans-serif; box-shadow: 0 4px 16px rgba(29,78,216,0.3); }
  .sw-inp { background: #060d1a; border: 1px solid #1e293b; border-radius: 10px; color: #e2e8f0; padding: 10px 14px; font-size: 13px; font-family: 'Space Grotesk', sans-serif; outline: none; transition: border-color 0.2s; }
  .sw-inp:focus { border-color: rgba(59,130,246,0.5); }
  .sw-inp::placeholder { color: #1e293b; }
  .sw-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,78,216,0.4); }
  .sw-send { transition: all 0.15s; }
`;

export default function SupportWidget({ session }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(null);
  const [hasNew, setHasNew] = useState(false);
  const [agentOnline] = useState(true);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const prevLen = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem('dts_conv_id');
    if (stored) { setConvId(stored); loadMessages(stored); }
  }, []);

  useEffect(() => {
    if (open && convId) {
      loadMessages(convId);
      pollRef.current = setInterval(() => loadMessages(convId), 5000);
      setHasNew(false);
    }
    return () => clearInterval(pollRef.current);
  }, [open, convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages(id) {
    if (!id) return;
    try {
      const r = await fetch(`/api/support?action=get&conversationId=${id}`);
      const d = await r.json();
      if (d.messages) {
        if (d.messages.length > prevLen.current && !open) setHasNew(true);
        prevLen.current = d.messages.length;
        setMessages(d.messages);
      }
    } catch {}
  }

  async function sendMessage() {
    const txt = input.trim();
    if (!txt) return;
    const token = session?.access_token || null;
    setLoading(true);
    setInput('');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const body = { message: txt, conversationId: convId };
    if (!token && email) body.email = email;
    try {
      const r = await fetch('/api/support?action=send', { method: 'POST', headers, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.success) {
        const newId = d.conversationId || d.id;
        if (!convId) { setConvId(newId); localStorage.setItem('dts_conv_id', newId); }
        loadMessages(newId || convId);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <>
      <style>{CSS}</style>

      {/* FAB BUTTON */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999 }}>
        {hasNew && !open && (
          <div style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', animation: 'sw-pulse 1.5s infinite', zIndex: 1 }}>!</div>
        )}
        <button className="sw-fab" onClick={() => setOpen(!open)}
          style={{ width: 58, height: 58, borderRadius: '50%', background: open ? '#1e293b' : 'linear-gradient(135deg,#1d4ed8,#6d28d9)', border: open ? '1px solid #334155' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(29,78,216,0.45)', fontSize: open ? 20 : 24 }}>
          {open ? '✕' : '💬'}
        </button>
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div style={{ position: 'fixed', bottom: 100, right: 28, zIndex: 9998, width: 340, background: '#06101e', border: '1px solid #0f1923', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'sw-popIn 0.25s ease', maxHeight: 520, fontFamily: "'Space Grotesk',sans-serif" }}>

          {/* HEADER */}
          <div style={{ background: 'linear-gradient(135deg,#080f20,#0f1a35)', padding: '16px 18px', borderBottom: '1px solid #0f1923', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 1, top: 0, background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.5),transparent)', animation: 'sw-scan 3s linear infinite' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#1d4ed8,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: '0 4px 16px rgba(29,78,216,0.4)' }}>🛡</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.3 }}>Deep Trade Scan</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: agentOnline ? '#10b981' : '#ef4444', boxShadow: agentOnline ? '0 0 6px #10b981' : 'none', animation: agentOnline ? 'sw-pulse 2s infinite' : 'none' }} />
                  <span style={{ fontSize: 10, color: agentOnline ? '#34d399' : '#ef4444', fontWeight: 600 }}>
                    {agentOnline ? 'Destek Ekibi Çevrimiçi' : 'Çevrimdışı'}
                  </span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, padding: '3px 8px' }}>
                <div style={{ fontSize: 8, color: '#3b82f6', fontWeight: 700, letterSpacing: 1 }}>CHARTOS</div>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200, maxHeight: 320 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>👋</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Merhaba!</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>Destek ekibimiz burada. Üyelik, analiz veya teknik konularda yardımcı olabiliriz.</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>
                  {['Üyelik planları nelerdir?', 'Analiz nasıl çalışır?', 'Telegram kanalı nasıl katılırım?'].map((q, i) => (
                    <button key={i} onClick={() => setInput(q)} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#60a5fa', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif" }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.is_from_admin ? 'flex-end' : 'flex-start' }}>
                <div className={m.is_from_admin ? 'sw-msg-admin' : 'sw-msg-user'}>
                  {m.message}
                  <div style={{ fontSize: 9, opacity: 0.45, marginTop: 4, textAlign: m.is_from_admin ? 'right' : 'left' }}>
                    {new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#0d1829', border: '1px solid #1e293b', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#334155', animation: `sw-pulse 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* EMAIL (anonim) */}
          {!session && !convId && (
            <div style={{ padding: '0 14px 8px', flexShrink: 0 }}>
              <input className="sw-inp" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta adresiniz (opsiyonel)" style={{ width: '100%', fontSize: 12 }} />
            </div>
          )}

          {/* INPUT */}
          <div style={{ padding: '10px 14px 16px', borderTop: '1px solid #0a1220', flexShrink: 0, display: 'flex', gap: 8 }}>
            <input className="sw-inp" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Mesajınızı yazın..." style={{ flex: 1 }} />
            <button className="sw-send" onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ background: input.trim() ? 'linear-gradient(135deg,#1d4ed8,#6d28d9)' : '#0d1829', border: 'none', borderRadius: 10, padding: '10px 16px', color: input.trim() ? '#fff' : '#334155', cursor: input.trim() ? 'pointer' : 'not-allowed', fontSize: 16, flexShrink: 0 }}>
              →
            </button>
          </div>

          {/* FOOTER */}
          <div style={{ padding: '8px 14px', borderTop: '1px solid #060d1a', textAlign: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: '#1e293b', letterSpacing: 1 }}>DEEP TRADE SCAN — GÜVENLİ DESTEK</span>
          </div>
        </div>
      )}
    </>
  );
}
