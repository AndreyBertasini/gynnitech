import { describe, expect, it } from 'vitest';
import {
  auditRenderedHtml,
  countSourceFences,
  hasDoubleDollarMath,
  pageErrors,
} from '../scripts/lib/rendered-code-audit';

describe('auditRenderedHtml', () => {
  it('flags plain code blocks that no highlighter processed', () => {
    const r = auditRenderedHtml('<pre><code class="language-sql">SELECT 1</code></pre>');
    expect(r.plainCode).toEqual(['sql']);
  });

  it('flags mermaid blocks that were not turned into diagrams', () => {
    const r = auditRenderedHtml('<pre><code class="language-mermaid">flowchart TD</code></pre>');
    expect(r.plainMermaid).toBe(1);
    expect(r.plainCode).toEqual([]);
  });

  it('counts Expressive Code blocks, Mermaid diagrams and KaTeX formulas', () => {
    const html = [
      '<div class="expressive-code"><figure><pre data-language="sql"><code>x</code></pre></figure></div>',
      '<pre class="mermaid">flowchart TD</pre>',
      '<span class="katex">x</span><span class="katex">y</span>',
    ].join('');
    const r = auditRenderedHtml(html);
    expect(r).toMatchObject({ ec: 1, mermaid: 1, katex: 2, plainCode: [], plainMermaid: 0 });
  });

  it('counts KaTeX display blocks and KaTeX errors', () => {
    const r = auditRenderedHtml('<span class="katex-display">x</span><span class="katex-error">y</span>');
    expect(r).toMatchObject({ katexDisplay: 1, katexError: 1 });
  });

  it('ignores math blocks rendered by KaTeX', () => {
    expect(auditRenderedHtml('<pre><code class="language-math">x</code></pre>').plainCode).toEqual([]);
  });
});

describe('countSourceFences', () => {
  it('separates mermaid fences from code fences and ignores closing fences', () => {
    const mdx = ['```sql', 'SELECT 1', '```', '', '```mermaid', 'flowchart TD', '```', '  ```python', 'x', '  ```'].join('\n');
    expect(countSourceFences(mdx)).toEqual({ code: 2, mermaid: 1 });
  });
});

describe('countSourceFences, stili di fence', () => {
  it('counts ~~~ fences', () => {
    expect(countSourceFences(['~~~sql', 'SELECT 1', '~~~'].join('\n'))).toEqual({ code: 1, mermaid: 0 });
  });

  it('counts a 4-backtick wrapper once and ignores the 3-backtick example inside it', () => {
    const mdx = ['````md', '```sql', 'SELECT 1', '```', '````'].join('\n');
    expect(countSourceFences(mdx)).toEqual({ code: 1, mermaid: 0 });
  });

  it('does not let a ~~~ line close a ``` fence', () => {
    const mdx = ['```python', 'x = "~~~"', '~~~', 'y', '```'].join('\n');
    expect(countSourceFences(mdx)).toEqual({ code: 1, mermaid: 0 });
  });

  it('does not treat an unclosed fence line with info string inside a fence as a new block', () => {
    const mdx = ['```sql', '```python', '```'].join('\n');
    expect(countSourceFences(mdx)).toEqual({ code: 1, mermaid: 0 });
  });
});

describe('hasDoubleDollarMath', () => {
  it('detects $$ formulas (block or single-line) in prose only', () => {
    expect(hasDoubleDollarMath('Testo\n\n$$\nx = 1\n$$\n')).toBe(true);
    expect(hasDoubleDollarMath('Riga $$x = 1$$ qui')).toBe(true);
    expect(hasDoubleDollarMath('```bash\necho $$\n```\nPrezzo \\$5 e \\$6')).toBe(false);
  });
});

describe('pageErrors', () => {
  const ok = { plainCode: [], plainMermaid: 0, ec: 2, mermaid: 1, katex: 3, katexDisplay: 0, katexError: 0 };

  it('accepts a page whose rendered counts match its source', () => {
    expect(pageErrors({ code: 2, mermaid: 1, doubleDollarMath: false }, ok)).toEqual([]);
  });

  it('flags a page that has fewer Expressive Code blocks than the source, even if the site total is fine', () => {
    expect(pageErrors({ code: 3, mermaid: 1, doubleDollarMath: false }, ok)).toEqual([
      'Expressive Code: 2 blocchi, attesi 3',
    ]);
  });

  it('flags extra blocks, mermaid mismatches, plain code and katex problems', () => {
    const bad = { ...ok, plainCode: ['sql'], plainMermaid: 1, mermaid: 0, katex: 0, katexError: 2 };
    const errs = pageErrors({ code: 2, mermaid: 1, doubleDollarMath: true }, bad);
    expect(errs).toContain('1 blocchi di codice non evidenziati (sql)');
    expect(errs).toContain('1 diagrammi Mermaid non disegnati');
    expect(errs).toContain('Mermaid: 0 diagrammi, attesi 1');
    expect(errs).toContain('KaTeX: 2 formule in errore');
    expect(errs).toContain('KaTeX: il sorgente ha formule $$ ma la pagina non ha formule KaTeX');
  });
});
