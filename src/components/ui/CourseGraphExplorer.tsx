import React, { startTransition, useDeferredValue, useEffect, useState } from 'react';
import clsx from 'clsx';
import { BookOpen, GitBranch, MoveRight, Search, Sparkles, Waypoints } from 'lucide-react';
import type { CourseGraphData, CourseGraphLesson, CourseGraphModule } from '../../lib/course-graph';

interface CourseGraphExplorerProps {
  graph: CourseGraphData;
  title?: string;
  description?: string;
}

interface AutomaticRoute {
  id: string;
  title: string;
  description: string;
  moduleIds: string[];
}

const normalize = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const lessonHref = (lessonId: string): string => `/course/${lessonId}/`;
const moduleHref = (moduleId: string): string => `/course/${moduleId}/`;

const labelDifficulty = (value?: string): string | undefined => {
  if (!value) return undefined;

  const normalized = value.toLowerCase();
  if (normalized === 'beginner' || normalized === 'base') return 'Base';
  if (normalized === 'intermediate' || normalized === 'intermedio') return 'Intermedio';
  if (normalized === 'advanced' || normalized === 'avanzato') return 'Avanzato';
  return value;
};

const uniq = <T,>(values: T[]): T[] => Array.from(new Set(values));

const sliceNames = (values: string[], limit = 3): string[] => values.slice(0, limit);

const buildAutomaticRoutes = (graph: CourseGraphData): AutomaticRoute[] => {
  const stageIds = graph.stages.map((stage) => stage.id);
  const routes: AutomaticRoute[] = [];

  const pushRoute = (id: string, title: string, description: string, includedStageIds: string[]) => {
    const moduleIds = graph.stages
      .filter((stage) => includedStageIds.includes(stage.id))
      .flatMap((stage) => stage.moduleIds);

    if (moduleIds.length === 0) return;

    routes.push({ id, title, description, moduleIds });
  };

  if (stageIds[0]) {
    pushRoute(
      'start',
      'Partenza guidata',
      'Per chi vuole entrare nel corso in modo ordinato, costruendo prima basi, lessico e metodo.',
      [stageIds[0]],
    );
  }

  if (stageIds[0] && stageIds[1]) {
    pushRoute(
      'business',
      'Da zero a decisioni business',
      'Unisce fondazione e applicazione per arrivare piu rapidamente a prodotto, marketing e dashboard.',
      [stageIds[0], stageIds[1]],
    );
  }

  if (stageIds[0] && stageIds[2] && stageIds[3]) {
    pushRoute(
      'stack',
      'Dati e stack tecnico',
      'Per chi vuole andare da tracking e pipeline fino a warehousing, realtime, SQL e analytics engineering.',
      [stageIds[0], stageIds[2], stageIds[3]],
    );
  }

  if (stageIds[0] && stageIds[3]) {
    pushRoute(
      'rigor',
      'Rigore e sperimentazione',
      'Per chi vuole concentrarsi su matematica, SQL, testing, causalita e lettura critica dei risultati.',
      uniq([stageIds[0], stageIds[3], stageIds[4]].filter(Boolean) as string[]),
    );
  }

  return routes;
};

const sumLessons = (moduleIds: string[], modulesById: Record<string, CourseGraphModule>): number =>
  moduleIds.reduce((total, moduleId) => total + (modulesById[moduleId]?.lessonCount || 0), 0);

const topModuleNamesFromLessons = (
  lessonIds: string[],
  lessonsById: Record<string, CourseGraphLesson>,
  modulesById: Record<string, CourseGraphModule>,
): string[] => {
  return uniq(
    lessonIds
      .map((lessonId) => lessonsById[lessonId]?.moduleId)
      .filter((moduleId): moduleId is string => Boolean(moduleId))
      .map((moduleId) => modulesById[moduleId]?.title || moduleId),
  );
};

export const CourseGraphExplorer = ({ graph, title, description }: CourseGraphExplorerProps) => {
  const modulesById = Object.fromEntries(graph.modules.map((module) => [module.id, module])) as Record<string, CourseGraphModule>;
  const lessonsById = Object.fromEntries(graph.lessons.map((lesson) => [lesson.id, lesson])) as Record<string, CourseGraphLesson>;
  const automaticRoutes = buildAutomaticRoutes(graph);

  const [activeStageId, setActiveStageId] = useState<string>('all');
  const [activeRouteId, setActiveRouteId] = useState<string>('all');
  const [selectedModuleId, setSelectedModuleId] = useState(graph.modules[0]?.id ?? '');
  const [query, setQuery] = useState('');

  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalize(deferredQuery.trim());
  const activeRoute = automaticRoutes.find((route) => route.id === activeRouteId);

  const filteredModules = graph.modules.filter((module) => {
    if (activeRoute && !activeRoute.moduleIds.includes(module.id)) return false;
    if (activeStageId !== 'all' && module.stageId !== activeStageId) return false;
    if (!normalizedQuery) return true;
    return normalize([module.title, module.description, module.stageTitle].join(' ')).includes(normalizedQuery);
  });

  useEffect(() => {
    if (filteredModules.length === 0) return;
    if (!filteredModules.some((module) => module.id === selectedModuleId)) {
      setSelectedModuleId(filteredModules[0].id);
    }
  }, [filteredModules, selectedModuleId]);

  const selectedModule =
    filteredModules.find((module) => module.id === selectedModuleId) ||
    graph.modules.find((module) => module.id === selectedModuleId) ||
    filteredModules[0] ||
    graph.modules[0];

  const selectedModuleIncoming = graph.moduleEdges
    .filter((edge) => edge.target === selectedModule?.id)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const selectedModuleOutgoing = graph.moduleEdges
    .filter((edge) => edge.source === selectedModule?.id)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const bridgeLessons = (selectedModule?.lessons || [])
    .filter((lesson) => lesson.externalPrerequisites.length > 0 || lesson.externalDependents.length > 0)
    .sort(
      (a, b) =>
        b.externalPrerequisites.length +
          b.externalDependents.length -
          (a.externalPrerequisites.length + a.externalDependents.length) || a.order - b.order,
    )
    .slice(0, 6);

  const densestLessons = [...(selectedModule?.lessons || [])]
    .sort((a, b) => b.prerequisites.length - a.prerequisites.length || a.order - b.order)
    .slice(0, 6);

  return (
    <section className="space-y-10">
      <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(0,243,255,0.12),_transparent_35%),linear-gradient(180deg,rgba(13,18,28,0.98),rgba(6,8,14,0.98))] p-6 shadow-[0_32px_90px_-54px_rgba(0,243,255,0.4)] md:p-8 xl:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              <Waypoints className="h-3.5 w-3.5" />
              Learning Path Dinamico
            </div>
            <h1 className="max-w-4xl font-heading text-4xl font-bold tracking-tight text-white md:text-5xl xl:text-6xl">
              {title || 'Mappa del corso, moduli e lezioni collegati in automatico'}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
              {description ||
                'La pagina si rigenera dai contenuti reali del corso: ordine dei moduli, lezioni, prerequisiti e collegamenti vengono ricostruiti ogni volta che aggiorni il catalogo.'}
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Moduli</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">derivati da `src/data/course-modules.ts`</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Lezioni</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">lette da `src/content/corso/*/*.mdx`</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Mappa</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">conteggi e dipendenze ricalcolati automaticamente</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Moduli', graph.stats.totalModules],
              ['Lezioni', graph.stats.totalLessons],
              ['Link interni', graph.stats.internalLinks],
              ['Link tra moduli', graph.stats.crossModuleLinks],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Vista di insieme</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Le fasi del corso</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            La mappa principale e stata semplificata per essere leggibile anche su mobile: mostra le grandi fasi del corso
            e i passaggi tra loro, invece di comprimere tutto in un canvas troppo denso.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          {graph.stages.map((stage, index) => (
            <article key={stage.id} className="rounded-[28px] border border-white/10 bg-[#0b1017]/90 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Fase {index + 1}
                </span>
                <span className="text-xs text-accent">{stage.crossStageOutgoingCount} out</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{stage.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{stage.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Moduli</p>
                  <p className="mt-1 text-white">{stage.moduleCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Lezioni</p>
                  <p className="mt-1 text-white">{stage.lessonCount}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {sliceNames(stage.moduleIds.map((moduleId) => modulesById[moduleId]?.title || moduleId)).map((name) => (
                  <span key={name} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                    {name}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Percorsi automatici</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Entrate rapide nel catalogo</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {automaticRoutes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => {
                startTransition(() => {
                  setActiveRouteId(route.id);
                  setActiveStageId('all');
                  setSelectedModuleId(route.moduleIds[0]);
                });
              }}
              className={clsx(
                'rounded-[28px] border p-5 text-left transition',
                activeRouteId === route.id
                  ? 'border-accent/40 bg-accent/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]',
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Percorso</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{route.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{route.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                <span>{route.moduleIds.length} moduli</span>
                <span>{sumLessons(route.moduleIds, modulesById)} lezioni</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#0b1017]/90 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Esplora il corso</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Moduli e lezioni, in modo leggibile</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            Cerca, filtra per fase o entra da un percorso automatico. La selezione qui sotto resta aggiornata quando cambi
            moduli, lezioni o prerequisiti nel catalogo.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca un modulo"
                className="w-full rounded-2xl border border-white/10 bg-[#070b10] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveStageId('all');
                  setActiveRouteId('all');
                }}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  activeStageId === 'all' && activeRouteId === 'all'
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white',
                )}
              >
                Tutti
              </button>
              {graph.stages.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    setActiveStageId(stage.id);
                    setActiveRouteId('all');
                    if (stage.moduleIds[0]) setSelectedModuleId(stage.moduleIds[0]);
                  }}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    activeStageId === stage.id
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white',
                  )}
                >
                  {stage.title}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setSelectedModuleId(module.id)}
                    className={clsx(
                      'w-full rounded-[24px] border p-4 text-left transition',
                      selectedModule?.id === module.id
                        ? 'border-accent/40 bg-accent/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]',
                    )}
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Modulo {module.index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{module.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{module.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>{module.lessonCount} lezioni</span>
                      <span>{module.stageTitle}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                  Nessun modulo corrisponde al filtro attivo.
                </div>
              )}
            </div>
          </aside>

          {selectedModule && (
            <div className="space-y-6">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                      Modulo attivo · {selectedModule.stageTitle}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold text-white">{selectedModule.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{selectedModule.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a href={moduleHref(selectedModule.id)} className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:border-accent/40 hover:bg-accent/15">
                      Apri modulo
                      <MoveRight className="h-4 w-4" />
                    </a>
                    {selectedModule.lessons[0] && (
                      <a href={lessonHref(selectedModule.lessons[0].id)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20">
                        Prima lezione
                        <MoveRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Lezioni', selectedModule.lessonCount],
                    ['Link interni', selectedModule.internalLinkCount],
                    ['Ingressi esterni', selectedModule.crossModuleIncomingCount],
                    ['Uscite esterne', selectedModule.crossModuleOutgoingCount],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_340px]">
                <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-accent" />
                    <div>
                      <h4 className="text-2xl font-semibold text-white">Lezioni del modulo</h4>
                      <p className="text-sm text-slate-400">Ordine reale, prerequisiti e punti di ponte verso il resto del corso.</p>
                    </div>
                  </div>

                  <div className="relative space-y-4 pl-5 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-gradient-to-b before:from-accent/40 before:via-white/10 before:to-transparent">
                    {selectedModule.lessons.map((lesson) => (
                      <article key={lesson.id} className="relative rounded-[24px] border border-white/10 bg-[#0a0f15] p-5">
                        <span className="absolute -left-[1.62rem] top-6 flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-[#09121d] text-[11px] font-semibold text-accent">
                          {lesson.order}
                        </span>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-3xl">
                            <h5 className="text-xl font-semibold text-white">{lesson.title}</h5>
                            <p className="mt-2 text-sm leading-7 text-slate-300">{lesson.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{lesson.category}</span>
                            {lesson.duration && <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{lesson.duration}</span>}
                            {labelDifficulty(lesson.difficulty) && <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{labelDifficulty(lesson.difficulty)}</span>}
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Prerequisiti</p>
                            <p className="mt-1 text-white">{lesson.prerequisites.length}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Ingressi esterni</p>
                            <p className="mt-1 text-white">{lesson.externalPrerequisites.length}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Lezioni sbloccate</p>
                            <p className="mt-1 text-white">{lesson.dependents.length}</p>
                          </div>
                        </div>
                        <a href={lessonHref(lesson.id)} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:text-accent/80">
                          Apri la lezione
                          <MoveRight className="h-4 w-4" />
                        </a>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="space-y-6">
                  <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <GitBranch className="h-5 w-5 text-accent" />
                      <div>
                        <h4 className="text-xl font-semibold text-white">Connessioni del modulo</h4>
                        <p className="text-sm text-slate-400">Da dove arriva e dove porta.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Arriva da</p>
                        {selectedModuleIncoming.length > 0 ? selectedModuleIncoming.map((edge) => (
                          <button key={`${edge.source}-${edge.target}`} type="button" onClick={() => setSelectedModuleId(edge.source)} className="mb-2 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-accent/30 hover:bg-accent/10">
                            <span className="text-sm text-white">{modulesById[edge.source]?.title || edge.source}</span>
                            <span className="text-xs text-accent">{edge.count}</span>
                          </button>
                        )) : <p className="text-sm text-slate-400">Nessun ponte esterno rilevante in ingresso.</p>}
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Porta verso</p>
                        {selectedModuleOutgoing.length > 0 ? selectedModuleOutgoing.map((edge) => (
                          <button key={`${edge.source}-${edge.target}`} type="button" onClick={() => setSelectedModuleId(edge.target)} className="mb-2 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-accent/30 hover:bg-accent/10">
                            <span className="text-sm text-white">{modulesById[edge.target]?.title || edge.target}</span>
                            <span className="text-xs text-accent">{edge.count}</span>
                          </button>
                        )) : <p className="text-sm text-slate-400">Questo modulo lavora soprattutto al suo interno.</p>}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-accent" />
                      <div>
                        <h4 className="text-xl font-semibold text-white">Lezioni ponte</h4>
                        <p className="text-sm text-slate-400">Lezioni che collegano questo modulo al resto del corso.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {bridgeLessons.length > 0 ? bridgeLessons.map((lesson) => (
                        <a key={lesson.id} href={lessonHref(lesson.id)} className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-accent/30 hover:bg-accent/10">
                          <p className="text-sm font-semibold text-white">{lesson.title}</p>
                          <p className="mt-2 text-xs leading-6 text-slate-400">
                            richiama {topModuleNamesFromLessons(lesson.externalPrerequisites, lessonsById, modulesById).join(', ') || 'nessun modulo esterno'}
                          </p>
                        </a>
                      )) : <p className="text-sm text-slate-400">Non ci sono lezioni ponte particolarmente forti in questo modulo.</p>}
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <h4 className="text-xl font-semibold text-white">Nodi piu densi</h4>
                    <p className="mt-2 text-sm text-slate-400">Le lezioni con piu prerequisiti o maggiore effetto sul resto del modulo.</p>
                    <div className="mt-4 space-y-3">
                      {densestLessons.map((lesson) => (
                        <a key={lesson.id} href={lessonHref(lesson.id)} className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-accent/30 hover:bg-accent/10">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">{lesson.title}</p>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">{lesson.prerequisites.length} prereq</span>
                          </div>
                          <p className="mt-2 text-xs leading-6 text-slate-400">
                            sblocca {lesson.dependents.length} lezioni · {lesson.externalDependents.length} fuori modulo
                          </p>
                        </a>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};
