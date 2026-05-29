import { promises as fs } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';

const COURSE_ROOT = 'src/content/corso';
const SECTION_TITLE = '## Una scena da cui partire';

const moduleFrames = {
  'panoramica': {
    room: "all'inizio del percorso, quando il materiale sembra tanto e il tempo sembra poco",
    actor: 'una persona che vuole entrare nel data work senza perdersi in teoria sterile',
    pressure: 'scegliere cosa studiare oggi e cosa lasciare a dopo',
    object: 'un metodo che resta utile anche quando il corso diventa tecnico',
  },
  'data-collection': {
    room: 'prima che una dashboard esista, quando qualcuno deve decidere quali eventi meritano di essere tracciati',
    actor: 'un team marketing che ha già troppi numeri ma non ancora abbastanza fiducia nei dati',
    pressure: 'capire se un evento osservato racconta davvero un comportamento',
    object: 'un sistema di raccolta dati che non tradisce le decisioni',
  },
  'metriche-fondamenti': {
    room: 'in una riunione dove tutti citano una metrica diversa per difendere la propria idea',
    actor: 'un analista che deve separare segnale, rumore e incentivi sbagliati',
    pressure: 'trasformare un numero in una domanda migliore',
    object: 'metriche che guidano scelte, non solo report',
  },
  'gestione-data-driven': {
    room: "nel momento in cui una decisione importante rischia di diventare opinione contro opinione",
    actor: 'un manager che vuole usare i dati senza nascondersi dietro i dati',
    pressure: 'rendere chiaro chi decide, con quali evidenze e con quale rischio residuo',
    object: 'un operating system decisionale ripetibile',
  },
  'analisi-prodotto': {
    room: 'dentro un prodotto che sembra crescere, ma dove retention, attivazione e valore non raccontano la stessa storia',
    actor: 'un product analyst chiamato a spiegare cosa sta succedendo agli utenti reali',
    pressure: 'trovare il punto del journey dove il valore si rompe',
    object: 'una diagnosi di prodotto che porta a una scelta di roadmap',
  },
  'analisi-marketing': {
    room: 'alla fine di una campagna, quando il budget è stato speso e restano domande scomode',
    actor: 'un team marketing che deve capire cosa ha creato domanda e cosa ha solo intercettato domanda già esistente',
    pressure: 'difendere una lettura onesta di canali, funnel, brand e marginalità',
    object: 'una misura di marketing che regge davanti a finanza e direzione',
  },
  'dashboard-visualizzazione': {
    room: 'davanti a una dashboard aperta in sala riunioni, con persone che cercano risposte diverse nello stesso grafico',
    actor: 'chi progetta interfacce decisionali, non poster pieni di numeri',
    pressure: 'far vedere subito il cambiamento che richiede attenzione',
    object: 'una visualizzazione che riduce ambiguita e accelera la decisione',
  },
  'marketing-data-science': {
    room: 'quando un modello sembra promettente, ma nessuno sa ancora se cambiera davvero una decisione',
    actor: 'un data scientist che deve tradurre probabilita, segmenti e previsioni in azioni commerciali',
    pressure: 'evitare che il modello diventi un esercizio elegante ma inutile',
    object: 'un modello che migliora una scelta misurabile',
  },
  'data-warehousing': {
    room: 'nel retrobottega dei dati, dove una query lenta o una tabella ambigua puo bloccare tutto il lavoro analitico',
    actor: 'un analytics engineer che deve rendere affidabile ciò che altri useranno ogni giorno',
    pressure: 'progettare struttura, semantica e performance prima che il caos diventi costoso',
    object: 'un warehouse che rende semplici le domande difficili',
  },
  's3-data-lake': {
    room: 'nel momento in cui file, formati e permessi cominciano a moltiplicarsi nel data lake',
    actor: 'un team dati che deve conservare flessibilita senza perdere governance',
    pressure: 'capire cosa puo restare grezzo e cosa deve diventare contratto affidabile',
    object: 'un lakehouse che non diventa una palude',
  },
  'kafka-streaming': {
    room: 'quando gli eventi arrivano mentre il business sta già reagendo',
    actor: 'un data engineer che non puo aspettare il batch di domani per sapere cosa e successo',
    pressure: 'progettare flussi che restano ordinati anche sotto carico',
    object: 'uno streaming system osservabile, evolvibile e utile',
  },
  'real-time-analytics': {
    room: "davanti a un sistema operativo in tempo reale, dove cinque minuti di ritardo cambiano il valore dell'informazione",
    actor: 'chi deve servire analytics veloci senza sacrificare qualità e costo',
    pressure: 'distinguere ciò che deve essere immediato da ciò che può essere calcolato con calma',
    object: 'un layer real-time che risponde quando serve davvero',
  },
  'infrastructure-ops': {
    room: 'quando il sistema funziona finche nessuno lo guarda, poi si rompe nel momento peggiore',
    actor: 'un team che deve rendere affidabile ciò che sostiene dati, pipeline e prodotto',
    pressure: 'prevenire incidenti, costi nascosti e deploy fragili',
    object: 'operazioni solide senza burocrazia inutile',
  },
  'advanced-sql': {
    room: 'davanti a una tabella reale, sporca e piena di eccezioni, non davanti a un esercizio pulito',
    actor: 'un analista che deve arrivare a una risposta tracciabile con SQL',
    pressure: 'scrivere query che spiegano il ragionamento oltre a produrre un numero',
    object: 'SQL come strumento di pensiero, non solo di estrazione',
  },
  'matematica-analisi-dati': {
    room: 'quando una formula appare in un modello e bisogna capire se sta chiarendo il problema o nascondendo assunzioni',
    actor: 'chi usa la matematica per ragionare meglio sui dati, non per decorare una slide',
    pressure: 'collegare simboli, intuizione geometrica e decisione pratica',
    object: 'una base matematica che rende leggibili modelli e metriche',
  },
  'analytics-engineering': {
    room: 'tra sorgenti grezze e metriche di business, dove ogni trasformazione puo creare fiducia o debito tecnico',
    actor: 'un analytics engineer che deve trasformare dati instabili in prodotti dati riusabili',
    pressure: 'dare nomi, test e contratti alle trasformazioni',
    object: 'un modello analitico che altri possono usare senza chiedere permesso',
  },
  'significativita-statistica': {
    room: 'alla fine di un esperimento, quando un p-value rischia di diventare una sentenza più forte dei dati',
    actor: 'chi deve decidere se una differenza osservata e reale, utile o solo rumorosa',
    pressure: 'non confondere significatività, impatto e qualità del disegno sperimentale',
    object: 'esperimenti che proteggono il business da conclusioni premature',
  },
  'direzioni-analitica': {
    room: 'quando devi scegliere che tipo di analista diventare e quali problemi vuoi saper risolvere',
    actor: 'una persona che vuole orientare competenze tecniche verso un ruolo concreto',
    pressure: 'capire la differenza tra marketing, prodotto, finanza e operations senza semplificare troppo',
    object: 'una mappa professionale per scegliere direzione e profondita',
  },
  'filosofia-analisi-dati': {
    room: 'quando un dato sembra evidente, ma la domanda vera e cosa possiamo legittimamente concludere',
    actor: 'un analista che non vuole scambiare correlazione, misura e causalita per verita assolute',
    pressure: 'rendere esplicite assunzioni, limiti e responsabilita',
    object: "un pensiero critico che rende l'analisi più onesta",
  },
};

const categoryLens = [
  {
    test: /tecnico|sql|stream|infrastructure|data engineering|tracking/i,
    value: {
      mode: 'tecnico',
      promise: 'Qui non basta capire il concetto: devi vedere come si rompe, come si controlla e come si spiega a chi userà il risultato.',
      table: ['Quale vincolo tecnico decide il disegno?', 'Quale controllo ti direbbe che il risultato è affidabile?', 'Quale trade-off racconteresti prima di mettere in produzione?'],
    },
  },
  {
    test: /lab|caso/i,
    value: {
      mode: 'laboratorio',
      promise: 'Leggila come un banco di prova: ogni passaggio deve trasformare un dato, un dubbio o un vincolo in una decisione verificabile.',
      table: ['Quale contesto rende il caso difficile?', 'Quale evidenza cambia davvero la decisione?', 'Quale lezione resta valida fuori dal caso specifico?'],
    },
  },
  {
    test: /sintesi|cheat/i,
    value: {
      mode: 'operativo',
      promise: 'Questa lezione funziona come una postazione di lavoro: torna qui quando devi ricordare cosa controllare, in che ordine e con quale criterio.',
      table: ['Quale regola serve sotto pressione?', 'Quale eccezione non devi dimenticare?', 'Quale checklist useresti domani in un progetto reale?'],
    },
  },
  {
    test: /decisione|strategia|management|brand/i,
    value: {
      mode: 'decisionale',
      promise: "L'obiettivo non è avere una definizione elegante, ma una conversazione più chiara quando persone intelligenti leggono gli stessi dati in modi diversi.",
      table: ['Quale decisione rende utile il concetto?', 'Quale conflitto tra team o metriche devi anticipare?', 'Quale frase useresti per spiegarlo in riunione?'],
    },
  },
  {
    test: /fondamenti|panoramica|metodologia|ricerca|metriche|analisi|statistica|indice/i,
    value: {
      mode: 'concettuale',
      promise: 'Trattala come una lente mentale: il valore sta nel cambiare il modo in cui osservi un problema prima ancora di aprire un tool.',
      table: ['Quale intuizione deve restare dopo la lettura?', 'Quale esempio rende concreto il concetto?', 'Quale errore diventa più facile evitare?'],
    },
  },
];

function cleanTitle(value) {
  return String(value || 'questa lezione').replace(/^["']|["']$/g, '').trim();
}

function cleanCategory(value) {
  const category = String(value || 'Fondamenti').split('\n')[0].trim();
  return category || 'Fondamenti';
}

function difficultyLine(difficulty) {
  const normalized = String(difficulty || '').toLowerCase();
  if (normalized.includes('advanced') || normalized.includes('avanz')) {
    return 'Il livello è avanzato: non cercare una ricetta unica, cerca i vincoli che cambiano la risposta.';
  }
  if (normalized.includes('intermediate') || normalized.includes('intermedio')) {
    return 'Il livello è intermedio: collega il modello alla pratica e chiediti dove smette di funzionare.';
  }
  return 'Il livello è introduttivo: costruisci prima una mappa semplice, poi aggiungi le eccezioni.';
}

function pickLens(category) {
  return categoryLens.find((entry) => entry.test.test(category))?.value ?? categoryLens.at(-1).value;
}

function buildStorySection({ title, moduleId, category, difficulty }) {
  const frame = moduleFrames[moduleId] ?? moduleFrames.panoramica;
  const lens = pickLens(category);

  return `Immagina ${frame.actor} ${frame.room}. Sul tavolo non c'è un esercizio astratto: c'è la pressione concreta di ${frame.pressure}. **${title}** entra qui, nel punto in cui una scelta deve diventare più chiara, più misurabile e più difendibile.

${SECTION_TITLE}

La lezione va letta con questo atteggiamento: non collezionare frasi da ricordare, ma cercare il passaggio che trasforma ${frame.object} in lavoro reale. ${lens.promise} ${difficultyLine(difficulty)}

- **Contesto:** ${lens.table[0]}
- **Metodo:** ${lens.table[1]}
- **Applicazione:** ${lens.table[2]}
`;
}

function removeExistingStorySection(body) {
  let nextBody = body;

  while (true) {
    const marker = nextBody.startsWith(`${SECTION_TITLE}\n`)
      ? { index: 0, prefixLength: 0 }
      : (() => {
          const index = nextBody.indexOf(`\n${SECTION_TITLE}\n`);
          return index === -1 ? null : { index, prefixLength: 1 };
        })();

    if (!marker) return nextBody;

    const markerStart = marker.index + marker.prefixLength;
    let start = markerStart;
    const beforeMarker = nextBody.slice(0, markerStart).trimEnd();
    const paragraphStart = beforeMarker.lastIndexOf('\n\n') + 2;
    const previousParagraph = beforeMarker.slice(paragraphStart).trim();

    if (previousParagraph.startsWith('Immagina ') && previousParagraph.includes('entra qui')) {
      start = paragraphStart;
    }

    const nextHeading = nextBody.indexOf('\n## ', markerStart + SECTION_TITLE.length + 1);

    if (nextHeading === -1) {
      nextBody = nextBody.slice(0, start).trimEnd() + '\n';
      continue;
    }

    nextBody = nextBody.slice(0, start).trimEnd() + '\n\n' + nextBody.slice(nextHeading + 1);
  }
}

function insertAfterFirstH1(body, section) {
  const lines = body.split(/\r?\n/);
  const h1Index = lines.findIndex((line) => /^#\s+/.test(line.trim()));

  if (h1Index === -1) {
    let importEnd = 0;
    let sawImport = false;
    while (importEnd < lines.length) {
      const trimmed = lines[importEnd].trim();
      if (trimmed === '') {
        importEnd += 1;
        continue;
      }
      if (trimmed.startsWith('import ')) {
        sawImport = true;
        importEnd += 1;
        continue;
      }
      break;
    }

    if (sawImport) {
      const imports = lines.slice(0, importEnd).join('\n').trimEnd();
      const rest = lines.slice(importEnd).join('\n').trimStart();
      return `${imports}\n\n${section.trim()}\n\n${rest}`;
    }

    return `${section.trim()}\n\n${body.trimStart()}`;
  }

  let insertAt = h1Index + 1;
  while (insertAt < lines.length && lines[insertAt].trim() === '') {
    insertAt += 1;
  }

  lines.splice(insertAt, 0, '', section.trim(), '');
  return lines.join('\n').replace(/\n{4,}/g, '\n\n\n');
}

const files = await glob(`${COURSE_ROOT}/**/*.mdx`, { nodir: true });
let changed = 0;

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  const parsed = matter(raw);
  if (typeof parsed.data.order !== 'number') continue;

  const relative = path.relative(COURSE_ROOT, file);
  const moduleId = relative.split(path.sep)[0];
  const title = cleanTitle(parsed.data.title);
  const category = cleanCategory(parsed.data.category);
  const section = buildStorySection({
    title,
    moduleId,
    category,
    difficulty: parsed.data.difficulty,
  });

  const frontmatterMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!frontmatterMatch) continue;

  const frontmatter = frontmatterMatch[0].replace(/\s*$/, '\n');
  const originalBody = raw.slice(frontmatterMatch[0].length);
  const bodyWithoutStory = removeExistingStorySection(originalBody);
  const nextBody = insertAfterFirstH1(bodyWithoutStory, section);
  const nextRaw = `${frontmatter}${nextBody.replace(/^\n+/, '')}`;

  if (nextRaw !== raw) {
    await fs.writeFile(file, nextRaw, 'utf8');
    changed += 1;
  }
}

console.log(`Storytelling editorial pass applied to ${changed} lessons.`);
