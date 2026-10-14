# Modernizzazione Astro 7.x — report

## Punto di partenza (Astro 7.3.1, prima di qualunque modifica)

- Build completa (`npm run build`): riuscita, 530 pagine Astro, 824 file HTML, `audit:site` superato.
- Fotografia `00-baseline`: 802 pagine (le restanti sono redirect).
- `astro build` a cache fredda (due misure): 17,0 s e 17,3 s; picco di memoria 1600 MB in entrambe.
- Le build girano in una copia fuori dall'albero annidato del worktree: con `resolve.tsconfigPaths` (impostato da Astro) Vite 8 legge anche il `tsconfig.json` della radice del repo principale, che estende `astro/tsconfigs/strict` ma non ha `node_modules`, quindi il caricamento di `astro.config.mjs` fallisce nel worktree.
