import { describe, expect, it } from 'vitest';
import { baseTerms, glossaryTerms, termTitle, termWords } from '../src/lib/glossary';
import fs from 'node:fs';
import path from 'node:path';
import { bodies } from '../src/data/glossary/bodies';
import { lessonLinks } from '../src/data/glossary/lesson-links';

describe('glossario', () => {
  it('ogni slug del glossario ha un testo scritto e nessun testo è orfano', () => {
    const slugs = new Set(baseTerms.map((t) => t.slug));
    expect(Object.keys(bodies).filter((s) => !slugs.has(s))).toEqual([]);
    expect(baseTerms.filter((t) => !bodies[t.slug]).map((t) => t.slug)).toEqual([]);
  });

  it('ogni pagina ha almeno 300 parole di contenuto proprio', () => {
    const short = glossaryTerms.map((t) => [t.slug, termWords(t)] as const).filter(([, n]) => n < 300);
    expect(short).toEqual([]);
  });

  it('i termini correlati esistono, non puntano a se stessi e il title sta in 60 caratteri', () => {
    const slugs = new Set(baseTerms.map((t) => t.slug));
    for (const t of glossaryTerms) {
      expect(t.body.related.length, t.slug).toBeGreaterThanOrEqual(2);
      for (const r of t.body.related) {
        expect(slugs.has(r), `${t.slug} -> ${r}`).toBe(true);
        expect(r).not.toBe(t.slug);
      }
      expect(termTitle(t).length, t.slug).toBeLessThanOrEqual(60);
    }
  });

  it('nessun paragrafo è condiviso tra due termini', () => {
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const t of glossaryTerms) {
      for (const field of [t.body.why, t.body.how, t.body.example, t.body.pitfalls]) {
        const prev = seen.get(field);
        if (prev) dup.push(`${t.slug} = ${prev}`);
        seen.set(field, t.slug);
      }
    }
    expect(dup).toEqual([]);
  });

  it('le lezioni collegate a mano esistono', () => {
    const slugs = new Set(baseTerms.map((t) => t.slug));
    const missing: string[] = [];
    for (const [term, ids] of Object.entries(lessonLinks)) {
      if (!slugs.has(term)) missing.push(`termine ${term}`);
      for (const id of ids) {
        const base = path.join(process.cwd(), 'src', 'content', 'corso', id);
        if (!fs.existsSync(`${base}.mdx`) && !fs.existsSync(`${base}.md`)) missing.push(id);
      }
    }
    expect(missing).toEqual([]);
  });
});
