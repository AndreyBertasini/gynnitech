import type { ImageMetadata } from 'astro';
import { MODULE_COVER_IMAGES } from '../data/module-cover-images';

const moduleCoverAssets = import.meta.glob('../../images/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, ImageMetadata>;

export function getModuleCoverImage(moduleId: string): ImageMetadata | undefined {
  const filename = MODULE_COVER_IMAGES[moduleId];
  if (!filename) {
    return undefined;
  }

  return Object.entries(moduleCoverAssets).find(([assetPath]) => assetPath.endsWith(`/${filename}`))?.[1];
}

export function getModuleCoverAlt(moduleTitle: string): string {
  return `Copertina editoriale del modulo ${moduleTitle}`;
}
