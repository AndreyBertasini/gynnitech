import React, { useEffect, useState } from 'react';
import { Check, Lock, Play, Clock, GraduationCap } from 'lucide-react';
import {
  isLessonCompleted,
  LESSON_COMPLETED_EVENT,
  loadLessonProgress,
} from '../../utils/progress';

export interface PathLesson {
  id: string; // "module/slug"
  title: string;
  href: string;
  duration?: string;
  difficulty?: string;
}

interface LessonPathProps {
  moduleId: string;
  lessons: PathLesson[];
}

type NodeState = 'completed' | 'active' | 'locked';

const DIFFICULTY_COLOR: Record<string, string> = {
  Base: '#38bdf8',
  Intermedio: '#a78bfa',
  Avanzato: '#f472b6',
};

export const LessonPath = ({ moduleId, lessons }: LessonPathProps) => {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const progress = loadLessonProgress();
      const done = new Set<string>();
      let firstIncomplete = lessons.length;
      lessons.forEach((lesson, index) => {
        const slug = lesson.id.split('/')[1] ?? lesson.id;
        if (isLessonCompleted(moduleId, slug, progress)) {
          done.add(lesson.id);
        } else if (firstIncomplete === lessons.length) {
          firstIncomplete = index;
        }
      });
      setCompleted(done);
      setCurrentIndex(firstIncomplete);
    };
    refresh();
    window.addEventListener(LESSON_COMPLETED_EVENT, refresh);
    return () => window.removeEventListener(LESSON_COMPLETED_EVENT, refresh);
  }, [moduleId, lessons]);

  const stateOf = (index: number): NodeState => {
    if (completed.has(lessons[index].id)) return 'completed';
    if (index === currentIndex) return 'active';
    return 'locked';
  };

  const nodeLabel = (state: NodeState): string => {
    if (state === 'completed') return 'Lezione completata';
    if (state === 'active') return 'Lezione disponibile';
    return 'Completa le lezioni precedenti per sbloccare';
  };

  return (
    <div className="lesson-path" data-module={moduleId}>
      {/* Header percorso */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <GraduationCap className="h-5 w-5 text-[var(--color-accent)]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Percorso del modulo</p>
            <p className="text-xs text-slate-500">
              {completed.size}/{lessons.length} lezioni completate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#4ade80]" /> Completata
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[var(--color-accent)]" /> Disponibile
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-white/10" /> Bloccata
          </span>
        </div>
      </div>

      {/* Percorso a nodi */}
      <div className="relative">
        {/* Linea centrale */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-white/15 via-white/10 to-transparent"
        />

        <ol className="space-y-6">
          {lessons.map((lesson, index) => {
            const state = stateOf(index);
            const isLeft = index % 2 === 0;
            const locked = state === 'locked';

            return (
              <li key={lesson.id} className="relative">
                <div
                  className={`grid items-center gap-4 sm:gap-6 ${
                    isLeft
                      ? 'sm:grid-cols-[1fr_auto_1fr]'
                      : 'sm:grid-cols-[1fr_auto_1fr]'
                  }`}
                >
                  {/* Card lezione (lato alternato) */}
                  <div
                    className={`order-2 sm:order-none ${
                      isLeft ? 'sm:col-start-1 sm:text-right' : 'sm:col-start-3'
                    }`}
                  >
                    {locked ? (
                      <div className="inline-block w-full max-w-md rounded-2xl border border-white/5 bg-white/[0.02] p-5 opacity-50 sm:max-w-none">
                        <p className="text-sm font-semibold text-slate-400">{lesson.title}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          {lesson.duration ? `${lesson.duration} · ` : ''}
                          {lesson.difficulty ?? ''}
                        </p>
                      </div>
                    ) : (
                      <a
                        href={lesson.href}
                        className="group inline-block w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0e14]/80 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_30px_-10px_rgba(204,255,0,0.25)] sm:max-w-none"
                      >
                        <p className="text-sm font-semibold text-white transition-colors group-hover:text-[var(--color-accent)]">
                          {lesson.title}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          {lesson.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {lesson.duration}
                            </span>
                          )}
                          {lesson.difficulty && (
                            <span
                              className="rounded-md px-1.5 py-0.5 font-medium"
                              style={{
                                color: DIFFICULTY_COLOR[lesson.difficulty] ?? '#94a3b8',
                                background: `${DIFFICULTY_COLOR[lesson.difficulty] ?? '#94a3b8'}1a`,
                              }}
                            >
                              {lesson.difficulty}
                            </span>
                          )}
                        </p>
                      </a>
                    )}
                  </div>

                  {/* Nodo */}
                  <div className="order-1 flex justify-center sm:col-start-2">
                    <div
                      className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        state === 'completed'
                          ? 'border-[#4ade80] bg-[#4ade80]/15 shadow-[0_0_24px_-6px_rgba(74,222,128,0.6)]'
                          : state === 'active'
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] shadow-[0_0_32px_-6px_rgba(204,255,0,0.7)] scale-110'
                            : 'border-white/10 bg-white/[0.04]'
                      }`}
                      title={nodeLabel(state)}
                    >
                      {state === 'completed' ? (
                        <Check className="h-6 w-6 text-[#4ade80]" strokeWidth={3} />
                      ) : state === 'active' ? (
                        <Play className="h-6 w-6 text-black" fill="black" />
                      ) : (
                        <Lock className="h-5 w-5 text-slate-600" />
                      )}
                      {state === 'active' && (
                        <span className="absolute -inset-2 rounded-full border-2 border-[var(--color-accent)]/30 animate-ping" />
                      )}
                    </div>
                  </div>

                  {/* Spazio vuoto lato opposto */}
                  <div
                    className={`hidden sm:block ${
                      isLeft ? 'sm:col-start-3' : 'sm:col-start-1'
                    }`}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
