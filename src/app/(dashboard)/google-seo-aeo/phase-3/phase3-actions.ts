"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePhase2Context } from "../phase-2/action-context";
import { inngest } from "@/services/inngest/client";
import { encryptAlertSecret } from "@/services/aeo/alerting/channel-secrets";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { verifySenderDomain } from "@/services/aeo/reporting/verify-sender-domain";

const domain = z.string().trim().toLowerCase().regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/).optional().or(z.literal(""));

export async function runPhase3Refresh() {
    const { businessId, organizationId } = await requirePhase2Context();
    await inngest.send({ name: "aeo/phase3.refresh.requested", data: { businessId, organizationId, trigger: "manual" } });
    revalidatePath("/google-seo-aeo/phase-3");
}

export async function saveWhiteLabel(formData: FormData) {
    const parsed = z.object({ name: z.string().trim().min(2).max(100), logoUrl: z.string().url().optional().or(z.literal("")),
        color: z.string().regex(/^#[0-9a-f]{6}$/i), senderDomain: domain }).safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid white-label settings");
    if (parsed.data.logoUrl) {
        const url = new URL(parsed.data.logoUrl); const safety = await checkOriginIsPublic(url.href);
        if (url.protocol !== "https:" || !safety.safe) throw new Error("Logo must use a public HTTPS URL");
    }
    const { admin, organizationId } = await requirePhase2Context();
    const result = await admin.from("organizations" as never).update({ name: parsed.data.name,
        logo_url: parsed.data.logoUrl || null, primary_color: parsed.data.color,
        hide_powered_by: formData.get("hidePoweredBy") === "on", aeo_sender_domain: parsed.data.senderDomain || null,
        aeo_sender_domain_status: parsed.data.senderDomain ? "pending" : "not_configured",
        aeo_sender_domain_checked_at: null } as never).eq("id" as never, organizationId);
    if (result.error) throw new Error("Unable to save white-label settings");
    revalidatePath("/google-seo-aeo/phase-3");
}

export async function checkSenderDomain() {
    const { admin, organizationId } = await requirePhase2Context();
    const org = await admin.from("organizations" as never).select("aeo_sender_domain" as never)
        .eq("id" as never, organizationId).single() as unknown as { data: { aeo_sender_domain: string | null } | null };
    if (!org.data?.aeo_sender_domain) throw new Error("Save a sender domain first");
    await verifySenderDomain(admin, organizationId, org.data.aeo_sender_domain);
    revalidatePath("/google-seo-aeo/phase-3");
}

export async function createPhase3Webhook(formData: FormData) {
    const parsed = z.object({ name: z.string().trim().min(2).max(80), endpoint: z.string().url(),
        secret: z.string().min(32).max(200) }).safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid webhook");
    const url = new URL(parsed.data.endpoint); const safety = await checkOriginIsPublic(url.href);
    if (url.protocol !== "https:" || !safety.safe) throw new Error("Use a public HTTPS endpoint");
    const events = formData.getAll("events").map(String).filter((value) => ["aeo.alert.created", "aeo.run.completed"].includes(value));
    if (!events.length) throw new Error("Select at least one event");
    const { admin, businessId, organizationId } = await requirePhase2Context();
    const result = await admin.from("aeo_webhook_endpoints" as never).insert({ organization_id: organizationId,
        business_id: businessId, name: parsed.data.name, endpoint_ciphertext: encryptAlertSecret(url.href),
        signing_secret_ciphertext: encryptAlertSecret(parsed.data.secret), event_types: events } as never);
    if (result.error) throw new Error("Unable to save webhook");
    revalidatePath("/google-seo-aeo/phase-3");
}

export async function saveBigQuery(formData: FormData) {
    const parsed = z.object({ projectId: z.string().regex(/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/),
        datasetId: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]{0,1023}$/), tableId: z.string().regex(/^[A-Za-z0-9_-]{1,1024}$/),
        credentials: z.string().min(100).transform((value, ctx) => { try { return JSON.parse(value) as unknown; }
            catch { ctx.addIssue({ code: "custom", message: "Service account JSON is invalid" }); return z.NEVER; } })
            .pipe(z.object({ client_email: z.string().email(), private_key: z.string().min(100) })) }).safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid BigQuery settings");
    const { admin, businessId, organizationId } = await requirePhase2Context();
    const result = await admin.from("aeo_bigquery_integrations" as never).upsert({ organization_id: organizationId,
        business_id: businessId, project_id: parsed.data.projectId, dataset_id: parsed.data.datasetId,
        table_id: parsed.data.tableId, credentials_ciphertext: encryptAlertSecret(JSON.stringify(parsed.data.credentials)),
        enabled: true, updated_at: new Date().toISOString() } as never, { onConflict: "organization_id,business_id" });
    if (result.error) throw new Error("Unable to save BigQuery integration");
    revalidatePath("/google-seo-aeo/phase-3");
}
