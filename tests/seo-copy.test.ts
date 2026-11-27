import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { COURSE_MODULES } from '../src/data/course-modules';

/**
 * Title e description rivisti per il CTR (fase 4): title ≤ 60 caratteri, description ≤ 155,
 * parola chiave all'inizio del title. Il test fissa anche le correzioni di grammatica richieste.
 */
const root = path.join(process.cwd(), 'src', 'content');
const post = (folder: 'blog' | 'blog-en', slug: string) =>
  matter(fs.readFileSync(path.join(root, folder, `${slug}.mdx`), 'utf8')).data as { seoTitle?: string; title: string; description: string };

const targets: Array<{ name: string; title: string; description: string; keyword: string }> = [
  ...(
    [
      ['blog', 'ai-2027-scenario-italiano', 'AI 2027'],
      ['blog', 'affinity-index', 'Affinity Index'],
      ['blog', 'hadi-cycles', 'Ciclo HADI'],
      ['blog', 'cluster-analysis', 'Cluster analysis'],
      ['blog-en', 'affinity-index', 'Affinity Index'],
      ['blog-en', 'hadi-cycles', 'HADI cycle'],
      ['blog-en', 'cluster-analysis', 'Cluster analysis'],
    ] as const
  ).map(([folder, slug, keyword]) => {
    const fm = post(folder, slug);
    return { name: `${folder}/${slug}`, title: fm.seoTitle ?? '', description: fm.description, keyword };
  }),
  ...(
    [
      ['analytics-engineering', 'Corso analytics engineering'],
      ['data-warehousing', 'Corso data warehouse'],
    ] as const
  ).map(([id, keyword]) => {
    const m = COURSE_MODULES.find((x) => x.id === id)!;
    return { name: `course/${id}`, title: m.seoTitle ?? '', description: m.seoDescription ?? '', keyword };
  }),
];

describe('title e description per il CTR', () => {
  for (const t of targets) {
    it(`${t.name}: lunghezze, keyword iniziale, niente doppi spazi`, () => {
      expect(t.title.length, 'title').toBeGreaterThan(0);
      expect(t.title.length, 'title').toBeLessThanOrEqual(60);
      expect(t.description.length, 'description').toBeLessThanOrEqual(155);
      expect(t.title.toLowerCase().startsWith(t.keyword.toLowerCase()), `keyword "${t.keyword}" all'inizio`).toBe(true);
      expect(`${t.title} ${t.description}`).not.toMatch(/\s{2,}/);
    });
  }

  it('affinity index: "senza affinity e come pescare" è corretto in "è come pescare"', () => {
    expect(post('blog', 'affinity-index').description).toContain('è come pescare al buio');
    expect(post('blog', 'affinity-index').description).not.toMatch(/affinity e come pescare/);
    expect(post('blog-en', 'affinity-index').description).toContain('is like fishing in the dark');
  });
});
