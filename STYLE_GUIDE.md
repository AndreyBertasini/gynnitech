# GinnyTech Design System & Style Guide (v2.1)

## 1. Core Principles: "Neon-Glass"
Il design system di GinnyTech combina l'estetica **Glassmorphism** (trasparenze, blur) con accenti **Neon** ad alto contrasto su sfondo scuro profondo. L'obiettivo è comunicare tecnologia avanzata, precisione e modernità.

---

## 2. Color Palette

### Base Colors
| Nome | Valore Hex | Utilizzo |
| :--- | :--- | :--- |
| `brand-dark` | `#050505` | Sfondo principale (Deep Black) |
| `brand-darker` | `#000000` | Sfondi secondari / Sidebar |
| `white` | `#ffffff` | Testo primario, icone |
| `slate-400` | `#94a3b8` | Testo secondario, descrizioni |

### Neon Accents
| Nome | Valore Hex | Utilizzo |
| :--- | :--- | :--- |
| `acid-yellow` | `#ccff00` | **Primary Accent**. CTA, badge, highlight, text-shadow |
| `neon-blue` | `#00f3ff` | **Secondary Accent**. Link hover, glow, bordi focus |
| `neon-pink` | `#ff00ff` | Accento terziario, dettagli creativi |
| `neon-green` | `#39ff14` | Successo, elementi codice |

### Mint Scale (Legacy/Support)
Utilizzata per elementi UI più tenui o sfondi.
- `mint-500`: `#02569B`
- `mint-400`: `#26a69a`

---

## 3. Typography

### Font Families
1.  **Headings & UI**: `Montserrat` (Sans-serif)
    *   Weights: 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
    *   Usage: Titoli (`h1`-`h6`), Bottoni, Badge, Navigation.
2.  **Body Text**: `Inter` (Sans-serif)
    *   Weights: 400 (Regular), 600 (SemiBold)
    *   Usage: Paragrafi, liste, contenuto lungo.
3.  **Code**: `Geist Mono` / `Menlo` (Monospace)
    *   Usage: Blocchi di codice, snippet.

### Styles
*   **Headings**: `tracking-tight`, spesso accompagnati da `text-shadow` o gradienti.
*   **Body**: `leading-relaxed` per leggibilità ottimale.

---

## 4. UI Components & Effects

### Glassmorphism (Vetro)
Utilizzato per card, sidebar e pannelli.
*   **Background**: `bg-white/5` o `rgba(255, 255, 255, 0.03)`
*   **Border**: `border-white/10` o `rgba(255, 255, 255, 0.08)`
*   **Backdrop Filter**: `backdrop-blur-sm` o `blur(10px)`
*   **Shadow**: `box-shadow: 0 0 20px rgba(0, 243, 255, 0.05)`

### Buttons (CTA)
*   **Primary (Acid)**:
    *   Bg: `bg-acid-yellow`
    *   Text: `text-brand-dark`
    *   Shadow: `shadow-[0_0_20px_rgba(204,255,0,0.4)]`
    *   Hover: `hover:shadow-[0_0_30px_rgba(204,255,0,0.6)]`, `hover:scale-105`
*   **Secondary (Glass)**:
    *   Bg: `bg-white/5`
    *   Border: `border-white/10`
    *   Hover: `hover:border-neon-blue`, `hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]`

### Glow Effects
Utilizzati per dare profondità e "vita" agli elementi.
*   **Text Glow**: `text-shadow: 0 0 10px var(--color-acid-yellow)`
*   **Box Glow**: `box-shadow: 0 0 15px rgba(204, 255, 0, 0.2)`
*   **Background Blurs**: Cerchi sfocati (`blur-[150px]`) posizionati dietro i contenuti principali (`neon-blue/20`, `neon-pink/10`).

---

## 5. Animations
*   **Pulse**: `animate-pulse` per elementi di attenzione (badge, indicatori).
*   **Fade In Up**: Entrata dal basso con dissolvenza per sezioni e card.
*   **Hover Lift**: `hover:-translate-y-1` per interattività.

---

## 6. Code Guidelines (Tailwind CSS v4)
*   Utilizzare le variabili CSS definite in `@theme` nel file `src/styles/custom.css`.
*   Esempio: `text-acid-yellow` invece di `#ccff00`.
*   Mantenere la consistenza usando le classi di utilità per spaziature e layout.
*   Per componenti complessi, estrarre in componenti React/Astro riutilizzabili.
