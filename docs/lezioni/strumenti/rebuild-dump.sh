#!/bin/bash
# Risincronizza la copia, fa la build Astro ed estrae le stringhe EN introdotte rispetto al branch base.
S="C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Desktop-gynnitech--claude-worktrees-analizza-corsi-structure-f4afab/dffd62f2-8299-4532-b0d6-e1c60089ea9a/scratchpad"
W="C:/Users/User/Desktop/gynnitech/.claude/worktrees/analizza-corsi-structure-f4afab"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(cygpath -w "$S/mirror.ps1")" -Source "$(cygpath -w "$W")" -Dest "$(cygpath -w "$S/mirror-new")" > /dev/null 2>&1
cd "$S/mirror-new" || exit 1
cp ../dump-missing-en.ts.keep scripts/dump-missing-en.ts
rm -rf dist
npx astro build > ../rb-build.log 2>&1
echo "build exit $?"
npx tsx scripts/dump-missing-en.ts 2>&1 | tail -1
node -e '
const fs=require("fs");const S=process.argv[1];
const head=new Set(JSON.parse(fs.readFileSync(S+"/missing-head.json","utf8")).map(x=>x.text));
const now=JSON.parse(fs.readFileSync(S+"/missing.json","utf8")).map(x=>x.text);
const intro=now.filter(t=>!head.has(t));
fs.writeFileSync(S+"/intro.json",JSON.stringify(intro));
console.log("stringhe introdotte e senza traduzione:",intro.length);' "$S"
