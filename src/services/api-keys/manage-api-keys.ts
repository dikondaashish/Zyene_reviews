import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createApiKeyMaterial, toPublicApiKey } from "@/lib/api-keys/credentials";
import type { ApiKeyScope } from "@/lib/api-keys/scopes";
import { canManageApiKeys } from "@/lib/api-keys/scopes";
import { performApiKeyRotation } from "@/lib/api-keys/rotation";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";

const PUBLIC_FIELDS =
    "id, name, key_prefix, scopes, rate_limit_per_minute, last_used_at, revoked_at, created_at";

type KeyRow = {
    id: string;
    organization_id: string;
    business_id: string | null;
    name: string;
    key_prefix: string;
    scopes: string[];
    rate_limit_per_minute: number;
    last_used_at: string | null;
    revoked_at: string | null;
    created_at: string;
};

export type ManagementAuthorization =
    | { ok: true; user: User }
    | { ok: false; status: 401 | 403 };

export async function authorizeApiKeyManagement(
    businessId: string,
): Promise<ManagementAuthorization> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, status: 401 };

    const member = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
    if (!canManageApiKeys(member.data?.role)) return { ok: false, status: 403 };
    return { ok: true, user };
}

async function organizationIdForBusiness(businessId: string): Promise<string | null> {
    const result = await createAdminClient()
        .from("businesses")
        .select("organization_id")
        .eq("id", businessId)
        .maybeSingle();
    return result.data?.organization_id ?? null;
}

export async function findApiKeyForManagement(keyId: string): Promise<KeyRow | null> {
    const result = (await createAdminClient()
        .from("aeo_public_api_keys" as never)
        .select(`${PUBLIC_FIELDS}, organization_id, business_id` as never)
        .eq("id" as never, keyId as never)
        .maybeSingle()) as unknown as { data: KeyRow | null };
    return result.data;
}

export async function createManagedApiKey(input: {
    businessId: string;
    name: string;
    scopes: ApiKeyScope[];
    rateLimitPerMinute: number;
    actorUserId: string;
    rotatedFromId?: string;
}) {
    const organizationId = await organizationIdForBusiness(input.businessId);
    if (!organizationId) return null;
    const material = createApiKeyMaterial();
    const result = (await createAdminClient()
        .from("aeo_public_api_keys" as never)
        .insert({
            organization_id: organizationId,
            business_id: input.businessId,
            name: input.name,
            key_prefix: material.storage.keyPrefix,
            key_hash: material.storage.keyHash,
            scopes: input.scopes,
            rate_limit_per_minute: input.rateLimitPerMinute,
            created_by_user_id: input.actorUserId,
            rotated_from_id: input.rotatedFromId ?? null,
        } as never)
        .select(PUBLIC_FIELDS as never)
        .single()) as unknown as { data: KeyRow | null; error: unknown };
    if (result.error || !result.data) return null;
    return { apiKey: material.secret, key: toPublicApiKey(result.data) };
}

export async function revokeManagedApiKey(
    keyId: string,
    actorUserId: string,
    reason: "manual" | "rotated",
): Promise<boolean> {
    const result = (await createAdminClient()
        .from("aeo_public_api_keys" as never)
        .update({
            revoked_at: new Date().toISOString(),
            revoked_by_user_id: actorUserId,
            revocation_reason: reason,
        } as never)
        .eq("id" as never, keyId as never)
        .is("revoked_at" as never, null as never)
        .select("id" as never)
        .maybeSingle()) as unknown as { data: { id: string } | null; error: unknown };
    return !result.error && Boolean(result.data);
}

export async function rotateManagedApiKey(oldKey: KeyRow, actorUserId: string) {
    return performApiKeyRotation({
        id: oldKey.id,
        businessId: oldKey.business_id,
        name: oldKey.name,
        scopes: oldKey.scopes as ApiKeyScope[],
        rateLimitPerMinute: oldKey.rate_limit_per_minute,
        revokedAt: oldKey.revoked_at,
    }, actorUserId, {
        create: createManagedApiKey,
        revoke: revokeManagedApiKey,
    });
}

export async function loadActiveApiKeySummary(
    supabase: SupabaseClient,
    businessId: string,
    scope: ApiKeyScope,
) {
    const result = (await supabase
        .from("aeo_public_api_keys" as never)
        .select(PUBLIC_FIELDS as never)
        .eq("business_id" as never, businessId as never)
        .contains("scopes" as never, [scope] as never)
        .is("revoked_at" as never, null as never)
        .order("created_at" as never, { ascending: false })
        .limit(1)
        .maybeSingle()) as unknown as { data: KeyRow | null };
    return result.data ? toPublicApiKey(result.data) : null;
}
