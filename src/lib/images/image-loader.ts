/**
 * Default loader for next/image. Same `/_next/image` optimizer URLs as the built-in loader,
 * but photos are re-encoded at quality 90 instead of Next's default 75. Our generated
 * photographs are already compressed, so a second lossy pass at 75 visibly softens them.
 * Pass `quality={75}` on an image that should stay small. Keep `images.qualities` in
 * next.config.ts in sync with the values used here.
 */
export const DEFAULT_IMAGE_QUALITY = 90;

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? DEFAULT_IMAGE_QUALITY}`;
}
