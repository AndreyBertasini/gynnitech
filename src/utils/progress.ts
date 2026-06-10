export interface LessonProgress {
  moduleId: string;
  slug: string;
  completed: boolean;
  timestamp: number;
}

export type LessonProgressRecord = Record<string, LessonProgress>;
export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const PROGRESS_STORAGE_KEY = 'ginnytech_progress';
export const LESSON_COMPLETED_EVENT = 'ginnytech:lesson-completed';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isLessonProgress = (value: unknown): value is LessonProgress =>
  isRecord(value) &&
  typeof value.moduleId === 'string' &&
  typeof value.slug === 'string' &&
  typeof value.completed === 'boolean' &&
  typeof value.timestamp === 'number';

const browserStorage = (): ProgressStorage | undefined =>
  typeof globalThis.localStorage === 'undefined' ? undefined : globalThis.localStorage;

export const lessonProgressKey = (moduleId: string, slug: string): string => `${moduleId}/${slug}`;

export const sanitizeLessonProgress = (value: unknown): LessonProgressRecord => {
  if (!isRecord(value)) return {};

  const progress: LessonProgressRecord = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isLessonProgress(entry)) {
      progress[key] = entry;
    }
  }

  return progress;
};

export const loadLessonProgress = (storage: ProgressStorage | undefined = browserStorage()): LessonProgressRecord => {
  if (!storage) return {};

  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? sanitizeLessonProgress(JSON.parse(raw) as unknown) : {};
  } catch {
    return {};
  }
};

export const saveLessonProgress = (
  progress: LessonProgressRecord,
  storage: ProgressStorage | undefined = browserStorage(),
): void => {
  if (!storage) return;
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
};

export const isLessonCompleted = (
  moduleId: string,
  slug: string,
  progress: LessonProgressRecord = loadLessonProgress(),
): boolean => progress[lessonProgressKey(moduleId, slug)]?.completed === true;

export const countCompletedLessons = (
  moduleId: string,
  progress: LessonProgressRecord = loadLessonProgress(),
): number =>
  Object.values(progress).filter((lesson) => lesson.moduleId === moduleId && lesson.completed).length;

export const dispatchLessonCompleted = (moduleId: string, slug: string): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(LESSON_COMPLETED_EVENT, { detail: { moduleId, slug } }));
};
