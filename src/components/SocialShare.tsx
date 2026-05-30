import { currentSiteLanguage } from '../utils/language';

interface Props {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: Props) {
  const language = currentSiteLanguage();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const copy = language === 'en'
    ? { share: 'Share:', copyLink: 'Copy link', copied: 'Copied!' }
    : { share: 'Condividi:', copyLink: 'Copia link', copied: 'Copiato!' };

  const shareLinks = [
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: 'in',
      color: '#0077b5',
    },
    {
      name: 'Twitter / X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: 'X',
      color: '#1da1f2',
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: 'WA',
      color: '#25d366',
    },
    {
      name: copy.copyLink,
      href: '#',
      icon: 'URL',
      color: '#64748b',
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        navigator.clipboard.writeText(url).then(() => {
          const button = event.currentTarget as HTMLElement;
          const label = button.querySelector('.copy-text') as HTMLElement | null;
          if (label) {
            label.textContent = copy.copied;
            setTimeout(() => {
              label.textContent = copy.copyLink;
            }, 1500);
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
          {copy.share}
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
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = link.color;
              event.currentTarget.style.color = '#e2e8f0';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              event.currentTarget.style.color = '#94a3b8';
            }}
          >
            <span aria-hidden="true">{link.icon}</span>
            <span className="copy-text">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
