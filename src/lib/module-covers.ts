import { MODULE_COVER_IMAGES } from '../data/module-cover-images';

export interface ModuleCoverImage {
  src: string;
}

export function getModuleCoverImage(moduleId: string): ModuleCoverImage | undefined {
  const src = MODULE_COVER_IMAGES[moduleId];
  if (!src) {
    return undefined;
  }

  return { src };
}

export function getModuleCoverAlt(moduleTitle: string): string {
  return `Copertina editoriale del modulo ${moduleTitle}`;
}
