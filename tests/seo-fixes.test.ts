import { describe, expect, it } from 'vitest';
import { addTrailingSlash, normalizeInternalLinks } from '../scripts/lib/internal-links';
import { stripTextRegions } from '../scripts/lib/html-text-regions';
import { isPageTranslated, type TranslationTally } from '../scripts/lib/translation-coverage';
import rehypeStripCourseH1 from '../src/lib/rehype-strip-course-h1.mjs';

describe('addTrailingSlash', () => {
  it.each([
    ['/blog/sql-per-marketing', '/blog/sql-per-marketing/'],
    ['/en', '/en/'],
    ['/course/real-time-analytics/streaming#kafka', '/course/real-time-analytics/streaming/#kafka'],
    ['/blog?tag=sql', '/blog/?tag=sql'],
  ])('adds the slash Cloudflare would redirect to: %s', (input, expected) => {
    expect(addTrailingSlash(input)).toBe(expected);
  });

  it.each([
    '/', '/blog/', '/about/#faq', 'https://example.com/page', '//cdn.example.com/x', '#top', 'mailto:a@b.it',
    '/llms.txt', '/about.md', '/sitemap-index.xml', '/_astro/app.js', '/pagefind/pagefind.js', '/cdn-cgi/l/email-protection',
    '/api/newsletter',
  ])('leaves %s untouched', (href) => {
    expect(addTrailingSlash(href)).toBe(href);
  });
});

describe('normalizeInternalLinks', () => {
  it('rewrites href attributes only, including canonical and hreflang links', () => {
    const html = '<link rel="canonical" href="https://ginnytech.it/consulting"><a href="/blog/x">x</a><a href=\'/en/blog/y#z\'>y</a><code>href="/not/a/link"</code>';
    const out = normalizeInternalLinks(html, 'https://ginnytech.it');
    expect(out).toContain('href="https://ginnytech.it/consulting/"');
    expect(out).toContain('href="/blog/x/"');
    expect(out).toContain("href='/en/blog/y/#z'");
    expect(out).toContain('<code>href="/not/a/link"</code>');
  });

  it('does not touch external absolute URLs', () => {
    expect(normalizeInternalLinks('<a href="https://github.com/foo">g</a>', 'https://ginnytech.it')).toBe('<a href="https://github.com/foo">g</a>');
  });
});

describe('stripTextRegions', () => {
  it('drops code samples so audits do not mistake them for real links', () => {
    expect(stripTextRegions('<p><a href="/a/">a</a></p><code>&#x3C;a href="/checkout"></code><pre class="x">href="/y"</pre>'))
      .toBe('<p><a href="/a/">a</a></p><code></code><pre></pre>');
  });
});

describe('isPageTranslated', () => {
  const tally = (hit: number, miss: number, title = true, description = true): TranslationTally => ({
    translatedChars: hit, untranslatedChars: miss, titleTranslated: title, descriptionTranslated: description,
  });

  it('accepts a page whose title, description and almost all text are translated', () => {
    expect(isPageTranslated(tally(9500, 400))).toBe(true);
  });

  it('rejects a page left mostly in Italian', () => {
    expect(isPageTranslated(tally(3000, 7000))).toBe(false);
  });

  it('rejects a page with an untranslated title or description even if the body is translated', () => {
    expect(isPageTranslated(tally(9900, 10, false, true))).toBe(false);
    expect(isPageTranslated(tally(9900, 10, true, false))).toBe(false);
  });

  it('treats a page with no translatable text as not translated', () => {
    expect(isPageTranslated(tally(0, 0))).toBe(false);
  });
});

describe('rehypeStripCourseH1', () => {
  const el = (tagName: string, text: string) => ({ type: 'element', tagName, properties: {}, children: [{ type: 'text', value: text }] });
  const ws = { type: 'text', value: '\n' };
  const run = (children: object[], path: string) => {
    const tree = { type: 'root', children: [...children] };
    rehypeStripCourseH1()(tree as never, { path } as never);
    return tree.children.map((n: any) => n.tagName ?? 'ws');
  };

  it('removes the leading H1 of a course lesson, which the page template already renders', () => {
    expect(run([ws, el('h1', 'Titolo'), ws, el('p', 'Intro'), el('h2', 'Sezione')], '/repo/src/content/corso/advanced-sql/caso-studio.mdx'))
      .toEqual(['ws', 'ws', 'p', 'h2']);
  });

  it('keeps the H1 of non-course content and H1s that are not first', () => {
    expect(run([el('h1', 'Post'), el('p', 'x')], '/repo/src/content/blog/post.mdx')).toEqual(['h1', 'p']);
    expect(run([el('p', 'x'), el('h1', 'Later')], '/repo/src/content/corso/m/l.mdx')).toEqual(['p', 'h1']);
  });
});
