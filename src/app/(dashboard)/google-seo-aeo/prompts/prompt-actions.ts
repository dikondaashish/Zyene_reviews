"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { activePromptLimitForPlan } from "@/services/aeo/prompts/prompt-plan-limit";

/**
 * Prompt library (F4.1–F4.3).
 *
 * Activation is the money decision, not creation. An inactive prompt costs
 * nothing and is never dispatched; activating one enrols it in every future
 * run across every enabled engine. So activation is always an explicit,
 * separate act — nothing here creates a prompt that is already live.
 */

const PROMPT_TEXT_MAX = 500;

const createSchema = z.object({
    businessId: z.uuid(),
    promptText: z.string().trim().min(3).max(PROMPT_TEXT_MAX),
    intent: z.enum(["discovery", "comparison", "transactional", "branded"]).nullable(),
    localeCity: z.string().trim().max(120).nullable(),
});

const toggleSchema = z.object({
    promptId: z.uuid(),
    isActive: z.boolean(),
});

const deleteSchema = z.object({ promptId: z.uuid() });

export type PromptActionResult =
    | { ok: true }
    | { ok: false; error: string; upgradeHref?: string };

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** Confirms the authenticated caller may act on this business. */
async function authorize(supabase: ServerClient, userId: string, businessId: string) {
    const allowed = await userCanAccessBusiness(supabase, userId, businessId);
    if (!allowed) return { ok: false as const, error: "You do not have access to this business." };

    return { ok: true as const, admin: createAdminClient() };
}

/** Resolves a prompt's owning business, so a promptId alone cannot cross tenants. */
async function authorizeByPrompt(supabase: ServerClient, userId: string, promptId: string) {
    const admin = createAdminClient();
    const { data: prompt } = await admin
        .from("aeo_prompts")
        .select("business_id")
        .eq("id", promptId)
        .maybeSingle();

    if (!prompt) return { ok: false as const, error: "Prompt not found" };

    const auth = await authorize(supabase, userId, prompt.business_id);
    if (!auth.ok) return auth;
    return { ok: true as const, admin, businessId: prompt.business_id };
}

export async function createPrompt(input: unknown): Promise<PromptActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Enter a prompt between 3 and 500 characters." };

    const auth = await authorize(supabase, user.id, parsed.data.businessId);
    if (!auth.ok) return auth;

    const { error } = await auth.admin.from("aeo_prompts").insert({
        business_id: parsed.data.businessId,
        prompt_text: parsed.data.promptText,
        intent: parsed.data.intent,
        locale_city: parsed.data.localeCity,
        source: "manual",
        // Created inactive, always. Enrolling a prompt into paid runs is a
        // separate, deliberate click — never a side effect of typing it.
        is_active: false,
    });

    if (error) {
        logger.error({ err: error }, "[AEO] prompt insert failed");
        return { ok: false, error: "Could not save that prompt." };
    }

    revalidatePath("/google-seo-aeo/prompts");
    return { ok: true };
}

export async function setPromptActive(input: unknown): Promise<PromptActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const parsed = toggleSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request" };

    const auth = await authorizeByPrompt(supabase, user.id, parsed.data.promptId);
    if (!auth.ok) return auth;

    if (parsed.data.isActive) {
        const { data: business } = await auth.admin
            .from("businesses")
            .select("organizations!inner(plan, plan_status)")
            .eq("id", auth.businessId)
            .single();
        const org = business?.organizations;
        const limit = activePromptLimitForPlan(org?.plan, org?.plan_status);
        const { count } = await auth.admin
            .from("aeo_prompts")
            .select("id", { count: "exact", head: true })
            .eq("business_id", auth.businessId)
            .eq("is_active", true);

        if ((count ?? 0) >= limit) {
            return {
                ok: false,
                error: limit > 0
                    ? `Your plan includes ${limit} active prompts. Pause one or upgrade to activate another.`
                    : "A paid, active subscription is required to activate prompts.",
                upgradeHref: "/settings/billing",
            };
        }
    }

    const { error } = await auth.admin
        .from("aeo_prompts")
        .update({ is_active: parsed.data.isActive, updated_at: new Date().toISOString() })
        .eq("id", parsed.data.promptId);

    if (error) {
        logger.error({ err: error }, "[AEO] prompt activation toggle failed");
        const limit = /AEO_PROMPT_LIMIT_REACHED:(\d+)/.exec(error.message)?.[1];
        if (limit) {
            return {
                ok: false,
                error: `Your plan includes ${limit} active prompts. Pause one or upgrade to activate another.`,
                upgradeHref: "/settings/billing",
            };
        }
        return { ok: false, error: "Could not update that prompt." };
    }

    revalidatePath("/google-seo-aeo/prompts");
    return { ok: true };
}

export async function deletePrompt(input: unknown): Promise<PromptActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const parsed = deleteSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request" };

    const auth = await authorizeByPrompt(supabase, user.id, parsed.data.promptId);
    if (!auth.ok) return auth;

    // Samples reference prompt_id with ON DELETE SET NULL, so historic results
    // survive a deleted prompt rather than vanishing from the record. The
    // evidence of what an engine said is worth keeping even once we stop asking.
    const { error } = await auth.admin.from("aeo_prompts").delete().eq("id", parsed.data.promptId);

    if (error) {
        logger.error({ err: error }, "[AEO] prompt delete failed");
        return { ok: false, error: "Could not delete that prompt." };
    }

    revalidatePath("/google-seo-aeo/prompts");
    return { ok: true };
}
