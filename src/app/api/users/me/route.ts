import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { requireUser } from "@/app/api/_shared/auth";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { stripe } from "@/services/stripe/client";
import { z } from "zod";

const updateProfileSchema = z.object({
    full_name: z.string().max(200),
});

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    const parsed = updateProfileSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, { status: 400 });
    }
    const body = parsed.data;

    // Update user metadata (full_name)
    const { data, error } = await supabase.auth.updateUser({
        data: { full_name: body.full_name },
    });

    if (error) {
        return apiError("Internal Server Error", { status: 500 });
    }

    // Also update public.users table if it exists and has name column?
    // Usually auth triggers handle this, or we update it manually.
    // Assuming we might have a users table copy.
    // Let's check if we need to update a users table.
    // For now, updating auth metadata is standard.
    // If request included deleting, user.delete() is needed.

    return apiOk(data.user);
}

/**
 * Permanently delete the authenticated user.
 * - Orgs where this user is the only member are removed (CASCADE cleans businesses, reviews, etc.).
 * - Active Stripe subscriptions for those orgs are canceled when possible.
 * - Other orgs remain; this user's rows in public.users and organization_members are removed via CASCADE when auth user is deleted.
 */
export async function DELETE() {
    try {
        const { user } = await requireUser();
        const admin = createAdminClient();

        const { data: memberships, error: memErr } = await admin
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id);

        if (memErr) {
            throw new ApiRouteError("Failed to load memberships", {
                status: 500,
                code: "MEMBERSHIP_LOAD_FAILED",
                details: memErr.message,
            });
        }

        const orgIds = [...new Set((memberships ?? []).map((m) => m.organization_id))];

        for (const organizationId of orgIds) {
            const { count, error: countErr } = await admin
                .from("organization_members")
                .select("*", { count: "exact", head: true })
                .eq("organization_id", organizationId);

            if (countErr) {
                throw new ApiRouteError("Failed to verify organization membership", {
                    status: 500,
                    code: "MEMBER_COUNT_FAILED",
                    details: countErr.message,
                });
            }

            if ((count ?? 0) !== 1) continue;

            const { data: org, error: orgErr } = await admin
                .from("organizations")
                .select("id, stripe_subscription_id")
                .eq("id", organizationId)
                .maybeSingle();

            if (orgErr || !org) {
                throw new ApiRouteError("Failed to load organization", {
                    status: 500,
                    code: "ORG_LOAD_FAILED",
                    details: orgErr?.message,
                });
            }

            const subId =
                typeof org.stripe_subscription_id === "string" && org.stripe_subscription_id.trim()
                    ? org.stripe_subscription_id.trim()
                    : null;

            if (subId && process.env.STRIPE_SECRET_KEY) {
                try {
                    await stripe.subscriptions.cancel(subId);
                } catch (e) {
                    console.error("[DELETE /api/users/me] Stripe subscription cancel failed:", e);
                }
            }

            const { error: delOrgErr } = await admin.from("organizations").delete().eq("id", organizationId);
            if (delOrgErr) {
                throw new ApiRouteError("Failed to delete organization data", {
                    status: 500,
                    code: "ORG_DELETE_FAILED",
                    details: delOrgErr.message,
                });
            }
        }

        const { error: authDelErr } = await admin.auth.admin.deleteUser(user.id);
        if (authDelErr) {
            throw new ApiRouteError(authDelErr.message || "Failed to delete auth user", {
                status: 500,
                code: "AUTH_DELETE_FAILED",
            });
        }

        try {
            const { redis } = await import("@/lib/db/redis");
            await redis.del(`user_businesses:${user.id}`);
        } catch (e) {
            console.error("[DELETE /api/users/me] Redis cache purge failed:", e);
        }

        return apiOk({ deleted: true });
    } catch (err) {
        const e = toApiError(err);
        return apiError(e.message, { status: e.status, code: e.code, details: e.details });
    }
}
