# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Dev server on localhost:3000
npm run build            # Production build (dist/) + Pagefind indexing
npm run preview          # Serve production build locally
npm run validate:content # Validate frontmatter, slugs, and lesson quality
npm run test             # Run Vitest tests
npm run check            # validate:content + astro check + vitest (pre-commit)
```

`STRICT_EDITORIAL=1 npm run validate:content` — treats editorial warnings (missing summary, no examples) as errors.

## Architecture

**Astro 5 + Starlight** static site deployed to Cloudflare Pages (`wrangler.toml`).

### Content Collections (Astro 5 Content Layer)

Active config: `src/content.config.ts`. The legacy `src/content/config.ts` is empty and ignored.

| Collection | Loader base | Schema |
|-----------|-------------|--------|
| `docs` | `src/content/_starlight/` | Starlight `docsSchema()` |
| `blog` | `src/content/blog/` | `blogSchema` |
| `corso` | `src/content/corso/` | `corsoSchema` |
| `products` | `src/data/products.json` | `productsSchema` |

Schemas: `src/lib/schemas.ts` — `corsoSchema` requires `title`, `description`, optional `order` (integer, required for all lessons that are not module root).

### Course Structure

`src/content/corso/` has 15 module subdirectories. Module IDs in `src/data/course-modules.ts` must exactly match subdirectory names.

Lesson validation rules (`scripts/validation.ts`):
- Minimum **3000 characters** body
- Minimum **3 H2 headings**
- Minimum **120 character intro** before first H2
- Must have a summary section (H2 `Riepilogo`/`Conclusioni`/`Sintesi`)
- Must have an example signal (code block, table, `Esempio`, `Caso pratico`, or `Template`)

### Key Paths

- `src/data/course-modules.ts` — module definitions (IDs + metadata)
- `src/lib/config/sidebar-sections.mjs` — sidebar config
- `src/lib/config/redirects.mjs` — URL redirects
- `src/lib/config/head-tags.mjs` — SEO/meta tags
- `src/styles/custom.css` — global styles and Starlight overrides
- `src/data/sidebar-generated.json` — auto-generated sidebar (do not edit manually)

### Starlight Integration

- Custom `Sidebar` component (`src/components/starlight/Sidebar.astro`)
- Search replaced with empty component (custom search via Pagefind)
- Plugins: `starlightHeadingBadges`, `starlightImageZoom`
- `expressiveCode` themes: `github-dark` / `github-light`

### Tailwind CSS 4

Configured as a Vite plugin (`@tailwindcss/vite`) in `astro.config.mjs`. No separate `tailwind.config.*` file.

### Markdown Extensions

- **KaTeX** for math (`$...$`, `$$...$$`) via `remark-math` + `rehype-katex`
- **Mermaid** diagrams via `astro-mermaid` (dark theme)
- **Starlight components** available in MDX: `<Aside>`, `<Steps>`, `<Tabs>`, `<TabItem>`, `<Card>`, `<CardGrid>`
- **Lucide React** icons available in MDX

## Known MDX Gotchas

- **`<Steps>` requires numbered list items** (`1. text`), not bold paragraphs — bold breaks the HTML structure
- **Code blocks inside `<Steps>` break rendering** — place code blocks between Step items instead
- **`starlightHeadingBadges` adds `__SHB__` to heading text** — strip with `.replace(/__SHB__.*$/, '').trim()` when reading `render().headings`
- **YAML frontmatter**: titles containing `:` must be quoted (`title: "Foo: Bar"`)
- **H1 duplication**: MDX files have their own H1; page templates must hide it with `.course-prose > h1:first-child { display: none }`

## Custom Skills

Project-specific Claude Code slash commands in `.claude/commands/`:

| Command | Purpose |
|---------|---------|
| `/scrivi-lezione` | Write a new lesson following quality standards |
| `/check-lezione` | Validate a single lesson (anti-patterns, structure, word count) |
| `/audit-corso` | Bulk audit all lessons, update `.claude/lesson-status.md` |
| `/fix-mdx` | Fix common MDX issues (YAML quoting, broken `<Steps>`, unclosed tags) |
| `/deploy-check` | Pre-deploy checklist (build, SEO, stub detection) |
| `/naturalizza-lezione` | Rewrite a lesson in narrative prose, removing scholastic boxes |
| `/ginnytech` | Multi-agent crew that critiques, rewrites, and validates a lesson |

Lesson quality tracking: `.claude/lesson-status.md` (✅ OK / ⚠️ incomplete / ❌ stub).

## Multi-agent crew (`.claude/agents/`)

The `/ginnytech` orchestrator coordinates 6 specialized subagents in parallel:

| Subagent | Role |
|----------|------|
| `lesson-critic-pedagogy` | Didactic quality (university-level lecture lens) |
| `lesson-critic-voice` | Naturalness, prose rhythm, anti-AI-smell |
| `lesson-critic-substance` | Factual accuracy, examples, technical depth, sources |
| `lesson-rewriter` | Synthesizes critiques, rewrites the MDX, creates `.bak` |
| `lesson-validator-structure` | Mechanical checks (`npm run validate:content`, MDX, word count) |
| `lesson-validator-quality` | Confirms rewrite addresses must-fix without regressions |

Shared report schema: `.claude/agents/_report-schema.md`. All subagents output JSON conforming to it.

### Keyword trigger

When the user starts a message with the literal word **`ginnytech`** (case-insensitive), interpret it as an invocation of `/ginnytech` and pass the remainder of the message as `$ARGUMENTS`. Examples:

- `ginnytech metriche-fondamenti/north-star` → run `/ginnytech metriche-fondamenti/north-star`
- `ginnytech` (alone) → run `/ginnytech` and let it ask which lesson
- `ginnytech causal inference per marketing` → run `/ginnytech causal inference per marketing` (mode *new*)

Confirm the interpretation in 1 line before launching the pipeline so the user can correct it.
