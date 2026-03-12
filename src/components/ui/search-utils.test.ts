import { describe, expect, test } from "vitest";

import {
  normalizeSearchText,
  rankSearchResults,
  type SearchResultCandidate,
} from "./search-utils";

describe("normalizeSearchText", () => {
  test("normalizes accents and strips html", () => {
    expect(normalizeSearchText("  Ric\u00e9rca <mark>SQL</mark> ")).toBe("ricerca sql");
  });
});

describe("rankSearchResults", () => {
  test("prefers title matches over excerpt-only matches", () => {
    const candidates: SearchResultCandidate[] = [
      {
        url: "/course/infrastructure-ops/cicd/",
        meta: { title: "CI/CD for Data" },
        excerpt: "Git workflow per dbt e <mark>SQL</mark>.",
        score: 3.1,
      },
      {
        url: "/course/dashboard-visualizzazione/sql-per-analisti/",
        meta: { title: "SQL per Analisti" },
        excerpt: "<mark>SQL</mark> per Analisti. Le query essenziali.",
        score: 2.78,
      },
      {
        url: "/course/advanced-sql/anomalie-pareto-e-segmentazione/",
        meta: { title: "Anomalie, Pareto e Segmentazione con SQL" },
        excerpt: "Outlier e segmentazione con <mark>SQL</mark>.",
        score: 0.63,
      },
    ];

    const ranked = rankSearchResults(candidates, "sql");

    expect(ranked[0]?.url).toBe("/course/dashboard-visualizzazione/sql-per-analisti/");
    expect(ranked[1]?.url).toBe("/course/advanced-sql/anomalie-pareto-e-segmentazione/");
    expect(ranked[2]?.url).toBe("/course/infrastructure-ops/cicd/");
  });

  test("deduplicates repeated urls", () => {
    const candidates: SearchResultCandidate[] = [
      {
        url: "/course/data-collection/introduction/",
        meta: { title: "Introduzione al Tracking" },
        excerpt: "Tracking plan e data collection.",
        score: 1,
      },
      {
        url: "/course/data-collection/introduction/",
        meta: { title: "Introduzione al Tracking" },
        excerpt: "Tracking plan e data collection.",
        score: 0.5,
      },
    ];

    expect(rankSearchResults(candidates, "tracking")).toHaveLength(1);
  });
});
