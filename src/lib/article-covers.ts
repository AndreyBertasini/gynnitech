export function getArticleCoverPath(slug: string, customImage?: string): string {
  return customImage || `/article-covers/${slug}.svg`;
}

export function getArticleCoverAlt(title: string): string {
  return `Copertina articolo: ${title}`;
}
