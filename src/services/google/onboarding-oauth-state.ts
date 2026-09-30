import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redis } from "@/lib/db/redis";

const COOKIE = "google_onboarding_state";
const options = { httpOnly: true, sameSite: "lax" as const, path: "/",
    secure: process.env.NODE_ENV === "production", maxAge: 300 };
interface State { userId: string; businessId: string; redirectUri: string }

export async function beginGoogleOnboardingOAuth(data: State): Promise<string> {
    const nonce = randomBytes(32).toString("base64url");
    await redis.set(`google-onboarding-state:${nonce}`, data, { ex: 300 });
    (await cookies()).set(COOKIE, nonce, options);
    return nonce;
}

export async function consumeGoogleOnboardingOAuth(nonce: string, userId: string, businessId: string): Promise<State | null> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(nonce)) return null;
    const store = await cookies();
    const cookie = store.get(COOKIE)?.value;
    if (!cookie || !/^[A-Za-z0-9_-]{43}$/.test(cookie) || !timingSafeEqual(Buffer.from(nonce), Buffer.from(cookie))) return null;
    const key = `google-onboarding-state:${nonce}`;
    const state = await redis.get<State>(key);
    if (!state || state.userId !== userId || state.businessId !== businessId) return null;
    const consumed = await redis.getdel<State>(key);
    if (!consumed || consumed.userId !== userId || consumed.businessId !== businessId) return null;
    store.set(COOKIE, "", { ...options, maxAge: 0 });
    return consumed;
}
