# Mappa Progetto

## Configurazione Astro

I blocchi statici della configurazione sono stati estratti in `src/lib/config/`:

- `src/lib/config/redirects.mjs`: mappa redirect + validazione di duplicati e path interni.
- `src/lib/config/head-tags.mjs`: definizione dei tag `head` di Starlight + validazione minima di struttura.
- `src/lib/config/sidebar-sections.mjs`: sezioni statiche della sidebar + validazione link e duplicati.

`astro.config.mjs` ora mantiene solo wiring/composizione:

- import dei moduli config;
- caricamento sidebar dinamica (`src/data/sidebar-generated.json`);
- assemblaggio finale di `redirects`, `head` e `sidebar` nel `defineConfig`.
