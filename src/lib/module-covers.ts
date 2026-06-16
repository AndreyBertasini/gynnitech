import { MODULE_COVER_IMAGES } from '../data/module-cover-images';

export interface ModuleCoverImage {
  src: string;
  width: number;
  height: number;
}

const MODULE_COVER_WIDTH = 900;
const MODULE_COVER_HEIGHT = 382;

const MODULE_COVER_DIMENSIONS: Record<string, Pick<ModuleCoverImage, 'width' | 'height'>> = {
  'ai-data-workflows': { width: 1600, height: 900 },
  'agentic-ai-data-workflows': { width: 1600, height: 900 },
};

export function getModuleCoverImage(moduleId: string): ModuleCoverImage | undefined {
  const src = MODULE_COVER_IMAGES[moduleId];
  if (!src) {
    return undefined;
  }

  const dimensions = MODULE_COVER_DIMENSIONS[moduleId] ?? {
    width: MODULE_COVER_WIDTH,
    height: MODULE_COVER_HEIGHT,
  };

  return { src, ...dimensions };
}

export function getModuleCoverAlt(moduleTitle: string): string {
  return `Copertina editoriale del modulo ${moduleTitle}`;
}
