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

  describe("security", () => {
    test("prevents script tag injection", () => {
      const input = {
        title: "</script><script>alert('xss')</script>"
      };
      const output = serializeJsonLd(input);
      expect(output).toContain("\\u003c/script\\u003e");
      expect(output).not.toContain("</script>");
    });

    test("prevents HTML comment injection", () => {
      const input = {
        comment: "<!-- malicious comment -->"
      };
      const output = serializeJsonLd(input);
      expect(output).toContain("\\u003c!--");
      expect(output).toContain("--\\u003e");
      expect(output).not.toContain("<!--");
      expect(output).not.toContain("-->");
    });

    test("prevents CDATA injection", () => {
      const input = {
        cdata: "<![CDATA[ malicious data ]]>"
      };
      const output = serializeJsonLd(input);
      expect(output).toContain("\\u003c![CDATA[");
      expect(output).toContain("]]\\u003e");
      expect(output).not.toContain("<![CDATA[");
      expect(output).not.toContain("]]>");
    });
  });
