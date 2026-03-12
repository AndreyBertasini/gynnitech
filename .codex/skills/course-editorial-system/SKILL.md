---
name: course-editorial-system
description: Standardize, audit, and repair MDX course catalogs made of module folders, lesson files, learning paths, and overview pages. Use when Codex needs to clean theoretical lessons, keep code only where pedagogically useful, align `module` frontmatter with the canonical module taxonomy, sync course counts and overview pages, or run a full-course editorial pass on `src/content/corso`.
---

# Course Editorial System

## Overview

Use this skill when working on the GinnyTech course catalog. The source of truth is the folder structure under `src/content/corso`, while lesson quality depends on consistent frontmatter, coherent module naming, and the correct distinction between theoretical and technical teaching.

Read [references/course-standards.md](references/course-standards.md) before editing lessons. Read [references/unification-workflow.md](references/unification-workflow.md) when the task is to clean or realign the full catalog rather than a single file.

## Workflow

1. Run the audit first:

```bash
python .codex/skills/course-editorial-system/scripts/course_catalog.py audit --repo-root .
```

2. If `module` frontmatter drifted from the canonical taxonomy, sync it:

```bash
python .codex/skills/course-editorial-system/scripts/course_catalog.py sync-modules --repo-root .
```

3. Fix overview documents whenever the catalog structure changes:
- `src/content/corso/learning-path.mdx`
- `src/content/corso/panoramica/mappe-concettuali.mdx`

4. Apply editorial cleanup by lesson type:
- Theoretical lessons: replace fenced blocks, pseudo-code, ASCII trees, and template dumps with tables, process descriptions, examples, and decision criteria.
- Technical lessons: keep code only when it is the shortest path to understanding the technique.
- Case studies: preserve numbers, decision logic, and trade-offs.
- Cheat sheets: keep dense, but structured for scanning.

5. Re-run validation after edits:

```bash
npm run validate:content
npm test
npm run build
```

## Hard Rules

- Treat directory name as the canonical module identity; `module:` frontmatter must match the canonical label for that directory.
- Keep code in technical lessons, not in conceptual lessons unless the code itself is the teaching objective.
- Ensure every ordered lesson has `module`, `category`, `duration`, `difficulty`, `prerequisites`, and `learningObjectives`.
- Keep learning path and overview pages synchronized with the real catalog counts.
- Treat lessons over roughly 4,500 words as review candidates for splitting or tightening.
- End lessons with a summary or conclusions section.

## Resources

### scripts/

- `course_catalog.py`: audit the course catalog and synchronize `module` frontmatter with the canonical directory-to-module mapping.

### references/

- `course-standards.md`: canonical editorial standard for lesson types, structure, module taxonomy, and code usage.
- `unification-workflow.md`: full-course cleanup and unification checklist.
