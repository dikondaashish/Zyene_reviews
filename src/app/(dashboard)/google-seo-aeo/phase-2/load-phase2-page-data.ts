import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { loadPhase2Visibility } from "./load-phase2-visibility";
import { loadPhase2Operations } from "./load-phase2-operations";

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
    return { kind: "ok" as const, businessId: context.businessId, businessName: context.business.name ?? "Business", visibility, operations };
}
