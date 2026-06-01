# AGENTS.md — ginnytech.it

## Build & Dev

```bash
npm run dev              # Dev server on localhost:3000
npm run build            # Production build (dist/) + Pagefind indexing
npm run preview          # Serve production build locally
npm run validate:content # Validate frontmatter, slugs, and lesson quality
npm run test             # Run Vitest tests
npm run check            # validate:content + astro check + vitest (pre-commit)
```

## Architecture

Astro 6 + Starlight static site. Content collections in `src/content/`. Course
content in `src/content/corso/` with 15 module subdirectories. Tailwind CSS 4
via Vite plugin. Cloudflare Pages deploy from `main` branch.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
