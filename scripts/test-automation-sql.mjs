import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Review-automation migrations against a disposable PostgreSQL (no host ports, no network,
// no application env). Applies the live-shaped fixture, then the migrations as an upgrade.
const container = `zyene-automation-test-${randomUUID()}`;
const migrations = [
    "20260930143637_business_scoped_access_guards.sql",
    "20261020120000_campaign_status_draft_and_active.sql",
    "20261020121000_campaign_stats_trigger.sql",
    "20261021090000_review_request_delivery_controls.sql",
    "20261021100000_review_reply_rules.sql",
    "20261021110000_enrollment_imports.sql",
    "20261021120000_inbound_email_enrollment.sql",
];

function docker(args, input) {
    const result = spawnSync("docker", args, { input, encoding: "utf8", timeout: 60_000 });
    if (result.status !== 0) throw new Error(result.error?.message || result.stderr || "Local Docker command failed");
    return result.stdout;
}

try {
    docker(["run", "--rm", "--detach", "--network", "none", "--name", container,
        "-e", "POSTGRES_HOST_AUTH_METHOD=trust", "postgres:17-alpine"]);
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt++) {
        const result = spawnSync("docker", ["exec", container, "sh", "-c",
            'test "$(cat /proc/1/comm)" = postgres && pg_isready -U postgres'], { encoding: "utf8", timeout: 5_000 });
        if (result.status === 0) { ready = true; break; }
        await delay(500);
    }
    if (!ready) throw new Error("Disposable PostgreSQL did not become ready");
    const sql = [
        readFileSync("tests/security/database-fixture.sql", "utf8"),
        readFileSync("tests/security/automation-fixture.sql", "utf8"),
        ...migrations.map((file) => readFileSync(`supabase/migrations/${file}`, "utf8")),
        // Re-running every new migration must be safe (idempotent DDL).
        ...migrations.slice(1).map((file) => readFileSync(`supabase/migrations/${file}`, "utf8")),
        readFileSync("tests/security/automation-boundaries.sql", "utf8"),
    ].join("\n");
    docker(["exec", "-i", container, "psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-U", "postgres"], sql);
    console.log(`PASS: ${migrations.length} migrations applied twice; repair, counter, constraint and tenant-isolation assertions passed.`);
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    spawnSync("docker", ["rm", "--force", container], { encoding: "utf8", timeout: 10_000 });
}
