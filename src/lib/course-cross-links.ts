import type { CourseGraphData, CourseGraphLesson, CourseGraphModule } from './course-graph';

export interface CourseCrossLink {
  href: string;
  title: string;
  description: string;
  moduleId: string;
  moduleTitle: string;
  relation: string;
}

export interface ModuleCrossLink {
  href: string;
  title: string;
  description: string;
  relation: string;
  lessonCount: number;
}

const STOPWORDS = new Set([
  'alla',
  'alle',
  'con',
  'che',
  'come',
  'dei',
  'del',
  'della',
  'delle',
  'dell',
  'gli',
  'il',
  'in',
  'la',
  'le',
  'lo',
  'nel',
  'nella',
  'nelle',
  'per',
  'piu',
  'sui',
  'sul',
  'tra',
  'una',
  'uno',
  'and',
  'data',
  'analytics',
  'analisi',
  'dati',
  'modulo',
]);

function lessonHref(lessonId: string): string {
  return `/course/${lessonId}/`;
}

function moduleHref(moduleId: string): string {
  return `/course/${moduleId}/`;
}

function moduleIndex(graph: CourseGraphData, moduleId: string): number {
  return graph.modules.find((module) => module.id === moduleId)?.index ?? Number.MAX_SAFE_INTEGER;
}

function keywordSet(...values: Array<string | undefined>): Set<string> {
  const source = values
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ');

  return new Set(
    source
      .split(/[\s-]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4 && !STOPWORDS.has(token)),
  );
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let score = 0;
  for (const token of a) {
    if (b.has(token)) score += 1;
  }
  return score;
}

function addUniqueLesson(
  links: CourseCrossLink[],
  lesson: CourseGraphLesson | undefined,
  relation: string,
  currentLessonId: string,
): void {
  if (!lesson || lesson.id === currentLessonId || links.some((link) => link.href === lessonHref(lesson.id))) {
    return;
  }

  links.push({
    href: lessonHref(lesson.id),
    title: lesson.title,
    description: lesson.description,
    moduleId: lesson.moduleId,
    moduleTitle: lesson.moduleTitle,
    relation,
  });
}

function lessonLinkCountForModule(links: CourseCrossLink[], moduleId: string): number {
  return links.filter((link) => link.moduleId === moduleId).length;
}

function addUniqueModule(
  links: ModuleCrossLink[],
  module: CourseGraphModule | undefined,
  relation: string,
  currentModuleId: string,
): void {
  if (!module || module.id === currentModuleId || module.lessonCount === 0 || links.some((link) => link.href === moduleHref(module.id))) {
    return;
  }

  links.push({
    href: moduleHref(module.id),
    title: module.title,
    description: module.description,
    relation,
    lessonCount: module.lessonCount,
  });
}

export function buildLessonCrossLinks(
  graph: CourseGraphData,
  lessonId: string,
  options: { maxLinks?: number } = {},
): CourseCrossLink[] {
  const maxLinks = options.maxLinks ?? 6;
  const current = graph.lessons.find((lesson) => lesson.id === lessonId);
  if (!current) return [];

  const lessonById = new Map(graph.lessons.map((lesson) => [lesson.id, lesson]));
  const links: CourseCrossLink[] = [];
  const maxLinksPerModule = 2;

  for (const prerequisiteId of current.externalPrerequisites) {
    const prerequisite = lessonById.get(prerequisiteId);
    if (prerequisite && lessonLinkCountForModule(links, prerequisite.moduleId) < maxLinksPerModule) {
      addUniqueLesson(links, prerequisite, 'Base da riprendere', current.id);
    }
  }

  for (const dependentId of current.externalDependents) {
    const dependent = lessonById.get(dependentId);
    if (dependent && lessonLinkCountForModule(links, dependent.moduleId) < maxLinksPerModule) {
      addUniqueLesson(links, dependent, 'Prossimo passo', current.id);
    }
  }

  const currentKeywords = keywordSet(current.title, current.description, current.category, current.moduleTitle);
  const currentModuleIndex = moduleIndex(graph, current.moduleId);
  const currentStageId = graph.modules.find((module) => module.id === current.moduleId)?.stageId;

  const scoredCandidates = graph.lessons
    .filter((candidate) => candidate.id !== current.id && candidate.moduleId !== current.moduleId)
    .map((candidate) => {
      const candidateKeywords = keywordSet(candidate.title, candidate.description, candidate.category, candidate.moduleTitle);
      const candidateStageId = graph.modules.find((module) => module.id === candidate.moduleId)?.stageId;
      const distance = Math.abs(moduleIndex(graph, candidate.moduleId) - currentModuleIndex);
      const score =
        overlapScore(currentKeywords, candidateKeywords) * 12 +
        (candidate.category === current.category ? 8 : 0) +
        (candidateStageId && candidateStageId === currentStageId ? 5 : 0) +
        Math.max(0, 6 - distance);

      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.order - b.candidate.order || a.candidate.title.localeCompare(b.candidate.title, 'it'));

  for (const { candidate } of scoredCandidates) {
    if (lessonLinkCountForModule(links, candidate.moduleId) >= maxLinksPerModule) {
      continue;
    }
    addUniqueLesson(links, candidate, 'Collegamento tematico', current.id);
    if (links.length >= maxLinks) return links;
  }

  const adjacentModules = graph.modules
    .filter((module) => module.id !== current.moduleId && module.lessonCount > 0)
    .sort((a, b) => Math.abs(a.index - currentModuleIndex) - Math.abs(b.index - currentModuleIndex));

  for (const module of adjacentModules) {
    if (lessonLinkCountForModule(links, module.id) >= maxLinksPerModule) {
      continue;
    }
    addUniqueLesson(links, module.lessons[0], 'Modulo vicino', current.id);
    if (links.length >= maxLinks) break;
  }

  return links.slice(0, maxLinks);
}

export function buildModuleCrossLinks(
  graph: CourseGraphData,
  moduleId: string,
  options: { maxLinks?: number } = {},
): ModuleCrossLink[] {
  const maxLinks = options.maxLinks ?? 6;
  const current = graph.modules.find((module) => module.id === moduleId);
  if (!current) return [];

  const moduleById = new Map(graph.modules.map((module) => [module.id, module]));
  const links: ModuleCrossLink[] = [];

  for (const edge of graph.moduleEdges.filter((edge) => edge.target === moduleId)) {
    addUniqueModule(links, moduleById.get(edge.source), 'Prerequisito naturale', moduleId);
  }

  for (const edge of graph.moduleEdges.filter((edge) => edge.source === moduleId)) {
    addUniqueModule(links, moduleById.get(edge.target), 'Continua qui', moduleId);
  }

  const sameStageModules = graph.modules
    .filter((module) => module.stageId === current.stageId)
    .sort((a, b) => Math.abs(a.index - current.index) - Math.abs(b.index - current.index));

  for (const module of sameStageModules) {
    addUniqueModule(links, module, 'Stessa fase del percorso', moduleId);
  }

  for (const module of graph.modules) {
    addUniqueModule(links, module, module.index < current.index ? 'Modulo precedente' : 'Modulo successivo', moduleId);
    if (links.length >= maxLinks) break;
  }

  return links.slice(0, maxLinks);
}
