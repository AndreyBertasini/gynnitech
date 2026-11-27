/**
 * Link contestuali lezione ↔ articolo, calcolati dal contenuto (nessun elenco manuale da mantenere).
 * Punteggio: somma degli IDF dei termini condivisi tra (titolo + descrizione + categoria/modulo) di
 * una lezione e di un articolo, con peso doppio per i termini presenti nei due titoli.
 * Soglia minima e tie-break alfabetico rendono l'output deterministico; sotto soglia non si
 * propone nulla (meglio 0 link che un link fuori tema).
 */
export type LinkDoc = { id: string; href: string; title: string; description?: string; extra?: string };
export type LinkMatch = { href: string; title: string; score: number };

const STOP = new Set([
  'alla', 'alle', 'allo', 'agli', 'con', 'che', 'come', 'dei', 'del', 'della', 'delle', 'dell', 'degli', 'gli', 'il',
  'in', 'la', 'le', 'lo', 'nel', 'nella', 'nelle', 'nei', 'per', 'piu', 'sui', 'sul', 'sulla', 'tra', 'una', 'uno',
  'and', 'the', 'for', 'non', 'sono', 'cosa', 'quando', 'dove', 'perche', 'guida', 'modulo', 'lezione', 'articolo',
  'cheat', 'sheet', 'caso', 'studio', 'indice', 'pratica', 'pratico', 'esempio', 'esempi', 'corso', 'ginnytech',
  'data', 'dati', 'analytics', 'analisi',
]);

// Lemmatizzazione grossolana (it/en): "sperimentazione/sperimentazioni" e "metrica/metriche" coincidono.
const stem = (t: string) => (t.length >= 7 ? t.replace(/(mente|zioni|zione|ing|ali|ale|che|chi|i|e|a|o|s)$/, '') : t);

const tokens = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((t) => t.length >= 4 && !STOP.has(t))
    .map(stem);

const bag = (doc: LinkDoc) => ({
  all: new Set(tokens([doc.title, doc.description ?? '', doc.extra ?? ''].join(' '))),
  title: new Set(tokens(doc.title)),
});

export const MIN_SCORE = 10;
/** Termini distinti in comune richiesti: un solo termine condiviso è quasi sempre una coincidenza. */
export const MIN_SHARED = 2;

export function buildLinkIndex(lessons: LinkDoc[], posts: LinkDoc[]) {
  const lessonBags = lessons.map(bag);
  const postBags = posts.map(bag);
  const df = new Map<string, number>();
  for (const b of [...lessonBags, ...postBags]) for (const t of b.all) df.set(t, (df.get(t) ?? 0) + 1);
  const n = lessons.length + posts.length;
  const idf = (t: string) => Math.log(n / (df.get(t) ?? 1));

  const score = (a: ReturnType<typeof bag>, b: ReturnType<typeof bag>) => {
    let s = 0;
    let shared = 0;
    for (const t of a.all) {
      if (!b.all.has(t)) continue;
      shared++;
      s += idf(t) * (a.title.has(t) && b.title.has(t) ? 2 : 1);
    }
    return shared >= MIN_SHARED ? s : 0;
  };
  const top = (from: ReturnType<typeof bag>, to: LinkDoc[], toBags: ReturnType<typeof bag>[], limit: number, minScore: number): LinkMatch[] =>
    to
      .map((doc, i) => ({ href: doc.href, title: doc.title, score: score(from, toBags[i]) }))
      .filter((m) => m.score >= minScore)
      .sort((x, y) => y.score - x.score || x.href.localeCompare(y.href))
      .slice(0, limit);

  return {
    postsForLesson: (lessonId: string, limit = 3, minScore = MIN_SCORE) => {
      const i = lessons.findIndex((l) => l.id === lessonId);
      return i < 0 ? [] : top(lessonBags[i], posts, postBags, limit, minScore);
    },
    lessonsForPost: (postId: string, limit = 3, minScore = MIN_SCORE) => {
      const i = posts.findIndex((p) => p.id === postId);
      return i < 0 ? [] : top(postBags[i], lessons, lessonBags, limit, minScore);
    },
  };
}
