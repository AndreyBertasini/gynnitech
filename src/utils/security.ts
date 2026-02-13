/**
 * Serializes an object to a JSON string safe for embedding in HTML.
 * Escapes characters that could be used to break out of a script tag.
 */
export function serializeJsonLd(data: unknown): string {
  const json = JSON.stringify(data);
  if (typeof json !== "string") {
    return "{}";
  }
  return json.replace(
    /[<>&]/g,
    (char) =>
      ({
        "<": "\\u003c",
        ">": "\\u003e",
        "&": "\\u0026",
      }[char] || char)
  );
}
