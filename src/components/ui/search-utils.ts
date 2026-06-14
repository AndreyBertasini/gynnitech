const DIACRITICS_REGEX = /[\u0300-\u036f]/g;
const HTML_TAG_REGEX = /<[^>]*>/g;
const MULTISPACE_REGEX = /\s+/g;
const NON_WORD_REGEX = /[^a-z0-9/#_+ -]/g;

export const SEARCH_RESULTS_LIMIT = 8;
export const SEARCH_CANDIDATE_LIMIT = 32;
export const MIN_SEARCH_QUERY_LENGTH = 2;

export const PAGEFIND_RANKING = {
  termSimilarity: 1.8,
  termFrequency: 0.7,
  termSaturation: 0.15,
  pageLength: 0.45,
} as const;

type SearchKind = "blog" | "course" | "page";

type SearchMeta = {
  title?: string;
  [key: string]: string | undefined;
};

export type SearchResultCandidate = {
  url: string;
  excerpt: string;
  meta: SearchMeta;
  score: number;
};

export type RankedSearchResult = SearchResultCandidate & {
  kind: SearchKind;
  rankingScore: number;
  plainTitle: string;
  plainExcerpt: string;
  displayExcerpt: string;
};

const stripHtml = (value: string) => value.replace(HTML_TAG_REGEX, " ");

export const normalizeSearchText = (value: string) =>
  stripHtml(value)
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(NON_WORD_REGEX, " ")
    .replace(MULTISPACE_REGEX, " ")
    .trim();

const compactHtmlSnippet = (value: string) => value.replace(MULTISPACE_REGEX, " ").trim();

const tokenizeQuery = (query: string) =>
  normalizeSearchText(query)
    .split(" ")
    .filter(Boolean);

const countTokenMatches = (tokens: string[], haystack: string) =>
  tokens.reduce((count, token) => count + (haystack.includes(token) ? 1 : 0), 0);

const inferSearchKind = (url: string): SearchKind => {
  if (url.includes("/blog/")) return "blog";
  if (url.includes("/course/") || url.includes("/corso/")) return "course";
  return "page";
};

const scoreCandidate = (candidate: SearchResultCandidate, query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  const tokens = tokenizeQuery(query);
  const plainTitle = stripHtml(candidate.meta.title ?? "").trim();
  const plainExcerpt = stripHtml(candidate.excerpt ?? "").replace(MULTISPACE_REGEX, " ").trim();
  const normalizedTitle = normalizeSearchText(plainTitle);
  const normalizedExcerpt = normalizeSearchText(plainExcerpt);
  const normalizedUrl = normalizeSearchText(candidate.url);

  const titleMatches = countTokenMatches(tokens, normalizedTitle);
  const urlMatches = countTokenMatches(tokens, normalizedUrl);
  const excerptMatches = countTokenMatches(tokens, normalizedExcerpt);
  const hasTitleCoverage = tokens.length > 0 && titleMatches === tokens.length;
  const hasUrlCoverage = tokens.length > 0 && urlMatches === tokens.length;

  let boost = 0;

  if (normalizedTitle === normalizedQuery && normalizedQuery) boost += 14;
  if (normalizedTitle.startsWith(normalizedQuery) && normalizedQuery) boost += 8;
  if (normalizedTitle.includes(normalizedQuery) && normalizedQuery) boost += 5;
  if (hasTitleCoverage) boost += 5;
  if (normalizedUrl.includes(normalizedQuery) && normalizedQuery) boost += 3.5;
  if (hasUrlCoverage) boost += 2;

  boost += titleMatches * 1.75;
  boost += urlMatches * 0.75;
  boost += excerptMatches * 0.2;

  if (tokens.length > 0 && titleMatches === 0) boost -= 2.25;
  if (tokens.length > 1 && excerptMatches === tokens.length) boost += 0.5;

  return {
    plainTitle,
    plainExcerpt,
    rankingScore: candidate.score + boost,
  };
};

export const rankSearchResults = (
  candidates: SearchResultCandidate[],
  query: string,
  limit = SEARCH_RESULTS_LIMIT,
): RankedSearchResult[] => {
  const ranked = candidates
    .map((candidate) => {
      const scored = scoreCandidate(candidate, query);

      return {
        ...candidate,
        ...scored,
        kind: inferSearchKind(candidate.url),
        displayExcerpt: compactHtmlSnippet(candidate.excerpt ?? ""),
      };
    })
    .sort((left, right) => right.rankingScore - left.rankingScore);

  const deduped: RankedSearchResult[] = [];
  const seen = new Set<string>();

  for (const result of ranked) {
    if (seen.has(result.url)) continue;
    seen.add(result.url);
    deduped.push(result);

    if (deduped.length >= limit) break;
  }

  return deduped;
};
