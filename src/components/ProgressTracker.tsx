import { useEffect, useState } from 'react';
import { currentSiteLanguage } from '../utils/language';

interface LessonProgress {
  moduleId: string;
  slug: string;
  completed: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'ginnytech_progress';
const COMPLETION_EVENT = 'ginnytech:lesson-completed';

function loadProgress(): Record<string, LessonProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, LessonProgress>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getKey(moduleId: string, slug: string): string {
  return `${moduleId}/${slug}`;
}

export function markLessonCompleted(moduleId: string, slug: string): void {
  const progress = loadProgress();
  const key = getKey(moduleId, slug);
  progress[key] = { moduleId, slug, completed: true, timestamp: Date.now() };
  saveProgress(progress);
  window.dispatchEvent(new CustomEvent(COMPLETION_EVENT, { detail: { moduleId, slug } }));
}

export function isLessonCompleted(moduleId: string, slug: string): boolean {
  return !!loadProgress()[getKey(moduleId, slug)]?.completed;
}

function countCompleted(moduleId: string): number {
  return Object.values(loadProgress()).filter((progress) => progress.moduleId === moduleId && progress.completed).length;
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
      const progress = loadProgress();
      delete progress[getKey(moduleId, slug)];
      saveProgress(progress);
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

  const refresh = () => setCompleted(countCompleted(moduleId));

  useEffect(() => {
    refresh();
    window.addEventListener(COMPLETION_EVENT, refresh);
    return () => window.removeEventListener(COMPLETION_EVENT, refresh);
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
