import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { SYS_FONT, ACCENT, GREEN, LABEL, LABEL_2, Icon } from './mac';

interface EmailComposeProps {
  windowMode?: boolean;
}

const SEP = '0.5px solid rgba(0,0,0,0.1)';

const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: LABEL,
  fontSize: '13px',
  fontFamily: SYS_FONT,
  caretColor: ACCENT,
  padding: 0,
  height: '100%',
};

const pushButton: CSSProperties = {
  height: '22px',
  padding: '0 14px',
  borderRadius: '6px',
  border: '0.5px solid rgba(0,0,0,0.15)',
  background: '#fff',
  boxShadow: '0 0.5px 1px rgba(0,0,0,0.08)',
  color: LABEL,
  fontSize: '13px',
  fontFamily: SYS_FONT,
  cursor: 'default',
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '30px', padding: '0 16px 0 0', borderBottom: SEP }}>
      <span style={{ width: '76px', flexShrink: 0, textAlign: 'right', paddingRight: '8px', boxSizing: 'border-box', fontSize: '13px', color: LABEL_2 }}>{label}</span>
      {children}
    </div>
  );
}

const EmailCompose = (_props: EmailComposeProps) => {
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [hoverSend, setHoverSend] = useState(false);

  const canSend = /\S+@\S+\.\S+/.test(from.trim()) && message.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    const subjectLine = subject.trim() || `Message from ${from.trim()}`;
    const body = `${message.trim()}\n\nReply to: ${from.trim()}`;
    window.location.href = `mailto:ronnielgandhe@gmail.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => setSent(true), 400);
  };

  const shell: CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    fontFamily: SYS_FONT,
    fontSize: '13px',
    lineHeight: 1.35,
    color: LABEL,
    overflow: 'hidden',
  };

  if (sent) {
    return (
      <div style={{ ...shell, alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <svg width="36" height="36" viewBox="0 0 20 20" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8" />
          <path d="m6.5 10.2 2.3 2.3 4.7-4.9" />
        </svg>
        <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>Your mail app should open now</div>
        <div style={{ color: LABEL_2 }}>Hit send there to deliver the message.</div>
        <button
          style={{ ...pushButton, marginTop: '12px' }}
          onClick={() => { setSent(false); setFrom(''); setSubject(''); setMessage(''); }}
        >
          New Message
        </button>
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={{ height: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 12px 0 80px', boxSizing: 'border-box', background: '#f6f6f6', borderBottom: SEP }}>
        <div
          role="button"
          title="Send"
          aria-disabled={!canSend}
          onClick={handleSend}
          onMouseEnter={() => setHoverSend(true)}
          onMouseLeave={() => setHoverSend(false)}
          style={{
            width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: canSend ? ACCENT : 'rgba(0,0,0,0.25)',
            background: canSend && hoverSend ? 'rgba(0,0,0,0.06)' : 'transparent',
            cursor: 'default',
          }}
        >
          <Icon.PaperPlane size={18} />
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        <Row label="To:">
          <span style={{ fontSize: '13px', color: ACCENT, background: 'rgba(0,122,255,0.1)', padding: '1px 8px', borderRadius: '10px' }}>
            Ronniel Gandhe
          </span>
        </Row>
        <Row label="From:">
          <input type="email" value={from} onChange={e => setFrom(e.target.value)} placeholder="you@example.com" style={inputStyle} />
        </Row>
        <Row label="Subject:">
          <input value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} />
        </Row>
      </div>

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        aria-label="Message"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: LABEL,
          fontSize: '13px',
          fontFamily: SYS_FONT,
          lineHeight: 1.35,
          padding: '12px 16px',
          resize: 'none',
          width: '100%',
          boxSizing: 'border-box',
          caretColor: ACCENT,
        }}
      />
    </div>
  );
};

export default EmailCompose;
