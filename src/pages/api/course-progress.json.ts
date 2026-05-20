import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

interface LessonProgress {
  slug: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  order?: number;
  duration?: string;
  difficulty?: string;
  completed: boolean;
  completedAt: string | null;
}

interface ModuleProgress {
  id: string;
  title: string;
  description: string;
  phase: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  lessons: LessonProgress[];
}

export const GET: APIRoute = async () => {
  const courseDocs = await getCollection('corso');
  const { COURSE_MODULES, COURSE_PHASES, COURSE_TRACKS } = await import('../../data/course-modules');

  const modules: ModuleProgress[] = COURSE_MODULES.map((mod) => {
    const modSlug = mod.id;
    const modLessons = courseDocs
      .filter((doc) => doc.id.startsWith(modSlug + '/') && typeof doc.data.order === 'number')
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      phase: mod.phase,
      totalLessons: modLessons.length,
      completedLessons: 0,
      percentComplete: 0,
      lessons: modLessons.map((lesson) => ({
        slug: lesson.id,
        title: lesson.data.title,
        moduleId: mod.id,
        moduleTitle: mod.title,
        order: lesson.data.order,
        duration: lesson.data.duration,
        difficulty: lesson.data.difficulty,
        completed: false,
        completedAt: null,
      })),
    };
  });

  const totalLessons = modules.reduce((sum, m) => sum + m.totalLessons, 0);

  const manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    courseTitle: 'GinnyTech — MarTech & Analytics Engineering',
    totalModules: modules.length,
    totalLessons,
    phases: COURSE_PHASES.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      modules: modules.filter((m) => m.phase === p.id).map((m) => m.id),
      totalLessons: modules
        .filter((m) => m.phase === p.id)
        .reduce((s, m) => s + m.totalLessons, 0),
    })),
    tracks: COURSE_TRACKS.map((t) => ({
      id: t.id,
      title: t.title,
      summary: t.summary,
      moduleIds: t.moduleIds,
      totalLessons: modules
        .filter((m) => t.moduleIds.includes(m.id))
        .reduce((s, m) => s + m.totalLessons, 0),
    })),
    modules,
    _meta: {
      syncHint:
        'POST completed lesson slugs (e.g. {"completed": ["panoramica/come-studiare-bene-questo-corso", "advanced-sql/window-functions-avanzate"]}) to sync progress across devices. Client-side: store in localStorage under ginnytech_completed_lessons.',
      localStoragePrefix: 'ginnytech_',
      completionKeys: [
        'ginnytech_completed_lessons',
        'ginnytech_module_progress',
        'ginnytech_quiz_scores',
      ],
      endpoints: {
        progressPage: '/progress',
        learningPath: '/course/learning-path',
      },
    },
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
