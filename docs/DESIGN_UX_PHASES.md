# Design & UX improvement phases (`docs/DESIGN.md` + `.agent` skills)

Roadmap for `app.zyenereviews.com`. Each phase builds on the last. Use `docs/DESIGN.md` as the source of truth for palette, radii, borders, typography roles, and orange restraint.

---

## Phase 1 — Foundation & tokens (v1 shipped in repo)

**Goal:** Align the codebase with the design system at the token and marketing-hero level.

- **Typography:** Syne loaded as `--font-display` (Degular-like marketing hero face); Inter remains default UI via `body` (`src/app/layout.tsx`, `.font-display` in `globals.css`).
- **CSS utilities:** `.font-display` for hero headlines; `.pro-hover`, `.pro-card`, `.cta-button` refactored toward border-first / primary tokens (`globals.css`).
- **Marketing:** Landing `h1` uses `font-display` + `leading-[0.9]` (`src/app/(marketing)/page.tsx`).
- **Footer:** Marketing footer uses explicit `docs/DESIGN.md` hexes so the dark band is correct in light and dark theme (`src/app/(marketing)/layout.tsx`).
- **Motion:** Baseline `prefers-reduced-motion` for `scroll-behavior` on `html` (`globals.css`). Marketing hero uses Framer **`useReducedMotion`** so stagger/float are disabled when the user prefers reduced motion (`(marketing)/page.tsx`).

**Exit criteria:** Landing hero uses display font + tight line-height; primary CTA utility matches orange + 4px radius pattern; footer is a consistent dark band; reduced-motion baseline in place.

**Next (still Phase 1 optional polish):** Editorial accent font (GT Alpina substitute) on one marketing strip; map remaining marketing `h2`/`h3` to a clear type scale.

---

## Phase 2 — Dashboard UX & product surfaces (v1 shipped in repo)

**Goal:** Calm, scannable app UI with clear business context.

- **Scope clarity:** Header shows optional **Scope: {business name}** (md+) and a hint when there are zero businesses; business switcher has an **`aria-label`** for assistive tech (`src/app/(dashboard)/layout.tsx`, `business-switcher.tsx`).
- **States:** Shared **`BusinessContextEmptyState`** + **`TeamMembershipEmptyState`** for all “no business” / “not a member” cases across Integrations, Reviews, Competitors, Review Requests, Analytics, Customers, Q&A, Team, and Business / Public Profile / Notifications settings. **`integrations/loading.tsx`** and **`settings/team/loading.tsx`** added; Reviews/Analytics/Customers/Campaigns already had loading UIs.
- **Density:** Reviews filter bar uses sticky layering + translucent backdrop (`reviews-filters.tsx`) so filters stay readable over scrolling content.
- **Settings:** **`SettingsSectionLabel`** (`settings-section-label.tsx`) for uppercase micro labels on long forms; **Notifications** uses it for Email / Text blocks.

**Exit criteria (v1):** Major dashboard routes use the shared empty state with CTAs (`/businesses/add`, `/businesses`); Analytics no longer returns a bare “No business” string; Team distinguishes “no business” vs “not a member”; Customers no longer hard-redirects to add-business only (user sees the same pattern as other routes).

**Next:** More settings section labels / disclosure where forms are long.

---

## Phase 3 — Component consistency pass (v1 shipped in repo)

**Goal:** One component language across the app.

- **Tabs:** `TabsList variant="line"` uses **docs/DESIGN.md** inset underlines (`#ff4f00` active, `#c5c0b1` hover); horizontal vs vertical orientation scoped in `tabs.tsx`. Migrated: Campaigns, Send Request dialog, Q&A filters, Review Flow Content (settings), **Google lodging panel** (`google-lodging-panel.tsx`).
- **Cards/inputs:** `Card` + `Input` already at **5px** radius; unchanged this pass.
- **Buttons:** Default `Button` radius set to **4px** (`rounded-[4px]`) per primary CTA spec; `lg` remains **8px** (`rounded-lg`).
- **Charts:** Recharts primary series use **`var(--primary)`** instead of hard-coded `#ff4f00` where the accent should track theme tokens (`ratings-chart`, `google-performance-profile-chart`, `zyene-platform-analytics`, competitors bar chart).
- **Fetch errors:** `DashboardFetchError` with **`retryHref`** (server pages) or **`onRetry`** (client). Shown when initial Supabase reads fail on **Dashboard**, **Customers**, **Reviews**, **Analytics**, **Competitors**, **Requests** (`/requests`), **Review Requests** (`/review-requests`), **Questions**, and settings loaders (**Team**, **Billing**, **Notifications**, **Business information** links).

**Exit criteria (v1):** Tab primitive matches inset-underline pattern; key surfaces use `variant="line"`; customers fetch failure is not silent.

**Next:** Pill-style review filters stay as `variant="default"` by design; optional further token sweeps outside Recharts (auth layout hexes, tour CSS).

---

## Phase 4 — Accessibility & motion polish

**Goal:** WCAG-minded behavior and respectful motion.

- **Focus:** Visible focus rings on keyboard navigation; interactive milestone toast action now uses `focus-visible` ring styling.
- **Touch:** Minimum **44px** targets for icon-only controls on mobile — **Notifications** field help tips use `h-11 min-h-11 min-w-11` (`notification-form.tsx`); milestone toast action also enforces `min-h-11`.
- **Motion:** Marketing Framer sections respect reduced motion (see Phase 1); milestone confetti now also respects `useReducedMotion`.
- **Color:** Status and sentiment not conveyed by hue alone (pair with icon/text).

**Exit criteria:** Core reduced-motion + touch target behaviors are implemented for marketing and milestone celebrations; continue periodic keyboard-only spot checks on auth, dashboard shell, and long forms.

---

## How to use `.agent` skills

- **`ui-ux-pro-max`:** Run design-system searches for stack-specific patterns (Next.js, shadcn) when implementing a phase.
- **`find-skills`:** Add community skills (e.g. a11y audits) if you want automated checklists beyond this doc.

---

## Tracking

| Phase | Status                         |
|-------|--------------------------------|
| 1     | v1 done — optional polish left |
| 2     | v1 done — filter bar + settings labels shipped |
| 3     | v1 done — lodging tabs + chart `var(--primary)` sweep |
| 4     | v1 done — reduced motion + touch/focus safeguards in place |
