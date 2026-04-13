# Design & UX improvement phases (`DESIGN.md` + `.agent` skills)

Roadmap for `app.zyenereviews.com`. Each phase builds on the last. Use `DESIGN.md` as the source of truth for palette, radii, borders, typography roles, and orange restraint.

---

## Phase 1 — Foundation & tokens (v1 shipped in repo)

**Goal:** Align the codebase with the design system at the token and marketing-hero level.

- **Typography:** Syne loaded as `--font-display` (Degular-like marketing hero face); Inter remains default UI via `body` (`src/app/layout.tsx`, `.font-display` in `globals.css`).
- **CSS utilities:** `.font-display` for hero headlines; `.pro-hover`, `.pro-card`, `.cta-button` refactored toward border-first / primary tokens (`globals.css`).
- **Marketing:** Landing `h1` uses `font-display` + `leading-[0.9]` (`src/app/(marketing)/page.tsx`).
- **Footer:** Marketing footer uses explicit `DESIGN.md` hexes so the dark band is correct in light and dark theme (`src/app/(marketing)/layout.tsx`).
- **Motion:** Baseline `prefers-reduced-motion` for `scroll-behavior` on `html` (`globals.css`). Framer Motion respect → Phase 4.

**Exit criteria:** Landing hero uses display font + tight line-height; primary CTA utility matches orange + 4px radius pattern; footer is a consistent dark band; reduced-motion baseline in place.

**Next (still Phase 1 optional polish):** Editorial accent font (GT Alpina substitute) on one marketing strip; map remaining marketing `h2`/`h3` to a clear type scale.

---

## Phase 2 — Dashboard UX & product surfaces

**Goal:** Calm, scannable app UI with clear business context.

- **Scope clarity:** Persistent business context in headers, empty states, and destructive actions.
- **States:** Standardize loading skeletons, empty states, and error states on high-traffic routes (Reviews, Analytics, Integrations, Customers).
- **Density:** Table/filter patterns, sticky toolbars, one primary action per view.
- **Settings:** Progressive disclosure for long forms; section labels (uppercase + tracking) where helpful.

**Exit criteria:** Each major dashboard route has intentional loading/empty/error UI; switching business updates copy and data without confusion.

---

## Phase 3 — Component consistency pass

**Goal:** One component language across the app.

- **Tabs:** Inset underline active/hover pattern everywhere tabs are used.
- **Cards/inputs:** Single radius scale (5px cards/inputs, 4px primary buttons per spec); sand borders over shadows.
- **Buttons:** Primary / secondary / ghost map to `DESIGN.md` padding and hover states.
- **Charts:** Semantic chart tokens; orange only for primary series where appropriate.

**Exit criteria:** UI primitives match `DESIGN.md` tables; audit diff is mostly deletion of one-off classes.

---

## Phase 4 — Accessibility & motion polish

**Goal:** WCAG-minded behavior and respectful motion.

- **Focus:** Visible focus rings on keyboard navigation; focus order in modals and drawers.
- **Touch:** Minimum 44px targets for icon-only controls on mobile.
- **Motion:** `prefers-reduced-motion` for Framer Motion marketing sections; respect for tour/confetti.
- **Color:** Status and sentiment not conveyed by hue alone (pair with icon/text).

**Exit criteria:** Spot-check with keyboard-only navigation on auth, dashboard shell, and one long form; reduced-motion path verified.

---

## How to use `.agent` skills

- **`ui-ux-pro-max`:** Run design-system searches for stack-specific patterns (Next.js, shadcn) when implementing a phase.
- **`find-skills`:** Add community skills (e.g. a11y audits) if you want automated checklists beyond this doc.

---

## Tracking

| Phase | Status                         |
|-------|--------------------------------|
| 1     | v1 done — optional polish left |
| 2     | Planned                        |
| 3     | Planned                        |
| 4     | Planned                        |
