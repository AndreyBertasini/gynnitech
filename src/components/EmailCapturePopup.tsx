import { useState, useEffect, useCallback } from 'react';

const DISMISSED_KEY = 'ginnytech_email_popup_dismissed';
const SUBSCRIBED_KEY = 'ginnytech_email_subscribed';
const SCROLL_THRESHOLD = 55; // % of page scrolled

export function EmailCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Show after scrolling 55% of page OR after 45 seconds
  const trigger = useCallback(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const subscribed = localStorage.getItem(SUBSCRIBED_KEY);
    if (dismissed || subscribed || visible) return;
    setVisible(true);
  }, [visible]);

  useEffect(() => {
    // Scroll trigger
    let scrolled = false;
    const onScroll = () => {
      if (scrolled) return;
      const pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
      if (pct >= SCROLL_THRESHOLD) {
        scrolled = true;
        trigger();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Time trigger (45s backup)
    const timer = setTimeout(trigger, 45000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [trigger]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  const subscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Inserisci un indirizzo email valido');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // Use MailerLite API (free tier up to 1000 subs)
      // Docs: https://developers.mailerlite.com/docs/subscribers
      // Group ID and API key from env or hardcoded for now
      const ML_API_KEY = 'REPLACE_WITH_YOUR_API_KEY';
      const ML_GROUP_ID = 'REPLACE_WITH_YOUR_GROUP_ID';

      const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ML_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          groups: [ML_GROUP_ID],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.message || 'Errore nella registrazione');
      }

      setStatus('success');
      localStorage.setItem(SUBSCRIBED_KEY, 'true');
      // Track in GA
      if ((window as any).gtag) {
        (window as any).gtag('event', 'email_signup', { event_category: 'conversion' });
      }

      // Close after 2.5s
      setTimeout(() => setVisible(false), 2500);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Errore. Riprova più tardi.');
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: 1000,
        animation: 'slideUp 0.4s ease-out',
      }}
    >
      {/* Backdrop for clicking outside */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: -1,
        }}
      />

      <div style={{
        maxWidth: '480px', margin: '0 auto 1.5rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
        border: '1px solid rgba(204,255,0,0.2)',
        borderRadius: '20px', padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(204,255,0,0.08)',
        position: 'relative',
      }}>
        <button
          onClick={dismiss}
          style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'none', border: 'none', color: '#64748b',
            fontSize: '1.2rem', cursor: 'pointer', padding: '0.25rem',
          }}
        >
          ✕
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📬</span>
            <h3 style={{ color: 'var(--color-accent)', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
              Controlla la tua email!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Ti abbiamo inviato la guida SQL.
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.8rem' }}>🗄️</span>
              <h3 style={{
                color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: '0.5rem 0 0.25rem',
              }}>
                Scarica la guida SQL per marketer
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                50+ query SQL commentate per analytics marketing.
                Gratis, in italiano. Ti arriva subito via email.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                onKeyDown={(e) => e.key === 'Enter' && subscribe()}
                placeholder="La tua email"
                disabled={status === 'loading'}
                style={{
                  flex: 1, minWidth: '180px',
                  padding: '0.7rem 1rem', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <button
                onClick={subscribe}
                disabled={status === 'loading'}
                style={{
                  padding: '0.7rem 1.4rem', borderRadius: '12px',
                  border: 'none',
                  background: status === 'loading'
                    ? 'rgba(204,255,0,0.3)'
                    : 'var(--color-accent)',
                  color: '#0a0f1e', fontSize: '0.9rem', fontWeight: 700,
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {status === 'loading' ? 'Invio...' : 'Scarica gratis'}
              </button>
            </div>

            {errorMsg && (
              <p style={{ color: '#f87171', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
                {errorMsg}
              </p>
            )}

            <p style={{
              color: '#475569', fontSize: '0.72rem', margin: '0.75rem 0 0', textAlign: 'center',
            }}>
              Nessuno spam. Solo contenuti che aiutano davvero.
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
