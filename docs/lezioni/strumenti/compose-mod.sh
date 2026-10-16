#!/bin/bash
# Uso: compose-mod.sh <modulo> <prefisso> <slug...>
S="C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Desktop-gynnitech--claude-worktrees-analizza-corsi-structure-f4afab/dffd62f2-8299-4532-b0d6-e1c60089ea9a/scratchpad"
cd "C:/Users/User/Desktop/gynnitech/.claude/worktrees/analizza-corsi-structure-f4afab" || exit 1
m=$1; p=$2; shift 2
for f in "$@"; do node scripts/lezioni-compose.mjs "src/content/corso/$m/$f.mdx" "$S/bodies/$p-$f.txt" || exit 1; done
npm run validate:3s 2>&1 | grep -E "errori|^errore|^ERRORE|: (sezioni|Schema|slide|Domanda|figura|Riepilogo|tag|Obiettivi|learningObjectives)" | grep -v "^avviso" | head -40
node scripts/lezioni-fm-diff.mjs claude/lezioni-3-secondi "$m" 2>&1 | grep -v "frontmatter ok"
