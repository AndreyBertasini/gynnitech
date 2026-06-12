import { MODULE_COVER_IMAGES } from '../data/module-cover-images';

export interface ModuleCoverImage {
  src: string;
  width: number;
  height: number;
}

const MODULE_COVER_WIDTH = 900;
const MODULE_COVER_HEIGHT = 382;

export function getModuleCoverImage(moduleId: string): ModuleCoverImage | undefined {
  const src = MODULE_COVER_IMAGES[moduleId];
  if (!src) {
    return undefined;
  }

  return { src, width: MODULE_COVER_WIDTH, height: MODULE_COVER_HEIGHT };
}

export function getModuleCoverAlt(moduleTitle: string): string {
  return `Copertina editoriale del modulo ${moduleTitle}`;
}
