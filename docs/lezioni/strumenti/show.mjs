// Uso: node show.mjs <modulo> <slug...> — body senza boilerplate ripetuto
import fs from 'node:fs';
const W = 'C:/Users/User/Desktop/gynnitech/.claude/worktrees/analizza-corsi-structure-f4afab/src/content/corso';
const [m, ...slugs] = process.argv.slice(2);
for (const s of slugs) {
  const raw = fs.readFileSync(`${W}/${m}/${s}.mdx`, 'utf8').replace(/\r\n/g, '\n');
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  const obj = /learningObjectives:\n((?:\s+-.*\n?)+)/.exec(fm[1]);
  let body = raw.slice(fm[0].length);
  body = body.replace(/```[a-z]*\n[\s\S]*?```/g, (b) => (/base_events|rolling_mean|weekly_user_metrics/.test(b) ? '[BLOCCO GENERICO SQL/PY RIMOSSO]' : b));
  body = body.split('\n').filter((l) => !/^\| (Decisione|Segnale|Baseline|Vincolo|Azione|Unit[àa] di analisi|Variabile osservata|Soglia decisionale|Rischio residuo) \|/.test(l)).join('\n');
  console.log(`######## ${s}\n${obj ? obj[1] : ''}${body}`);
}
