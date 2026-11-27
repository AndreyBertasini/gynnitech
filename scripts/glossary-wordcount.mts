import { glossaryTerms, termWords } from '../src/lib/glossary';
const r = glossaryTerms.map((t) => [t.slug, termWords(t)] as const);
console.log(r.map(([s, n]) => `${s}:${n}`).join(' '));
console.log('min', Math.min(...r.map((x) => x[1])), 'avg', Math.round(r.reduce((a, x) => a + x[1], 0) / r.length));
