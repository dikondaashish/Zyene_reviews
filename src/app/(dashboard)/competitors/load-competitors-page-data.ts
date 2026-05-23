import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { getCompetitorRangeStart, normalizeCompetitorRange } from "@/lib/competitors/date-range";
import type { CompetitorsPageLoadResult } from "./competitors-page-types";
import { fetchCompetitorsPageRaw } from "./fetch-competitors-page-raw";
import { buildCompetitorsListProps } from "./build-competitors-list-props";

export type { CompetitorsPageLoadResult, CompetitorsListProps } from "./competitors-page-types";

export async function loadCompetitorsPageData(rangeParam?: string): Promise<CompetitorsPageLoadResult> {
    const supabase = await createClient();
    const range = normalizeCompetitorRange(rangeParam);
    const rangeStart = getCompetitorRangeStart(range);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { businessId } = await getActiveBusinessId();
    if (!businessId) return { kind: "no-business" };

    const raw = await fetchCompetitorsPageRaw(businessId, rangeStart);
    if (!raw.ok) return { kind: "error" };

    const listProps = await buildCompetitorsListProps(businessId, range, raw);

    return {
        kind: "ok",
        recentAlertsCount: raw.recentAlertsCountRes.count ?? 0,
        listProps,
    };
}
