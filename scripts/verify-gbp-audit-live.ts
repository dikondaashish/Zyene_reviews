/**
 * F5.10: reads ONE real Google Business Profile and prints the six GBP audit
 * rows exactly as the dashboard would score them.
 *
 * Read-only. Calls the Media, Local Posts, and Business Information APIs and
 * writes nothing — to Google or to our database.
 *
 *   pnpm exec tsx scripts/verify-gbp-audit-live.ts <businessId>
 *
 * Takes no default business, so it cannot accidentally read someone's profile.
 * Point it at a business you are authorized to inspect.
 *
 * Purpose is to catch what mocked tests cannot: whether Google returns
 * `serviceItems`/`serviceArea` under our readMask at all, whether media
 * `attribution` reliably distinguishes owner from customer photos, and whether
 * the thresholds in gbp-audit-thresholds.ts land sensibly on a real profile.
 */
import { createAdminClient } from "../src/lib/db/supabase/admin";
import { getValidGoogleToken } from "../src/services/google/sync-service";
import { getGoogleLocation } from "../src/services/google/listing-information";
import { fetchGbpAuditSignals } from "../src/services/aeo/technical-audit/fetch-gbp-audit-signals";
import { buildGbpAuditChecks } from "../src/services/aeo/technical-audit/gbp-audit-checks";

const businessId = process.argv[2];
if (!businessId) {
    console.error("Usage: pnpm exec tsx scripts/verify-gbp-audit-live.ts <businessId>");
    process.exit(1);
}

async function main() {
    const supabase = createAdminClient();

    const { data: platform, error } = await supabase
        .from("review_platforms")
        .select("id, google_account_id, google_location_id")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();

    if (error || !platform) {
        console.error(`No Google platform row for business ${businessId}.`, error ?? "");
        process.exit(1);
    }

    console.log(`account=${platform.google_account_id ?? "(none stored)"}`);
    console.log(`location=${platform.google_location_id ?? "(none stored)"}\n`);

    if (!platform.google_account_id) {
        console.warn("No google_account_id stored: Media and Local Posts cannot be read for this");
        console.warn("connection, so those checks will report `unavailable` by design.\n");
    }

    const { accessToken } = await getValidGoogleToken(platform.id);
    if (!accessToken) {
        console.error("Could not obtain a valid Google access token.");
        process.exit(1);
    }

    const location = platform.google_location_id
        ? await getGoogleLocation(accessToken, platform.google_location_id)
        : null;

    console.log("Raw fields returned under LOCATION_READ_MASK:");
    console.log(`  serviceItems : ${location?.serviceItems ? `${location.serviceItems.length} item(s)` : "absent"}`);
    console.log(`  serviceArea  : ${location?.serviceArea ? JSON.stringify(location.serviceArea) : "absent"}\n`);

    const signals = await fetchGbpAuditSignals({
        accessToken,
        accountId: platform.google_account_id,
        locationId: platform.google_location_id,
        location,
    });

    console.log("Signals:");
    console.log(`  photos : ${signals.photos ? JSON.stringify(signals.photos) : "unavailable"}`);
    console.log(
        `  posts  : ${signals.posts ? `${signals.posts.recentCount} in ${signals.posts.windowDays}d` : "unavailable"}\n`
    );

    // Keywords come from Search Console on the real page; passing none here
    // makes the post-keyword row report `unavailable` rather than guess.
    const checks = buildGbpAuditChecks(signals, { keywords: [] });

    console.log("Audit rows:");
    for (const check of checks) {
        console.log(`  [${check.status.toUpperCase().padEnd(14)}] ${check.label}`);
        console.log(`                    ${check.detail}`);
    }

    const scored = checks.filter((c) => c.status === "pass" || c.status === "fail");
    console.log(`\nScored ${scored.length} of ${checks.length} GBP rows.`);
    // No `pending` check is needed here: GbpCheckStatus does not include it, so
    // criterion #29 holds for these six rows by construction rather than by
    // assertion. tsc rejects any attempt to reintroduce one.
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
