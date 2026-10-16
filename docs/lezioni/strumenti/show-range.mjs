import fs from 'node:fs';
const [,, f, a, b] = process.argv;
const arr = JSON.parse(fs.readFileSync(f, 'utf8'));
for (let i = +a; i < Math.min(+b, arr.length); i++) console.log(i + '\t' + arr[i].split('\n').join('\n'));
