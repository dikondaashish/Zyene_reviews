/**
 * Local checklist for Competitor Watch (Week 1 + Week 2): migrations, routes, libs, env.
 * Run: pnpm verify:competitor-watch
 * Does not connect to Supabase — apply migrations in the dashboard or `supabase db push`.
 */

import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { config as loadEnv } from "dotenv";

const MIGRATIONS = [
  "supabase/migrations/20260415173000_competitor_watch_foundation.sql",
  "supabase/migrations/20260415221500_competitor_watch_lock.sql",
  "supabase/migrations/20260415230000_competitor_watch_runs.sql",
  "supabase/migrations/20260416000500_competitor_week1_upgrade.sql",
  "supabase/migrations/20260416120000_competitor_watch_email_alerts.sql",
];

const FILES = [
  "src/app/api/cron/competitor-watch/route.ts",
  "src/app/api/competitors/export/route.ts",
  "src/lib/monitoring/competitor-watch-heartbeat.ts",
  "src/lib/competitors/date-range.ts",
  "src/lib/competitors/range-benchmark.ts",
  "src/lib/competitors/snapshot-movement.ts",
  "src/app/actions/competitor-watch-settings.ts",
  "src/app/(dashboard)/settings/competitor-alerts/page.tsx",
  "src/app/(dashboard)/competitors/loading.tsx",
];

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  loadEnv({ path: ".env.local" });

  let failed = false;

  console.log("Competitor Watch — verification\n");

  for (const f of [...MIGRATIONS, ...FILES]) {
    const ok = await exists(f);
    if (!ok) {
      console.error(`  ✗ Missing: ${f}`);
      failed = true;
    } else {
      console.log(`  ✓ ${f}`);
    }
  }

  const cronSecret = Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length > 0);
  console.log(`\n  ${cronSecret ? "✓" : "✗"} CRON_SECRET set (required for /api/cron/competitor-watch)`);
  if (!cronSecret) failed = true;

  const hb = process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL?.trim();
  console.log(`  ${hb ? "✓" : "○"} BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL (optional)`);

  console.log("\nApply migrations in Supabase if not already applied:");
  for (const m of MIGRATIONS) {
    console.log(`  - ${m}`);
  }

  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
