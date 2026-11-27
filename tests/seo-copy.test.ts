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
      ['blog', 'growth-engineering-osservabilita-ai', 'Strumenti di osservabilità per agenti AI'],
    ] as const
  ).map(([folder, slug, keyword]) => {
    const fm = post(folder, slug);
    return { name: `${folder}/${slug}`, title: fm.seoTitle ?? '', description: fm.description, keyword };
  }),
  ...(
    [
      ['analytics-engineering', 'Corso analytics engineering'],
      ['data-warehousing', 'Corso data warehouse'],
      ['agentic-ai-data-workflows', 'Data engineering con AI agentica'],
      ['dashboard-visualizzazione', 'Corso data visualization'],
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

  describe('fase 5: query vicine alla prima pagina', () => {
    const article = fs.readFileSync(path.join(root, 'blog', 'growth-engineering-osservabilita-ai.mdx'), 'utf8');
    const body = article.split('---\n').slice(2).join('---\n');

    it('osservabilità: H2 con la query esatta, tabella di confronto, FAQ e almeno 1000 parole', () => {
      expect(body).toContain('## Strumenti di osservabilità per agenti AI: confronto');
      expect(body).toMatch(/\|\s*Strumento\s*\|[^\n]*\n\|[-|\s]+\|/);
      for (const tool of ['Langfuse', 'LangSmith', 'Arize Phoenix', 'Helicone', 'OpenTelemetry']) expect(body).toContain(`| ${tool} |`);
      expect(body).toContain('## Domande frequenti');
      const faq = matter(article).data.faqSchema as unknown[];
      expect(faq.length).toBeGreaterThanOrEqual(4);
      expect(body.replace(/```[\s\S]*?```/g, '').match(/[\p{L}\p{N}']+/gu)!.length).toBeGreaterThanOrEqual(1000);
    });

    it('moduli: H1 con la query e descrizione del programma con i risultati attesi', () => {
      for (const [id, h1] of [
        ['agentic-ai-data-workflows', 'Data engineering con AI agentica'],
        ['dashboard-visualizzazione', 'Corso di data visualization'],
      ] as const) {
        const m = COURSE_MODULES.find((x) => x.id === id)!;
        expect(m.seoH1?.startsWith(h1), id).toBe(true);
        expect(m.programIntro?.paragraphs.length, id).toBeGreaterThanOrEqual(3);
        expect(m.programIntro?.outcomes.length, id).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
