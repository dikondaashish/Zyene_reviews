export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";
import { PLAN_CREDIT_GRANTS_MICRO_USD } from "@/services/aeo/billing/billing-constants";

const AEO_ELIGIBLE_PLAN_IDS = Object.keys(PLAN_CREDIT_GRANTS_MICRO_USD);

/**
 * F8 detection fan-out — daily, every AEO-eligible business, no per-business
 * slot. Unlike E-10 (sampling) and E-3 (crawling), detection is pure reads
 * against data that already exists; there is no external call to spread
 * load against, so there is nothing E-10's slot mechanism would protect.
 *
 * Registered daily at 09:00 UTC — after the 1–8 UTC sampling window closes,
 * so detection reads the night's fresh samples rather than racing them. The
 * digest runs an hour later, at 10:00, giving detection room to finish before
 * anything is emailed.
 *
 * AEO_LIVE_ALERTING remains the separate gate, checked inside the alert
 * worker: with it unset this cron fans out events that create no alerts and
 * send no email.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const admin = createAdminClient();
        const { data: orgs, error: orgsError } = await admin
            .from("organizations")
            .select("id")
            .in("plan", AEO_ELIGIBLE_PLAN_IDS)
            .in("plan_status", ["active", "trialing"]);

        if (orgsError) throw new Error(orgsError.message);
        if (!orgs || orgs.length === 0) {
            return NextResponse.json({ success: true, dispatched: 0 });
        }

        const { data: businesses, error: bizError } = await admin
            .from("businesses")
            .select("id, organization_id")
            .in("organization_id", orgs.map((o) => o.id));

        if (bizError) throw new Error(bizError.message);
        if (!businesses || businesses.length === 0) {
            return NextResponse.json({ success: true, dispatched: 0 });
        }

        await inngest.send(
            businesses.map((b) => ({
                name: "aeo/alert-check.requested" as const,
                data: { businessId: b.id, organizationId: b.organization_id },
            }))
        );

        return NextResponse.json({ success: true, dispatched: businesses.length });
    } catch (error: unknown) {
        logger.error({ err: error }, "[cron/aeo-alert-scheduler] fan-out failed:");
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
