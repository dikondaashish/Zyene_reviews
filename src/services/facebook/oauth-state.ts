import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const FACEBOOK_STATE_COOKIE = "fb_oauth_state";
const stateSchema = z.object({
    nonce: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    userId: z.string().uuid(),
    businessId: z.string().uuid(),
    expiresAt: z.number().int().positive(),
});

function mac(payload: string, secret: string) {
    return createHmac("sha256", secret).update(`facebook-oauth:v1:${payload}`).digest();
}

export function createFacebookOAuthState(userId: string, businessId: string, secret: string) {
    if (!secret) throw new Error("Facebook OAuth secret missing");
    const nonce = randomBytes(32).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
        nonce, userId, businessId, expiresAt: Date.now() + 600_000,
    })).toString("base64url");
    return { nonce, cookieValue: `${payload}.${mac(payload, secret).toString("base64url")}` };
}

export function verifyFacebookOAuthState(
    nonce: string, cookieValue: string | undefined, userId: string, secret: string,
) {
    if (!secret || !cookieValue) return null;
    const [payload, signature, extra] = cookieValue.split(".");
    if (!payload || !signature || extra) return null;
    const actual = Buffer.from(signature, "base64url");
    const expected = mac(payload, secret);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    try {
        const parsed = stateSchema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString()));
        if (!parsed.success || parsed.data.nonce !== nonce || parsed.data.userId !== userId ||
            parsed.data.expiresAt <= Date.now()) return null;
        return parsed.data;
    } catch {
        return null;
    }
}

export function facebookCookieOptions(path: string, maxAge: number) {
    const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000")
        .replace(/^https?:\/\//, "").split(":")[0].replace(/^(?:www\.|app\.|auth\.)/, "");
    return {
        domain: root === "localhost" || root === "127.0.0.1" ? undefined : `.${root}`,
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const, path, maxAge,
    };
}
