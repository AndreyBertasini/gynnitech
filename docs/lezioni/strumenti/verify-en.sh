#!/bin/bash
# Copia la cache nella copia, rifà la build completa e conta le stringhe EN introdotte e scoperte
S="C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Desktop-gynnitech--claude-worktrees-analizza-corsi-structure-f4afab/dffd62f2-8299-4532-b0d6-e1c60089ea9a/scratchpad"
W="C:/Users/User/Desktop/gynnitech/.claude/worktrees/analizza-corsi-structure-f4afab"
cp "$W/src/data/i18n/en-static-cache.json" "$S/mirror-new/src/data/i18n/en-static-cache.json"
cd "$S/mirror-new" || exit 1
rm -rf dist
npm run build > ../ve-build.log 2>&1
echo "build exit $?"
grep -E "audit passed|audit failed" ../ve-build.log
find dist -type f \( -name "*.html" -o -name "*.md" \) -not -path "dist/en/*" -not -path "*/pagefind/*" | sed "s#^dist##" | sort > ../pages-ve.txt
diff -q ../pages-head.txt ../pages-ve.txt > /dev/null && echo "URL identici ($(wc -l < ../pages-ve.txt))" || echo "URL DIVERSI"
npx tsx scripts/dump-missing-en.ts 2>&1 | tail -1
node -e '
const fs=require("fs"),crypto=require("crypto");const S=process.argv[1];
const head=new Set(JSON.parse(fs.readFileSync(S+"/missing-head.json","utf8")).map(x=>x.text));
const now=JSON.parse(fs.readFileSync(S+"/missing.json","utf8")).map(x=>x.text);
const intro=now.filter(t=>!head.has(t));fs.writeFileSync(S+"/intro.json",JSON.stringify(intro));
console.log("stringhe EN introdotte e scoperte:",intro.length);intro.slice(0,5).forEach(t=>console.log(" -",t.slice(0,140)));' "$S"
