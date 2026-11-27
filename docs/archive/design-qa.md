# Design QA - GinnyTech Mobile Heroes

source visual truth path: `.codex/design-qa/source-home-mobile-after-390x844.png`

implementation screenshot path: `.codex/design-qa/landing-mobile-final-390x844.png`

viewport: `390x844` mobile; desktop spot checks were also captured during QA.

state: public, unauthenticated, local dev server at `http://127.0.0.1:4325`.

full-view comparison evidence: `.codex/design-qa/comparison-mobile-final.png`

focused region comparison evidence: first viewport hero text and primary CTA. Focused region was required because the issue was visible only at the mobile hero width.

## Findings

- [P1] Mobile hero text clipped on the landing page.
  Location: `src/pages/agenti-analisi-dati.astro`.
  Evidence: before the patch, the H1, hero description, and CTA pushed into the right edge at `390px` width.
  Impact: primary sales message was not fully readable on mobile.
  Fix: tightened mobile H1 scale, added local `box-sizing`, constrained line length, enabled safe wrapping, and reduced CTA mobile padding.

- [P1] Mobile hero text clipped on the homepage.
  Location: `src/pages/index.astro`.
  Evidence: the homepage headline and lede were cut off at the right edge in the mobile screenshot.
  Impact: the main site entry point looked broken on mobile.
  Fix: added mobile-first max widths, safer wrapping, and a constrained CTA width while preserving desktop scale.

## Required Fidelity Surfaces

- Fonts and typography: mobile title sizes now fit the viewport without truncation; hierarchy remains strong.
- Spacing and layout rhythm: hero content keeps consistent side margins and no longer touches the viewport edge.
- Colors and tokens: brand dark background, white typography, and lime CTA remain consistent with GinnyTech.
- Image quality and asset fidelity: existing real hero images are preserved; no placeholder or CSS art was introduced.
- Copy and content: copy is unchanged; only wrapping and responsive presentation were adjusted.

## Patches Made

- Added responsive wrapping and box-model safeguards to `/agenti-analisi-dati/`.
- Reduced landing mobile H1 scale and constrained the hero lede and CTA.
- Constrained homepage mobile headline, lede, and CTA width.
- Rechecked mobile screenshots after the fixes.

## Final Result

final result: passed
