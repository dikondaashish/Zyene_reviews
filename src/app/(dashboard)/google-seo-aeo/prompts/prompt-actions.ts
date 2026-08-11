"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";

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
    businessId: z.string().uuid(),
    promptText: z.string().trim().min(3).max(PROMPT_TEXT_MAX),
    intent: z.enum(["discovery", "comparison", "transactional", "branded"]).nullable(),
    localeCity: z.string().trim().max(120).nullable(),
});

const toggleSchema = z.object({
    promptId: z.string().uuid(),
    isActive: z.boolean(),
});

const deleteSchema = z.object({ promptId: z.string().uuid() });

export type PromptActionResult = { ok: true } | { ok: false; error: string };

/** Confirms the caller may act on this business, and returns an admin client. */
async function authorize(businessId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, error: "Not authenticated" };

    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) return { ok: false as const, error: "You do not have access to this business." };

    return { ok: true as const, admin: createAdminClient() };
}

/** Resolves a prompt's owning business, so a promptId alone cannot cross tenants. */
async function authorizeByPrompt(promptId: string) {
    const admin = createAdminClient();
    const { data: prompt } = await admin
        .from("aeo_prompts")
        .select("business_id")
        .eq("id", promptId)
        .maybeSingle();

    if (!prompt) return { ok: false as const, error: "Prompt not found" };

    const auth = await authorize(prompt.business_id);
    if (!auth.ok) return auth;
    return { ok: true as const, admin, businessId: prompt.business_id };
}

export async function createPrompt(input: unknown): Promise<PromptActionResult> {
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Enter a prompt between 3 and 500 characters." };

    const auth = await authorize(parsed.data.businessId);
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
    const parsed = toggleSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request" };

    const auth = await authorizeByPrompt(parsed.data.promptId);
    if (!auth.ok) return auth;

    const { error } = await auth.admin
        .from("aeo_prompts")
        .update({ is_active: parsed.data.isActive, updated_at: new Date().toISOString() })
        .eq("id", parsed.data.promptId);

    if (error) {
        logger.error({ err: error }, "[AEO] prompt activation toggle failed");
        return { ok: false, error: "Could not update that prompt." };
    }

    revalidatePath("/google-seo-aeo/prompts");
    return { ok: true };
}

export async function deletePrompt(input: unknown): Promise<PromptActionResult> {
    const parsed = deleteSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request" };

    const auth = await authorizeByPrompt(parsed.data.promptId);
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
