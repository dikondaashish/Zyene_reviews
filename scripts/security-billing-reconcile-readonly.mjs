import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Operator-only GET audit. Secrets stay in memory; no financial/database mutations.
const projectId = "prj_WDO2luYDA0NKvteSoSHHiThiH7N0";
const expectedHost = "snielpllhrppdqzkzjwf.supabase.co";
const expectedAccount = "acct_1T71rDIiQQIaqDAL";
let stage = "environment_inventory";
function productionEnv(key, rows) {
    const matches = rows.filter((row) => row.key === key && row.target?.includes("production") && !row.gitBranch);
    if (matches.length !== 1 || !matches[0].value) throw new Error(`Missing/unambiguous production configuration: ${key}`);
    const decrypted = JSON.parse(execFileSync("vercel", ["api", `/v1/projects/${projectId}/env/${matches[0].id}`, "--raw"], {
        encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1_000_000,
    }));
    if (decrypted.decrypted !== true || decrypted.key !== key) throw new Error("Environment decryption unavailable");
    return decrypted.value;
}
function count(map, key) { map[key] = (map[key] ?? 0) + 1; }
try {
    const { envs } = JSON.parse(execFileSync("vercel", ["api", `/v10/projects/${projectId}/env`, "--raw"], {
        encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 5_000_000,
    }));
    const url = productionEnv("NEXT_PUBLIC_SUPABASE_URL", envs);
    if (new URL(url).hostname !== expectedHost) throw new Error("Supabase target mismatch");
    const stripe = new Stripe(productionEnv("STRIPE_SECRET_KEY", envs), { maxNetworkRetries: 1 });
    stage = "stripe_account_binding";
    const account = await stripe.accounts.retrieve();
    if (account.id !== expectedAccount) throw new Error("Stripe account mismatch");
    const db = createClient(url, productionEnv("SUPABASE_SERVICE_ROLE_KEY", envs), {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    stage = "database_inventory";
    const [eventsResult, orgResult, receiptsResult, endpoints] = await Promise.all([
        db.from("stripe_webhook_events").select("event_id, received_at").eq("status", "legacy_unknown"),
        db.from("organizations").select("id, stripe_customer_id, stripe_subscription_id, plan, plan_status"),
        db.from("stripe_credit_grant_receipts").select("receipt_id"),
        stripe.webhookEndpoints.list({ limit: 100 }),
    ]);
    if (eventsResult.error || orgResult.error || receiptsResult.error) throw new Error("Read-only database inventory failed");
    const report = {
        checkedAt: new Date().toISOString(), projectId, stripeAccount: expectedAccount,
        readOnly: true, legacyTotal: eventsResult.data.length, retrieved: 0, unavailable: 0,
        byMonth: {}, byType: {}, pendingWebhookEvents: 0, creditsReceiptMatches: 0,
        subscriptionProjection: { matched: 0, drift: 0, unavailable: 0, customerMismatch: 0 },
        webhookConfiguration: endpoints.data.map((e) => ({ id: e.id, url: e.url, status: e.status,
            apiVersion: e.api_version, enabledEvents: e.enabled_events })),
        signingSecretConfigured: productionEnv("STRIPE_WEBHOOK_SECRET", envs).startsWith("whsec_"),
        signingSecretMatchesEndpoint: "not_verified_existing_endpoint_secret_is_not_returned_by_GET",
        headlessEnabled: envs.some((e) => e.key === "AEO_HEADLESS_RENDER_ISOLATED_EGRESS" &&
            e.target?.includes("production")) &&
            productionEnv("AEO_HEADLESS_RENDER_ISOLATED_EGRESS", envs) === "true",
        events: [], subscriptionDrift: [],
    };
    const receipts = new Set(receiptsResult.data.map((row) => row.receipt_id));
    stage = "historical_event_reads";
    for (const row of eventsResult.data) {
        count(report.byMonth, row.received_at.slice(0, 7));
        try {
            const event = await stripe.events.retrieve(row.event_id);
            if (!event.livemode) throw new Error("Unexpected test-mode event");
            report.retrieved++;
            count(report.byType, event.type);
            if (event.pending_webhooks > 0) report.pendingWebhookEvents++;
            if (receipts.has(event.data.object.id)) report.creditsReceiptMatches++;
            // Identifiers only in a private owner-readable artifact, not console logs.
            report.events.push({ eventId: row.event_id, type: event.type, created: event.created,
                pendingWebhooks: event.pending_webhooks, receiptExists: receipts.has(event.data.object.id),
                disposition: "requires_side_effect_history_not_delivery_status_alone" });
        } catch (error) {
            if (error?.code !== "resource_missing") throw new Error("Stripe event read failed");
            report.unavailable++;
            report.events.push({ eventId: row.event_id, disposition: "outside_retention_or_missing_no_replay" });
        }
    }
    stage = "current_subscription_reads";
    for (const org of orgResult.data.filter((o) => o.stripe_subscription_id)) {
        try {
            const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
            const customer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
            if (customer !== org.stripe_customer_id) report.subscriptionProjection.customerMismatch++;
            else if (subscription.status === org.plan_status) report.subscriptionProjection.matched++;
            else {
                report.subscriptionProjection.drift++;
                report.subscriptionDrift.push({ organizationId: org.id, currentStatus: org.plan_status,
                    providerStatus: subscription.status, action: "review_before_authorized_projection_repair" });
            }
        } catch (error) {
            if (error?.code !== "resource_missing") throw new Error("Stripe subscription read failed");
            report.subscriptionProjection.unavailable++;
        }
    }
    const file = join(homedir(), ".strix/zyene-reviews-runs/follow-up-2026-09-30/billing-readonly.json");
    writeFileSync(file, JSON.stringify(report, null, 2), { mode: 0o600 });
    const { events, subscriptionDrift, ...aggregate } = report;
    console.log(JSON.stringify({ ...aggregate, privateReport: file }, null, 2));
} catch {
    console.error(`Read-only audit failed at ${stage}; no writes performed.`);
    process.exitCode = 1;
}
