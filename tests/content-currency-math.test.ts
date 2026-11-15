import { readFileSync } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import remarkMath from 'remark-math';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import { hasPipelineClosure } from '../scripts/validation';

/**
 * Il `$` delle valute ("$40 million", "24$", "500 $ |") viene accoppiato da remark-math e il testo
 * fra due prezzi finisce dentro una formula KaTeX. Nel testo il dollaro va scritto `\$`.
 */
function suspiciousInlineMath(source: string, mdx: boolean): string[] {
  const body = source.replace(/^---[\s\S]*?\n---\n/, (m) => m.replace(/[^\n]/g, ' '));
  const processor = unified().use(remarkParse).use(remarkMath);
  if (mdx) processor.use(remarkMdx);
  const found: string[] = [];
  visit(processor.parse(body), 'inlineMath', (node: { value: string; position?: { start: { line: number } } }) => {
    const words = node.value.replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, '').match(/[A-Za-zÀ-ÿ]{4,}/g) ?? [];
    const startsOrEndsWithAmount = /^\s*\d/.test(node.value) || /\d\s*$/.test(node.value);
    const looksLikePrice = startsOrEndsWithAmount && (words.length > 0 || /^\s|\s$/.test(node.value));
    if (looksLikePrice || node.value.includes('|\n|')) {
      found.push(`${node.position?.start.line}: $${node.value.slice(0, 80)}$`);
    }
  });
  return found;
}

describe('il $ delle valute non diventa una formula', () => {
  it('nessun contenuto ha una formula inline che è in realtà testo fra due prezzi', async () => {
    const root = path.join(process.cwd(), 'src/content');
    const files = (await glob('**/*.{md,mdx}', { cwd: root, nodir: true, absolute: true })).sort();
    const offenders = files.flatMap((file) =>
      suspiciousInlineMath(readFileSync(file, 'utf8'), file.endsWith('.mdx')).map(
        (hit) => `${path.relative(process.cwd(), file)}:${hit}`,
      ),
    );
    expect(offenders, `\n${offenders.join('\n')}\n`).toEqual([]);
  }, 60_000);

  it('riconosce i prezzi accoppiati e lascia stare le formule vere e i dollari escapati', () => {
    expect(suspiciousInlineMath('Budget di $40 million contro $120 million.', false)).toHaveLength(1);
    expect(suspiciousInlineMath('Tier da 24$ e poi 49$ al mese.', false)).toHaveLength(1);
    expect(suspiciousInlineMath('| a | fino a 500 $ |\n| b | fino a 200 $ |', false)).toHaveLength(1);
    expect(suspiciousInlineMath('Budget di \\$40 million contro \\$120 million.', false)).toEqual([]);
    expect(suspiciousInlineMath('Con $1 - \\beta = 0{,}8$ e $P(\\text{Churn})$.', false)).toEqual([]);
  });
});

describe('chiusura delle lezioni della pipeline', () => {
  const closing = '## Domande\n\n1. Prima?\n2. Seconda?\n3. Terza?\n';
  it('vale come sintesi solo con domande numerate in fondo e una riga Verdetto', () => {
    expect(hasPipelineClosure(`## A\n\nVerdetto: scegli X.\n\n${closing}`)).toBe(true);
    expect(hasPipelineClosure(`## A\n\nTesto.\n\n${closing}`)).toBe(false);
    expect(hasPipelineClosure(`${closing}\n## Coda\n\nVerdetto: scegli X.\n`)).toBe(false);
  });
});
