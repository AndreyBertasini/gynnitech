import { describe, expect, test } from "bun:test";
import { serializeJsonLd } from "./jsonld";

describe("serializeJsonLd", () => {
  test("escapes <, >, and & characters", () => {
    const input = {
      foo: "<script>alert('xss')</script> & more",
    };
    const output = serializeJsonLd(input);
    expect(output).toContain("\\u003c");
    expect(output).toContain("\\u003e");
    expect(output).toContain("\\u0026");
    expect(output).not.toContain("<");
    expect(output).not.toContain(">");
    expect(output).not.toContain("&");
  });

  test("produces valid JSON", () => {
    const input = { foo: "bar" };
    const output = serializeJsonLd(input);
    expect(JSON.parse(output)).toEqual(input);
  });

  test("handles arrays and nested objects", () => {
    const input = { foo: ["<", { bar: ">" }] };
    const output = serializeJsonLd(input);
    expect(output).toContain("\\u003c");
    expect(output).toContain("\\u003e");
    expect(JSON.parse(output)).toEqual(input);
  });

  test("handles undefined input gracefully", () => {
    expect(serializeJsonLd(undefined)).toBe("{}");
    // Functions are also not JSON serializable and return undefined from JSON.stringify
    expect(serializeJsonLd(() => {})).toBe("{}");
  });
});
