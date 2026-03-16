import React, { startTransition, useDeferredValue, useEffect, useState } from 'react';
import clsx from 'clsx';
import { ArrowRightLeft, GitBranch, MoveRight, Search, Sparkles, Waypoints } from 'lucide-react';
import type { CourseGraphData, CourseGraphLesson, CourseGraphModule } from '../../lib/course-graph';

interface CourseGraphExplorerProps {
  graph: CourseGraphData;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MODULE_W = 220;
const MODULE_H = 112;
const MODULE_STAGE_W = 248;
const MODULE_STAGE_GAP = 24;
const MODULE_ROW_GAP = 24;
const MODULE_PAD = 28;
const MODULE_HEAD_H = 84;

const LESSON_W = 224;
const LESSON_H = 116;
const LESSON_PAD = 24;
const LESSON_COL_GAP = 28;
const LESSON_ROW_GAP = 28;

const normalize = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const labelDifficulty = (value?: string): string | undefined => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'beginner' || normalized === 'base') return 'Base';
  if (normalized === 'advanced' || normalized === 'avanzato') return 'Avanzato';
  if (normalized === 'intermediate' || normalized === 'intermedio') return 'Intermedio';
  return value;
};

const lessonHref = (lessonId: string): string => `/course/${lessonId}/`;
const moduleHref = (moduleId: string): string => `/course/${moduleId}/`;

const horizontalCurve = (source: Box, target: Box): string => {
  const startX = source.x + source.width;
  const startY = source.y + source.height / 2;
  const endX = target.x;
  const endY = target.y + target.height / 2;
  const direction = endX >= startX ? 1 : -1;
  const offset = Math.max(70, Math.abs(endX - startX) * 0.38);
  return `M ${startX} ${startY} C ${startX + offset * direction} ${startY}, ${endX - offset * direction} ${endY}, ${endX} ${endY}`;
};

const verticalCurve = (source: Box, target: Box): string => {
  const startX = source.x + source.width / 2;
  const startY = source.y + source.height;
  const endX = target.x + target.width / 2;
  const endY = target.y;
  const offset = Math.max(44, Math.abs(endY - startY) * 0.35);
  return `M ${startX} ${startY} C ${startX} ${startY + offset}, ${endX} ${endY - offset}, ${endX} ${endY}`;
};

const moduleLayout = (graph: CourseGraphData) => {
  const positions: Record<string, Box> = {};
  const maxRows = Math.max(...graph.stages.map((stage) => stage.moduleIds.length), 1);

  graph.stages.forEach((stage, stageIndex) => {
    const stageX = MODULE_PAD + stageIndex * (MODULE_STAGE_W + MODULE_STAGE_GAP);
    stage.moduleIds.forEach((moduleId, rowIndex) => {
      positions[moduleId] = {
        x: stageX + (MODULE_STAGE_W - MODULE_W) / 2,
        y: MODULE_HEAD_H + MODULE_PAD + rowIndex * (MODULE_H + MODULE_ROW_GAP),
        width: MODULE_W,
        height: MODULE_H,
      };
    });
  });

  return {
    positions,
    width: MODULE_PAD * 2 + graph.stages.length * MODULE_STAGE_W + (graph.stages.length - 1) * MODULE_STAGE_GAP,
    height: MODULE_HEAD_H + MODULE_PAD * 2 + maxRows * MODULE_H + (maxRows - 1) * MODULE_ROW_GAP,
  };
};

const lessonLayout = (lessons: CourseGraphLesson[]) => {
  const columns = lessons.length > 16 ? 4 : lessons.length > 8 ? 3 : 2;
  const positions: Record<string, Box> = {};

  lessons.forEach((lesson, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    positions[lesson.id] = {
      x: LESSON_PAD + column * (LESSON_W + LESSON_COL_GAP),
      y: LESSON_PAD + row * (LESSON_H + LESSON_ROW_GAP),
      width: LESSON_W,
      height: LESSON_H,
    };
  });

  const rows = Math.max(1, Math.ceil(lessons.length / columns));
  return {
    positions,
    width: LESSON_PAD * 2 + columns * LESSON_W + (columns - 1) * LESSON_COL_GAP,
    height: LESSON_PAD * 2 + rows * LESSON_H + (rows - 1) * LESSON_ROW_GAP,
  };
};

export const CourseGraphExplorer = ({ graph }: CourseGraphExplorerProps) => {
  const [selectedModuleId, setSelectedModuleId] = useState(graph.modules[0]?.id ?? '');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(graph.modules[0]?.lessons[0]?.id ?? null);
  const [query, setQuery] = useState('');

  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalize(deferredQuery.trim());
  const modulesById = Object.fromEntries(graph.modules.map((module) => [module.id, module])) as Record<string, CourseGraphModule>;
  const lessonsById = Object.fromEntries(graph.lessons.map((lesson) => [lesson.id, lesson])) as Record<string, CourseGraphLesson>;
  const selectedModule = modulesById[selectedModuleId] ?? graph.modules[0];
  const selectedLesson =
    selectedLessonId && lessonsById[selectedLessonId]?.moduleId === selectedModule?.id
      ? lessonsById[selectedLessonId]
      : selectedModule?.lessons[0] ?? null;

  useEffect(() => {
    if (!selectedModule) return;
    if (!selectedLesson || selectedLesson.moduleId !== selectedModule.id) {
      setSelectedLessonId(selectedModule.lessons[0]?.id ?? null);
    }
  }, [selectedLesson, selectedModule]);

  const selectModule = (moduleId: string, lessonId?: string) => {
    startTransition(() => {
      setSelectedModuleId(moduleId);
      setSelectedLessonId(lessonId ?? modulesById[moduleId]?.lessons[0]?.id ?? null);
    });
  };

  const searchResults = normalizedQuery
    ? graph.lessons
        .filter((lesson) =>
          normalize([lesson.title, lesson.description, lesson.moduleTitle, lesson.category].join(' ')).includes(normalizedQuery),
        )
        .slice(0, 8)
    : [];

  const moduleBoard = moduleLayout(graph);
  const lessonBoard = lessonLayout(selectedModule?.lessons ?? []);
  const incoming = graph.moduleEdges.filter((edge) => edge.target === selectedModule?.id).sort((a, b) => b.count - a.count).slice(0, 5);
  const outgoing = graph.moduleEdges.filter((edge) => edge.source === selectedModule?.id).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <section
      id="course-graph-explorer"
      className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(0,243,255,0.12),_transparent_35%),linear-gradient(180deg,rgba(14,18,26,0.98),rgba(5,8,14,0.96))] p-5 shadow-[0_32px_80px_-48px_rgba(0,243,255,0.4)] md:p-8"
    >
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neon-blue/20 bg-neon-blue/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-neon-blue">
            <Waypoints className="h-3.5 w-3.5" />
            Mappa Relazionale
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
            Moduli, lezioni e dipendenze reali del corso
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            Questa vista nasce dal catalogo MDX: le curve seguono i prerequisiti dichiarati nelle lezioni, quindi la mappa resta sempre sincronizzata con il corso.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Moduli', graph.stats.totalModules],
            ['Lezioni', graph.stats.totalLessons],
            ['Link Interni', graph.stats.internalLinks],
            ['Link Tra Moduli', graph.stats.crossModuleLinks],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca una lezione o un modulo"
                className="w-full rounded-2xl border border-white/10 bg-[#090d13] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-neon-blue/40 focus:ring-2 focus:ring-neon-blue/20"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {graph.stages.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => selectModule(stage.moduleIds[0])}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    selectedModule?.stageId === stage.id
                      ? 'border-neon-blue/40 bg-neon-blue/10 text-neon-blue'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white',
                  )}
                >
                  {stage.title}
                </button>
              ))}
            </div>

            {normalizedQuery && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#090d13]/80 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">Risultati per "{query.trim()}"</p>
                  <p className="text-xs text-slate-500">{searchResults.length} mostrati</p>
                </div>
                <div className="grid gap-2">
                  {searchResults.length > 0 ? (
                    searchResults.map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => selectModule(lesson.moduleId, lesson.id)}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-neon-blue/40 hover:bg-neon-blue/10"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{lesson.title}</p>
                          <p className="mt-1 text-xs text-slate-400">{lesson.moduleTitle} - {lesson.category}</p>
                        </div>
                        <MoveRight className="h-4 w-4 text-neon-blue" />
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Nessuna lezione corrisponde alla ricerca.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neon-mint">Visione di Insieme</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Connessioni tra moduli</h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-400">
                Le curve mostrano solo i richiami tra moduli diversi. Il numero indica quante lezioni del modulo di arrivo dipendono da quello di partenza.
              </p>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="relative" style={{ width: `${moduleBoard.width}px`, height: `${moduleBoard.height}px` }}>
                {graph.stages.map((stage, stageIndex) => {
                  const stageX = MODULE_PAD + stageIndex * (MODULE_STAGE_W + MODULE_STAGE_GAP);
                  return (
                    <div
                      key={stage.id}
                      className={clsx(
                        'absolute inset-y-0 rounded-[28px] border',
                        selectedModule?.stageId === stage.id ? 'border-neon-blue/20 bg-neon-blue/[0.05]' : 'border-white/5 bg-white/[0.02]',
                      )}
                      style={{ left: `${stageX}px`, width: `${MODULE_STAGE_W}px` }}
                    >
                      <div className="px-5 pt-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{stage.title}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}

                <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                  {graph.moduleEdges.map((edge) => {
                    const source = moduleBoard.positions[edge.source];
                    const target = moduleBoard.positions[edge.target];
                    if (!source || !target) return null;
                    const active = selectedModule?.id === edge.source || selectedModule?.id === edge.target;
                    const midX = (source.x + source.width + target.x) / 2;
                    const midY = (source.y + source.height / 2 + target.y + target.height / 2) / 2;
                    return (
                      <g key={`${edge.source}-${edge.target}`}>
                        <path
                          d={horizontalCurve(source, target)}
                          fill="none"
                          stroke={active ? 'rgba(0,243,255,0.66)' : 'rgba(148,163,184,0.18)'}
                          strokeWidth={active ? 2.4 : 1.4}
                          strokeDasharray={active ? undefined : '7 9'}
                        />
                        <g transform={`translate(${midX}, ${midY - 10})`}>
                          <rect x={-11} y={-10} width={22} height={18} rx={9} fill="rgba(9,13,19,0.92)" stroke={active ? 'rgba(0,243,255,0.28)' : 'rgba(148,163,184,0.16)'} />
                          <text textAnchor="middle" dominantBaseline="middle" fill={active ? '#9ffcf3' : '#94a3b8'} fontSize="10" fontWeight="700">
                            {edge.count}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {graph.modules.map((module) => {
                  const position = moduleBoard.positions[module.id];
                  if (!position) return null;
                  const queryMatch = normalizedQuery && normalize([module.title, module.description].join(' ')).includes(normalizedQuery);
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => selectModule(module.id)}
                      className={clsx(
                        'absolute overflow-hidden rounded-[24px] border text-left transition',
                        selectedModule?.id === module.id
                          ? 'border-neon-blue/40 bg-[#0a1320] shadow-[0_20px_40px_-24px_rgba(0,243,255,0.55)]'
                          : 'border-white/10 bg-[#090d13]/90 hover:border-white/20 hover:bg-[#0d121a]',
                        queryMatch && 'ring-2 ring-acid-yellow/50 ring-offset-2 ring-offset-[#09111b]',
                      )}
                      style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${position.width}px`, height: `${position.height}px` }}
                    >
                      <div className={clsx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', module.color)} />
                      <div className="flex h-full flex-col justify-between p-4">
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">M{module.index + 1}</span>
                          <span className="text-[11px] text-slate-500">{module.stageTitle}</span>
                        </div>
                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-white">{module.title}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{module.lessonCount} lezioni</span>
                          <span>{module.crossModuleOutgoingCount} -&gt; {module.crossModuleIncomingCount}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedModule && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-acid-yellow">
                    Focus Modulo {selectedModule.index + 1}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{selectedModule.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{selectedModule.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                    {selectedModule.lessonCount} lezioni
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                    {selectedModule.internalLinkCount} link interni
                  </span>
                  <a
                    href={moduleHref(selectedModule.id)}
                    className="rounded-full border border-neon-blue/20 bg-neon-blue/10 px-3 py-1.5 text-xs text-neon-blue transition hover:border-neon-blue/40 hover:bg-neon-blue/15"
                  >
                    Apri modulo
                  </a>
                </div>
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-acid-yellow" />
                Clicca una lezione per vedere requisiti e dipendenze.
              </div>

              <div className="overflow-x-auto pb-2">
                <div
                  className="relative rounded-[28px] border border-white/5 bg-[#070b10]/80"
                  style={{ width: `${lessonBoard.width}px`, minHeight: `${lessonBoard.height}px` }}
                >
                  <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                    {selectedModule.lessons.flatMap((lesson) =>
                      lesson.internalPrerequisites.map((prerequisiteId) => {
                        const source = lessonBoard.positions[prerequisiteId];
                        const target = lessonBoard.positions[lesson.id];
                        if (!source || !target) return [];
                        const active = selectedLesson?.id === lesson.id || selectedLesson?.id === prerequisiteId;
                        return (
                          <path
                            key={`${prerequisiteId}-${lesson.id}`}
                            d={verticalCurve(source, target)}
                            fill="none"
                            stroke={active ? 'rgba(204,255,0,0.72)' : 'rgba(148,163,184,0.16)'}
                            strokeWidth={active ? 2.5 : 1.35}
                            strokeDasharray={active ? undefined : '6 9'}
                          />
                        );
                      }),
                    )}
                  </svg>

                  {selectedModule.lessons.map((lesson) => {
                    const position = lessonBoard.positions[lesson.id];
                    const connected =
                      selectedLesson?.internalPrerequisites.includes(lesson.id) ||
                      selectedLesson?.internalDependents.includes(lesson.id);
                    const active = selectedLesson?.id === lesson.id;
                    const queryMatch =
                      normalizedQuery && normalize([lesson.title, lesson.description, lesson.category].join(' ')).includes(normalizedQuery);
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={clsx(
                          'absolute overflow-hidden rounded-[24px] border text-left transition',
                          active
                            ? 'border-acid-yellow/50 bg-[#11170c] shadow-[0_24px_48px_-28px_rgba(204,255,0,0.45)]'
                            : connected
                              ? 'border-neon-blue/30 bg-[#0d1219]'
                              : 'border-white/10 bg-[#090d13]/88 hover:border-white/20 hover:bg-[#0d1219]',
                          queryMatch && 'ring-2 ring-neon-blue/50 ring-offset-2 ring-offset-[#070b10]',
                        )}
                        style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${position.width}px`, height: `${position.height}px` }}
                      >
                        <div className="flex h-full flex-col p-4">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                              {lesson.order}
                            </span>
                            {lesson.duration && <span className="text-[11px] text-slate-500">{lesson.duration}</span>}
                          </div>
                          <p className="line-clamp-2 text-sm font-semibold leading-6 text-white">{lesson.title}</p>
                          <p className="mt-2 line-clamp-1 text-xs text-slate-400">{lesson.category}</p>
                          <div className="mt-auto flex items-center justify-between pt-4 text-[11px] text-slate-400">
                            <span>{lesson.prerequisites.length} prerequisiti</span>
                            <span>{lesson.externalPrerequisites.length} esterni</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          {selectedModule && (
            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neon-mint">Modulo Attivo</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{selectedModule.title}</h3>
                </div>
                <GitBranch className="h-5 w-5 text-neon-mint" />
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Legami in uscita</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{selectedModule.crossModuleOutgoingCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Legami in ingresso</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{selectedModule.crossModuleIncomingCount}</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Arriva da</p>
                  {incoming.length > 0 ? (
                    <div className="space-y-2">
                      {incoming.map((edge) => (
                        <button
                          key={`${edge.source}-${edge.target}`}
                          type="button"
                          onClick={() => selectModule(edge.source)}
                          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-neon-blue/30 hover:bg-neon-blue/10"
                        >
                          <span className="text-sm text-white">{modulesById[edge.source]?.title ?? edge.source}</span>
                          <span className="text-xs text-neon-blue">{edge.count}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Questo modulo usa soprattutto connessioni interne.</p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Porta verso</p>
                  {outgoing.length > 0 ? (
                    <div className="space-y-2">
                      {outgoing.map((edge) => (
                        <button
                          key={`${edge.source}-${edge.target}`}
                          type="button"
                          onClick={() => selectModule(edge.target)}
                          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-neon-blue/30 hover:bg-neon-blue/10"
                        >
                          <span className="text-sm text-white">{modulesById[edge.target]?.title ?? edge.target}</span>
                          <span className="text-xs text-neon-blue">{edge.count}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Non emergono dipendenze forti verso altri moduli.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {selectedLesson && (
            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-acid-yellow">Lezione Attiva</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{selectedLesson.title}</h3>
                </div>
                <ArrowRightLeft className="h-5 w-5 text-acid-yellow" />
              </div>

              <p className="text-sm leading-7 text-slate-300">{selectedLesson.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                  {selectedLesson.category}
                </span>
                {selectedLesson.duration && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                    {selectedLesson.duration}
                  </span>
                )}
                {labelDifficulty(selectedLesson.difficulty) && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                    {labelDifficulty(selectedLesson.difficulty)}
                  </span>
                )}
              </div>

              <a
                href={lessonHref(selectedLesson.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-neon-blue/20 bg-neon-blue/10 px-4 py-2 text-sm font-medium text-neon-blue transition hover:border-neon-blue/40 hover:bg-neon-blue/15"
              >
                Apri la lezione
                <MoveRight className="h-4 w-4" />
              </a>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prerequisiti interni</p>
                  {selectedLesson.internalPrerequisites.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedLesson.internalPrerequisites.map((lessonId) => (
                        <button
                          key={lessonId}
                          type="button"
                          onClick={() => setSelectedLessonId(lessonId)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:border-acid-yellow/40 hover:text-white"
                        >
                          {lessonsById[lessonId]?.title ?? lessonId}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Nessun prerequisito interno esplicito.</p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prerequisiti esterni</p>
                  {selectedLesson.externalPrerequisites.length > 0 ? (
                    <div className="space-y-2">
                      {selectedLesson.externalPrerequisites.map((lessonId) => (
                        <a
                          key={lessonId}
                          href={lessonHref(lessonId)}
                          className="block rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition hover:border-neon-blue/30 hover:bg-neon-blue/10"
                        >
                          {lessonsById[lessonId]?.title ?? lessonId}
                          <span className="mt-1 block text-xs text-slate-500">
                            {modulesById[lessonId.split('/')[0]]?.title ?? lessonId.split('/')[0]}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Questa lezione non richiama moduli esterni.</p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sblocca</p>
                  {selectedLesson.dependents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedLesson.dependents.slice(0, 8).map((lessonId) => {
                        const dependent = lessonsById[lessonId];
                        const internal = dependent?.moduleId === selectedModule?.id;
                        return internal ? (
                          <button
                            key={lessonId}
                            type="button"
                            onClick={() => setSelectedLessonId(lessonId)}
                            className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-slate-200 transition hover:border-acid-yellow/40 hover:bg-acid-yellow/10"
                          >
                            {dependent?.title ?? lessonId}
                            <span className="mt-1 block text-xs text-slate-500">Nel modulo corrente</span>
                          </button>
                        ) : (
                          <a
                            key={lessonId}
                            href={lessonHref(lessonId)}
                            className="block rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition hover:border-neon-blue/30 hover:bg-neon-blue/10"
                          >
                            {dependent?.title ?? lessonId}
                            <span className="mt-1 block text-xs text-slate-500">
                              {modulesById[lessonId.split('/')[0]]?.title ?? lessonId.split('/')[0]}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Non risultano lezioni successive collegate in modo esplicito.</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </aside>
      </div>
    </section>
  );
};
