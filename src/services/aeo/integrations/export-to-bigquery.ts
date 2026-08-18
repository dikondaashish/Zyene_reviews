import { createSign } from "node:crypto";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { decryptAlertSecret } from "@/services/aeo/alerting/channel-secrets";
import { buildBigQueryRows } from "./bigquery-export";

type Admin = SupabaseClient<Database>;
type Integration = { id: string; project_id: string; dataset_id: string; table_id: string;
    credentials_ciphertext: string; last_export_at: string | null };
const Credentials = z.object({ client_email: z.string().email(), private_key: z.string().min(100) });
const b64 = (value: string) => Buffer.from(value).toString("base64url");

async function accessToken(ciphertext: string) {
    const credentials = Credentials.parse(JSON.parse(decryptAlertSecret(ciphertext)));
    const now = Math.floor(Date.now() / 1000);
    const header = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = b64(JSON.stringify({ iss: credentials.client_email,
        scope: "https://www.googleapis.com/auth/bigquery.insertdata", aud: "https://oauth2.googleapis.com/token",
        iat: now, exp: now + 3600 }));
    const input = `${header}.${claims}`;
    const signature = createSign("RSA-SHA256").update(input).sign(credentials.private_key, "base64url");
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: `${input}.${signature}` }), signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Google OAuth returned HTTP ${response.status}`);
    const parsed = z.object({ access_token: z.string() }).parse(await response.json());
    return parsed.access_token;
}

async function exportIntegration(db: Admin, businessId: string, integration: Integration) {
    const since = integration.last_export_at ?? new Date(Date.now() - 90 * 86_400_000).toISOString();
    const samples = await db.from("aeo_samples")
        .select("id, business_id, prompt_id, engine_id, status, sampled_at, cost_micro_usd")
        .eq("business_id", businessId).eq("is_estimated", false).gt("sampled_at", since)
        .order("sampled_at", { ascending: true }).limit(10_000);
    if (samples.error) throw new Error(`BigQuery sample load failed: ${samples.error.message}`);
    const ids = (samples.data ?? []).map((row) => row.id);
    const mentions = ids.length ? await db.from("aeo_brand_mentions").select("sample_id")
        .eq("business_id", businessId).eq("brand_kind", "own").eq("cited_only", false).in("sample_id", ids)
        : { data: [], error: null };
    if (mentions.error) throw new Error(`BigQuery mention load failed: ${mentions.error.message}`);
    const named = new Set((mentions.data ?? []).map((row) => row.sample_id));
    const rows = buildBigQueryRows((samples.data ?? []).map((row) => ({
        sampleId: row.id, businessId: row.business_id, promptId: row.prompt_id, engineId: row.engine_id,
        status: row.status, sampledAt: row.sampled_at, costMicroUsd: row.cost_micro_usd,
        brandNamed: named.has(row.id),
    })));
    if (!rows.length) return 0;
    const token = await accessToken(integration.credentials_ciphertext);
    const path = [integration.project_id, integration.dataset_id, integration.table_id].map(encodeURIComponent);
    const response = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${path[0]}/datasets/${path[1]}/tables/${path[2]}/insertAll`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "bigquery#tableDataInsertAllRequest", skipInvalidRows: false,
            ignoreUnknownValues: false, rows }), signal: AbortSignal.timeout(30_000),
    });
    const body = await response.json() as { insertErrors?: unknown[] };
    if (!response.ok || body.insertErrors?.length) throw new Error(`BigQuery insert failed (${response.status})`);
    return rows.length;
}

export function bigQueryCheckpointUpdate(status: "success" | "failed", exportedAt: string) {
    return status === "success"
        ? { last_export_at: exportedAt, last_export_status: status }
        : { last_export_status: status };
}

export async function exportBusinessToBigQuery(db: Admin, input: { organizationId: string; businessId: string }) {
    const result = await db.from("aeo_bigquery_integrations" as never)
        .select("id, project_id, dataset_id, table_id, credentials_ciphertext, last_export_at" as never)
        .eq("organization_id" as never, input.organizationId).eq("enabled" as never, true)
        .or(`business_id.eq.${input.businessId},business_id.is.null`);
    if (result.error) throw new Error(`BigQuery integration load failed: ${result.error.message}`);
    if (!result.data?.length) return { exported: 0, skipped: "not_configured" as const };
    let exported = 0;
    for (const integration of (result.data ?? []) as unknown as Integration[]) {
        let status: "success" | "failed" = "success";
        let errorMessage: string | null = null;
        let rowCount = 0;
        try { rowCount = await exportIntegration(db, input.businessId, integration); exported += rowCount; }
        catch (error) { status = "failed"; errorMessage = error instanceof Error ? error.message.slice(0, 500) : String(error); }
        const completedAt = new Date().toISOString();
        const [runWrite, checkpointWrite] = await Promise.all([
            db.from("aeo_bigquery_export_runs" as never).insert({ integration_id: integration.id,
                organization_id: input.organizationId, business_id: input.businessId, row_count: rowCount,
                status, error_message: errorMessage } as never),
            db.from("aeo_bigquery_integrations" as never)
                .update(bigQueryCheckpointUpdate(status, completedAt) as never).eq("id" as never, integration.id),
        ]);
        if (runWrite.error || checkpointWrite.error) {
            throw new Error(`BigQuery export state write failed: ${runWrite.error?.message ?? checkpointWrite.error?.message}`);
        }
    }
    return { exported };
}
