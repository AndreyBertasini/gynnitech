import { describe, expect, test } from "vitest";
import { compile } from "@mdx-js/mdx";
import remarkMath from "remark-math";
import { mdxToAgentMarkdown } from "../src/lib/agent-markdown";

const SAMPLE_MDX = [
  "# Domanda di verifica",
  "",
  "Qual è l'effetto sul tasso netto?",
  "",
  "<details>",
  "<summary>Mostra risposta</summary>",
  "",
  "Il tasso netto scende al 12%.",
  "",
  "</details>",
].join("\n");

describe("details/summary support in MDX and agent markdown", () => {
  test("compiles cleanly with @mdx-js/mdx and remarkMath", async () => {
    const compiled = await compile(SAMPLE_MDX, {
      remarkPlugins: [remarkMath],
      rehypePlugins: [],
      development: false,
    });
    expect(String(compiled)).toContain("Mostra risposta");
  });

  test("mdxToAgentMarkdown strips raw details/summary tags and preserves content", () => {
    const md = mdxToAgentMarkdown(SAMPLE_MDX);
    expect(md).not.toMatch(/<\/?(details|summary)\b/i);
    expect(md).toContain("Mostra risposta");
    expect(md).toContain("Il tasso netto scende al 12%.");
  });

  test("mdxToAgentMarkdown handles CRLF line endings cleanly", () => {
    const crlfSample = SAMPLE_MDX.replace(/\n/g, "\r\n");
    const md = mdxToAgentMarkdown(crlfSample);
    expect(md).not.toMatch(/<\/?(details|summary)\b/i);
    expect(md).toContain("Mostra risposta");
    expect(md).toContain("Il tasso netto scende al 12%.");
  });
});
