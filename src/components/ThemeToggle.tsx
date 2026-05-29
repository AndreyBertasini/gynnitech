import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'starlight-theme';
const THEME_EVENT = 'ginnytech:theme-changed';

type Theme = 'dark' | 'light';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
}

export function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return (document.documentElement.getAttribute('data-theme') as Theme) || 'dark';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const current = getStoredTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Passa alla modalità chiara' : 'Passa alla modalità scura'}
      title={isDark ? 'Modalità chiara' : 'Modalità scura'}
      style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '999px',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        padding: 0,
        color: isDark ? '#fbbf24' : '#64748b',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(204,255,0,0.4)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(204,255,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Sun icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: 'absolute',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isDark ? 'translateY(30px) rotate(90deg)' : 'translateY(0) rotate(0deg)',
          opacity: isDark ? 0 : 1,
        }}
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>

      {/* Moon icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: 'absolute',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isDark ? 'translateY(0) rotate(0deg)' : 'translateY(-30px) rotate(-90deg)',
          opacity: isDark ? 1 : 0,
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
