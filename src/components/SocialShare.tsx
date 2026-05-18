interface Props {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: '🔗',
      color: '#0077b5',
    },
    {
      name: 'Twitter / X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: '🐦',
      color: '#1da1f2',
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: '💬',
      color: '#25d366',
    },
    {
      name: 'Copia link',
      href: '#',
      icon: '📋',
      color: '#64748b',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(url).then(() => {
          const btn = e.currentTarget as HTMLElement;
          const span = btn.querySelector('.copy-text') as HTMLElement;
          if (span) {
            span.textContent = 'Copiato!';
            setTimeout(() => { span.textContent = 'Copia link'; }, 1500);
          }
        });
      },
    },
  ];

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '2.5rem auto 0',
        padding: '1.25rem 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500, marginRight: '0.5rem' }}>
          Condividi:
        </span>
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target={link.onClick ? undefined : '_blank'}
            rel="noreferrer"
            onClick={link.onClick}
            className="share-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: 500,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = link.color;
              e.currentTarget.style.color = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            {link.icon}
            <span className="copy-text">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
