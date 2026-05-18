import { useEffect, useState } from 'react';

interface Props {
  moduleId: string;
  title: string;
  description: string;
  lessonCount: number;
  difficulty?: string;
  icon?: string;
}

const ICON_MAP: Record<string, string> = {
  Map: '🗺️', Database: '🗄️', Activity: '📊', GitMerge: '🔀',
  Zap: '⚡', BrainCircuit: '🧠', Server: '🖥️', FlaskConical: '🧪',
  BarChart: '📈', HardDrive: '💾', Radio: '📡', LayoutDashboard: '📋',
  BookOpen: '📖', Workflow: '🔄', ChartNoAxesColumn: '📉',
};

export function ModuleSummary({ moduleId, title, description, lessonCount, difficulty, icon }: Props) {
  const emoji = ICON_MAP[icon || ''] || '📚';

  return (
    <div
      style={{
        border: '1px solid rgba(204,255,0,0.12)',
        borderRadius: '16px',
        background: 'rgba(204,255,0,0.025)',
        padding: '1.5rem 1.75rem',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{emoji}</span>
        <div>
          <h3 style={{ color: '#ccff00', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
            Cosa imparerai in questo modulo
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '0 0 0.75rem', lineHeight: 1.55 }}>
            {description}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 500,
            }}>
              📚 {lessonCount} lezioni
            </span>
            {difficulty && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 500,
              }}>
                🎯 {difficulty}
              </span>
            )}
            <a
              href={`/course/${moduleId}`}
              style={{
                color: '#ccff00', fontSize: '0.78rem', fontWeight: 600,
                textDecoration: 'none', marginLeft: 'auto',
              }}
            >
              Vai al modulo →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
