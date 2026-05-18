import { useEffect, useState } from 'react';
import { ProgressBar } from './ProgressTracker';

interface ModuleInfo {
  id: string;
  title: string;
  icon: string;
  color: string;
  totalLessons: number;
}

interface Props {
  modules: ModuleInfo[];
}

const STORAGE_KEY = 'ginnytech_progress';
const EVENT_KEY = 'ginnytech:lesson-completed';

function countModuleCompleted(moduleId: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const progress = JSON.parse(raw);
    return Object.values(progress).filter(
      (p: any) => p.moduleId === moduleId && p.completed
    ).length;
  } catch {
    return 0;
  }
}

export function ProgressDashboard({ modules }: Props) {
  const [, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    window.addEventListener(EVENT_KEY, refresh);
    return () => window.removeEventListener(EVENT_KEY, refresh);
  }, []);

  const moduleData = modules.map((mod) => ({
    ...mod,
    completed: countModuleCompleted(mod.id),
  }));

  const totalCompleted = moduleData.reduce((s, m) => s + m.completed, 0);
  const totalLessons = modules.reduce((s, m) => s + m.totalLessons, 0);
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div>
      {/* Overall progress */}
      <div
        style={{
          marginBottom: '2.5rem',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(204,255,0,0.15)',
          background: 'rgba(204,255,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
          }}
        >
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
            Progresso totale
          </span>
          <span style={{ color: '#ccff00', fontWeight: 700, fontSize: '1.1rem' }}>
            {totalCompleted}/{totalLessons} ({overallPct}%)
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '0.75rem',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${overallPct}%`,
              background: 'linear-gradient(90deg, #ccff00, #a3e635, #84cc16)',
              borderRadius: '999px',
              boxShadow: '0 0 16px rgba(204,255,0,0.35)',
              transition: 'width 0.8s ease-out',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
              {totalCompleted} completate
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
              {totalLessons - totalCompleted} rimanenti
            </span>
          </div>
        </div>
      </div>

      {/* Per-module breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {moduleData.map((mod) => (
          <a
            key={mod.id}
            href={`/course/${mod.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.25s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(204,255,0,0.2)';
                e.currentTarget.style.background = 'rgba(204,255,0,0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    color: '#e2e8f0',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%',
                  }}
                >
                  {mod.completed === mod.totalLessons && '✅ '}
                  {mod.title}
                </span>
                <span style={{ color: '#ccff00', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {mod.completed}/{mod.totalLessons}
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${mod.totalLessons > 0 ? Math.round((mod.completed / mod.totalLessons) * 100) : 0}%`,
                    background:
                      mod.completed === mod.totalLessons
                        ? '#22c55e'
                        : 'linear-gradient(90deg, #ccff00, #a3e635)',
                    borderRadius: '999px',
                    transition: 'width 0.6s ease-out',
                  }}
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
