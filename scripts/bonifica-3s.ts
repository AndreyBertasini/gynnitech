import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CORSO_DIR = path.resolve('src/content/corso');

function walkMdx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMdx(full));
    else if (entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function attr(tag: string, name: string): string | undefined {
  const m = new RegExp(`\\b${name}="([^"]*)"`).exec(tag);
  return m ? m[1] : undefined;
}

function stripFrontmatter3s(rawFrontmatter: string): string {
  const lines = rawFrontmatter.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let skippingSezioni = false;

  for (const line of lines) {
    if (skippingSezioni) {
      if (/^\s+-\s+/.test(line) || /^\s+[a-zA-Z0-9_]+:/.test(line)) {
        continue;
      }
      skippingSezioni = false;
    }
    if (/^formato:\s*["']?3s["']?\s*$/.test(line.trim())) {
      continue;
    }
    if (/^sezioni:\s*$/.test(line.trim()) || /^sezioni:\s*\[/.test(line.trim())) {
      if (!line.trim().endsWith(']')) {
        skippingSezioni = true;
      }
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

export function transformBody3s(body: string): string {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inFence: string | null = null;
  let skippingWidget = false;
  let skippingRiepilogo = false;
  let inSchema = false;

  for (const raw of lines) {
    const trimmed = raw.trim();
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(raw);
    if (inFence) {
      out.push(raw);
      if (fenceMatch && fenceMatch[1][0] === inFence[0] && fenceMatch[1].length >= inFence.length) {
        inFence = null;
      }
      continue;
    }
    if (fenceMatch) {
      inFence = fenceMatch[1];
      out.push(raw);
      continue;
    }

    if (/^import\s+.*(QuizExercise|SqlExercise|components\/lezione)/.test(trimmed)) {
      continue;
    }

    if (skippingWidget) {
      if (/\/>\s*$/.test(trimmed) || /<\/(QuizExercise|SqlExercise)>/.test(trimmed)) {
        skippingWidget = false;
      }
      continue;
    }
    if (/^<(QuizExercise|SqlExercise)\b/.test(trimmed)) {
      if (!/\/>\s*$/.test(trimmed)) skippingWidget = true;
      continue;
    }

    if (/^##\s+(?:\d+\.\s*)?(Riepilogo|Riepilogo operativo|Conclusioni|Sintesi)\b/i.test(trimmed)) {
      skippingRiepilogo = true;
      continue;
    }
    if (skippingRiepilogo && /^##\s+/.test(trimmed)) {
      skippingRiepilogo = false;
    }
    if (skippingRiepilogo) continue;

    if (/^<Schema\b/.test(trimmed)) {
      inSchema = true;
      continue;
    }
    if (/^<\/Schema>/.test(trimmed)) {
      inSchema = false;
      continue;
    }
    if (inSchema || /^<Passo\b/.test(trimmed)) continue;

    if (/^<(Percorso|Obiettivi)\s*\/>$/.test(trimmed)) continue;
    if (/^<\/?(Slide|Confronto|Passi|Opzioni|Barre|NumeriGrandi|ErroreTipico|TabellaDati)\b[^>]*>$/.test(trimmed)) continue;
    if (/^<\/Relazioni>$/.test(trimmed)) continue;
    if (/^<(Domanda|Messaggio|MiniTabella)\b/.test(trimmed)) continue;

    const tag = /^<([A-Z][A-Za-z0-9]*)\b/.exec(trimmed)?.[1];
    const a = (n: string) => attr(trimmed, n) ?? '';

    if (tag === 'Relazioni') {
      out.push(`**Relazioni chiave — ${a('centro')}:**`);
      continue;
    }
    if (tag === 'Lato') {
      const es = attr(trimmed, 'esempio');
      const sc = attr(trimmed, 'scelta');
      out.push(`- **${a('nome')}**: ${a('sottotitolo')}${es ? ` (Esempio: \`${es}\`)` : ''}${sc ? ` — ${sc}` : ''}`);
      continue;
    }
    if (tag === 'Criterio') {
      out.push(`- **${a('nome')}**: ${a('a')} vs ${a('b')}`);
      continue;
    }
    if (tag === 'Fase') {
      out.push(`- **${a('nome')}**: ${a('testo')}`);
      continue;
    }
    if (tag === 'Opzione') {
      out.push(`- **${a('nome')}**: ${a('testo')}`);
      continue;
    }
    if (tag === 'Barra') {
      out.push(`- **${a('nome')}**: ${attr(trimmed, 'etichetta') ?? a('valore')}`);
      continue;
    }
    if (tag === 'Numero') {
      out.push(`- **${a('valore')}** — ${a('testo')}`);
      continue;
    }
    if (tag === 'Nodo') {
      out.push(`- **${a('nome')}**`);
      continue;
    }
    if (tag === 'ErroreTipico') {
      out.push(`- **Caso pratico — Errore comune:** ${a('sbagliato')}\n- **Approccio corretto:** ${a('giusto')}`);
      continue;
    }
    if (tag === 'Pattern') {
      out.push(`- **Pattern operativo:** ${a('si')}\n- **Anti-pattern da evitare:** ${a('no')}`);
      continue;
    }

    out.push(raw);
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function main() {
  const files = walkMdx(CORSO_DIR);
  let touched = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    const has3s = parsed.data.formato === '3s' || parsed.data.sezioni !== undefined;
    const hasWidgets = /<(QuizExercise|SqlExercise|Slide|Schema|Percorso|Obiettivi)\b/.test(parsed.content);

    if (!has3s && !hasWidgets) continue;

    const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
    if (!fmMatch) continue;

    const newFm = stripFrontmatter3s(fmMatch[1]);
    const newBody = transformBody3s(parsed.content);
    const updated = `---\n${newFm}\n---\n\n${newBody}`;

    fs.writeFileSync(file, updated, 'utf8');
    touched++;
  }

  console.log(`Bonificati ${touched} file .mdx.`);
}

main();
