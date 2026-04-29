# GinnyTech V2 Publication Readiness

Date: 2026-03-22

## Scope

Preparazione alla pubblicazione del curriculum GinnyTech V2:

- 19 moduli
- 210 lezioni core
- 5 fasi
- capstone finale obbligatorio
- 3 track conclusivi
- completion pack per modulo
- dataset pack ed esercizi a 3 livelli esposti nelle pagine modulo

## Source Of Truth

- Programma V2: `src/data/course-program.ts`
- Helper editoriali V2: `src/lib/course-v2.ts`
- Applicatore massivo curriculum: `scripts/apply-v2-curriculum.ts`

## Public Surface Verified

- Landing corso: `src/pages/course.astro`
- Learning path: `src/pages/course/learning-path.astro`
- Pagine modulo: `src/pages/course/[module]/index.astro`
- Pagine lezione: `src/pages/course/[module]/[slug].astro`
- Catalogo contenuti: `src/content/corso`

## Release Checks Executed

1. `python .codex/skills/course-editorial-system/scripts/course_catalog.py audit --repo-root .`
2. `npm run validate:content`
3. `npm run check`
4. `npm run build`

## Results

- Audit clean
- Canonical modules: 19
- Core lessons: 210
- Supplemental resources: 9
- Content validation: passed
- Astro diagnostics: 0 errors, 0 warnings
- Test suite: 699 passed
- Build: passed

## Residual Non-Blocking Warnings

- Vite CSS minify warning su proprieta `file` non supportata
- Sentry build warnings per auth token mancante

Questi warning non bloccano la build statica e non impediscono la pubblicazione del corso.

## Publication Command

Per rieseguire il pacchetto completo di pre-pubblicazione:

```bash
npm run release:course-v2
```

## Editorial Notes

- Gli slug e gli URL storici sono stati mantenuti.
- Il modulo 19 conserva 9 risorse supplementari fuori dal conteggio delle 210 lezioni core.
- La panoramica e stata rimappata per rendere piu sensato il legame tra slug pubblici e titoli V2, senza rompere gli URL esistenti.
