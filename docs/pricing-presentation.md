# Pricing presentation

## Scope and existing behavior

The pricing page already selected monthly/yearly plans from `PLAN_MAP` through a
single React state value. Prices, reference prices, and feature allowances remain
in `src/services/stripe/plan-catalog.ts`. That catalog and billing services were
not changed.

The existing card links use the supplied `signupUrl` for paid plans and `/demo`
for Enterprise. They had no card-specific analytics handlers or additional query
parameters. The links still use those destinations unchanged. Regression tests
also cover supplied referral, campaign, and next-page parameters.

## Presentation

- `pricing-presentation.ts` derives display equivalents from catalog amounts.
- `PricingPriceDisplay` is shared by the pricing cards and homepage pricing teaser.
- Monthly cards show muted reference prices, readable actual monthly charges, and
  dominant daily amounts: “Less than $1/day” and “Less than $2/day.”
- Starter's reference is $49.99. Professional's existing catalog reference is
  $89.99; no new reference price was invented.
- Annual cards show $25/month or $50/month as equivalents, the exact $299.99 or
  $599.99 annual charge, and dominant $0.82/day or $1.64/day equivalents.
- Daily equivalents use a 30-day month or 365-day year, explained below the cards.
- Enterprise retains conversational pricing and all existing features.
- Professional uses the existing orange brand color with a restrained badge,
  border, and background. Primary button labels remain white.

## Accessibility and layout verification

- Native radios retain a fieldset/legend, arrow-key operation, checked state,
  a visible checkmark, and a visible keyboard focus outline.
- Plan headings label their articles; real charges remain in the visible DOM.
  Reference/current labels clarify monthly billing for screen readers.
- Price changes use a 180ms opacity transition. Reduced-motion emulation confirmed
  no price animation and a zero-duration toggle transition.
- Monthly and yearly states were checked at 320, 375, 390, 430, 768, 1440, and
  1920px. Pricing text/CTAs fit at every width, and all feature lists are retained.
- Card top positions, heights, and CTA positions changed by 0px when toggling at
  each tested width. Desktop card heights and CTA positions align across plans.
- Daily amounts render at 62–80px versus 18px monthly amounts and 14px references.
- The homepage pricing teaser was additionally inspected at 320px.
- Browser checks reported no console errors on the pricing page.

## Automated checks

- `pnpm verify:fast`: passed TypeScript and file-size checks.
- ESLint on the changed pricing files: passed.
- Full existing suite plus pricing presentation tests: 1,178 tests passed.
- Targeted presentation/routing suite after adding link regressions: 12 passed.
- React Doctor on the six affected UI components: 100/100, no findings.
- Pricing metadata and existing offer schema remain unchanged.
