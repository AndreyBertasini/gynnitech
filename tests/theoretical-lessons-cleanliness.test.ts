import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const lessonsWithoutFencedBlocks = [
    "src/content/corso/data-collection/jtbd.mdx",
    "src/content/corso/data-collection/terminology.mdx",
    "src/content/corso/data-collection/framework.mdx",
    "src/content/corso/gestione-data-driven/framework-jtbd.mdx",
    "src/content/corso/gestione-data-driven/okr-e-kpi.mdx",
    "src/content/corso/analisi-marketing/costruire-brand-forte.mdx",
    "src/content/corso/analisi-marketing/customer-journey-mapping.mdx",
    "src/content/corso/analisi-marketing/efficacia-brand.mdx",
    "src/content/corso/analisi-marketing/performance-marketing.mdx",
    "src/content/corso/dashboard-visualizzazione/storytelling-dati.mdx",
    "src/content/corso/direzioni-analitica/indice-direzioni-analitica.mdx",
    "src/content/corso/metriche-fondamenti/approccio-analitico.mdx",
    "src/content/corso/metriche-fondamenti/generazione-idee.mdx",
    "src/content/corso/metriche-fondamenti/ricerca-desk.mdx",
    "src/content/corso/analisi-prodotto/product-market-fit.mdx",
    "src/content/corso/marketing-data-science/pmf.mdx",
    "src/content/corso/marketing-data-science/strategy.mdx",
    "src/content/corso/marketing-data-science/unit-economics.mdx",
    "src/content/corso/marketing-data-science/user-centricity.mdx",
];

describe("Theoretical lessons cleanliness", () => {
    test.each(lessonsWithoutFencedBlocks)(
        "%s should not contain fenced blocks",
        (relativePath) => {
            const filePath = path.resolve(relativePath);
            const content = readFileSync(filePath, "utf8");

            expect(content).not.toMatch(/```/);
        },
    );
});
