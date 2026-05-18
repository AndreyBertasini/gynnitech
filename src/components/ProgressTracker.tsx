import { useEffect, useState } from 'react';

// ---- Storage ----

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
  } catch { return {}; }
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
  return Object.values(loadProgress()).filter(p => p.moduleId === moduleId && p.completed).length;
}

// ---- Completion Button ----

export function CompletionButton({ moduleId, slug }: { moduleId: string; slug: string }) {
  const [completed, setCompleted] = useState(false);

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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>{completed ? '✅' : '⬜'}</span>
          <span style={{
            color: completed ? '#ccff00' : '#94a3b8',
            fontSize: '0.95rem', fontWeight: 500,
          }}>
            {completed ? 'Lezione completata!' : 'Segna come completata'}
          </span>
        </div>
        <button
          onClick={toggle}
          style={{
            padding: '0.6rem 1.4rem', borderRadius: '999px',
            border: completed ? '1px solid rgba(148,163,184,0.3)' : '1px solid rgba(204,255,0,0.4)',
            background: completed ? 'transparent' : 'rgba(204,255,0,0.12)',
            color: completed ? '#94a3b8' : '#ccff00',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s',
          }}
        >
          {completed ? 'Annulla' : 'Completata ✓'}
        </button>
      </div>
    </div>
  );
}

// ---- Progress Bar (reads from localStorage) ----

export function ProgressBar({ moduleId, totalLessons }: { moduleId: string; totalLessons: number }) {
  const [completed, setCompleted] = useState(0);

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
        <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Progresso modulo</span>
        <span style={{ color: '#ccff00', fontWeight: 600 }}>{completed}/{totalLessons} ({pct}%)</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, #ccff00, #a3e635, #84cc16)',
          borderRadius: '999px', boxShadow: '0 0 12px rgba(204,255,0,0.35)',
          transition: 'width 0.8s ease-out',
        }} />
      </div>
    </div>
  );
}
