import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const ADD_BUSINESS_OAUTH_COOKIE = "zyene_add_business_oauth";
export const ADD_BUSINESS_OAUTH_TTL_SECONDS = 600;

const stateSchema = z.object({
    nonce: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    userId: z.string().uuid(),
    organizationId: z.string().uuid(),
    expiresAt: z.number().int().positive(),
});

type AddBusinessState = z.infer<typeof stateSchema>;

function signature(payload: string, secret: string): Buffer {
    return createHmac("sha256", secret)
        .update(`add-business-oauth:v1:${payload}`)
        .digest();
}

export function createAddBusinessOAuthState(
    userId: string,
    organizationId: string,
    secret: string,
    now = Date.now(),
): { nonce: string; cookieValue: string } {
    if (!secret) throw new Error("OAuth state signing secret is missing");

    const nonce = randomBytes(32).toString("base64url");
    const state: AddBusinessState = {
        nonce,
        userId,
        organizationId,
        expiresAt: now + ADD_BUSINESS_OAUTH_TTL_SECONDS * 1000,
    };
    const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
    return {
        nonce,
        cookieValue: `${payload}.${signature(payload, secret).toString("base64url")}`,
    };
}

export function verifyAddBusinessOAuthState(
    nonce: string,
    cookieValue: string | undefined,
    expectedUserId: string,
    secret: string,
    now = Date.now(),
): AddBusinessState | null {
    if (!secret || !cookieValue) return null;
    const [payload, suppliedMac, extra] = cookieValue.split(".");
    if (!payload || !suppliedMac || extra) return null;

    const actual = Buffer.from(suppliedMac, "base64url");
    const expected = signature(payload, secret);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

    try {
        const parsed = stateSchema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString()));
        if (!parsed.success) return null;
        const state = parsed.data;
        if (state.nonce !== nonce || state.userId !== expectedUserId || state.expiresAt <= now) {
            return null;
        }
        return state;
    } catch {
        return null;
    }
}
