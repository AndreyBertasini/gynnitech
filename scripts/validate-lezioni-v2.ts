import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { checkLezioneV2 } from './lezioni-v2-rules';

interface CliOptions {
  requireAll: boolean;
  filterModules: Set<string> | null;
}

function parseCliArgs(argv: string[]): CliOptions {
  let requireAll = false;
  let filterRaw: string | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--require-all') {
      requireAll = true;
    } else if (arg.startsWith('--filter=')) {
      filterRaw = arg.slice('--filter='.length);
    } else if (arg === '--filter' && i + 1 < argv.length) {
      filterRaw = argv[i + 1];
      i += 1;
    }
  }

  const filterModules =
    filterRaw && filterRaw.trim().length > 0
      ? new Set(
          filterRaw
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean),
        )
      : null;

  return { requireAll, filterModules };
}

async function main() {
  const { requireAll, filterModules } = parseCliArgs(process.argv.slice(2));
  const rawPaths = await glob('src/content/corso/**/*.mdx');
  const allPaths = rawPaths.map((p) => p.replace(/\\/g, '/')).sort();

  const moduleLessonPaths = allPaths.filter((p) => {
    const relFromCorso = p.replace(/^src\/content\/corso\//, '');
    if (!relFromCorso.includes('/')) {
      return false; // Skip top-level files like src/content/corso/learning-path.mdx
    }
    if (filterModules) {
      const moduleSlug = relFromCorso.split('/')[0].toLowerCase();
      return filterModules.has(moduleSlug);
    }
    return true;
  });

  const v2Files: Array<{ rel: string; raw: string }> = [];
  const notMigrated: string[] = [];

  for (const rel of moduleLessonPaths) {
    const raw = (await fs.readFile(path.resolve(rel), 'utf-8')).replace(/\r\n/g, '\n');
    let formato: unknown = null;
    try {
      const parsed = matter(raw);
      formato = parsed.data?.formato ?? null;
    } catch {
      if (requireAll) {
        notMigrated.push(`${rel} (frontmatter YAML non valido)`);
      }
      continue;
    }

    if (formato === 'didattica-v2') {
      v2Files.push({ rel, raw });
    } else {
      notMigrated.push(rel);
    }
  }

  if (requireAll) {
    if (moduleLessonPaths.length === 0 || v2Files.length === 0 || notMigrated.length > 0) {
      console.error(
        `ERROR (--require-all): ${v2Files.length}/${moduleLessonPaths.length} lezioni in formato didattica-v2.`,
      );
      if (notMigrated.length > 0) {
        const preview = notMigrated.slice(0, 15);
        for (const item of preview) {
          console.error(`  - missing formato: "didattica-v2" -> ${item}`);
        }
        if (notMigrated.length > preview.length) {
          console.error(`  ... e altre ${notMigrated.length - preview.length} lezioni non migrate`);
        }
      }
      process.exit(1);
    }
  }

  if (v2Files.length === 0) {
    console.log(
      `0 lezioni didattica-v2 trovate (su ${moduleLessonPaths.length} lezioni di modulo controllate); nessun errore.`,
    );
    process.exit(0);
  }

  let errorCount = 0;
  let warningCount = 0;

  for (const { rel, raw } of v2Files) {
    const { errors, warnings } = checkLezioneV2(raw, rel);
    for (const w of warnings) {
      warningCount += 1;
      console.warn(`WARN  ${rel}: ${w}`);
    }
    for (const e of errors) {
      errorCount += 1;
      console.error(`ERROR ${rel}: ${e}`);
    }
  }

  console.log(
    `Controllate ${v2Files.length} lezioni didattica-v2 (su ${moduleLessonPaths.length} lezioni di modulo): ${errorCount} errori, ${warningCount} warning.`,
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
