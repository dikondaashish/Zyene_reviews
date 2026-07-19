# Design System Master File — DEPRECATED

> **Deprecated.** Do not use this file for UI work.  
> **Source of truth:** [`docs/DESIGN.md`](../../docs/DESIGN.md) and live tokens in [`src/app/globals.css`](../../src/app/globals.css).  
> This file was an early generator output (purple theme). Tokens below are aligned to the live warm system for archaeology only.

---

**Project:** Zyene Reviews  
**Status:** Deprecated (2026-07-18)  
**Category:** Micro SaaS  

---

## Global Rules (live-aligned tokens)

### Color Palette

| Role | Hex | CSS Variable (conceptual) | Live CSS |
|------|-----|---------------------------|----------|
| Primary / CTA | `#ff4f00` | `--color-primary` / `--cta` | `--primary`, `--cta` in `globals.css` |
| Background | `#fffefb` | `--color-background` | `--background` |
| Text / foreground | follow `docs/DESIGN.md` | `--foreground` | theme tokens in `globals.css` |
| Secondary | muted neutrals | `--secondary` / `--muted` | `globals.css` |

**Color notes:** Warm orange primary (`#ff4f00`) on warm off-white (`#fffefb`). Not purple.

### Typography

- Prefer fonts defined in the app layout / `docs/DESIGN.md` (Syne + Inter in product; not Plus Jakarta Sans from this obsolete generator).
- Do not import Plus Jakarta Sans for new work based on this file.

### Spacing / shadows / components

Legacy spacing and component CSS samples below are **not** authoritative. Use Tailwind + shadcn primitives under `src/components/ui/` and `docs/DESIGN.md`.

---

## Anti-patterns (still valid)

- Complex onboarding flow
- Cluttered layout
- **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- **Layout-shifting hovers** — Avoid scale transforms that shift layout
- **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- **Instant state changes** — Always use transitions (150–300ms)
- **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-delivery checklist

Before delivering any UI code, verify against `docs/DESIGN.md`:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
