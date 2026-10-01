import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Disposable PostgreSQL only: no host ports, network, volumes, or application env.
const container = `zyene-security-test-${randomUUID()}`;
const migrations = [
    "20260930143031_restrict_public_integration_reads.sql",
    "20260930143035_stripe_webhook_processing_claims.sql",
    "20260930143037_protect_organization_billing_columns.sql",
    "20260930143537_guard_business_member_roles.sql",
    "20260930143541_restrict_platform_sync_lock.sql",
    "20260930143543_secure_oauth_key_rotation.sql",
    "20260930143632_enforce_review_platform_tenant.sql",
    "20260930143635_secure_business_invitations.sql",
    "20260930143637_business_scoped_access_guards.sql",
    "20260930143714_atomic_subscription_projection.sql",
    "20260930143715_stripe_credit_grant_receipts.sql",
    "20260930143717_referral_reward_claims.sql",
    "20260930145044_guard_privileged_business_rpcs.sql",
    "20260930153833_guard_oauth_ciphertext_writes.sql",
    "20260930165420_backend_only_ai_usage.sql",
    "20260930160138_retire_legacy_oauth_encryption_key.sql",
    "20260930162251_scope_business_storage_access.sql",
].sort();

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
    const storageFixture = readFileSync("tests/security/storage-fixture.sql", "utf8");
    const logoSchema = readFileSync("supabase/migrations/008_public_profile_customization.sql", "utf8");
    const answerStorage = readFileSync("supabase/migrations/20260807180000_aeo_answer_storage.sql", "utf8");
    const storageAssertions = readFileSync("tests/security/storage-boundaries.sql", "utf8");
    const creditLedger = readFileSync("supabase/migrations/20260808200000_aeo_credit_ledger.sql", "utf8");
    const legacyFixture = readFileSync("tests/security/legacy-business-rpcs-fixture.sql", "utf8");
    const legacyRpcs = [
        "20260804162256_harden_security_definer_functions.sql",
        "20260804162339_revoke_public_execute_on_security_definer_functions.sql",
        "20260811120000_aeo_alerts_schema.sql",
        "20260820160000_fix_claim_review_milestone_auth.sql",
        "20260828205000_repair_customer_identity_functions.sql",
    ].map((file) => readFileSync(`supabase/migrations/${file}`, "utf8"));
    const rpcAssertions = readFileSync("tests/security/privileged-business-rpc-boundaries.sql", "utf8");
    const assertions = readFileSync("tests/security/database-boundaries.sql", "utf8");
    const accountingAssertions = readFileSync("tests/security/ai-usage-boundaries.sql", "utf8");
    const invitationAssertions = readFileSync("tests/security/invitation-boundaries.sql", "utf8");
    const businessScopeAssertions = readFileSync("tests/security/business-scope-boundaries.sql", "utf8");
    const billingAssertions = readFileSync("tests/security/billing-projection-boundaries.sql", "utf8");
    const referralAssertions = readFileSync("tests/security/referral-reward-boundaries.sql", "utf8");
    const readOnlyChecks = readFileSync("docs/security-readonly-verification-2026-09-29.sql", "utf8");
    const migrationVersions = migrations.map((file) => `('${file.split('_')[0]}')`).join(", ");
    const sql = [fixture, storageFixture, logoSchema, answerStorage, creditLedger, legacyFixture, ...legacyRpcs,
        "GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;",
        ...migrations.map((file) =>
        readFileSync(`supabase/migrations/${file}`, "utf8")),
        `INSERT INTO supabase_migrations.schema_migrations VALUES ${migrationVersions};`,
        rpcAssertions, businessScopeAssertions, billingAssertions, referralAssertions, invitationAssertions,
        storageAssertions, accountingAssertions, assertions, readOnlyChecks,
        readFileSync("supabase/migrations/20261001020939_developer_owner_role_label.sql", "utf8"),
        readFileSync("supabase/migrations/20261001022325_owner_delete_developer.sql", "utf8"),
        readFileSync("tests/security/developer-boundaries.sql", "utf8"),
        readFileSync("tests/security/default-developer-fixture.sql", "utf8"),
        readFileSync("supabase/migrations/20261001151611_default_business_developer.sql", "utf8"),
        readFileSync("tests/security/default-developer-boundaries.sql", "utf8")].join("\n");
    docker(["exec", "-i", container, "psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-U", "postgres"], sql);
    console.log(`PASS: ${migrations.length + 3} security migrations executed; grant, tenant, storage, accounting, role, developer defaults/removal, invitation, webhook and key-rotation assertions passed.`);
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    spawnSync("docker", ["rm", "--force", container], { encoding: "utf8", timeout: 10_000 });
}
