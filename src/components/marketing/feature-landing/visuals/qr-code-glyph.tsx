/**
 * Decorative QR-style glyph for feature-page mocks. It is not a scannable code:
 * three finder squares plus a deterministic pattern, so mocks never point
 * at a real (or wrong) URL.
 */
const SIZE = 21;

function inFinder(x: number, y: number): { lx: number; ly: number } | null {
  const corners = [[0, 0], [SIZE - 7, 0], [0, SIZE - 7]];
  for (const [cx, cy] of corners) {
    if (x >= cx && x < cx + 7 && y >= cy && y < cy + 7) return { lx: x - cx, ly: y - cy };
  }
  return null;
}

function nearFinder(x: number, y: number): boolean {
  return (x <= 7 && y <= 7) || (x >= SIZE - 8 && y <= 7) || (x <= 7 && y >= SIZE - 8);
}

function isDark(x: number, y: number, seed: number): boolean {
  const finder = inFinder(x, y);
  if (finder) {
    const { lx, ly } = finder;
    const ring = lx === 0 || lx === 6 || ly === 0 || ly === 6;
    const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
    return ring || core;
  }
  if (nearFinder(x, y)) return false;
  let h = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) & 7) < 4;
}

function glyphPath(seed: number): string {
  let d = "";
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (isDark(x, y, seed)) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
}

export function QrGlyph({ seed = 7, className = "" }: { seed?: number; className?: string }) {
  return (
    <svg
      viewBox="-1 -1 23 23"
      className={`vz-qr-glyph ${className}`}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      <rect x="-1" y="-1" width="23" height="23" fill="#fff" />
      <path d={glyphPath(seed)} fill="currentColor" />
    </svg>
  );
}
