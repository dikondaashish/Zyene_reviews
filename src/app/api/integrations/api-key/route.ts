import { NextResponse } from "next/server";
import { z } from "zod";

import { API_KEY_SCOPES, DEVELOPER_API_SCOPES } from "@/lib/api-keys/scopes";
import {
    authorizeApiKeyManagement,
    createManagedApiKey,
    findApiKeyForManagement,
    revokeManagedApiKey,
    rotateManagedApiKey,
} from "@/services/api-keys/manage-api-keys";

const scopeSchema = z.enum(API_KEY_SCOPES);
const createSchema = z.object({
    businessId: z.uuid(),
    name: z.string().trim().min(1).max(100).default("Developer API"),
    scopes: z.array(scopeSchema).min(1).max(API_KEY_SCOPES.length).default(DEVELOPER_API_SCOPES),
    rateLimitPerMinute: z.number().int().min(1).max(600).default(60),
});
const keySchema = z.object({ keyId: z.uuid() });

function authorizationError(status: 401 | 403) {
    return NextResponse.json(
        { error: status === 401 ? "Unauthorized" : "Only business owners and admins can manage API keys" },
        { status },
    );
}

function oneTimeSecretResponse(body: unknown, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
    });
}

export async function POST(req: Request) {
    const parsed = createSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid API key request" }, { status: 400 });
    const auth = await authorizeApiKeyManagement(parsed.data.businessId);
    if (!auth.ok) return authorizationError(auth.status);
    const created = await createManagedApiKey({
        ...parsed.data,
        actorUserId: auth.user.id,
    });
    if (!created) return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
    return oneTimeSecretResponse(created, 201);
}

export async function PATCH(req: Request) {
    const parsed = keySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
    const oldKey = await findApiKeyForManagement(parsed.data.keyId);
    if (!oldKey?.business_id) return NextResponse.json({ error: "API key not found" }, { status: 404 });
    const auth = await authorizeApiKeyManagement(oldKey.business_id);
    if (!auth.ok) return authorizationError(auth.status);
    const rotated = await rotateManagedApiKey(oldKey, auth.user.id);
    if (!rotated) return NextResponse.json({ error: "Unable to rotate API key" }, { status: 500 });
    return oneTimeSecretResponse(rotated);
}

export async function DELETE(req: Request) {
    const parsed = keySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
    const key = await findApiKeyForManagement(parsed.data.keyId);
    if (!key?.business_id) return NextResponse.json({ error: "API key not found" }, { status: 404 });
    const auth = await authorizeApiKeyManagement(key.business_id);
    if (!auth.ok) return authorizationError(auth.status);
    const revoked = await revokeManagedApiKey(key.id, auth.user.id, "manual");
    if (!revoked) return NextResponse.json({ error: "Unable to revoke API key" }, { status: 500 });
    return NextResponse.json({ revoked: true });
}
