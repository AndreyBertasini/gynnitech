# Agentic SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fare in modo che gli agenti AI (ChatGPT, Perplexity, Claude, Gemini, agenti che navigano) riconoscano *Andrii Dyshkantiuk* come un'unica entità esperta dei temi di GinnyTech e possano leggere e citare ogni pagina in un formato pulito.

**Architecture:** Un solo modulo (`src/lib/entity.ts`) diventa la fonte di verità per le entità Person e Organization. Tutte le pagine referenziano la Person tramite lo stesso `@id`, invece di dichiarare Person anonime. Un audit post-build blocca le regressioni. In parallelo, ogni lezione, articolo e la pagina `/about` espongono una versione Markdown (`.md`) annunciata con `<link rel="alternate" type="text/markdown">` e in `llms.txt`.

**Tech Stack:** Astro 7 (endpoint statici `.md.ts`), TypeScript, Vitest, Cloudflare Pages `_headers`.

**Spec:** nessuna spec separata. Il brainstorming si è fermato alla prima domanda e l'utente ha chiesto direttamente il piano. Le decisioni prese al posto della spec sono nella sezione *Decisioni di design* qui sotto: chi esegue deve leggerle come se fossero la spec.

## Decisioni di design (assunzioni, da confermare)

1. **Priorità:** A (autorità del nome) > B (citazione dei contenuti) > C (agenti che agiscono). C resta fuori scope, salvo rimuovere i segnali falsi: la `SearchAction` verso `/?q=`, che nessuna pagina gestisce.
2. **Una sola entità Person:** `@id` canonico `https://ginnytech.it/about#andrii-dyshkantiuk`. Oggi la home usa `/#andrii-dyshkantiuk` e `/about` usa `/about#…`: si unifica sul secondo, perché `/about` è la pagina che descrive la persona.
3. **Organization:** `@id` `https://ginnytech.it/#ginnytech`, con `founder` che punta alla Person. Nella home resta il tipo `EducationalOrganization`, mentre il Layout usa lo stesso `@id`. È lo stesso nodo descritto in due punti, e lo schema lo consente.
4. **I temi del nome vengono dal corso:** `knowsAbout` e la sezione visibile "Temi" di `/about` derivano da un'unica lista `PERSON_TOPICS`, in cui ogni tema linka una pagina reale del corso. Il legame nome↔tema è così visibile agli agenti sia nei dati strutturati sia nel testo e nei link.
5. **Markdown per agenti:** si conservano i blocchi di codice, perché sono la parte più utile per chi cita. Si tolgono import ed export MDX e i tag dei componenti Starlight, mantenendo il loro contenuto. Si copre solo l'italiano: le pagine `/en/` sono traduzioni post-build e restano fuori.
6. **`llms-full.txt` resta com'è** (2,7 MB): i `.md` per pagina offrono la granularità che manca, senza rompere chi già lo consuma.
7. **Profili `sameAs`:** sono oggi solo LinkedIn e GitHub. Il piano li sposta in un array di `entity.ts`, così aggiungere un profilo (talk, Wikidata, YouTube…) è una riga. Questo piano non inventa nessun profilo.

## Global Constraints

- Person `@id`: `https://ginnytech.it/about#andrii-dyshkantiuk`. Organization `@id`: `https://ginnytech.it/#ginnytech`.
- Person `name`: `Andrii Dyshkantiuk`. `jobTitle`: `MarTech Expert, Data Engineer e Formatore`.
- Person `description`: `Andrii Dyshkantiuk è un esperto di MarTech in Italia con oltre 15 anni di esperienza tra marketing analytics, data engineering e formazione pratica. È il fondatore di GinnyTech.`
- Il valore `@id` si importa sempre da `src/lib/entity.ts` e non va mai scritto a mano in una pagina.
- Commit in italiano nello stile del repo (`feat(seo): …`), terminati da `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Ogni `npm run build` rigenera `public/llms-full.txt`: va ripristinato (`git checkout public/llms-full.txt`) prima di ogni commit, salvo nel Task 6.
- Lo styling visibile si verifica con `npm run build && npm run preview`, mai solo con `dev`, perché `custom.css` vince sugli stili scoped solo in produzione.
- Ogni nuova stringa italiana visibile va aggiunta a mano in `src/data/i18n/en-static-cache.json`, altrimenti `/en/` la mostra non tradotta.

## Review Focus

1. **Pagine `/en/`:** sono copie tradotte dell'HTML italiano, quindi l'audit le vede. Il JSON-LD della Person deve restare identico (stesso `@id`) e non va tradotto. Il test va nel Task 2 (`auditEntityGraph` su un HTML con `inLanguage: en-US`).
2. **MDX con componenti annidati e codice dentro `<Steps>`/`<Tabs>`:** il Markdown per agenti non deve perdere il codice né lasciare tag orfani. Il test va nel Task 4.
3. **Titoli con `:` o virgolette nel frontmatter:** l'intestazione YAML del `.md` deve restare valida. Il test va nel Task 4 (title con `"` e `:`).
4. **Lezioni root di modulo (id senza `/`):** non devono generare un `.md` orfano né rompere `getStaticPaths`. Il test va nel Task 5 (verifica dei file in `dist`).
5. **Drift tra `llms.txt` e `COURSE_MODULES`:** oggi `llms.txt` elenca i moduli a mano. Un modulo aggiunto o rinominato deve far fallire i test. Il test va nel Task 6.

---

### Task 1: Modulo entità

**Files:**
- Create: `src/lib/entity.ts`
- Test: `src/lib/entity.test.ts`

**Interfaces:**
- Consumes: `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `LINKEDIN_URL`, `GITHUB_PROFILE_URL` da `src/consts.ts`
- Produces:
  - `PERSON_ID: string`, `ORGANIZATION_ID: string`, `PERSON_URL: string` (`${SITE_URL}/about`)
  - `PERSON_SAME_AS: readonly string[]`
  - `PERSON_TOPICS: readonly { name: string; href: string }[]`, dove `href` è un path interno (`/course/<modulo>/`)
  - `personNode(): Record<string, unknown>`: nodo completo (`@type`, `@id`, `name`, `url`, `jobTitle`, `description`, `image`, `sameAs`, `knowsAbout`, `worksFor: {'@id': ORGANIZATION_ID}`)
  - `personRef(): { '@type': 'Person'; '@id': string; name: string; url: string }`: da usare come `author`/`instructor`
  - `organizationNode(type?: 'Organization' | 'EducationalOrganization'): Record<string, unknown>`: con `@id`, `name`, `url`, `logo`, `description`, `sameAs: PERSON_SAME_AS`, `founder: personRef()`

- [ ] **Step 1: Write the failing tests** in `src/lib/entity.test.ts`:
  - `PERSON_ID === 'https://ginnytech.it/about#andrii-dyshkantiuk'` e `ORGANIZATION_ID === 'https://ginnytech.it/#ginnytech'`
  - `personRef()` ha esattamente le chiavi `@type, @id, name, url`, con `url === 'https://ginnytech.it/about'`
  - `personNode().knowsAbout` è uguale a `PERSON_TOPICS.map(t => t.name)`
  - ogni `PERSON_TOPICS[i].href` corrisponde a `/^\/course\/[a-z0-9-]+\/$/` e il segmento del modulo è un `id` presente in `COURSE_MODULES`
  - `organizationNode().founder['@id'] === PERSON_ID` e `organizationNode('EducationalOrganization')['@type'] === 'EducationalOrganization'`
  - `PERSON_SAME_AS` contiene `LINKEDIN_URL` e `GITHUB_PROFILE_URL`

- [ ] **Step 2: Run** `npx vitest run src/lib/entity.test.ts`. Expected: FAIL (modulo inesistente).

- [ ] **Step 3: Implement `src/lib/entity.ts`.** Usare i valori dei Global Constraints. `image` = `${SITE_URL}/andrii.webp`. Copiare `src/assets/andrii.webp` in `public/andrii.webp`, perché l'asset Astro ha un nome con hash che cambia, mentre un'entità ha bisogno di un URL stabile. `PERSON_TOPICS` usa questi temi, con il modulo indicato:

  | name | href |
  |---|---|
  | MarTech | `/course/data-collection/` |
  | Marketing Analytics | `/course/analisi-marketing/` |
  | Attribution Modeling | `/course/analisi-marketing/` |
  | Product Analytics | `/course/analisi-prodotto/` |
  | A/B Testing | `/course/significativita-statistica/` |
  | Data Engineering | `/course/data-warehousing/` |
  | Analytics Engineering (dbt) | `/course/analytics-engineering/` |
  | Apache Kafka | `/course/kafka-streaming/` |
  | ClickHouse | `/course/real-time-analytics/` |
  | SQL | `/course/advanced-sql/` |
  | Marketing Data Science | `/course/marketing-data-science/` |
  | Agentic AI per l'analisi dati | `/course/agentic-ai-data-workflows/` |

  Se un id non esiste in `COURSE_MODULES` il test dello Step 1 fallisce: in quel caso correggere l'href verso il modulo esistente più vicino, senza rilassare il test.

- [ ] **Step 4: Run** `npx vitest run src/lib/entity.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit** `feat(seo): modulo entità unico per Person e Organization`

---

### Task 2: Audit post-build del grafo delle entità

**Files:**
- Create: `scripts/lib/entity-audit.ts`
- Test: `tests/entity-audit.test.ts`
- Modify: `scripts/site-quality-audit.ts` (chiamata accanto ad `auditSeo`, dentro il loop per file)

**Interfaces:**
- Consumes: `PERSON_ID`, `ORGANIZATION_ID` da `src/lib/entity.ts`
- Produces: `auditEntityGraph(html: string): string[]`, che restituisce i messaggi di errore (vuoto = ok)

Regole che la funzione applica, su tutti i blocchi `<script type="application/ld+json">` (sia `@graph` sia nodo singolo, ricorsivamente sui valori annidati):
1. ogni oggetto con `@type: "Person"` deve avere `@id === PERSON_ID`;
2. ogni oggetto con `@type` `Organization` o `EducationalOrganization` e `name === "GinnyTech"` deve avere `@id === ORGANIZATION_ID`;
3. nessun nodo `WebSite` deve contenere `potentialAction` di tipo `SearchAction`;
4. se la pagina contiene un nodo `Article`, `BlogPosting` o `LearningResource`, l'HTML deve contenere un `<a` con `rel="author"` e `href` che finisce in `/about` o `/about/`;
5. blocco JSON non parsabile → errore `invalid JSON-LD`.

- [ ] **Step 1: Write the failing tests** in `tests/entity-audit.test.ts`, con HTML minimi in linea:
  - `Article` con author `{ "@type":"Person","@id":PERSON_ID,… }` e `<a rel="author" href="/about/">` → `[]`
  - author Person senza `@id` → un messaggio che contiene `Person`
  - Person con `@id` `https://ginnytech.it/#andrii-dyshkantiuk` → errore (regressione sull'`@id` della home)
  - `Organization` GinnyTech senza `@id` → errore
  - `WebSite` con `SearchAction` → errore
  - `LearningResource` senza link `rel="author"` → errore
  - pagina `/en/` (`inLanguage: "en-US"`) con Person corretta → `[]`
  - pagina senza JSON-LD → `[]` (è `auditSeo` a segnalarla, non questo audit)
  - `<script type="application/ld+json">{bad</script>` → `['invalid JSON-LD']`

- [ ] **Step 2: Run** `npx vitest run tests/entity-audit.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `auditEntityGraph`** in `scripts/lib/entity-audit.ts`, poi in `site-quality-audit.ts` aggiungere ogni messaggio come `issues.push({ file, message: \`entity: ${m}\` })`, saltando le pagine redirect come fa già `auditSeo`.

- [ ] **Step 4: Run** `npx vitest run tests/entity-audit.test.ts`. Expected: PASS.

- [ ] **Step 5: Run** `npm run build`. Expected: l'audit **fallisce** con errori `entity:` su home, about, blog, lezioni. È la prova che l'audit vede il problema di oggi. Il Task 3 lo risolve. Ripristinare `public/llms-full.txt`.

- [ ] **Step 6: Commit** `feat(seo): audit post-build del grafo entità JSON-LD`. Il build resta rosso fino al Task 3: se si lavora su un branch condiviso, fare lo squash con il Task 3.

---

### Task 3: Collegare tutte le pagine all'entità unica

**Files:**
- Modify: `src/layouts/Layout.astro` (nodo Organization, `meta author`, rimozione della `SearchAction`)
- Modify: `src/pages/index.astro` (Person → `personNode()`, EducationalOrganization → `organizationNode('EducationalOrganization')`, rimozione della `SearchAction`)
- Modify: `src/pages/about.astro` (`personJsonLd` → `personNode()`)
- Modify: `src/pages/blog/[...slug].astro`, `src/pages/en/blog/[...slug].astro`, `src/pages/blog/index.astro` (author → `personRef()`, publisher → `{ '@id': ORGANIZATION_ID, '@type': 'Organization', name, url, logo }`)
- Modify: `src/pages/course/[module]/[slug].astro` (instructor → `personRef()`, provider → stesso schema del publisher)
- Modify: le bylines visibili. Blog IT/EN: il link autore punta a `/about/` con `rel="author"` invece che a LinkedIn. Lezione: `course-author-name` diventa `<a href="/about/" rel="author">`.

**Interfaces:**
- Consumes: tutto ciò che il Task 1 produce; `auditEntityGraph` del Task 2 come test di accettazione.

- [ ] **Step 1: Run** `npx vitest run tests/entity-audit.test.ts src/lib/entity.test.ts`. Expected: PASS (punto di partenza).

- [ ] **Step 2: Apply the changes listed above.** `<meta name="author">` usa `SITE_AUTHOR`. Il blocco `WebSite` nel Layout perde `potentialAction`. Nei file pagina non deve restare nessuna stringa `#andrii-dyshkantiuk` scritta a mano: verificarlo con `grep -rn "andrii-dyshkantiuk\"" src/pages src/layouts`, che deve dare 0 risultati.

- [ ] **Step 3: Run** `npm run build`. Expected: build verde, nessun messaggio `entity:` nell'output di `audit:site`.

- [ ] **Step 4: Visual check** con `npm run preview` su `/blog/<un-articolo>/` e `/course/<modulo>/<lezione>/`: la byline è cliccabile, porta a `/about/` e lo stile è invariato. Screenshot come prova.

- [ ] **Step 5: Run** `npm run check`. Expected: PASS.

- [ ] **Step 6: Commit** `feat(seo): una sola entità Person referenziata da tutte le pagine` (dopo aver ripristinato `public/llms-full.txt`).

---

### Task 4: Conversione MDX → Markdown per agenti

**Files:**
- Create: `src/lib/agent-markdown.ts`
- Test: `src/lib/agent-markdown.test.ts`

**Interfaces:**
- Produces:
  - `mdxToAgentMarkdown(body: string): string`
  - `type AgentDocMeta = { title: string; description?: string; url: string; dateModified?: Date; datePublished?: Date }`
  - `renderAgentDocument(meta: AgentDocMeta, body: string): string`: restituisce il frontmatter YAML seguito da `# {title}` e dal body convertito

Regole di `mdxToAgentMarkdown`:
- rimuove le righe `import … from …` e `export …` di primo livello, fuori dai blocchi di codice;
- rimuove i tag di apertura e chiusura di `Aside`, `Steps`, `Tabs`, `TabItem`, `Card`, `CardGrid` e delle icone Lucide (tag JSX self-closing con iniziale maiuscola), conservando il contenuto interno. Un `<TabItem label="X">` diventa la riga `**X**`, un `<Aside type="tip" title="Y">` diventa `> **Y**` seguito dal contenuto citato con `> `;
- non tocca mai il contenuto dentro i blocchi ```;
- rimuove il primo `# H1` del body, se presente, perché il titolo lo mette `renderAgentDocument`;
- comprime 3 o più righe vuote in 2.

Frontmatter di `renderAgentDocument` (chiavi in quest'ordine, stringhe sempre tra doppi apici con `"` e `\` escapati): `title`, `description` (se c'è), `url`, `author: "Andrii Dyshkantiuk"`, `author_url: "https://ginnytech.it/about"`, `publisher: "GinnyTech"`, `date_published`/`date_modified` (ISO `YYYY-MM-DD`, se ci sono), `license: "CC BY 4.0"`, `language: "it-IT"`.

- [ ] **Step 1: Write the failing tests:**
  - un input con `import { Aside } from '@astrojs/starlight/components';` + `<Aside type="tip" title="Nota">Testo</Aside>` → output senza `import` e con `> **Nota**` e `> Testo`
  - un blocco ```` ```sql\nSELECT '<Aside>' AS x;\n``` ```` resta identico byte per byte
  - `<Steps>\n1. uno\n2. due\n</Steps>` → `1. uno\n2. due`, senza tag residui
  - `<Tabs><TabItem label="Python">…</TabItem></Tabs>` → contiene `**Python**`, nessun `<Tab`
  - `renderAgentDocument({ title: 'A/B test: "perché" fallisce', url: 'https://ginnytech.it/blog/x/' }, '')` → YAML parsabile con `gray-matter`, `data.title === 'A/B test: "perché" fallisce'`
  - l'output non contiene mai la regex `/<\/?(Aside|Steps|Tabs|TabItem|Card|CardGrid)\b/`
  - un body che inizia con `# Titolo` → l'H1 compare una sola volta nel documento finale

- [ ] **Step 2: Run** `npx vitest run src/lib/agent-markdown.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement** in `src/lib/agent-markdown.ts`. Elaborare per righe, con un flag per lo stato "dentro un blocco di codice". Niente parser MDX.

- [ ] **Step 4: Run** `npx vitest run src/lib/agent-markdown.test.ts`. Expected: PASS.

- [ ] **Step 5: Smoke test** su 5 file reali (`src/content/corso/**` con `<Steps>`/`<Tabs>`, trovati con `grep -l`): uno script usa-e-getta nello scratchpad stampa l'output, e si controlla a occhio che non restino tag JSX. Lo script non va committato.

- [ ] **Step 6: Commit** `feat(seo): conversione MDX in Markdown pulito per agenti AI`

---

### Task 5: Endpoint `.md` e link alternate

**Files:**
- Create: `src/pages/blog/[slug].md.ts`, che genera `/blog/<slug>.md` per ogni entry di `getCollection('blog')`
- Create: `src/pages/course/[module]/[slug].md.ts`, che genera `/course/<modulo>/<slug>.md` solo per le entry con `/` nell'id, con la stessa `cleanSlug`/`cleanId` di `[slug].astro`
- Create: `src/pages/about.md.ts`, con il testo di `/about` scritto in Markdown: nome, ruolo, descrizione, una lista "Temi" da `PERSON_TOPICS` con URL assoluti, i profili `PERSON_SAME_AS`
- Modify: `src/layouts/Layout.astro`, con una nuova prop `markdownAlternate?: string` (path) che emette `<link rel="alternate" type="text/markdown" href={assoluto}>`
- Modify: `src/pages/blog/[...slug].astro`, `src/pages/course/[module]/[slug].astro`, `src/pages/about.astro`, che passano `markdownAlternate`
- Modify: `public/_headers`, con la regola `/*.md` → `Content-Type: text/markdown; charset=utf-8`. Niente `noindex`, perché bloccherebbe proprio i crawler AI che vogliamo. Niente header `Link` canonical, perché il placeholder di Cloudflare non è verificabile in locale: la pagina HTML di riferimento è dichiarata nel campo `url` del frontmatter.

**Interfaces:**
- Consumes: `renderAgentDocument`, `mdxToAgentMarkdown` (Task 4); `PERSON_TOPICS`, `PERSON_SAME_AS`, `personNode()` (Task 1)
- Produces: gli URL `<path-pagina-senza-slash-finale>.md`, convenzione che il Task 6 documenta in `llms.txt`

Ogni endpoint esporta `getStaticPaths` e `GET` e restituisce `new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })`. Il corpo è `entry.body`.

- [ ] **Step 1: Implement the three endpoints and the Layout prop.**

- [ ] **Step 2: Run** `npm run build`. Expected: build verde.

- [ ] **Step 3: Verify output.** Il conteggio dei `.md` in `dist/blog` deve essere uguale al numero di file in `src/content/blog/*.mdx`, e quello in `dist/course/*/` al numero di lezioni non-root. `dist/about.md` esiste. Nessun `dist/course/<modulo>.md` orfano. `grep -L "author_url" dist/blog/*.md` → vuoto. `grep -c 'type="text/markdown"' dist/about/index.html` → `1`. Comandi:
  ```bash
  ls dist/blog/*.md | wc -l; ls src/content/blog/*.mdx | wc -l
  ```

- [ ] **Step 4: Run** `npm run preview` e aprire `/blog/<slug>.md` e `/course/<modulo>/<slug>.md` nel browser pane: il testo è leggibile e il frontmatter è in testa.

- [ ] **Step 5: Run** `npm run check`. Expected: PASS.

- [ ] **Step 6: Commit** `feat(seo): versione Markdown di articoli, lezioni e about per agenti` (ripristinare `public/llms-full.txt` prima).

---

### Task 6: `llms.txt` allineato e protetto dal drift

**Files:**
- Modify: `public/llms.txt`
- Modify: `scripts/generate-llms-full.ts`, con una riga `Author: Andrii Dyshkantiuk (https://ginnytech.it/about)` nell'intestazione e il campo `Markdown: <url>.md` sotto ogni `URL:`
- Test: `tests/llms-txt.test.ts`

**Interfaces:**
- Consumes: `COURSE_MODULES`; `PERSON_TOPICS` (Task 1); la convenzione `.md` (Task 5)

Modifiche a `llms.txt`:
- nuova sezione `## Author` subito dopo `## About`: nome, ruolo e descrizione dai Global Constraints, `https://ginnytech.it/about` e `https://ginnytech.it/about.md`, la riga `Topics:` con i `PERSON_TOPICS.name` separati da virgola, i profili `sameAs`;
- in `## Preferred crawling/discovery` aggiungere: `- Markdown version of any article or lesson: append ".md" to the URL without trailing slash (e.g. https://ginnytech.it/blog/ab-test-errori.md)`;
- `## Course modules` deve elencare esattamente gli id di `COURSE_MODULES`, nello stesso ordine.

- [ ] **Step 1: Write the failing tests** in `tests/llms-txt.test.ts`, leggendo `public/llms.txt`:
  - ogni `COURSE_MODULES[i].id` compare come riga `- <id> — ` nella sezione `## Course modules`
  - ogni id elencato in quella sezione esiste in `COURSE_MODULES` (nessun modulo fantasma)
  - contiene `https://ginnytech.it/about.md` e la riga `Topics:` con tutti i `PERSON_TOPICS.name`
  - contiene la frase `append ".md"`
  - l'esempio `.md` citato corrisponde a un file reale in `src/content/blog/`

- [ ] **Step 2: Run** `npx vitest run tests/llms-txt.test.ts`. Expected: FAIL.

- [ ] **Step 3: Edit `public/llms.txt` and `scripts/generate-llms-full.ts`** come descritto.

- [ ] **Step 4: Run** `npx vitest run tests/llms-txt.test.ts`. Expected: PASS.

- [ ] **Step 5: Run** `npm run llms:full` e controllare con `grep -c "^Markdown: " public/llms-full.txt` che il numero corrisponda a blog + lezioni. In questo task `public/llms-full.txt` **va committato**, perché il cambiamento del suo contenuto è voluto.

- [ ] **Step 6: Commit** `feat(seo): llms.txt con sezione autore, convenzione .md e test anti-drift`

---

### Task 7: `/about` come hub visibile nome↔temi

**Files:**
- Modify: `src/pages/about.astro`, con una nuova sezione `<section aria-labelledby="temi">` con H2 `Temi su cui lavoro e insegno` e una lista di link generata da `PERSON_TOPICS` (testo = `name`, href = `href`)
- Modify: `src/data/i18n/en-static-cache.json`, con le traduzioni dell'H2 e di ogni `PERSON_TOPICS.name` che non sia già inglese
- Test: nessun test unitario, perché la sezione è solo markup. La verifica si fa sull'HTML buildato (Step 3) e a vista (Step 4).

**Interfaces:**
- Consumes: `PERSON_TOPICS` (Task 1)

- [ ] **Step 1: Implement the section,** riusando le classi Tailwind delle card già presenti nella pagina (la griglia `rounded-2xl border border-white/10 bg-white/[0.03]`). Nessun nuovo CSS globale.

- [ ] **Step 2: Run** `npm run build`. Expected: verde.

- [ ] **Step 3: Verify.** In `dist/about/index.html` ci sono tanti `href="/course/` dentro la sezione quante sono le voci di `PERSON_TOPICS`. In `dist/en/about/index.html` l'H2 è in inglese.

- [ ] **Step 4: Visual check** con `npm run preview` su `/about/` e `/en/about/`, a 375px e da desktop, in tema chiaro e scuro. Screenshot come prova.

- [ ] **Step 5: Run** `npm run check`. Expected: PASS.

- [ ] **Step 6: Commit** `feat(about): sezione temi che collega l'autore ai moduli del corso` (ripristinare `public/llms-full.txt` prima).

---

## Fuori scope (decisioni esplicite)

- **Nuovi profili esterni** (Wikidata, talk, podcast): servono dati che solo l'autore ha. Il Task 1 rende l'aggiunta una riga in `PERSON_SAME_AS`.
- **Endpoint di ricerca per agenti / `SearchAction` reale:** priorità C. Oggi la `SearchAction` si rimuove perché è falsa; reintrodurla richiede una pagina che gestisca `?q=`.
- **Markdown per le pagine `/en/`:** sono generate per traduzione post-build e richiederebbero un'altra pipeline.
- **Misura dell'effetto** (citazioni effettive negli LLM): è un processo editoriale, non codice. Si può pianificare a parte con la skill `aeo`.
