import { readdirSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { readEntryBody } from './entry-body';

describe('readEntryBody', () => {
  test('returns the lesson text without its frontmatter', async () => {
    const body = await readEntryBody('src/content/corso/advanced-sql/window-functions-avanzate.mdx');
    expect(body.length).toBeGreaterThan(3000);
    expect(body).not.toMatch(/^---/);
    expect(body).not.toContain('headerImageAlt:');
    expect(body).toContain('## ');
  });

  test('every course lesson has a body of at least the validated minimum length', async () => {
    const modules = readdirSync('src/content/corso', { withFileTypes: true }).filter((d) => d.isDirectory());
    let checked = 0;
    for (const dir of modules) {
      for (const file of readdirSync(`src/content/corso/${dir.name}`).filter((f) => f.endsWith('.mdx'))) {
        const body = await readEntryBody(`src/content/corso/${dir.name}/${file}`);
        expect(body.length, `${dir.name}/${file}`).toBeGreaterThan(2000);
        checked += 1;
      }
    }
    expect(checked).toBe(248);
  });

  test('fails loudly when the file does not exist', async () => {
    await expect(readEntryBody('src/content/corso/nope/nope.mdx')).rejects.toThrow();
  });
});
