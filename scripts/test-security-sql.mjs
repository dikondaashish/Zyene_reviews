import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Disposable PostgreSQL only: no host ports, network, volumes, or application env.
const container = `zyene-security-test-${randomUUID()}`;
const migrations = [
    "20260929230000_restrict_public_integration_reads.sql",
    "20260929231000_stripe_webhook_processing_claims.sql",
    "20260929232000_protect_organization_billing_columns.sql",
    "20260929233000_guard_business_member_roles.sql",
    "20260929234000_restrict_platform_sync_lock.sql",
    "20260929235000_secure_oauth_key_rotation.sql",
    "20260929235100_enforce_review_platform_tenant.sql",
    "20260929235200_secure_business_invitations.sql",
    "20260929235300_business_scoped_access_guards.sql",
    "20260929235400_atomic_subscription_projection.sql",
    "20260929235500_stripe_credit_grant_receipts.sql",
    "20260929235600_referral_reward_claims.sql",
];

function docker(args, input) {
    const result = spawnSync("docker", args, { input, encoding: "utf8", timeout: 30_000 });
    if (result.status !== 0) {
        throw new Error(result.error?.message || result.stderr || "Local Docker command failed");
    }
    return result.stdout;
}

try {
    docker(["run", "--rm", "--detach", "--network", "none", "--name", container,
        "-e", "POSTGRES_HOST_AUTH_METHOD=trust", "postgres:17-alpine"]);
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
        const result = spawnSync("docker", ["exec", container, "sh", "-c",
            'test "$(cat /proc/1/comm)" = postgres && pg_isready -U postgres'],
            { encoding: "utf8", timeout: 5_000 });
        if (result.status === 0) { ready = true; break; }
        await delay(500);
    }
    if (!ready) throw new Error("Disposable PostgreSQL did not become ready");
    const fixture = readFileSync("tests/security/database-fixture.sql", "utf8");
    const creditLedger = readFileSync("supabase/migrations/20260808200000_aeo_credit_ledger.sql", "utf8");
    const assertions = readFileSync("tests/security/database-boundaries.sql", "utf8");
    const invitationAssertions = readFileSync("tests/security/invitation-boundaries.sql", "utf8");
    const businessScopeAssertions = readFileSync("tests/security/business-scope-boundaries.sql", "utf8");
    const billingAssertions = readFileSync("tests/security/billing-projection-boundaries.sql", "utf8");
    const referralAssertions = readFileSync("tests/security/referral-reward-boundaries.sql", "utf8");
    const readOnlyChecks = readFileSync("docs/security-readonly-verification-2026-09-29.sql", "utf8");
    const migrationVersions = migrations.map((file) => `('${file.split('_')[0]}')`).join(", ");
    const sql = [fixture, creditLedger, ...migrations.map((file) =>
        readFileSync(`supabase/migrations/${file}`, "utf8")),
        `INSERT INTO supabase_migrations.schema_migrations VALUES ${migrationVersions};`,
        businessScopeAssertions, billingAssertions, referralAssertions, invitationAssertions, assertions, readOnlyChecks].join("\n");
    docker(["exec", "-i", container, "psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-U", "postgres"], sql);
    console.log(`PASS: ${migrations.length} security migrations executed; grant, tenant, role, invitation, webhook and key-rotation assertions passed.`);
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    spawnSync("docker", ["rm", "--force", container], { encoding: "utf8", timeout: 10_000 });
}
