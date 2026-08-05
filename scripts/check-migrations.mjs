/**
 * Migration guard — runs in CI on every PR.
 *
 * Applying a migration and deploying the code that needs it are two separate
 * manual acts on this project. Nothing in CI, Vercel or Supabase links them:
 * there is no Supabase GitHub integration, the Supabase CLI is not even a
 * dependency, and ci.yml has no database step. That is deliberate — but it
 * means the ordering is held together by whoever ships, and it has already
 * slipped once: 20260805200155 was live in production for hours before the
 * code that gated its columns reached main.
 *
 * This guard does not run migrations and does not touch a database. It enforces
 * two things a reviewer would otherwise have to notice by eye:
 *
 *   1. An already-applied migration is never edited. AGENTS.md has called this
 *      out since the repo started; nothing enforced it.
 *   2. Every new migration states, in the file itself, when it gets applied
 *      relative to the code that depends on it.
 *
 * (2) is a declaration, not a restriction. A migration-only PR is legitimate —
 * E-4's schema is one — but it has to say so out loud, in a line that survives
 * a squash merge and sits where the next person will read it.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const MIGRATION_DIR = "supabase/migrations";
const APPLY_PLAN = /^--\s*apply-plan:\s*(with-code|deferred|already-applied)\b\s*(.*)$/im;

const PLAN_HELP = `
Add one of these as a comment line near the top of the migration:

  -- apply-plan: with-code        — applied in the same release as the code in this PR
  -- apply-plan: deferred         — schema lands later, with a named follow-up (say which)
  -- apply-plan: already-applied  — applied out of band; note when and by what

Example:
  -- apply-plan: deferred — applied alongside E-5/E-7, not on merge of this PR
`;

const baseRef = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : "origin/main";

function changedFiles() {
  try {
    const out = execFileSync(
      "git",
      ["diff", "--name-status", `${baseRef}...HEAD`],
      { encoding: "utf8" }
    );
    return out
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [status, ...rest] = line.split("\t");
        return { status: status.trim(), file: rest[rest.length - 1] };
      });
  } catch {
    // No base ref locally (shallow clone, detached HEAD). Skip rather than
    // fail: this guard is about PR review, and CI always has the base.
    console.log(`OK: migration guard skipped — cannot diff against ${baseRef}.`);
    process.exit(0);
  }
}

const changes = changedFiles();
const migrations = changes.filter(
  (c) => c.file.startsWith(MIGRATION_DIR) && c.file.endsWith(".sql")
);

if (migrations.length === 0) {
  console.log("OK: no migration changes in this diff.");
  process.exit(0);
}

let failed = false;

// 1. Edits to existing migrations are never valid: the version is already
//    recorded in schema_migrations, so the change will never be replayed.
const edited = migrations.filter((m) => m.status.startsWith("M") || m.status.startsWith("R"));
if (edited.length > 0) {
  failed = true;
  console.error("Migration guard failed — existing migrations were modified:\n");
  for (const m of edited) console.error(`  ${m.file}`);
  console.error(
    "\nAn applied migration cannot be changed: its version is already in\n" +
      "supabase_migrations.schema_migrations and will never re-run. The edit\n" +
      "would silently apply to fresh databases only. Write a new migration.\n"
  );
}

// 2. Every added migration must declare when it gets applied.
const added = migrations.filter((m) => m.status.startsWith("A"));
const undeclared = [];
const declared = [];

for (const m of added) {
  const abs = path.join(process.cwd(), m.file);
  if (!fs.existsSync(abs)) continue;
  const match = fs.readFileSync(abs, "utf8").match(APPLY_PLAN);
  if (match) {
    // Strip a leading dash/em-dash so "deferred — note" does not print as "deferred — — note".
    const note = (match[2] ?? "").trim().replace(/^[—–-]\s*/, "");
    declared.push({ file: m.file, plan: match[1], note });
  }
  else undeclared.push(m.file);
}

if (undeclared.length > 0) {
  failed = true;
  console.error("Migration guard failed — new migrations with no apply plan:\n");
  for (const f of undeclared) console.error(`  ${f}`);
  console.error(PLAN_HELP);
}

if (failed) process.exit(1);

const touchesSrc = changes.some((c) => c.file.startsWith("src/"));
for (const d of declared) {
  console.log(`  ${d.file}\n    apply-plan: ${d.plan}${d.note ? ` — ${d.note}` : ""}`);
  // Advisory only. A 'with-code' claim in a PR that changes no application
  // code is usually a mistake, but it is the reviewer's call, not the guard's.
  if (d.plan === "with-code" && !touchesSrc) {
    console.log(
      "    note: declared 'with-code' but this diff changes nothing under src/."
    );
  }
}

console.log(`\nOK: ${declared.length} new migration(s), all declaring an apply plan.`);
