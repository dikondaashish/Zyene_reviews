import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

/**
 * CSRF-safe OAuth state for the Square and Clover connect flows.
 *
 * The provider only ever sees a random nonce. The business and user it belongs to
 * live in an HMAC-signed, short-lived, httpOnly cookie scoped to the callback path,
 * so a callback link built by someone else (with their own `code`) cannot attach
 * their merchant account to the victim's business: it has no matching cookie.
 */
export type PosOAuthProvider = "square" | "clover";

const STATE_TTL_MS = 600_000;
export const POS_OAUTH_STATE_MAX_AGE_S = STATE_TTL_MS / 1000;

const stateSchema = z.object({
    nonce: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    userId: z.string().uuid(),
    businessId: z.string().uuid(),
    expiresAt: z.number().int().positive(),
});

export type PosOAuthState = z.infer<typeof stateSchema>;

export function posOAuthStateCookieName(provider: PosOAuthProvider): string {
    return `${provider}_oauth_state`;
}

export function posOAuthCallbackPath(provider: PosOAuthProvider): string {
    return `/api/integrations/${provider}/callback`;
}

function mac(provider: PosOAuthProvider, payload: string, secret: string): Buffer {
    return createHmac("sha256", secret).update(`${provider}-oauth:v1:${payload}`).digest();
}

export function createPosOAuthState(
    provider: PosOAuthProvider, userId: string, businessId: string, secret: string,
): { nonce: string; cookieValue: string } {
    if (!secret) throw new Error(`${provider} OAuth secret missing`);
    const nonce = randomBytes(32).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
        nonce, userId, businessId, expiresAt: Date.now() + STATE_TTL_MS,
    })).toString("base64url");
    return { nonce, cookieValue: `${payload}.${mac(provider, payload, secret).toString("base64url")}` };
}

/** Returns the bound state only when nonce, signature, signed-in user and expiry all match. */
export function verifyPosOAuthState(
    provider: PosOAuthProvider,
    nonce: string | null,
    cookieValue: string | undefined,
    userId: string,
    secret: string,
): PosOAuthState | null {
    if (!secret || !nonce || !cookieValue) return null;
    const [payload, signature, extra] = cookieValue.split(".");
    if (!payload || !signature || extra !== undefined) return null;
    const actual = Buffer.from(signature, "base64url");
    const expected = mac(provider, payload, secret);
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

/** Same cookie scoping as the Facebook flow: shared across app subdomains, callback path only. */
export function posOAuthCookieOptions(provider: PosOAuthProvider, maxAge: number) {
    const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000")
        .replace(/^https?:\/\//, "").split(":")[0].replace(/^(?:www\.|app\.|auth\.)/, "");
    return {
        domain: root === "localhost" || root === "127.0.0.1" ? undefined : `.${root}`,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: posOAuthCallbackPath(provider),
        maxAge,
    };
}
