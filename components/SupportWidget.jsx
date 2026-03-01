// components/SupportWidget.jsx
// Bu dosyayı pages/app.jsx'in başına import edin:
// import SupportWidget from '../components/SupportWidget';
// Sonra <SupportWidget session={session} /> ekleyin

import { useState, useEffect, useRef } from 'react';

const WSTYLE = `
  @keyframes popIn { from{opacity:0;transform:scale(0.8) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes fadeUp2 { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
  @keyframes pulse2 { 0%,100%{transform:scale(1)}50%{transform:scale(1.1)} }
  .sw-bubble { max-width:75%; padding:9px 13px; border-radius:12px; font-size:13px; line-height:1.5; word-break:break-word; animation:fadeUp2 0.2s ease; }
  .sw-user { background:#0f1923; color:#94a3b8; border-radius:12px 12px 12px 2px; }
  .sw-admin { background:linear-gradient(135deg,#1d4ed8,#6d28d9); color:#fff; border-radius:12px 12px 2px 12px; }
`;

export default function SupportWidget({ session }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [convId, setConvId] = useState(null);
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // Konuşma ID'si localStorage'da sakla
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
    const r = await fetch(`/api/support?action=get&conversationId=${id}`);
    const d = await r.json();
    if (d.messages) {
      const prevLen = messages.length;
      setMessages(d.messages);
      if (d.messages.length > prevLen && !open) setHasNew(true);
    }
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const token = session?.access_token || null;
    setLoading(true);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const body = { message: input, conversationId: convId };
    if (!token && email) body.email = email;

    const r = await fetch('/api/support?action=send', { method: 'POST', headers, body: JSON.stringify(body) });
    const d = await r.json();
    setLoading(false);
    if (d.success) {
      setInput('');
      const newId = d.conversationId || d.id;
      if (!convId) { setConvId(newId); localStorage.setItem('dts_conv_id', newId); }
      loadMessages(newId || convId);
    }
  }

  return (
    <>
      <style>{WSTYLE}</style>

      {/* FAB */}
      <div style={{position:'fixed',bottom:24,right:24,zIndex:9000}}>
        {/* Yeni mesaj badge */}
        {hasNew && !open && (
          <div style={{position:'absolute',top:-6,right:-6,background:'#ef4444',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#fff',animation:'pulse2 1s infinite'}}>!</div>
        )}
        <button onClick={()=>setOpen(!open)}
          style={{width:54,height:54,borderRadius:'50%',background:'linear-gradient(135deg,#1d4ed8,#6d28d9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 24px rgba(29,78,216,0.5)',fontSize:22,transition:'all 0.2s'}}>
          {open?'✕':'💬'}
        </button>
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div style={{position:'fixed',bottom:88,right:24,zIndex:8999,width:320,background:'#080f1a',border:'1px solid #1e293b',borderRadius:18,boxShadow:'0 20px 60px rgba(0,0,0,0.6)',display:'flex',flexDirection:'column',overflow:'hidden',animation:'popIn 0.2s ease',maxHeight:480}}>
          {/* Header */}
          <div style={{background:'linear-gradient(135deg,#0f1f3d,#1a1a3e)',padding:'14px 16px',borderBottom:'1px solid #0f1923',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#1d4ed8,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🛡</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#f1f5f9',fontFamily:"'Space Grotesk',sans-serif"}}>Canlı Destek</div>
                <div style={{display:'flex',alignItems:'center',gap:5,marginTop:2}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#10b981'}}/>
                  <span style={{fontSize:10,color:'#34d399',fontFamily:"'Space Grotesk',sans-serif"}}>Çevrimiçi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:8,minHeight:200,maxHeight:320}}>
            {messages.length===0&&(
              <div style={{textAlign:'center',padding:'20px 0',color:'#334155',fontSize:12,fontFamily:"'Space Grotesk',sans-serif"}}>
                Merhaba! Size nasıl yardımcı olabiliriz?
              </div>
            )}
            {messages.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.is_from_admin?'flex-end':'flex-start'}}>
                <div className={`sw-bubble ${m.is_from_admin?'sw-admin':'sw-user'}`} style={{fontFamily:"'Space Grotesk',sans-serif"}}>
                  {m.message}
                  <div style={{fontSize:9,opacity:0.5,marginTop:3}}>{new Date(m.created_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Email (anonim ise) */}
          {!session && !convId && (
            <div style={{padding:'0 14px 8px',flexShrink:0}}>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-posta (isteğe bağlı)"
                style={{width:'100%',background:'#020509',border:'1px solid #0f1923',borderRadius:8,color:'#e2e8f0',padding:'8px 12px',fontSize:12,fontFamily:"'Space Grotesk',sans-serif",outline:'none'}}/>
            </div>
          )}

          {/* Input */}
          <div style={{padding:'8px 14px 14px',borderTop:'1px solid #0f1923',flexShrink:0,display:'flex',gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&sendMessage()}
              placeholder="Mesajınızı yazın..."
              style={{flex:1,background:'#020509',border:'1px solid #0f1923',borderRadius:9,color:'#e2e8f0',padding:'9px 12px',fontSize:12,fontFamily:"'Space Grotesk',sans-serif",outline:'none'}}/>
            <button onClick={sendMessage} disabled={loading||!input.trim()}
              style={{background:'linear-gradient(135deg,#1d4ed8,#6d28d9)',border:'none',borderRadius:9,padding:'9px 14px',color:'#fff',cursor:'pointer',fontSize:13,flexShrink:0}}>
              {loading?'...':'→'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
