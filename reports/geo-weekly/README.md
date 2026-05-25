# GEO weekly reports (owner-filled)

Generated and filled weekly reports live here. **Do not commit files with real subscriber emails or unreleased metrics** unless sanitized.

## Files

| File | Purpose |
|------|---------|
| `week-001-template.md` | Master template (committed) |
| `week-YYYY-MM-DD.md` | Dated reports — created by `pnpm geo:weekly-report` (gitignored) |

## Commands

```bash
pnpm geo:gsc-baseline          # export GSC first (OAuth)
pnpm geo:weekly-report         # create reports/geo-weekly/week-<today>.md
node scripts/validate-geo-faq-production.mjs   # after deploy
```

See [docs/GEO_WEEKLY_REPORT_TEMPLATE.md](../../docs/GEO_WEEKLY_REPORT_TEMPLATE.md) and [docs/GEO_OWNER_FINAL_CHECKLIST.md](../../docs/GEO_OWNER_FINAL_CHECKLIST.md).
