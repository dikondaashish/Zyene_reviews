import type { ApiKeyScope } from "./scopes";

export type RotatableApiKey = {
    id: string;
    businessId: string | null;
    name: string;
    scopes: ApiKeyScope[];
    rateLimitPerMinute: number;
    revokedAt: string | null;
};

type CreatedApiKey = { key: { id: string } };

export async function performApiKeyRotation<T extends CreatedApiKey>(
    oldKey: RotatableApiKey,
    actorUserId: string,
    operations: {
        create: (input: {
            businessId: string;
            name: string;
            scopes: ApiKeyScope[];
            rateLimitPerMinute: number;
            actorUserId: string;
            rotatedFromId: string;
        }) => Promise<T | null>;
        revoke: (
            keyId: string,
            actorId: string,
            reason: "manual" | "rotated",
        ) => Promise<boolean>;
    },
): Promise<T | null> {
    if (!oldKey.businessId || oldKey.revokedAt) return null;
    const created = await operations.create({
        businessId: oldKey.businessId,
        name: oldKey.name,
        scopes: oldKey.scopes,
        rateLimitPerMinute: oldKey.rateLimitPerMinute,
        actorUserId,
        rotatedFromId: oldKey.id,
    });
    if (!created) return null;
    if (await operations.revoke(oldKey.id, actorUserId, "rotated")) return created;

    await operations.revoke(created.key.id, actorUserId, "manual");
    return null;
}
