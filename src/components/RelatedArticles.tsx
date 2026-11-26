import type { CollectionEntry } from 'astro:content';
import { ArrowRight, BookOpen, Newspaper } from 'lucide-react';

type BlogLikePost = CollectionEntry<'blog'> | CollectionEntry<'blogEn'>;

interface Props {
  currentPost: BlogLikePost;
  allPosts: BlogLikePost[];
  basePath?: string;
  locale?: 'it' | 'en';
}

export function RelatedArticles({ currentPost, allPosts, basePath = '/blog', locale = 'it' }: Props) {
  const currentCategory = currentPost.data.category?.trim().toLowerCase() ?? '';
  const currentSlug = currentPost.id.replace(/\.[^/.]+$/, '');
  const copy = locale === 'en'
    ? {
        recent: 'Recent articles',
        related: 'Related articles',
        readingTime: 'min read',
        read: 'Read',
      }
    : {
        recent: 'Articoli recenti',
        related: 'Articoli correlati',
        readingTime: 'min di lettura',
        read: 'Leggi',
      };

  // Find related: same category, exclude self, sort by date descending, take 3
  const related = allPosts
    .filter((post) => {
      const cat = (post.data.category ?? '').trim().toLowerCase();
      const slug = post.id.replace(/\.[^/.]+$/, '');
      return cat === currentCategory && slug !== currentSlug;
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 3);

  if (related.length === 0) {
    // Fallback: recent posts from any category, still exclude self
    return (
      <div
        style={{
          maxWidth: '720px',
          margin: '4rem auto 0',
          padding: '1.5rem 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <Newspaper aria-hidden="true" size={18} color="var(--color-accent)" />
          <h3
            style={{
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              margin: 0,
            }}
          >
            {copy.recent}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allPosts
            .filter((p) => p.id.replace(/\.[^/.]+$/, '') !== currentSlug)
            .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
            .slice(0, 3)
            .map((post) => (
              <ArticleRow key={post.id} post={post} basePath={basePath} locale={locale} copy={copy} />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '4rem auto 0',
        padding: '1.5rem 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        <BookOpen aria-hidden="true" size={18} color="var(--color-accent)" />
        <h3
          style={{
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 700,
            margin: 0,
          }}
        >
          {copy.related}
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {related.map((post) => (
          <ArticleRow key={post.id} post={post} basePath={basePath} locale={locale} copy={copy} />
        ))}
      </div>
    </div>
  );
}

function ArticleRow({
  post,
  basePath,
  locale,
  copy,
}: {
  post: BlogLikePost;
  basePath: string;
  locale: 'it' | 'en';
  copy: { readingTime: string; read: string };
}) {
  const enSlug = (post.data as { enSlug?: string }).enSlug;
  const slug = locale === 'en' && enSlug ? enSlug : post.id.replace(/\.[^/.]+$/, '');
  const date = post.data.date.toLocaleDateString(locale === 'en' ? 'en-US' : 'it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const wordCount = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <a
      href={`${basePath.replace(/\/$/, '')}/${slug}/`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.015)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(204,255,0,0.15)';
        e.currentTarget.style.background = 'rgba(204,255,0,0.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            color: '#e2e8f0',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {post.data.title}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{date}</span>
          <span style={{ color: '#475569', fontSize: '0.75rem' }}>
            {readingTime} {copy.readingTime}
          </span>
        </div>
      </div>
      <span
        style={{
          color: 'var(--color-accent)',
          fontSize: '0.82rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {copy.read} <ArrowRight aria-hidden="true" size={14} />
      </span>
    </a>
  );
}
