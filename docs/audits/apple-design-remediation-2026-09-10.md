# Apple-design remediation — Zyene Reviews

This follows the [September 10 product review](./apple-design-review-2026-09-10.md). All 16 findings received an implementation in the working tree. The C1 primary-color adjustment was subsequently reverted at the product owner’s request to retain the original orange. This is an implementation record, not a claim that every authenticated screen or external integration has been exercised live. Nothing has been deployed by this task.

## Changes by finding

| Finding | Implementation | Evidence |
|---|---|---|
| C1 — Contrast | Original `#ff4f00` action color restored in both themes at the product owner’s request. Automatic foreground selection for custom review-flow colors and readable guide copy remain; primary normal-text contrast is still open. | Contrast unit tests; desktop homepage and mobile guide inspection. |
| C2 — Ratings | Named rating actions, announced selection, visible focus, responsive star targets, and an explicit keyboard-operable slider Continue action. | Source review and TypeScript. Public business-specific variants still need live acceptance testing. |
| C3 — Dialog focus | Radix modal with generated title/description associations, Escape dismissal and focus restoration. | Browser confirmed reverse-Tab stays inside, Escape dismisses, and focus returns to the guide trigger. |
| C4 — Form semantics | Password controls, private feedback, CSV mapping, role selection, review composition and campaign choices have names/selected states. | Source review and React checks. |
| C5 — Review widget | Manual scrolling and previous/next controls replace autoplay and duplicated reviews; full review text stays readable. | Source review and TypeScript. |
| C6 — Organization switching | Compact dashboard header retains a named organization control. | Source review; authenticated mobile acceptance remains. |
| H1 — Campaign audience | Selected IDs survive campaign creation and queueing, are resolved within the authorized business, and exclude opted-out/unreachable customers. Queue errors retain the saved campaign for retry. | Client response/retry tests, audience isolation tests and mocked API tests. |
| H2 — Bulk results | HTTP/application failures produce errors; sent/failed/skipped counts are real; unsent selections remain available. | Bulk response tests and server result review. |
| H3 — Stale analytics | Loading/error status names the displayed range/platform; exports are disabled during mismatched/loading/error states and use the displayed data filters. | Source review and TypeScript. |
| H4 — Public AI replies | Publishing scope, threshold and tone remain visible; enabling requires an explicit dialog explaining automatic public Google posting. | Source review and React checks. No public replies were posted. |
| H5 — Profile preview | Compact screens have an explicit preview toggle and visible sharing; desktop keeps the side-by-side editor. | Source review and TypeScript. |
| M1 — Mobile docs | Browse menu uses the same navigation groups, current-page state and keyboard menu behavior as desktop navigation. | Browser selected Quickstart through the 390 px menu; docs fit 320 px without horizontal overflow. |
| M2 — Dashboard hierarchy | Daily review attention and recent feedback move ahead of deeper reporting; sharing QR is a disclosure; quieter cards and clearer primary actions. | Source review and React checks. |
| M3 — Product language | Internal phase labels in empty states and refresh actions become business-facing instructions. | Source review. |
| D1 — Design system | Replaced the mismatched design document with Zyene colors, typography, spacing, content hierarchy, component and motion guidance. | `docs/DESIGN.md` matches implementation tokens. |
| D2 — Timed interruption | Removed automatic timed opening. The guide is an inline opt-in offer; compact modal prioritizes questions over artwork. | Browser inspected homepage and opt-in modal. |

The illustrative brand strip now explicitly says the brands are examples, not customers or endorsements; the corresponding existing test passes.

## Verification

- Full Vitest suite: **163 files, 1,236 tests passed**.
- `pnpm verify:fast`: TypeScript and file-size ratchet passed (29 grandfathered files; no growth violations).
- React Doctor: **89/100**, no reported issues in the changed-file scan.
- `git diff --check`: passed.
- Browser: desktop homepage at 1280 px; final guide at 390 px fits with the complete question step visible and no console errors; keyboard focus containment, dismissal and return; signup visibility toggle announces its selected state; documentation at 390 and 320 px, including successful Quickstart navigation. Temporary viewport overrides were reset.
- Production build: webpack compilation and its TypeScript stage passed. Completion of page-data/static generation remains unverified because local workers repeatedly stalled on ordinary dependency-file reads; the stalled build was stopped after more than 15 minutes. A clean Turbopack development preview rendered the changed public screens successfully. Diagnostic sampling found a synchronous filesystem read, not a reported application compilation error.

## Acceptance still needed

Use a controlled authenticated business to exercise campaign queueing/retry, organization switching, stale analytics/export recovery, AI settings, profile preview, and all public rating/widget variants across light/dark themes. Unit/API tests mock external services; they do not prove live SMS/email delivery or Google publication. No customer sends, billing actions, or public AI replies were performed.

“Save campaign only” intentionally saves the campaign configuration without persisting the current customer selection. The review step explains this; launching with the selection queues its eligible audience. Durable draft audiences would require a separate persistence change.
