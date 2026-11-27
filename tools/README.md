# tools/

Utility una tantum usate durante la produzione dei contenuti. **Non fanno parte della build** del sito
(che usa solo gli script TypeScript in `scripts/`).

Gli script in `tools/python/` sono stati spostati da `scripts/` e dalla radice del repo: alcuni
risolvono i percorsi relativi alla propria posizione, quindi vanno verificati prima di rilanciarli.
`seo-compare.py` confronta due export `seo-audit` (vedi `docs/seo/i18n.md`).
