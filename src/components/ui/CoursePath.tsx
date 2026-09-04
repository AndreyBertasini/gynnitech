import React, { useEffect, useState } from 'react';
import { Check, Lock, Play, BookOpen } from 'lucide-react';
import { loadLessonProgress, LESSON_COMPLETED_EVENT } from '../../utils/progress';

export interface PathModule {
  id: string;
  title: string;
  href: string;
  icon: string;
  color: string;
  lessonCount: number;
}

export interface PathPhase {
  id: string;
  title: string;
  description: string;
  modules: PathModule[];
}

interface CoursePathProps {
  phases: PathPhase[];
}

type ModuleState = 'completed' | 'active' | 'locked';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Map: BookOpen,
  Database: BookOpen,
  BarChart: BookOpen,
  BrainCircuit: BookOpen,
  Activity: BookOpen,
  Zap: BookOpen,
  LayoutDashboard: BookOpen,
  LineChart: BookOpen,
  Warehouse: BookOpen,
  HardDrive: BookOpen,
  Radio: BookOpen,
  Gauge: BookOpen,
  Server: BookOpen,
  Code2: BookOpen,
  Sigma: BookOpen,
  Hammer: BookOpen,
  FlaskConical: BookOpen,
  Compass: BookOpen,
  Scale: BookOpen,
  Bot: BookOpen,
  Network: BookOpen,
};

export const CoursePath = ({ phases }: CoursePathProps) => {
  const [completedByModule, setCompletedByModule] = useState<Record<string, number>>({});

  useEffect(() => {
    const refresh = () => {
      const progress = loadLessonProgress();
      const counts: Record<string, number> = {};
      Object.values(progress).forEach((entry) => {
        if (entry.completed) {
          counts[entry.moduleId] = (counts[entry.moduleId] || 0) + 1;
        }
      });
      setCompletedByModule(counts);
    };
    refresh();
    window.addEventListener(LESSON_COMPLETED_EVENT, refresh);
    return () => window.removeEventListener(LESSON_COMPLETED_EVENT, refresh);
  }, []);

  // Determina lo stato di ogni modulo nell'ordine globale del percorso
  const allModules = phases.flatMap((phase) => phase.modules);
  const stateOf = (module: PathModule): ModuleState => {
    const done = completedByModule[module.id] || 0;
    if (done >= module.lessonCount) return 'completed';
    const index = allModules.findIndex((m) => m.id === module.id);
    for (let i = 0; i < index; i++) {
      const prev = allModules[i];
      if ((completedByModule[prev.id] || 0) < prev.lessonCount) return 'locked';
    }
    return 'active';
  };

  return (
    <div className="course-path">
      {phases.map((phase, phaseIndex) => (
        <section key={phase.id} className="mb-14 last:mb-0">
          {/* Header fase */}
          <div className="mb-8 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-bold text-[var(--color-accent)]">
              {phaseIndex + 1}
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">{phase.title}</h3>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">{phase.description}</p>
            </div>
          </div>

          {/* Nodi moduli */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-white/10 via-white/15 to-white/10 md:block"
            />
            <div className="relative grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {phase.modules.map((module) => {
                const state = stateOf(module);
                const Icon = ICONS[module.icon] || BookOpen;
                const done = completedByModule[module.id] || 0;
                const locked = state === 'locked';

                return (
                  <div key={module.id} className="flex flex-col items-center text-center">
                    {locked ? (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/10 bg-white/[0.03] opacity-60"
                        title="Completa i moduli precedenti per sbloccare"
                      >
                        <Lock className="h-5 w-5 text-slate-600" />
                      </div>
                    ) : (
                      <a
                        href={module.href}
                        className={`group relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          state === 'completed'
                            ? 'border-[#4ade80] bg-[#4ade80]/15 shadow-[0_0_24px_-6px_rgba(74,222,128,0.6)]'
                            : 'border-[var(--color-accent)] bg-[var(--color-accent)] shadow-[0_0_32px_-6px_rgba(204,255,0,0.7)] scale-105'
                        }`}
                        title={module.title}
                      >
                        {state === 'completed' ? (
                          <Check className="h-6 w-6 text-[#4ade80]" strokeWidth={3} />
                        ) : (
                          <Play className="h-6 w-6 text-black" fill="black" />
                        )}
                        {state === 'active' && (
                          <span className="absolute -inset-2 rounded-full border-2 border-[var(--color-accent)]/30 animate-ping" />
                        )}
                      </a>
                    )}

                    <p className="mt-3 line-clamp-2 text-xs font-semibold leading-snug text-slate-300">
                      {module.title}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {state === 'completed'
                        ? `${module.lessonCount}/${module.lessonCount} lezioni`
                        : `${done}/${module.lessonCount} lezioni`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};
