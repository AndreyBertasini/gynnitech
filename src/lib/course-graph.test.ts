import { describe, expect, it } from 'vitest';
import { buildCourseGraph } from './course-graph';

describe('buildCourseGraph', () => {
  it('builds module and lesson connections from prerequisites', () => {
    const graph = buildCourseGraph([
      {
        id: 'learning-path',
        data: {
          title: 'Learning Path',
          description: 'Overview page',
        },
      },
      {
        id: 'panoramica/intro.mdx',
        data: {
          title: 'Intro',
          description: 'Starting point',
          order: 1,
        },
      },
      {
        id: 'panoramica/metodo.mdx',
        data: {
          title: 'Metodo',
          description: 'Second lesson',
          order: 2,
          prerequisites: ['panoramica/intro'],
        },
      },
      {
        id: 'data-collection/tracking.mdx',
        data: {
          title: 'Tracking',
          description: 'Cross-module lesson',
          order: 1,
          prerequisites: ['panoramica/metodo'],
        },
      },
    ]);

    expect(graph.stats.totalModules).toBe(21);
    expect(graph.stats.totalLessons).toBe(3);
    expect(graph.stats.totalLinks).toBe(2);
    expect(graph.stats.internalLinks).toBe(1);
    expect(graph.stats.crossModuleLinks).toBe(1);

    const panoramica = graph.modules.find((module) => module.id === 'panoramica');
    const dataCollection = graph.modules.find((module) => module.id === 'data-collection');

    expect(panoramica?.lessonCount).toBe(2);
    expect(panoramica?.internalLinkCount).toBe(1);
    expect(panoramica?.crossModuleOutgoingCount).toBe(1);
    expect(dataCollection?.crossModuleIncomingCount).toBe(1);

    expect(graph.moduleEdges).toEqual([{ source: 'panoramica', target: 'data-collection', count: 1 }]);

    const metodo = graph.lessons.find((lesson) => lesson.id === 'panoramica/metodo');
    const tracking = graph.lessons.find((lesson) => lesson.id === 'data-collection/tracking');

    expect(metodo?.dependents).toEqual(['data-collection/tracking']);
    expect(tracking?.externalPrerequisites).toEqual(['panoramica/metodo']);
  });
});
