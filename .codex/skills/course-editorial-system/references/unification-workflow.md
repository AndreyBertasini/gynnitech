# Unification Workflow

## Goal

Turn the course into one coherent system instead of a collection of uneven lessons.

## Pass 1: Structural audit

Run:

```bash
python .codex/skills/course-editorial-system/scripts/course_catalog.py audit --repo-root .
```

Review:
- module/frontmatter mismatches
- missing metadata
- overview count drift
- long lessons
- theory lessons with fenced blocks

## Pass 2: Metadata normalization

Run:

```bash
python .codex/skills/course-editorial-system/scripts/course_catalog.py sync-modules --repo-root .
```

Then manually review:
- `learning-path.mdx`
- `mappe-concettuali.mdx`

## Pass 3: Editorial cleanup

Prioritize in this order:
1. overview pages
2. theoretical lessons with fenced blocks
3. longest conceptual lessons
4. hybrid lessons where technical examples overshadow the business explanation

## Pass 4: Governance

Keep automated checks in the repo for:
- module mapping by folder
- synchronized learning path counts
- theoretical lessons without fenced blocks where appropriate

## Decision Rule

When in doubt, ask:
- Is this lesson trying to teach a concept or an implementation?

If concept:
- lead with process, examples, decisions, pitfalls

If implementation:
- lead with the technical problem, then code, then explanation
