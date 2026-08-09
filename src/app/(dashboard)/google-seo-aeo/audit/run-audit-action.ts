"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { inngest } from "@/services/inngest/client";
import { isLiveCrawlingEnabled } from "@/lib/features/aeo-surfaces";
import { parseOrigin } from "@/services/aeo/scheduler/load-due-crawl-businesses";

/** Real per-business cooldown, not a generic rate limiter — a business only ever needs one audit at a time, and re-crawling every few minutes is both wasteful and impolite to the target site. */
const MIN_MINUTES_BETWEEN_AUDITS = 60;

async function canManageBusiness(businessId: string): Promise<boolean> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

    const role = String(data?.role || "").toLowerCase();
    return role === "owner" || role === "admin" || role === "manager";
}

export type RunAuditResult = { success: true; eventId?: string } | { success: false; error: string };

export async function runTechnicalAuditNow(businessId: string): Promise<RunAuditResult> {
    if (!(await canManageBusiness(businessId))) {
        return { success: false, error: "You do not have permission to run this audit." };
    }
    if (!isLiveCrawlingEnabled()) {
        return { success: false, error: "Technical audits are not yet enabled for this deployment." };
    }

    const supabase = await createClient();

    const { data: business } = await supabase
        .from("businesses")
        .select("website, organization_id")
        .eq("id", businessId)
        .maybeSingle();

    if (!business?.website) {
        return { success: false, error: "Add a website to this business before running a technical audit." };
    }
    const origin = parseOrigin(business.website);
    if (!origin) {
        return { success: false, error: "This business's website URL looks invalid." };
    }

    const { data: recent } = await supabase
        .from("crawl_runs")
        .select("status, started_at")
        .eq("business_id", businessId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (recent?.status === "running") {
        return { success: false, error: "An audit is already running for this business." };
    }
    if (recent) {
        const minutesAgo = Math.round((Date.now() - new Date(recent.started_at).getTime()) / 60_000);
        if (minutesAgo < MIN_MINUTES_BETWEEN_AUDITS) {
            return {
                success: false,
                error: `An audit ran ${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago. Please wait before running another.`,
            };
        }
    }

    const { data: org } = await supabase
        .from("organizations")
        .select("plan")
        .eq("id", business.organization_id)
        .maybeSingle();

    try {
        const evt = await inngest.send({
            name: "aeo/crawl.requested",
            data: {
                businessId,
                organizationId: business.organization_id,
                origin,
                planId: org?.plan ?? null,
                trigger: "manual",
            },
        });
        revalidatePath("/google-seo-aeo/audit");
        return { success: true, eventId: evt.ids?.[0] };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to queue audit." };
    }
}
