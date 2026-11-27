import { describe, expect, it } from 'vitest';
import { auditRenderedHtml, countSourceFences } from '../scripts/lib/rendered-code-audit';

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
