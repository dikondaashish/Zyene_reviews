import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { loadPhase2Visibility } from "./load-phase2-visibility";
import { loadPhase2Operations } from "./load-phase2-operations";
import { isBusinessWebsitePage } from "@/services/aeo/content-briefs/owned-page";

export async function loadPhase2PageData() {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) redirect("/login");
    const context = await getActiveBusinessId();
    if (!context.businessId || !context.business || !context.organization) return { kind: "no-business" as const };
    const [visibility, operations] = await Promise.all([
        loadPhase2Visibility(db, context.businessId),
        loadPhase2Operations(db, context.businessId, context.organization.id),
    ]);
    const website = typeof context.business.website === "string" ? context.business.website : null;
    operations.recommendations = operations.recommendations.filter((row) => !row.targetUrl || isBusinessWebsitePage(row.targetUrl, website));
    return { kind: "ok" as const, businessId: context.businessId, businessName: context.business.name ?? "Business", visibility, operations };
}
