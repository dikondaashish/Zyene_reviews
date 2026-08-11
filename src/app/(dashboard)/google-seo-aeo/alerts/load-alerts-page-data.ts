import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { isLiveAlertingEnabled } from "@/lib/features/aeo-surfaces";

const ALERTS_LOOKBACK_DAYS = 90;

export type AlertRow = {
    id: string;
    alertType: string;
    severity: string;
    title: string;
    detail: string;
    createdAt: string;
    mutedAt: string | null;
};

export type AlertsPageData =
    | { kind: "no-business" }
    | { kind: "ok"; businessId: string; businessName: string; liveAlertingEnabled: boolean; alerts: AlertRow[] };

export async function loadAlertsPageData(): Promise<AlertsPageData> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !business) return { kind: "no-business" };

    const lookback = new Date(Date.now() - ALERTS_LOOKBACK_DAYS * 86_400_000).toISOString();
    const { data: rows } = await supabase
        .from("aeo_alerts")
        .select("id, alert_type, severity, title, detail, created_at, muted_at")
        .eq("business_id", businessId)
        .gte("created_at", lookback)
        .order("created_at", { ascending: false });

    return {
        kind: "ok",
        businessId,
        businessName: typeof business.name === "string" ? business.name : "this business",
        liveAlertingEnabled: isLiveAlertingEnabled(),
        alerts: (rows ?? []).map((r) => ({
            id: r.id,
            alertType: r.alert_type,
            severity: r.severity,
            title: r.title,
            detail: r.detail,
            createdAt: r.created_at,
            mutedAt: r.muted_at,
        })),
    };
}
