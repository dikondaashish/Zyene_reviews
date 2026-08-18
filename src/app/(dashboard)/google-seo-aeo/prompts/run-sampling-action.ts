"use server";

import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { inngest } from "@/services/inngest/client";
import { engineRegistry } from "@/services/aeo/engines/engine-registry";
import { registerAeoAdapters } from "@/services/aeo/engines/register-adapters";

const schema = z.object({ businessId: z.string().uuid(), attempts: z.number().int().min(1).max(5) });

export async function runSamplingNow(input: unknown) {
    const parsed = schema.safeParse(input); if (!parsed.success) return { ok: false as const, error: "Invalid sampling request" };
    const db = await createClient(); const { data: { user } } = await db.auth.getUser();
    if (!user || !(await userCanAccessBusiness(db, user.id, parsed.data.businessId))) return { ok: false as const, error: "Unauthorized" };
    const business = await db.from("businesses").select("organization_id").eq("id", parsed.data.businessId).single();
    if (business.error) return { ok: false as const, error: "Business not found" };
    registerAeoAdapters();
    const engineIds = engineRegistry.describeAll().filter((engine) => engine.state === "available" && engine.descriptor.id !== "copilot").map((engine) => engine.descriptor.id);
    if (!engineIds.length) return { ok: false as const, error: "No sampling engine is configured" };
    await inngest.send({ name: "aeo/run.requested", data: { businessId: parsed.data.businessId, organizationId: business.data.organization_id, trigger: "manual", engineIds, attemptsPerPrompt: parsed.data.attempts, overageAuthorised: false } });
    return { ok: true as const, engines: engineIds.length, attempts: parsed.data.attempts };
}
