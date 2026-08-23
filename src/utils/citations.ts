/**
 * Extracts external citation URLs from a raw markdown body.
 * Matches markdown links `[text](url)` and bare URLs, keeping only
 * http(s) links that point outside the site's own domain.
 */
export function extractCitations(body: string, ownHost: string): string[] {
  if (!body) return [];

  const urls = new Set<string>();
  const linkRegex = /\]\((https?:\/\/[^)\s]+)\)/g;
  const bareRegex = /(?:^|[\s(])(https?:\/\/[^\s)"'<>]+)/g;

  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(body)) !== null) {
    urls.add(match[1]);
  }
  while ((match = bareRegex.exec(body)) !== null) {
    urls.add(match[1]);
  }

  return [...urls].filter((url) => {
    try {
      const host = new URL(url).hostname;
      return host !== ownHost && !host.endsWith(`.${ownHost}`);
    } catch {
      return false;
    }
  });
}
