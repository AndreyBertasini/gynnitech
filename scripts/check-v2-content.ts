import { promises as fs } from "fs";

const f = "src/content/corso/matematica-analisi-dati/vettori-norme-e-similarita.mdx";
const raw = await fs.readFile(f, "utf-8");

// Check TODO
let idx = raw.indexOf("TODO");
while (idx !== -1) {
    console.log("TODO at", idx, ":", JSON.stringify(raw.slice(Math.max(0, idx - 80), idx + 80)));
    idx = raw.indexOf("TODO", idx + 1);
}

// Check "Questo concetto si applica quando"
idx = raw.indexOf("Questo concetto si applica quando");
while (idx !== -1) {
    console.log("Generic phrase at", idx, ":", JSON.stringify(raw.slice(Math.max(0, idx - 50), idx + 100)));
    idx = raw.indexOf("Questo concetto si applica quando", idx + 1);
}
