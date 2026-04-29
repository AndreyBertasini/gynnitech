import { COURSE_MODULES, COURSE_PHASES, type CoursePhaseId } from '../data/course-modules';

export interface CourseGraphSourceEntry {
  id: string;
  data: {
    title: string;
    description: string;
    order?: number;
    category?: string;
    duration?: string;
    difficulty?: string;
    prerequisites?: string[];
  };
}

export interface CourseGraphStage {
  id: string;
  index: number;
  title: string;
  description: string;
  moduleIds: string[];
  moduleCount: number;
  lessonCount: number;
  internalLinkCount: number;
  crossStageIncomingCount: number;
  crossStageOutgoingCount: number;
}

export interface CourseGraphLesson {
  id: string;
  slug: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  order: number;
  category: string;
  duration?: string;
  difficulty?: string;
  prerequisites: string[];
  dependents: string[];
  internalPrerequisites: string[];
  externalPrerequisites: string[];
  internalDependents: string[];
  externalDependents: string[];
}

export interface CourseGraphModule {
  id: string;
  index: number;
  title: string;
  description: string;
  color: string;
  stageId: string;
  stageTitle: string;
  lessonCount: number;
  internalLinkCount: number;
  crossModuleIncomingCount: number;
  crossModuleOutgoingCount: number;
  lessons: CourseGraphLesson[];
}

export interface CourseGraphModuleEdge {
  source: string;
  target: string;
  count: number;
}

export interface CourseGraphStageEdge {
  source: string;
  target: string;
  count: number;
}

export interface CourseGraphData {
  stages: CourseGraphStage[];
  modules: CourseGraphModule[];
  lessons: CourseGraphLesson[];
  moduleEdges: CourseGraphModuleEdge[];
  stageEdges: CourseGraphStageEdge[];
  stats: {
    totalModules: number;
    totalLessons: number;
    totalLinks: number;
    internalLinks: number;
    crossModuleLinks: number;
  };
}

const normalizeEntryId = (id: string): string => id.replace(/\.[^/.]+$/, '');

const isCoreEntry = (entry: CourseGraphSourceEntry): boolean => typeof entry.data.order === 'number';

const sortLessons = (a: CourseGraphSourceEntry, b: CourseGraphSourceEntry): number => {
  const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return a.data.title.localeCompare(b.data.title, 'it');
};

export function buildCourseGraph(entries: CourseGraphSourceEntry[]): CourseGraphData {
  const lessonEntries = entries
    .filter((entry) => normalizeEntryId(entry.id).includes('/'))
    .filter(isCoreEntry)
    .sort(sortLessons);

  const lessonIdSet = new Set(lessonEntries.map((entry) => normalizeEntryId(entry.id)));
  const dependentsMap = new Map<string, string[]>();

  for (const entry of lessonEntries) {
    const lessonId = normalizeEntryId(entry.id);
    const rawPrerequisites = Array.isArray(entry.data.prerequisites) ? entry.data.prerequisites : [];
    const prerequisites = Array.from(
      new Set(
        rawPrerequisites
          .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
          .map((value) => normalizeEntryId(value.trim()))
          .filter((value) => lessonIdSet.has(value)),
      ),
    );

    for (const prerequisiteId of prerequisites) {
      const currentDependents = dependentsMap.get(prerequisiteId) || [];
      currentDependents.push(lessonId);
      dependentsMap.set(prerequisiteId, currentDependents);
    }
  }

  const lessonsByModule = new Map<string, CourseGraphLesson[]>();
  const modulesLookup = new Map(COURSE_MODULES.map((module) => [module.id, module]));
  let totalLinks = 0;
  let internalLinks = 0;
  const moduleEdgeCounts = new Map<string, number>();

  const lessons: CourseGraphLesson[] = lessonEntries.map((entry, index) => {
    const lessonId = normalizeEntryId(entry.id);
    const [moduleId, slug] = lessonId.split('/');
    const module = modulesLookup.get(moduleId);
    const rawPrerequisites = Array.isArray(entry.data.prerequisites) ? entry.data.prerequisites : [];
    const prerequisites = Array.from(
      new Set(
        rawPrerequisites
          .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
          .map((value) => normalizeEntryId(value.trim()))
          .filter((value) => lessonIdSet.has(value)),
      ),
    );
    const dependents = Array.from(new Set(dependentsMap.get(lessonId) || [])).sort((a, b) => a.localeCompare(b, 'it'));
    const internalPrerequisites = prerequisites.filter((value) => value.startsWith(`${moduleId}/`));
    const externalPrerequisites = prerequisites.filter((value) => !value.startsWith(`${moduleId}/`));
    const internalDependents = dependents.filter((value) => value.startsWith(`${moduleId}/`));
    const externalDependents = dependents.filter((value) => !value.startsWith(`${moduleId}/`));

    totalLinks += prerequisites.length;
    internalLinks += internalPrerequisites.length;

    for (const prerequisiteId of externalPrerequisites) {
      const sourceModuleId = prerequisiteId.split('/')[0];
      const edgeKey = `${sourceModuleId}->${moduleId}`;
      moduleEdgeCounts.set(edgeKey, (moduleEdgeCounts.get(edgeKey) || 0) + 1);
    }

    const lesson: CourseGraphLesson = {
      id: lessonId,
      slug,
      moduleId,
      moduleTitle: module?.title ?? moduleId,
      title: entry.data.title,
      description: entry.data.description,
      order: entry.data.order ?? index + 1,
      category: entry.data.category?.trim() || 'Lezione',
      duration: entry.data.duration,
      difficulty: entry.data.difficulty,
      prerequisites,
      dependents,
      internalPrerequisites,
      externalPrerequisites,
      internalDependents,
      externalDependents,
    };

    const moduleLessons = lessonsByModule.get(moduleId) || [];
    moduleLessons.push(lesson);
    lessonsByModule.set(moduleId, moduleLessons);

    return lesson;
  });

  for (const moduleLessons of lessonsByModule.values()) {
    moduleLessons.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'it'));
  }

  const moduleEdges: CourseGraphModuleEdge[] = Array.from(moduleEdgeCounts.entries())
    .map(([key, count]) => {
      const [source, target] = key.split('->');
      return { source, target, count };
    })
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source, 'it') || a.target.localeCompare(b.target, 'it'));

  const phaseById = new Map(COURSE_PHASES.map((phase) => [phase.id, phase]));

  const modules: CourseGraphModule[] = COURSE_MODULES.map((module, index) => {
    const stage = phaseById.get(module.phase as CoursePhaseId) || COURSE_PHASES[COURSE_PHASES.length - 1];
    const moduleLessons = lessonsByModule.get(module.id) || [];
    const crossModuleIncomingCount = moduleEdges
      .filter((edge) => edge.target === module.id)
      .reduce((sum, edge) => sum + edge.count, 0);
    const crossModuleOutgoingCount = moduleEdges
      .filter((edge) => edge.source === module.id)
      .reduce((sum, edge) => sum + edge.count, 0);
    const internalLinkCount = moduleLessons.reduce((sum, lesson) => sum + lesson.internalPrerequisites.length, 0);

    return {
      id: module.id,
      index,
      title: module.title,
      description: module.description,
      color: module.color,
      stageId: stage.id,
      stageTitle: stage.title,
      lessonCount: moduleLessons.length,
      internalLinkCount,
      crossModuleIncomingCount,
      crossModuleOutgoingCount,
      lessons: moduleLessons,
    };
  });

  const moduleById = new Map(modules.map((module) => [module.id, module]));
  const stageEdgeCounts = new Map<string, number>();

  for (const edge of moduleEdges) {
    const sourceStageId = moduleById.get(edge.source)?.stageId;
    const targetStageId = moduleById.get(edge.target)?.stageId;

    if (!sourceStageId || !targetStageId || sourceStageId === targetStageId) {
      continue;
    }

    const key = `${sourceStageId}->${targetStageId}`;
    stageEdgeCounts.set(key, (stageEdgeCounts.get(key) || 0) + edge.count);
  }

  const stageEdges: CourseGraphStageEdge[] = Array.from(stageEdgeCounts.entries())
    .map(([key, count]) => {
      const [source, target] = key.split('->');
      return { source, target, count };
    })
    .sort((a, b) => a.source.localeCompare(b.source, 'it') || a.target.localeCompare(b.target, 'it'));

  const stages: CourseGraphStage[] = COURSE_PHASES.map((stage, index) => {
    const stageModules = modules.filter((module) => module.stageId === stage.id);
    return {
      id: stage.id,
      index,
      title: stage.title,
      description: stage.description,
      moduleIds: stageModules.map((module) => module.id),
      moduleCount: stageModules.length,
      lessonCount: stageModules.reduce((sum, module) => sum + module.lessonCount, 0),
      internalLinkCount: stageModules.reduce((sum, module) => sum + module.internalLinkCount, 0),
      crossStageIncomingCount: stageEdges
        .filter((edge) => edge.target === stage.id)
        .reduce((sum, edge) => sum + edge.count, 0),
      crossStageOutgoingCount: stageEdges
        .filter((edge) => edge.source === stage.id)
        .reduce((sum, edge) => sum + edge.count, 0),
    };
  }).filter((stage) => stage.moduleCount > 0);

  return {
    stages,
    modules,
    lessons,
    moduleEdges,
    stageEdges,
    stats: {
      totalModules: modules.length,
      totalLessons: lessons.length,
      totalLinks,
      internalLinks,
      crossModuleLinks: totalLinks - internalLinks,
    },
  };
}
