export function isMobile(): boolean {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 600;
}

export const BASE_STAGE_WIDTH = 800;
export const BASE_STAGE_HEIGHT = 400;

export function getContentScale(scene: { scale?: { width?: number; height?: number } }): number {
  const width = scene.scale?.width ?? BASE_STAGE_WIDTH;
  const height = scene.scale?.height ?? BASE_STAGE_HEIGHT;
  const scale = Math.min(width / BASE_STAGE_WIDTH, height / BASE_STAGE_HEIGHT) * 1.35;
  return Math.max(1.15, Math.min(scale, 3.2));
}

export function getTextScale(scene: { scale?: { width?: number; height?: number } }): number {
  const width = scene.scale?.width ?? BASE_STAGE_WIDTH;
  const height = scene.scale?.height ?? BASE_STAGE_HEIGHT;
  const scale = Math.min(width / BASE_STAGE_WIDTH, height / BASE_STAGE_HEIGHT) * 1.05;
  return Math.max(1, Math.min(scale, 1.7));
}
