/**
 * Decorative grid background for the marketing hero.
 * YC-company style (Linear / Vercel): SVG dot-grid with line grid,
 * radial mask fade, and warm primary glow.
 *
 * Uses --hero-grid-line / --hero-grid-dot / --hero-grid-glow tokens
 * defined in globals.css (separate :root and .dark values).
 * Server Component - zero client JS.
 */
export function HeroGridBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* ── Layer 1: SVG Line Grid (48 px cells) ──────────────────── */}
      <svg
        className="absolute inset-0 h-full w-full"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 42%, black 20%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 42%, black 20%, transparent 72%)",
        }}
      >
        <defs>
          <pattern
            id="hero-line-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="var(--hero-grid-line)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-line-grid)" />
      </svg>

      {/* ── Layer 2: SVG Dot Grid at intersections ────────────────── */}
      <svg
        className="absolute inset-0 h-full w-full"
        style={{
          maskImage:
            "radial-gradient(ellipse 72% 58% at 50% 42%, black 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 58% at 50% 42%, black 25%, transparent 75%)",
        }}
      >
        <defs>
          <pattern
            id="hero-dot-grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="0" cy="0" r="1.2" fill="var(--hero-grid-dot)" />
            <circle cx="48" cy="0" r="1.2" fill="var(--hero-grid-dot)" />
            <circle cx="0" cy="48" r="1.2" fill="var(--hero-grid-dot)" />
            <circle cx="48" cy="48" r="1.2" fill="var(--hero-grid-dot)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dot-grid)" />
      </svg>

      {/* ── Layer 3: Warm primary glow ────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 50% 35% at 50% 0%, var(--hero-grid-glow), transparent)",
            "radial-gradient(ellipse 35% 40% at 20% 55%, var(--hero-grid-glow), transparent)",
            "radial-gradient(ellipse 30% 35% at 82% 30%, var(--hero-grid-glow), transparent)",
          ].join(", "),
        }}
      />
    </div>
  );
}
