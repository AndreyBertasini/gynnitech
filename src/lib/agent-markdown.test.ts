import matter from 'gray-matter';
import { describe, expect, test } from 'vitest';
import { GITHUB_PROFILE_URL, LINKEDIN_URL } from '../consts';
import { mdxToAgentMarkdown, renderAboutDocument, renderAgentDocument } from './agent-markdown';
import { PERSON_TOPICS } from './entity';

const LEFTOVER_TAG = /<\/?(Aside|Steps|Tabs|TabItem|Card|CardGrid)\b/;

describe('mdxToAgentMarkdown — componenti «3 secondi»', () => {
  const body = [
    '<Percorso />',
    '',
    '## Righe e colonne',
    '',
    '<Slide sezione="1" titolo="Righe contro colonne" messaggio="OLTP legge una riga.">',
    '<Confronto>',
    '<Lato nome="OLTP" sottotitolo="una riga, tante volte" />',
    '<Lato nome="OLAP" sottotitolo="molte righe, poche colonne" scelta="ClickHouse punta qui" />',
    '<Criterio nome="Query" a="una riga intera" b="poche colonne" />',
    '</Confronto>',
    '</Slide>',
    '',
    '<Schema sezione="1" titolo="Perché leggiamo solo alcune colonne">',
    '<Passo testo="I dati sono in una tabella." />',
    '<Passo testo="Ogni colonna è un file a parte." />',
    '<Passo testo="La query legge solo amount." />',
    '<MiniTabella colonne="order_id,amount" righe="3" evidenzia="col:amount@3" />',
    '</Schema>',
    '',
    '<ErroreTipico sbagliato="SELECT * legge tutto" giusto="Solo le colonne che servono" />',
    '',
    '<Messaggio>Leggiamo solo le colonne della query.</Messaggio>',
    '',
    '<Domanda risposta="3">Quante colonne leggiamo?</Domanda>',
    '',
    '```sql',
    "SELECT '<Slide>' AS x;",
    '```',
  ].join('\n');

  test('non lascia tag dei componenti fuori dal codice', () => {
    const out = mdxToAgentMarkdown(body);
    const fuoriDalCodice = out.replace(/```[\s\S]*?```/g, '');
    expect(fuoriDalCodice).not.toMatch(/<\/?[A-Z]/);
  });

  test('rende stelle, passi numerati e confronto ✗/✓', () => {
    const out = mdxToAgentMarkdown(body);
    expect(out).toContain('> ★ Leggiamo solo le colonne della query.');
    expect(out).toContain('1. I dati sono in una tabella.');
    expect(out).toContain('3. La query legge solo amount.');
    expect(out).toContain('- ✗ SELECT * legge tutto');
    expect(out).toContain('- ✓ Solo le colonne che servono');
    expect(out).toContain('- **OLAP**: molte righe, poche colonne ← ClickHouse punta qui');
  });

  test('lascia il codice intatto', () => {
    expect(mdxToAgentMarkdown(body)).toContain("SELECT '<Slide>' AS x;");
  });
});

describe('mdxToAgentMarkdown', () => {
  test('drops imports and turns an Aside into a titled blockquote', () => {
    const out = mdxToAgentMarkdown(
      "import { Aside } from '@astrojs/starlight/components';\n\n<Aside type=\"tip\" title=\"Nota\">Testo</Aside>\n",
    );
    expect(out).not.toContain('import');
    expect(out).toContain('> **Nota**');
    expect(out).toContain('> Testo');
  });

  test('quotes a multi-line Aside body line by line', () => {
    const out = mdxToAgentMarkdown('<Aside title="Attenzione">\nPrima riga\n\nSeconda riga\n</Aside>');
    expect(out).toBe('> **Attenzione**\n> Prima riga\n>\n> Seconda riga');
  });

  test('drops multi-line imports', () => {
    const out = mdxToAgentMarkdown("import {\n  Aside,\n  Steps,\n} from '@astrojs/starlight/components';\n\nCiao");
    expect(out).toBe('Ciao');
  });

  test('leaves fenced code byte for byte, even when it looks like JSX or has blank runs', () => {
    const code = "```sql\nSELECT '<Aside>' AS x;\nimport foo\n\n\n\nSELECT 2;\n```";
    expect(mdxToAgentMarkdown(`Prima\n\n${code}\n\nDopo`)).toBe(`Prima\n\n${code}\n\nDopo`);
  });

  test('unwraps Steps and keeps the list intact', () => {
    const out = mdxToAgentMarkdown('<Steps>\n1. uno\n2. due\n</Steps>');
    expect(out).toBe('1. uno\n2. due');
  });

  test('keeps code that lives inside Steps and TabItem', () => {
    const body = '<Tabs>\n<TabItem label="Python">\n```python\nprint("<Steps>")\n```\n</TabItem>\n</Tabs>';
    const out = mdxToAgentMarkdown(body);
    expect(out).toContain('**Python**');
    expect(out).toContain('```python\nprint("<Steps>")\n```');
    expect(out.replace(/```[\s\S]*?```/g, '')).not.toMatch(LEFTOVER_TAG);
  });

  test('turns a titled Card into a bold line and unwraps CardGrid', () => {
    const out = mdxToAgentMarkdown('<CardGrid>\n<Card title="Alfa">\nTesto alfa\n</Card>\n</CardGrid>');
    expect(out).toBe('**Alfa**\nTesto alfa');
  });

  test('removes self-closing Lucide-style icons and MDX comments', () => {
    const out = mdxToAgentMarkdown('Testo <ArrowRight size={16} /> qui\n\n{/* GEO: claim senza fonte */}\n\nFine');
    expect(out).toBe('Testo  qui\n\nFine');
  });

  test('drops multi-line interactive exercise components', () => {
    const body = [
      'Prima',
      '',
      '<SqlExercise client:visible',
      '  description={`Usa un semi-join`}',
      '  hint="Usa WHERE EXISTS (SELECT 1 > 0)."',
      '/>',
      '',
      'Dopo',
    ].join('\n');
    expect(mdxToAgentMarkdown(body)).toBe('Prima\n\nDopo');
  });

  test('leaves JSX-looking text inside inline code alone', () => {
    expect(mdxToAgentMarkdown('Usa `<Icon />` e `<Aside>` nel testo.')).toBe('Usa `<Icon />` e `<Aside>` nel testo.');
  });

  test('drops a leading H1 only', () => {
    expect(mdxToAgentMarkdown('# Titolo\n\nTesto\n\n# Altro')).toBe('Testo\n\n# Altro');
  });

  test('collapses runs of blank lines outside code to a single blank line', () => {
    expect(mdxToAgentMarkdown('uno\n\n\n\n\ndue')).toBe('uno\n\ndue');
  });

  test('never leaves a component tag behind', () => {
    const body =
      "import { Aside, Steps } from 'x';\n<Steps>\n1. a\n</Steps>\n<Aside title=\"T\">x</Aside>\n<Tabs><TabItem label=\"L\">y</TabItem></Tabs>\n<CardGrid><Card title=\"C\">z</Card></CardGrid>";
    expect(mdxToAgentMarkdown(body)).not.toMatch(LEFTOVER_TAG);
  });
});

describe('renderAgentDocument', () => {
  const meta = {
    title: 'A/B test: "perché" fallisce',
    description: 'Descrizione con \\ backslash e "virgolette"',
    url: 'https://ginnytech.it/blog/x/',
    datePublished: new Date('2026-03-04T10:00:00Z'),
    dateModified: new Date('2026-05-06T10:00:00Z'),
  };

  test('emits YAML frontmatter that round-trips through gray-matter', () => {
    const { data } = matter(renderAgentDocument(meta, 'Corpo'));
    expect(data.title).toBe('A/B test: "perché" fallisce');
    expect(data.description).toBe('Descrizione con \\ backslash e "virgolette"');
    expect(data.url).toBe('https://ginnytech.it/blog/x/');
    expect(data.author).toBe('Andrii Dyshkantiuk');
    expect(data.author_url).toBe('https://ginnytech.it/about');
    expect(data.publisher).toBe('GinnyTech');
    expect(data.license).toBe('CC BY 4.0');
    expect(data.language).toBe('it-IT');
  });

  test('keeps keys in the documented order and dates as YYYY-MM-DD strings', () => {
    const doc = renderAgentDocument(meta, 'Corpo');
    const keys = doc
      .split('\n---\n')[0]
      .split('\n')
      .slice(1)
      .map((line) => line.split(':')[0]);
    expect(keys).toEqual([
      'title',
      'description',
      'url',
      'author',
      'author_url',
      'publisher',
      'date_published',
      'date_modified',
      'license',
      'language',
    ]);
    expect(doc).toContain('date_published: "2026-03-04"');
    expect(doc).toContain('date_modified: "2026-05-06"');
  });

  test('omits description and dates when absent', () => {
    const doc = renderAgentDocument({ title: 'T', url: 'https://ginnytech.it/x/' }, 'Corpo');
    expect(doc).not.toContain('description:');
    expect(doc).not.toContain('date_');
  });

  test('shows the title as a single H1 even when the body starts with its own H1', () => {
    const doc = renderAgentDocument({ title: 'Titolo', url: 'https://ginnytech.it/x/' }, '# Titolo\n\nCorpo');
    expect(doc.match(/^# /gm)).toHaveLength(1);
    expect(doc.trimEnd().endsWith('Corpo')).toBe(true);
  });

  test('converts the body', () => {
    const doc = renderAgentDocument({ title: 'T', url: 'https://ginnytech.it/x/' }, "import a from 'b';\n\n<Steps>\n1. uno\n</Steps>");
    expect(doc).not.toContain('import');
    expect(doc).not.toMatch(LEFTOVER_TAG);
  });
});

describe('renderAboutDocument', () => {
  const doc = renderAboutDocument();
  const { data, content } = matter(doc);

  test('is addressed to the HTML about page', () => {
    expect(data.url).toBe('https://ginnytech.it/about/');
    expect(data.author_url).toBe('https://ginnytech.it/about');
    expect(content.match(/^# /gm)).toHaveLength(1);
  });

  test('lists every topic as an absolute link to its course module', () => {
    for (const topic of PERSON_TOPICS) {
      expect(content).toContain(`- [${topic.name}](https://ginnytech.it${topic.href})`);
    }
  });

  test('names the public profiles and the role', () => {
    expect(content).toContain(LINKEDIN_URL);
    expect(content).toContain(GITHUB_PROFILE_URL);
    expect(content).toContain('MarTech Expert, Data Engineer e Formatore');
    expect(content).toContain('GinnyTech');
  });

  test('contains no component tags', () => {
    expect(doc).not.toMatch(LEFTOVER_TAG);
  });
});
