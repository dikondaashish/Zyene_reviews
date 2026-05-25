import { createAdminClient } from "@/lib/db/supabase/admin";
import type { Json } from "@/lib/db/supabase/database.types";
import { KPI_BY_ID, type KpiDefinition } from "@/lib/growth/kpi-definitions";

export type KpiStatus = "above" | "on_track" | "below" | "unknown" | "external";

export interface KpiMetricValue {
    id: string;
    value: number | null;
    displayValue: string;
    status: KpiStatus;
    periodDays: number;
    note?: string;
    computedAt: string;
}

export interface GrowthKpiSnapshot {
    periodDays: number;
    periodLabel: string;
    metrics: KpiMetricValue[];
    leads: {
        newsletterSubscribers: number;
        demoRequests: number;
        freeToolLeads: number;
        partnerLeads: number;
    };
    counts: {
        /** Unique organizations with a signup event in the period. */
        signupsInPeriod: number;
        activePaidOrgs: number;
        trialingOrgs: number;
        totalOrganizations: number;
        /** Where paid/trial subscription counts were sourced. */
        billingSource: "stripe" | "database";
    };
    /** True when `GROWTH_MARKETING_SESSIONS_30D` is set — visitor → signup % can compute. */
    marketingSessionsConfigured: boolean;
}

const DEFAULT_PERIOD_DAYS = 30;

function periodStart(days: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString();
}

function evaluateStatus(
    def: KpiDefinition,
    value: number | null
): KpiStatus {
    if (value === null || def.targetValue === null) return "unknown";
    const t = def.targetValue;
    if (def.targetDirection === "higher") {
        if (value >= t) return "above";
        if (value >= t * 0.7) return "on_track";
        return "below";
    }
    if (value <= t) return "above";
    if (value <= t * 1.3) return "on_track";
    return "below";
}

function formatMetric(def: KpiDefinition, value: number | null): string {
    if (value === null) return "—";
    switch (def.targetUnit) {
        case "%":
            return `${value.toFixed(1)}%`;
        case "hours":
            return `${value.toFixed(1)}h`;
        case "usd":
            return `$${value.toFixed(2)}`;
        case "count":
        case "sessions":
        case "score":
            return Math.round(value).toLocaleString();
        default:
            return String(value);
    }
}

function isPlgSignup(metadata: Json | null): boolean {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
    const m = metadata as Record<string, unknown>;
    if (typeof m.plg_ref === "string" && m.plg_ref.length > 0) return true;
    const attr = m.attribution;
    if (attr && typeof attr === "object" && !Array.isArray(attr)) {
        const a = attr as Record<string, unknown>;
        if (a.utm_source === "plg") return true;
        if (typeof a.ref === "string" && a.ref.length > 0) return true;
    }
    return false;
}

type OrganizationBillingRow = {
    id: string;
    created_at: string;
    plan_status: string | null;
    plan: string | null;
    stripe_subscription_id: string | null;
};

function isPaidOrganization(o: OrganizationBillingRow): boolean {
    return (
        o.plan_status === "active" &&
        o.plan !== "free" &&
        o.plan != null &&
        o.stripe_subscription_id != null
    );
}

function isTrialingOrganization(o: OrganizationBillingRow): boolean {
    const status = o.plan_status?.toLowerCase() ?? "";
    return (
        (status === "trialing" || status === "trial") &&
        o.plan !== "free" &&
        o.plan != null &&
        o.stripe_subscription_id != null
    );
}

async function fetchStripeRevenueHints(): Promise<{
    mrrCents: number | null;
    activePaidSubscriptions: number;
    trialingSubscriptions: number;
    canceledLast30d: number;
    stripeConfigured: boolean;
}> {
    if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
        return {
            mrrCents: null,
            activePaidSubscriptions: 0,
            trialingSubscriptions: 0,
            canceledLast30d: 0,
            stripeConfigured: false,
        };
    }
    try {
        const { stripe } = await import("@/services/stripe/client");
        const since = Math.floor(Date.now() / 1000) - DEFAULT_PERIOD_DAYS * 86400;
        const [active, trialing, canceled] = await Promise.all([
            stripe.subscriptions.list({ status: "active", limit: 100 }),
            stripe.subscriptions.list({ status: "trialing", limit: 100 }),
            stripe.subscriptions.list({ status: "canceled", limit: 100, created: { gte: since } }),
        ]);
        let mrrCents = 0;
        for (const sub of active.data) {
            for (const item of sub.items.data) {
                const unit = item.price?.unit_amount ?? 0;
                const qty = item.quantity ?? 1;
                const interval = item.price?.recurring?.interval;
                if (interval === "month") mrrCents += unit * qty;
                else if (interval === "year") mrrCents += Math.round((unit * qty) / 12);
            }
        }
        return {
            mrrCents,
            activePaidSubscriptions: active.data.length,
            trialingSubscriptions: trialing.data.length,
            canceledLast30d: canceled.data.length,
            stripeConfigured: true,
        };
    } catch {
        return {
            mrrCents: null,
            activePaidSubscriptions: 0,
            trialingSubscriptions: 0,
            canceledLast30d: 0,
            stripeConfigured: false,
        };
    }
}

export async function fetchGrowthKpiSnapshot(
    periodDays: number = DEFAULT_PERIOD_DAYS
): Promise<GrowthKpiSnapshot> {
    const admin = createAdminClient();
    const since = periodStart(periodDays);
    const computedAt = new Date().toISOString();

    const [
        signupsRes,
        orgsRes,
        referralRes,
        subscribersRes,
        platformsRes,
        requestsRes,
        stripeHints,
    ] = await Promise.all([
        admin
            .from("events")
            .select("id, organization_id, metadata, created_at")
            .eq("event_type", "user.signed_up")
            .gte("created_at", since),
        admin.from("organizations").select("id, created_at, plan_status, plan, stripe_subscription_id"),
        admin
            .from("referral_conversions")
            .select("id, created_at")
            .gte("created_at", since),
        admin
            .from("marketing_subscribers")
            .select("email, source, subscribed_at")
            .gte("subscribed_at", since),
        admin
            .from("review_platforms")
            .select("business_id, platform, google_location_id, created_at")
            .eq("platform", "google")
            .not("google_location_id", "is", null),
        admin.from("review_requests").select("business_id, created_at").gte("created_at", since),
        fetchStripeRevenueHints(),
    ]);

    const signupEvents = signupsRes.data ?? [];
    const signupOrgIds = new Set(
        signupEvents.reduce<string[]>((acc, e) => {
            if (e.organization_id) acc.push(e.organization_id);
            return acc;
        }, [])
    );
    const signupsInPeriod = signupOrgIds.size;
    const plgSignups = new Set(
        signupEvents.reduce<string[]>((acc, e) => {
            if (e.organization_id && isPlgSignup(e.metadata)) acc.push(e.organization_id);
            return acc;
        }, [])
    ).size;
    const referralCount = referralRes.data?.length ?? 0;

    const orgs = (orgsRes.data ?? []) as OrganizationBillingRow[];
    const paidFromDb = orgs.filter(isPaidOrganization).length;
    const trialingFromDb = orgs.filter(isTrialingOrganization).length;
    const billingSource: "stripe" | "database" = stripeHints.stripeConfigured ? "stripe" : "database";
    const activePaidOrgs = stripeHints.stripeConfigured
        ? stripeHints.activePaidSubscriptions
        : paidFromDb;
    const trialingOrgs = stripeHints.stripeConfigured
        ? stripeHints.trialingSubscriptions
        : trialingFromDb;
    const businessToOrg = new Map<string, string>();
    if (signupOrgIds.size > 0) {
        const { data: businesses } = await admin
            .from("businesses")
            .select("id, organization_id")
            .in("organization_id", [...signupOrgIds]);
        for (const b of businesses ?? []) {
            businessToOrg.set(b.id, b.organization_id);
        }
    }

    const googleBusinessIds = new Set((platformsRes.data ?? []).map((p) => p.business_id));
    let googleConnectedSignupOrgs = 0;
    for (const orgId of signupOrgIds) {
        const hasGoogle = [...businessToOrg.entries()].some(
            ([bizId, oId]) => oId === orgId && googleBusinessIds.has(bizId)
        );
        if (hasGoogle) googleConnectedSignupOrgs += 1;
    }

    const signupGoogleRate =
        signupOrgIds.size > 0
            ? (googleConnectedSignupOrgs / signupOrgIds.size) * 100
            : null;

    const paidFromTrial = orgs.filter(
        (o) => isPaidOrganization(o) && new Date(o.created_at) >= new Date(since)
    ).length;
    const newOrgsInPeriod = orgs.filter((o) => new Date(o.created_at) >= new Date(since)).length;
    const trialConversionRate =
        newOrgsInPeriod > 0 ? (paidFromTrial / newOrgsInPeriod) * 100 : null;

    const hoursToFirstRequest: number[] = [];
    if (requestsRes.data?.length) {
        const { data: allBiz } = await admin.from("businesses").select("id, organization_id, created_at");
        const orgCreated = new Map(
            (allBiz ?? []).map((b) => [b.id, { orgId: b.organization_id, created: b.created_at }])
        );
        const firstRequestByBiz = new Map<string, string>();
        for (const r of requestsRes.data) {
            const existing = firstRequestByBiz.get(r.business_id);
            if (!existing || r.created_at < existing) {
                firstRequestByBiz.set(r.business_id, r.created_at);
            }
        }
        for (const [bizId, reqAt] of firstRequestByBiz) {
            const meta = orgCreated.get(bizId);
            if (!meta) continue;
            const org = orgs.find((o) => o.id === meta.orgId);
            const anchor = org?.created_at ?? meta.created;
            const diffH =
                (new Date(reqAt).getTime() - new Date(anchor).getTime()) / (1000 * 60 * 60);
            if (diffH >= 0 && diffH < 24 * 14) hoursToFirstRequest.push(diffH);
        }
    }
    const medianHours =
        hoursToFirstRequest.length > 0
            ? [...hoursToFirstRequest].sort((a, b) => a - b)[
                  Math.floor(hoursToFirstRequest.length / 2)
              ]!
            : null;

    const plgShare = signupsInPeriod > 0 ? (plgSignups / signupsInPeriod) * 100 : null;
    const referralShare = signupsInPeriod > 0 ? (referralCount / signupsInPeriod) * 100 : null;

    const churnRate =
        stripeHints.activePaidSubscriptions > 0
            ? (stripeHints.canceledLast30d / stripeHints.activePaidSubscriptions) * 100
            : null;

    const arpu =
        stripeHints.mrrCents !== null && activePaidOrgs > 0
            ? stripeHints.mrrCents / 100 / activePaidOrgs
            : null;

    const sessionsEnv = process.env.GROWTH_MARKETING_SESSIONS_30D;
    const sessions =
        sessionsEnv && Number.isFinite(Number(sessionsEnv)) ? Number(sessionsEnv) : null;
    const visitorSignupRate =
        sessions !== null && sessions > 0 && signupsInPeriod > 0
            ? (signupsInPeriod / sessions) * 100
            : null;

    const prevMrrEnv = process.env.GROWTH_MRR_PREVIOUS_MONTH_CENTS;
    const prevMrr =
        prevMrrEnv && Number.isFinite(Number(prevMrrEnv)) ? Number(prevMrrEnv) : null;
    const mrrGrowthMom =
        stripeHints.mrrCents !== null && prevMrr !== null && prevMrr > 0
            ? ((stripeHints.mrrCents - prevMrr) / prevMrr) * 100
            : null;

    const subs = subscribersRes.data ?? [];
    const leads = {
        newsletterSubscribers: subs.filter((s) => s.source === "newsletter").length,
        demoRequests: subs.filter((s) => s.source === "demo_request").length,
        freeToolLeads: subs.filter((s) => String(s.source).startsWith("tool_")).length,
        partnerLeads: subs.filter((s) => s.source === "partners_page" || s.source === "agency_waitlist")
            .length,
    };

    const rawValues: Record<string, number | null> = {
        visitor_signup_rate: visitorSignupRate,
        signup_google_connected_rate: signupGoogleRate,
        trial_paid_conversion_rate: trialConversionRate,
        time_to_first_review_request_hours: medianHours,
        monthly_churn_rate: churnRate,
        mrr_growth_mom: mrrGrowthMom,
        arpu_usd: arpu,
        plg_signup_share: plgShare,
        referral_signup_share: referralShare,
    };

    const metrics: KpiMetricValue[] = Object.keys(KPI_BY_ID).map((id) => {
        const def = KPI_BY_ID[id]!;
        if (!def.computable) {
            return {
                id,
                value: null,
                displayValue: "External",
                status: "external" as KpiStatus,
                periodDays,
                note: def.externalUrl ? `Track in ${def.source}` : def.source,
                computedAt,
            };
        }
        const value = rawValues[id] ?? null;
        return {
            id,
            value,
            displayValue: formatMetric(def, value),
            status: evaluateStatus(def, value),
            periodDays,
            computedAt,
            note:
                value === null
                    ? id === "visitor_signup_rate"
                        ? "Set GROWTH_MARKETING_SESSIONS_30D to calculate visitor → signup conversion."
                        : id === "mrr_growth_mom"
                          ? "Set GROWTH_MRR_PREVIOUS_MONTH_CENTS or use Stripe MRR chart."
                          : "Insufficient data in period — connect Stripe or wait for more signups."
                    : undefined,
        };
    });

    return {
        periodDays,
        periodLabel: `Last ${periodDays} days`,
        metrics,
        leads,
        counts: {
            signupsInPeriod,
            activePaidOrgs,
            trialingOrgs,
            totalOrganizations: orgs.length,
            billingSource,
        },
        marketingSessionsConfigured: sessions !== null && sessions > 0,
    };
}
