/**
 * Authorization and field-level guards for PATCH /api/businesses/[id].
 *
 * Each guard throws ApiRouteError; the route's catch turns that into the
 * response. Ownership is checked through organization_members rather than
 * trusting the id in the URL.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { ApiRouteError } from "@/app/api/_shared/errors";
import type { Database } from "@/lib/db/supabase/database.types";
import { planAllowsAutoCommenter } from "@/services/stripe/plans";
import { sanitizeSlug } from "@/lib/utils";

import { DEFAULT_REVIEW_PAGE_BG, type BusinessPatchBody } from "./business-patch-schema";

type Client = SupabaseClient<Database>;

const MIN_SLUG_LENGTH = 3;

export interface CurrentBusiness {
    auto_reply_enabled: boolean | null;
    organizations: { plan?: string | null; plan_status?: string | null } | null;
}

/** Throws 403 unless the user is a member of the org that owns this business. */
export async function assertBusinessMembership(
    supabase: Client,
    userId: string,
    businessId: string,
): Promise<void> {
    const { data: membership, error } = await supabase
        .from("organization_members")
        .select("role, organizations!inner(businesses!inner(id))")
        .eq("user_id", userId)
        .eq("organizations.businesses.id", businessId)
        .single();

    if (error || !membership) {
        throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
    }
}

/** Loads the fields the guards need, or throws 404. */
export async function loadCurrentBusiness(
    supabase: Client,
    businessId: string,
): Promise<CurrentBusiness> {
    const { data, error } = await supabase
        .from("businesses")
        .select(`
                auto_reply_enabled,
                organizations ( plan, plan_status )
            `)
        .eq("id", businessId)
        .single();

    if (error || !data) {
        throw new ApiRouteError("Business not found", {
            status: 404,
            code: "BUSINESS_NOT_FOUND",
            details: error?.message,
        });
    }

    return data as unknown as CurrentBusiness;
}

/**
 * Auto commenter is a paid feature. Only enforced when the patch actually
 * touches auto-reply and leaves it enabled — editing other fields on a business
 * whose plan lapsed must still work.
 */
export function assertAutoReplyAllowed(
    body: BusinessPatchBody,
    current: CurrentBusiness,
): void {
    const touchesAutoReply =
        body.auto_reply_enabled !== undefined ||
        body.auto_reply_min_rating !== undefined ||
        body.auto_reply_tone !== undefined;

    const nextEnabled =
        body.auto_reply_enabled !== undefined
            ? body.auto_reply_enabled
            : current.auto_reply_enabled;

    if (!touchesAutoReply || !nextEnabled) return;

    const plan = current.organizations?.plan ?? null;
    const planStatus = current.organizations?.plan_status ?? null;

    if (!planAllowsAutoCommenter(plan, planStatus)) {
        throw new ApiRouteError(
            "Auto commenter requires a Starter, Professional, or Enterprise plan.",
            { status: 403, code: "AUTO_REPLY_PLAN_REQUIRED" },
        );
    }
}

/** Normalizes the requested slug and rejects collisions with another business. */
export async function resolveUniqueSlug(
    supabase: Client,
    businessId: string,
    requested: string,
): Promise<string> {
    const sanitized = sanitizeSlug(requested);
    if (sanitized.length < MIN_SLUG_LENGTH) {
        throw new ApiRouteError("Slug must be at least 3 characters.", {
            status: 400,
            code: "INVALID_SLUG",
        });
    }

    const { data: conflict } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", sanitized)
        .neq("id", businessId)
        .maybeSingle();

    if (conflict) {
        throw new ApiRouteError("This link is already taken.", {
            status: 409,
            code: "SLUG_TAKEN",
        });
    }

    return sanitized;
}

/**
 * Turns the validated body into the row update: stamps auto_reply_enabled_at on
 * transitions and substitutes the default background when it is cleared.
 */
export function buildBusinessUpdatePayload(
    body: BusinessPatchBody,
    current: CurrentBusiness,
    resolvedSlug: string | undefined,
): Database["public"]["Tables"]["businesses"]["Update"] {
    const patch: BusinessPatchBody & { auto_reply_enabled_at?: string | null } = { ...body };

    if (resolvedSlug !== undefined) {
        patch.slug = resolvedSlug;
    }
    if (body.auto_reply_enabled === true && !current.auto_reply_enabled) {
        patch.auto_reply_enabled_at = new Date().toISOString();
    }
    if (body.auto_reply_enabled === false) {
        patch.auto_reply_enabled_at = null;
    }

    const { review_page_background_color, ...patchRest } = patch;

    return {
        ...patchRest,
        ...(review_page_background_color !== undefined
            ? {
                  review_page_background_color:
                      review_page_background_color === null
                          ? DEFAULT_REVIEW_PAGE_BG
                          : review_page_background_color,
              }
            : {}),
    };
}
