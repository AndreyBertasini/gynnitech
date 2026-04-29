import type { CourseModule } from "../data/course-program";

export interface ModuleDatasetPack {
    title: string;
    summary: string;
    assets: string[];
    usageNotes: string[];
}

export interface ModuleExerciseLadder {
    base: string;
    intermediate: string;
    researchGrade: string;
}

export interface LessonPracticeKit {
    datasetPack: ModuleDatasetPack;
    exerciseLadder: ModuleExerciseLadder;
}

const phaseDatasetLens: Record<CourseModule["phase"], string> = {
    foundation: "un setup essenziale ma credibile su cui allenare definizioni, tracking e lettura metrica",
    application: "un caso business con segnali di funnel, segmentazione, performance e decisioni di crescita",
    stack: "un flusso dati con raw layer, trasformazioni, contratti e failure mode operativi",
    rigor: "un problema quantitativo in cui query, modelli e assunzioni cambiano davvero il risultato",
    direction: "un set di evidenze che obbliga a collegare analisi, responsabilita economica e qualita del giudizio",
};

const phaseArtifactLens: Record<CourseModule["phase"], string> = {
    foundation: "foglio metrico e canvas di revisione",
    application: "query SQL, notebook e dashboard decisionale",
    stack: "query SQL, specifiche di pipeline e modelli dbt",
    rigor: "query SQL, notebook quantitativo e soluzione guidata",
    direction: "memo decisionale, notebook di supporto e rubric di discussione",
};

export function getModuleDatasetPack(
    module: Pick<CourseModule, "id" | "title" | "objective" | "phase">,
): ModuleDatasetPack {
    return {
        title: `Dataset pack - ${module.title}`,
        summary:
            `Pacchetto di lavoro per ${module.title}: dataset realistico, ${phaseArtifactLens[module.phase]} e soluzioni guidate per allenare il modulo senza restare nel solo piano teorico.`,
        assets: [
            `Dataset principale coerente con ${phaseDatasetLens[module.phase]}.`,
            `Notebook commentato per esplorazione, formalizzazione e checkpoint.`,
            `${phaseArtifactLens[module.phase]} da adattare al proprio contesto.`,
            "Soluzione guidata con checklist, rubric e confronto tra approccio corretto ed errore tipico.",
        ],
        usageNotes: [
            "Parti dal caso base prima di introdurre segmentazioni o complessita extra.",
            "Versiona assunzioni, definizioni e scelte metodologiche mentre lavori.",
            "Usa il pack come base per assignment, caso studio end-to-end e capstone.",
        ],
    };
}

export function getModuleExerciseLadder(
    module: Pick<CourseModule, "title" | "objective" | "phase">,
): ModuleExerciseLadder {
    return {
        base: `Riconosci il problema reale di ${module.title}, chiarisci la decisione da supportare e riscrivi il tema in una forma meno ambigua.`,
        intermediate: `Applica il modello di ${module.title} a un dataset o a un workflow reale, esplicitando input, definizioni, guardrail e output atteso.`,
        researchGrade: `Metti a confronto due formalizzazioni del problema dentro ${module.title}, discuti ipotesi e failure mode, poi difendi una scelta davanti a uno stakeholder critico.`,
    };
}

export function getLessonPracticeKit(
    module: Pick<CourseModule, "id" | "title" | "objective" | "phase">,
    title: string,
    isSupplemental: boolean,
): LessonPracticeKit {
    const datasetPack = getModuleDatasetPack(module);

    return {
        datasetPack,
        exerciseLadder: {
            base:
                `Descrivi un caso in cui "${title}" viene citato senza una decisione chiara alle spalle. Riscrivi il problema in modo operativo e indica quale evidenza minima servirebbe per agire.`,
            intermediate:
                `Usa il dataset pack del modulo per costruire una mini-analisi su "${title}": definizioni, input, criterio di lettura, guardrail e output finale.`,
            researchGrade:
                `${isSupplemental ? "Confronta il core del modulo con questo approfondimento" : `Confronta due modi diversi di trattare "${title}"`} e mostra quali ipotesi cambiano, quali errori emergono e quale formulazione regge meglio davanti a una review rigorosa.`,
        },
    };
}
