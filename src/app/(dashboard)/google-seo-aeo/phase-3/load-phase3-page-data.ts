import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";

type Rows<T> = { data: T[] | null };
type Row<T> = { data: T | null };

export async function loadPhase3PageData() {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) redirect("/login");
    const context = await getActiveBusinessId();
    if (!context.businessId || !context.business || !context.organization) return { kind: "no-business" as const };
    const businessId = context.businessId;
    const organizationId = context.organization.id;
    const results = await Promise.all([
        db.from("organizations" as never).select("name, logo_url, primary_color, hide_powered_by, aeo_sender_domain, aeo_sender_domain_status" as never).eq("id" as never, organizationId).single(),
        db.from("aeo_answer_volatility" as never).select("prompt_id, engine_id, answer_volatility, citation_volatility, observation_count" as never).eq("business_id" as never, businessId).order("calculated_at" as never, { ascending: false }).limit(20),
        db.from("aeo_citation_traffic_correlations" as never).select("normalized_url, correlation, eligible, observation_days" as never).eq("business_id" as never, businessId).order("calculated_at" as never, { ascending: false }).limit(20),
        db.from("aeo_competitor_page_changes" as never).select("normalized_url, change_type, detected_at" as never).eq("business_id" as never, businessId).order("detected_at" as never, { ascending: false }).limit(20),
        db.from("aeo_prompt_demand_estimates" as never).select("prompt_id, monthly_search_volume, source_month, measured_at" as never).eq("business_id" as never, businessId).order("measured_at" as never, { ascending: false }).limit(30),
        db.from("aeo_llms_txt_audits" as never).select("present, valid, issues, checked_at" as never).eq("business_id" as never, businessId).order("checked_at" as never, { ascending: false }).limit(1).maybeSingle(),
        db.from("aeo_nap_observations" as never).select("source_name, name_matches, address_matches, phone_matches, checked_at" as never).eq("business_id" as never, businessId).order("checked_at" as never, { ascending: false }),
        db.from("aeo_webhook_endpoints" as never).select("id, name, event_types, enabled, last_delivery_status" as never).eq("organization_id" as never, organizationId),
        db.from("aeo_bigquery_integrations" as never).select("id, project_id, dataset_id, table_id, enabled, last_export_status" as never).eq("organization_id" as never, organizationId),
        db.from("aeo_anomaly_evaluations" as never).select("eligible, anomalous, history_days, evaluated_date" as never).eq("business_id" as never, businessId).order("evaluated_date" as never, { ascending: false }).limit(1).maybeSingle(),
    ]);
    const org = (results[0] as unknown as Row<{ name: string; logo_url: string | null; primary_color: string; hide_powered_by: boolean; aeo_sender_domain: string | null; aeo_sender_domain_status: string }>).data;
    return { kind: "ok" as const, businessId, organizationId, businessName: context.business.name ?? "Business",
        branding: org, volatility: ((results[1] as unknown as Rows<unknown>).data ?? []),
        correlations: ((results[2] as unknown as Rows<unknown>).data ?? []),
        competitorChanges: ((results[3] as unknown as Rows<unknown>).data ?? []),
        demand: ((results[4] as unknown as Rows<unknown>).data ?? []),
        llmsTxt: (results[5] as unknown as Row<unknown>).data,
        nap: ((results[6] as unknown as Rows<unknown>).data ?? []),
        webhooks: ((results[7] as unknown as Rows<unknown>).data ?? []),
        bigquery: ((results[8] as unknown as Rows<unknown>).data ?? []),
        anomaly: (results[9] as unknown as Row<unknown>).data,
        copilotConfigured: Boolean(process.env.MICROSOFT_COPILOT_ACCESS_TOKEN && process.env.AEO_ENABLE_COPILOT_PREVIEW === "true") };
}
