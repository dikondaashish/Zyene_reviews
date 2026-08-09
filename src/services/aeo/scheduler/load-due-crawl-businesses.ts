import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { CRAWL_PAGE_CAP } from "../crawler/crawl-plan-budget";
import { isCrawlDueNow } from "../crawler/crawl-slot";

type Admin = SupabaseClient<Database>;

export type DueCrawlBusiness = { businessId: string; organizationId: string; origin: string; planId: string };

const CRAWL_ELIGIBLE_PLAN_IDS = Object.keys(CRAWL_PAGE_CAP);

/**
 * Businesses whose weekly E-3 crawl slot is right now, on a plan the crawler
 * is scoped to, with a real website to crawl.
 *
 * Deliberately NO grant-history filter here — unlike load-due-businesses.ts
 * (E-10 sampling), crawling never touches aeo_credit_balances. It costs this
 * app's own compute and the target site's own bandwidth, not vendor spend, so
 * the Wolfpack-shaped gap that filter exists for does not apply to this path.
 *
 * `website` must parse as an http(s) URL: a business with a malformed or
 * empty website is not "due for a crawl of nothing," it is not eligible yet.
 */
export async function loadDueCrawlBusinesses(db: Admin, now: Date): Promise<DueCrawlBusiness[]> {
    const { data: orgs, error: orgsError } = await db
        .from("organizations")
        .select("id, plan")
        .in("plan", CRAWL_ELIGIBLE_PLAN_IDS)
        .in("plan_status", ["active", "trialing"]);

    if (orgsError) throw new Error(`loadDueCrawlBusinesses orgs query failed: ${orgsError.message}`);
    if (!orgs || orgs.length === 0) return [];

    const planByOrgId = new Map(orgs.map((o) => [o.id, o.plan]));

    const { data: businesses, error: businessesError } = await db
        .from("businesses")
        .select("id, organization_id, website")
        .in("organization_id", orgs.map((o) => o.id));

    if (businessesError) {
        throw new Error(`loadDueCrawlBusinesses businesses query failed: ${businessesError.message}`);
    }
    if (!businesses || businesses.length === 0) return [];

    const due: DueCrawlBusiness[] = [];
    for (const b of businesses) {
        if (!isCrawlDueNow(b.id, now)) continue;
        const origin = parseOrigin(b.website);
        if (!origin) continue;
        const planId = planByOrgId.get(b.organization_id);
        if (!planId) continue;
        due.push({ businessId: b.id, organizationId: b.organization_id, origin, planId });
    }
    return due;
}

/** Shared with the manual-trigger action (audit/run-audit-action.ts) — one definition of "a real, crawlable website". */
export function parseOrigin(website: string | null): string | null {
    if (!website?.trim()) return null;
    try {
        const url = new URL(website.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url.origin;
    } catch {
        return null;
    }
}
