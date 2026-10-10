# Verified cleanup execution — October 10, 2026

This records the cleanup authorized after independently checking the supplied
report against commit `7d45ba755ebccde5c6c10b274761645bff9d82be`.
The [claim-by-claim verification](REPO_CLEANUP_VERIFICATION_2026-10-10.md)
explains evidence and corrections. The [exact manifest](REPO_CLEANUP_MANIFEST_2026-10-10.json)
records every deleted path, original byte size, and archived document.
The [previous August report](archive/2026-08/DEEP_CODEBASE_AUDIT_REPORT.md)
is historical evidence, not current usage data.

## Executed changes

| Category | Files deleted | Original bytes |
|---|---:|---:|
| Unused source modules and non-routed/unmatched copies | 35 | 64,332 |
| Unreferenced public assets | 20 | 8,614,331 |
| Legacy blog JPEGs with existing WebP replacements | 22 | 9,628,142 |
| Retired one-off size-class codemod | 1 | 2,398 |
| Historical screenshots and obsolete machine usage snapshots | 25 | 5,392,810 |
| **Total** | **103** | **23,702,013** |

These are gross bytes removed from the current tree, before small additions.
They are not measured download, clone, deployment or CDN savings. Old Git blobs
remain recoverable; no history rewrite was performed. Fifteen dated documents
were moved into archive directories, which improves organization but saves no
checkout bytes. The prior deep-audit report was also preserved there.

The source batch includes the 25 named candidates and ten ` 2` copies. Seven
copies were byte-identical; three obsolete API copies differed and were checked
against their active routes/history before deletion. Their logic was not merged
back. The custom animated-number/pro-chart-container files were project additions,
not upstream shadcn primitives. Next.js convention files and live loading states stay.
The growth blueprint scans marketing directories dynamically; its regression test
checks behavior after the unused feature section was removed.

Twenty-two specific permanent redirects in `next.config.ts` preserve the old blog
JPEG URLs and lead to existing WebP images. Live JPEG covers remain. No wildcard
redirect rewrites arbitrary JPEGs. Other removed public assets had no tracked
application consumer; external traffic/logs were unavailable, so external use is
not certified absent. Restore a needed source asset from the baseline commit if
an external consumer is identified.

Historical design screenshots were removed from the checkout with a recovery
note in the evidence directory. Source plans, ledgers and SEO datasets remain.
Copies of the removed screenshots and machine snapshots were retained privately
outside the repository. Old screenshots do not certify today's rendered pages.

## Corrections and protected files

- `public/Main logo.png` is live through its encoded URL; it stays.
- Approved mascot masters, brand references, verification tokens, NFC photos,
  referenced blog covers and the live overview PDF stay.
- Tested security scripts and active security/support handoffs stay. Manual
  invocation is valid usage; package/CI absence is not proof of obsolescence.
- The shared marketing MIT notice stays because AnimatedBackground remains live.
- `docs/INDEX.md` is a discovery index, not a deletion allowlist. It now includes
  active support, security, planning and operator references previously missing.
- Stale MASTER design tokens were replaced with a pointer to DESIGN/PRODUCT.
- [Operator scripts](OPERATOR_SCRIPTS.md) now documents purpose, environment and
  side effects. Paid/live vendor tools were inspected, not run as ordinary tests.
- Dated plans with unfinished work remain active; superseded presentation/audit
  snapshots carry historical notices and updated relative links in the archive.

## Growth authentication repair

The login API now delegates to a bounded, strict Zod service. Malformed JSON,
null/array bodies and non-string/empty/oversized passwords return 400; wrong
passwords return 401; a disabled dashboard returns 503. Failures issue no cookie.
Unexpected session creation failures return a structured 500 and a server log.

Sessions have signed issuance/expiry timestamps and a random nonce. Verification
enforces a seven-day lifetime for both cookie access and bearer replay. Tampering,
future-issued and legacy non-expiring tokens are rejected. Rotating
`GROWTH_DASHBOARD_SECRET` invalidates existing sessions and the old raw secret.
Existing operators must sign in again after rollout. Cookies remain HttpOnly,
SameSite=Strict, and Secure in production. Success responses are no-store.

Raw secret bearer authorization remains supported for existing automation. There
is no per-session revocation registry or individual operator identity. The shared
API limiter remains, including its Redis-outage fail-open behavior; this change
does not claim to add a dedicated login limiter. See [growth operations](GROWTH_OPERATIONS.md).

## Administration and remaining owner work

Source inspection found no global tenant CRUD/impersonation console. It did find
implemented developer-labelled `owner`/`ORG_OWNER` support memberships, provisioning
triggers, backfill, organization opt-outs and audit events. Tenant permissions
also include viewer/ORG_EMPLOYEE normalization. Do not infer production grants
or deployed trigger status from migration files alone.

| Work | Owner / evidence required | Tracking |
|---|---|---|
| Attest current support access | Platform owner: correct Zyene project, migration/trigger state, support identities, active grants, opt-outs, MFA/recovery and audit visibility | [Developer access](developer-role-2026-09-30.md) |
| Reconcile recorded security follow-up | Platform owner: fresh deployment attestation, provider/heartbeat rotations and independent recovery before DB upgrade; dated statements need rechecking | [Security follow-up](SECURITY-FOLLOW-UP-2026-09-30.md) |
| Finish GEO distribution/proof/measurement | Growth owner: real QA outcomes, posts, profiles, customer permission and weekly numbers; no fake completion | [GEO closeout](GEO_CLOSEOUT_STATUS.md) and [owner checklist](GEO_OWNER_FINAL_CHECKLIST.md) |
| Reconcile AEO/SEO/workspace plans | Product owner: compare outstanding checklists to current implementation and measured acceptance before retiring plans | [AEO release plan](GOOGLE_SEO_AEO_RELEASE_PLAN.md), [SEO growth](SEO_GROWTH_PLAN_2026-09-29.md), [Reviews workspace](REVIEWS_WORKSPACE_IMPLEMENTATION_PLAN.md) |
| Triage existing static diagnostics | Engineering owner: investigate remaining React Doctor hypotheses against behavior and regression tests; compiler opt-outs and historical SQL are not all confirmed runtime defects | This record and the active standards/security audit workflow |
| Reduce overview PDF cost meaningfully | Marketing owner: review visual quality or storage/URL migration; preserve working download links | `public/zyene-overview.pdf` |

The connected Supabase account did not expose the Zyene project. No credentials
were substituted and no database state was changed. The permission matrix above
is an operational follow-up, not authorization to create a new admin console.

The PDF remains at its live URL. A lossless compression/deduplication trial
reduced 23,736,932 bytes by only 5,545 bytes (0.023%); that does not justify
replacing the production asset. A lossy redesign or storage move needs a separate
quality/link review.

## Local housekeeping

Removed the regenerable 7,857,196-byte TypeScript cache and seven verified empty
directories. Nonempty `output/`, `test-results 2/` and `loading-proof/` were retained
because they contain local evidence; the original empty-folder claim was wrong.
No generic recursive local-junk deletion was used.

## Verification

Completed so far:

- `pnpm verify`: strict TypeScript, 303 Vitest files / 1,940 tests, and file-size guard passed.
- Color and migration guards, changed-file ESLint and `git diff --check` passed.
- Post-removal TypeScript AST scan checked 2,853 tracked/new TS/JS files. It
  matched both resolver results and literal alias/relative paths so missing
  deleted files could not hide references. No imports/exports/requires targeted
  the 35 removed source/copy paths. The one nonliteral dynamic import belongs
  to the impeccable detector loader; runtime marketing directory scanning was
  reviewed separately and the growth blueprint tests passed.
- Archived/current doc check: 84 relative/external Markdown links inspected in
  18 affected documents; all local targets exist.
- Removal/archive manifest and protected-file hash checks passed.
- Changed-file React Doctor: 100/100, no findings. Its whole-repo diagnostic scan
  scored 43/100 with 656 hypotheses (223 scanner errors, 433 warnings), requiring
  contextual triage rather than a blanket health claim. Example: historical SQL
  policies flagged as permissive are removed by the August public-write-policy
  migration, and Stripe webhook RLS is enabled by later April/September
  migrations. Those flags do not establish today's deployed grants. No applied
  migration was edited or diagnostic suppression added. The same scanner on
  the original commit also scored 43/100, with 677 findings; the cleanup has 21
  fewer findings. File/rule/severity comparison found no added diagnostic counts. This
  is evidence of no scanner regression, not proof that all remaining flags are
  false or that the application is free of defects.
- The 43 marketing page/layout and sitemap/robots files match the baseline;
  focused marketing SEO, sitemap, branding and growth regression tests pass.
- `pnpm build`: production webpack compilation, build-time TypeScript and all 280 static pages passed. Existing Edge Runtime deprecation/static-generation notices remain. Built-server checks passed: all 22 old JPEG URLs return 308 and their WebP
  targets return 200; logo/PDF downloads return 200; malformed/wrong-password
  login requests return 400/401 without cookies; successful login sets the
  production Secure/HttpOnly/Strict cookie with signed seven-day expiry and
  no-store; unauthenticated/legacy-cookie metrics requests return 401. Home,
  features, partners and blog render 200 with titles/headings; the pre-existing
  product-to-features redirect still returns 308. Only synthetic credentials
  were used; no live provider or database actions ran.
The workspace's cloud-evicted dependency files stalled file reads. Verification
uses an exact-base temporary GitHub checkout with the task changes overlaid and
fresh frozen-lockfile dependencies, without changing the project's dependencies.
Focused auth/report/SEO/growth tests passed before that environment repair.
This report does not certify all application security, live database state,
external asset consumers or production rollout.
