import { readFileSync } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import { describe, expect, it } from 'vitest';
import { CONTROL_CHARS, findControlCharIssues } from '../scripts/lib/control-chars';

/**
 * Regressione sulla corruzione delle formule LaTeX (commit e37fe35): un escape interpretato
 * trasforma `\text` in TAB+"ext", `\frac` in FF+"rac" ecc. Il file compila, ma KaTeX rende male.
 * Fallisce se un file di src/content contiene caratteri di controllo o un TAB dentro una formula.
 */
const CONTENT_ROOT = path.join(process.cwd(), 'src/content');

describe('contenuti MDX senza escape LaTeX interpretati', () => {
  it('nessun file in src/content contiene caratteri di controllo o TAB dentro le formule', async () => {
    const files = (await glob('**/*.{md,mdx}', { cwd: CONTENT_ROOT, nodir: true, absolute: true })).sort();
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.flatMap((file) =>
      findControlCharIssues(readFileSync(file, 'utf8')).map(
        (i) => `${path.relative(process.cwd(), file)}:${i.line} [${i.reason}] ${i.excerpt}`,
      ),
    );
    expect(offenders, `\n${offenders.join('\n')}\n`).toEqual([]);
  });

  it('il rilevatore riconosce le sequenze corrotte note', () => {
    for (const sample of ['$\x07lpha$', '$\x08eta$', '$\x0crac{a}{b}$', '$a \x07pprox b$']) {
      expect(CONTROL_CHARS.test(sample)).toBe(true);
      expect(findControlCharIssues(sample)).toHaveLength(1);
    }
    expect(findControlCharIssues('$P(\ttext{A})$')).toEqual([
      expect.objectContaining({ line: 1, reason: 'TAB dentro una formula' }),
    ]);
  });

  it('non segnala LaTeX corretto, TAB legittimi fuori dalle formule o dentro il codice', () => {
    const pulita = String.raw`$P(\text{A} \mid \neg B) \approx \alpha \times \frac{1}{2}$ e $\beta$`;
    expect(findControlCharIssues(pulita)).toEqual([]);
    expect(findControlCharIssues('| colonna\tcon tab | $x$ |')).toEqual([]);
    expect(findControlCharIssues('```sql\nSELECT\t$1\n```')).toEqual([]);
  });
});
