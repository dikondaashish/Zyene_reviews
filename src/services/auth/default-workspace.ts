import type { SupabaseClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";

export type WorkspaceSetupStep =
    | "create_organization"
    | "create_business"
    | "create_business_member"
    | "create_organization_member";

export type DefaultWorkspaceResult =
    | { ok: true; organizationId: string; businessId: string }
    | { ok: false; step: WorkspaceSetupStep; error: unknown };

type Created = { organizationId?: string; businessId?: string };

export function workspaceSlug(fullName: string): string {
    return `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;
}

/**
 * Removes whatever a failed setup created, so the account is never left with an
 * organization but no membership (or no business), which onboarding cannot recover from.
 */
async function rollback(admin: SupabaseClient, userId: string, created: Created): Promise<void> {
    const steps: Array<[string, () => PromiseLike<{ error: unknown }>]> = [];
    if (created.businessId) {
        const businessId = created.businessId;
        steps.push(["business_members", () => admin.from("business_members").delete().eq("business_id", businessId)]);
        steps.push(["businesses", () => admin.from("businesses").delete().eq("id", businessId)]);
    }
    if (created.organizationId) {
        const organizationId = created.organizationId;
        steps.push(["organization_members", () =>
            admin.from("organization_members").delete().eq("organization_id", organizationId).eq("user_id", userId)]);
        steps.push(["organizations", () => admin.from("organizations").delete().eq("id", organizationId)]);
    }
    for (const [table, run] of steps) {
        const { error } = await run();
        if (error) logger.error({ err: error, table, userId }, "[workspace-setup] rollback failed");
    }
}

/** Default business (and its owner membership) inside an organization the user owns. */
export async function createDefaultBusiness(
    admin: SupabaseClient,
    params: { userId: string; organizationId: string; fullName: string; slug: string },
): Promise<DefaultWorkspaceResult> {
    const { userId, organizationId, fullName, slug } = params;
    const created: Created = {};
    const { data: business, error: bizError } = await admin
        .from("businesses")
        .insert({
            organization_id: organizationId,
            name: `${fullName}'s Business`,
            slug,
            country: "US",
            timezone: "UTC",
            category: "uncategorized",
            status: "active",
        })
        .select("id")
        .single();
    if (bizError || !business?.id) {
        return { ok: false, step: "create_business", error: bizError ?? new Error("missing business id") };
    }
    created.businessId = business.id as string;

    const { error: memberError } = await admin.from("business_members").upsert(
        { business_id: business.id, user_id: userId, role: "owner", status: "active" },
        { onConflict: "business_id,user_id" },
    );
    if (memberError) {
        await rollback(admin, userId, created);
        return { ok: false, step: "create_business_member", error: memberError };
    }
    return { ok: true, organizationId, businessId: business.id as string };
}

/**
 * Creates the owner's organization, default business and both memberships. All or
 * nothing: on any failure the rows already created are deleted again.
 */
export async function provisionDefaultWorkspace(
    admin: SupabaseClient,
    params: { userId: string; fullName: string; referredByUserId?: string | null; slug?: string },
): Promise<DefaultWorkspaceResult> {
    const { userId, fullName } = params;
    const slug = params.slug ?? workspaceSlug(fullName);

    const { data: org, error: orgError } = await admin
        .from("organizations")
        .insert({
            name: `${fullName}'s Org`,
            slug,
            type: "business",
            referred_by_user_id: params.referredByUserId ?? null,
        })
        .select()
        .single();
    if (orgError || !org?.id) {
        return { ok: false, step: "create_organization", error: orgError ?? new Error("missing organization id") };
    }
    const organizationId = org.id as string;
    const orgSlug = (org.slug as string | undefined) ?? slug;

    const business = await createDefaultBusiness(admin, { userId, organizationId, fullName, slug: orgSlug });
    if (!business.ok) {
        await rollback(admin, userId, { organizationId });
        return business;
    }

    const { error: orgMemberError } = await admin.from("organization_members").insert({
        organization_id: organizationId,
        user_id: userId,
        role: "ORG_OWNER",
        status: "active",
    });
    if (orgMemberError) {
        await rollback(admin, userId, { organizationId, businessId: business.businessId });
        return { ok: false, step: "create_organization_member", error: orgMemberError };
    }
    return business;
}
