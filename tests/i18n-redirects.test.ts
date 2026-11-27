import { describe, expect, it } from 'vitest';
import { buildI18nRedirects } from '../scripts/lib/i18n-redirects';
import { italianSignals } from '../scripts/lib/italian-detector';

const it_ = new Set(['sql-per-marketing', 'affinity-index']);
const find = (rules: { from: string; to: string }[], from: string) => rules.find((r) => r.from === from)?.to;

describe('buildI18nRedirects', () => {
  it('manda in 301 sull’italiano gli articoli EN non rivisti, vecchio e nuovo slug', () => {
    const rules = buildI18nRedirects([{ itSlug: 'sql-per-marketing', data: { enSlug: 'sql-for-marketing' } }], [], it_);
    expect(find(rules, '/en/blog/sql-per-marketing/')).toBe('/blog/sql-per-marketing/');
    expect(find(rules, '/en/blog/sql-for-marketing/')).toBe('/blog/sql-per-marketing/');
    expect(find(rules, '/en/blog/')).toBe('/blog/');
  });

  it('per un articolo rivisto reindirizza solo il vecchio slug e non tocca la pagina EN', () => {
    const rules = buildI18nRedirects(
      [{ itSlug: 'sql-per-marketing', data: { enSlug: 'sql-for-marketing', translationReviewed: true } }], [], it_);
    expect(find(rules, '/en/blog/sql-per-marketing/')).toBe('/en/blog/sql-for-marketing/');
    expect(find(rules, '/en/blog/sql-for-marketing/')).toBeUndefined();
    expect(find(rules, '/en/blog/')).toBeUndefined();
  });

  it('reindirizza corso e pagine statiche EN verso l’italiano', () => {
    const rules = buildI18nRedirects([], ['about', 'glossario', 'blog', 'course'], it_);
    expect(find(rules, '/en/course/*')).toBe('/course/:splat');
    expect(find(rules, '/en/about/')).toBe('/about/');
    expect(find(rules, '/en/')).toBe('/');
    expect(find(rules, '/en/blog/')).toBe('/blog/');
  });
});

describe('italianSignals', () => {
  it('riconosce l’italiano e ignora l’inglese tecnico', () => {
    expect(italianSignals('Questo è il modello della pipeline dei dati').strong.length).toBeGreaterThan(2);
    expect(italianSignals('The pipeline writes rows to ClickHouse per batch, not per event').strong).toEqual([]);
  });
});
