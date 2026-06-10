import { describe, expect, test } from 'vitest';

import {
  countCompletedLessons,
  lessonProgressKey,
  loadLessonProgress,
  PROGRESS_STORAGE_KEY,
  sanitizeLessonProgress,
  type ProgressStorage,
} from './progress';

describe('lesson progress utilities', () => {
  test('sanitizes malformed localStorage entries', () => {
    const progress = sanitizeLessonProgress({
      'data-collection/introduction': {
        moduleId: 'data-collection',
        slug: 'introduction',
        completed: true,
        timestamp: 1710000000000,
      },
      broken: {
        moduleId: 'data-collection',
        completed: true,
      },
    });

    expect(Object.keys(progress)).toEqual(['data-collection/introduction']);
  });

  test('loads an empty record when localStorage contains invalid JSON', () => {
    const storage: ProgressStorage = {
      getItem: (key) => (key === PROGRESS_STORAGE_KEY ? '{invalid' : null),
      setItem: () => undefined,
    };

    expect(loadLessonProgress(storage)).toEqual({});
  });

  test('counts completed lessons per module', () => {
    expect(
      countCompletedLessons('analytics-engineering', {
        [lessonProgressKey('analytics-engineering', 'dbt')]: {
          moduleId: 'analytics-engineering',
          slug: 'dbt',
          completed: true,
          timestamp: 1710000000000,
        },
        [lessonProgressKey('analytics-engineering', 'semantic-layer')]: {
          moduleId: 'analytics-engineering',
          slug: 'semantic-layer',
          completed: false,
          timestamp: 1710000000001,
        },
        [lessonProgressKey('advanced-sql', 'ranking')]: {
          moduleId: 'advanced-sql',
          slug: 'ranking',
          completed: true,
          timestamp: 1710000000002,
        },
      }),
    ).toBe(1);
  });
});
