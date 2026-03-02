import { describe, expect, test } from "vitest";
import { serializeJsonLd } from "./jsonld";

describe("serializeJsonLd Security Tests", () => {
  test("prevents XSS via </script> tag", () => {
    const maliciousInput = {
      description: "</script><script>alert(1)</script>",
    };
    const output = serializeJsonLd(maliciousInput);

    // Should escape < to \u003c
    expect(output).not.toContain("</script>");
    expect(output).toContain("\\u003c/script\\u003e");
  });

  test("prevents XSS via HTML comment injection <!--", () => {
    const maliciousInput = {
      description: "<!-- malicious comment",
    };
    const output = serializeJsonLd(maliciousInput);

    // Should escape < to \u003c
    expect(output).not.toContain("<!--");
    expect(output).toContain("\\u003c!--");
  });

  test("prevents XSS via HTML comment end -->", () => {
    const maliciousInput = {
      description: "-->",
    };
    const output = serializeJsonLd(maliciousInput);

    // Should escape > to \u003e
    expect(output).not.toContain("-->");
    expect(output).toContain("--\\u003e");
  });

  test("prevents XSS via & character", () => {
    const maliciousInput = {
      description: "search?q=foo&bar=baz",
    };
    const output = serializeJsonLd(maliciousInput);

    // Should escape & to \u0026
    expect(output).not.toContain("&");
    expect(output).toContain("\\u0026");
  });

  test("handles mixed dangerous characters", () => {
    const maliciousInput = {
      description: "<script> & <!--",
    };
    const output = serializeJsonLd(maliciousInput);

    expect(output).toContain("\\u003cscript\\u003e");
    expect(output).toContain("\\u0026");
    expect(output).toContain("\\u003c!--");
  });
});
