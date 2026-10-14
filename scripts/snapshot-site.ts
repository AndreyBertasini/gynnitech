import fs from 'node:fs/promises';
import path from 'node:path';
import { captureDist, comparePages, renderReport, type Snapshot } from './lib/site-snapshot';

const USAGE = `Uso:
  npm run snapshot:site -- capture --dist <dir> --out <file.json>
  npm run snapshot:site -- compare <a.json> <b.json> [--report <file.md>]`;

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

async function main(): Promise<number> {
  const command = args[0];

  if (command === 'capture') {
    const dist = flag('dist');
    const out = flag('out');
    if (!dist || !out) {
      console.error(USAGE);
      return 2;
    }
    const snapshot = await captureDist(dist);
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.writeFile(out, JSON.stringify(snapshot, null, 2));
    console.log(`Fotografia salvata: ${out} (${Object.keys(snapshot).length} pagine)`);
    return 0;
  }

  if (command === 'compare') {
    const [fileA, fileB] = args.slice(1).filter((a) => !a.startsWith('--') && a !== flag('report'));
    if (!fileA || !fileB) {
      console.error(USAGE);
      return 2;
    }
    const a: Snapshot = JSON.parse(await fs.readFile(fileA, 'utf-8'));
    const b: Snapshot = JSON.parse(await fs.readFile(fileB, 'utf-8'));
    const result = comparePages(a, b);
    const report = renderReport(result);
    const reportPath = flag('report');
    if (reportPath) await fs.writeFile(reportPath, report);
    const total = result.added.length + result.removed.length + result.changed.length;
    console.log(
      total === 0
        ? 'Nessuna differenza.'
        : `Differenze: ${result.added.length} aggiunte, ${result.removed.length} rimosse, ${result.changed.length} cambiate${reportPath ? ` (report: ${reportPath})` : ''}`,
    );
    if (total > 0 && !reportPath) console.log(report);
    return total === 0 ? 0 : 1;
  }

  console.error(USAGE);
  return 2;
}

process.exitCode = await main();
