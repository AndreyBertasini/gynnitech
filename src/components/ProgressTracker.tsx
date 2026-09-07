import { useEffect, useState } from 'react';
import { currentSiteLanguage } from '../utils/language';
import { trackEvent } from '../utils/analytics';
import {
  countCompletedLessons,
  dispatchLessonCompleted,
  isLessonCompleted as readLessonCompleted,
  lessonProgressKey,
  LESSON_COMPLETED_EVENT,
  loadLessonProgress,
  saveLessonProgress,
} from '../utils/progress';

export function markLessonCompleted(moduleId: string, slug: string): void {
  const progress = loadLessonProgress();
  const key = lessonProgressKey(moduleId, slug);
  progress[key] = { moduleId, slug, completed: true, timestamp: Date.now() };
  saveLessonProgress(progress);
  dispatchLessonCompleted(moduleId, slug);
  trackEvent('lesson_complete', { module_id: moduleId, lesson_slug: slug });
}

export function isLessonCompleted(moduleId: string, slug: string): boolean {
  return readLessonCompleted(moduleId, slug);
}

export function CompletionButton({ moduleId, slug }: { moduleId: string; slug: string }) {
  const [completed, setCompleted] = useState(false);
  const language = currentSiteLanguage();
  const copy = language === 'en'
    ? {
        completedStatus: 'Lesson completed!',
        incompleteStatus: 'Mark as completed',
        undo: 'Undo',
        complete: 'Completed',
      }
    : {
        completedStatus: 'Lezione completata!',
        incompleteStatus: 'Segna come completata',
        undo: 'Annulla',
        complete: 'Completata',
      };

  useEffect(() => {
    setCompleted(isLessonCompleted(moduleId, slug));
  }, [moduleId, slug]);

  const toggle = () => {
    if (completed) {
      const progress = loadLessonProgress();
      delete progress[lessonProgressKey(moduleId, slug)];
      saveLessonProgress(progress);
      setCompleted(false);
    } else {
      markLessonCompleted(moduleId, slug);
      setCompleted(true);
    }
  };

  return (
    <div style={{ margin: '2.5rem 0 1.5rem' }}>
      <div style={{
        border: completed ? '1px solid rgba(204,255,0,0.25)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        background: completed ? 'rgba(204,255,0,0.06)' : 'rgba(255,255,255,0.025)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{completed ? '[x]' : '[ ]'}</span>
          <span style={{
            color: completed ? 'var(--color-accent)' : '#94a3b8',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}>
            {completed ? copy.completedStatus : copy.incompleteStatus}
          </span>
        </div>
        <button
          onClick={toggle}
          style={{
            padding: '0.6rem 1.4rem',
            borderRadius: '999px',
            border: completed ? '1px solid rgba(148,163,184,0.3)' : '1px solid rgba(204,255,0,0.4)',
            background: completed ? 'transparent' : 'rgba(204,255,0,0.12)',
            color: completed ? '#94a3b8' : 'var(--color-accent)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.25s',
          }}
        >
          {completed ? copy.undo : copy.complete}
        </button>
      </div>
    </div>
  );
}

export function ProgressBar({ moduleId, totalLessons }: { moduleId: string; totalLessons: number }) {
  const [completed, setCompleted] = useState(0);
  const language = currentSiteLanguage();

  const refresh = () => setCompleted(countCompletedLessons(moduleId));

  useEffect(() => {
    refresh();
    window.addEventListener(LESSON_COMPLETED_EVENT, refresh);
    return () => window.removeEventListener(LESSON_COMPLETED_EVENT, refresh);
  }, [moduleId]);

  const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
        <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
          {language === 'en' ? 'Module progress' : 'Progresso modulo'}
        </span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{completed}/{totalLessons} ({pct}%)</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--color-accent), #a3e635, #84cc16)',
          borderRadius: '999px',
          boxShadow: '0 0 12px rgba(204,255,0,0.35)',
          transition: 'width 0.8s ease-out',
        }} />
      </div>
    </div>
  );
}
