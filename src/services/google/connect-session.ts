import { randomBytes } from "node:crypto";
import { redis } from "@/lib/db/redis";
import type { GoogleTokenBundle } from "@/app/actions/onboarding/google-oauth-helpers";
import type { GoogleBusinessLocation } from "@/app/actions/onboarding/types";

interface GoogleConnectData {
    userId: string;
    businessId: string;
    tokens: GoogleTokenBundle;
    locations: GoogleBusinessLocation[];
}

export async function saveGoogleConnectData(data: GoogleConnectData): Promise<string> {
    const nonce = randomBytes(32).toString("base64url");
    await redis.set(`google-connect:${nonce}`, data, { ex: 300 });
    return nonce;
}

export async function consumeGoogleConnectData(
    nonce: string, userId: string, businessId: string, locationName: string,
): Promise<{ tokens: GoogleTokenBundle; location: GoogleBusinessLocation } | null> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(nonce)) return null;
    const key = `google-connect:${nonce}`;
    const matches = (data: GoogleConnectData | null) => data?.userId === userId &&
        data.businessId === businessId && data.locations.some((location) => location.name === locationName);
    if (!matches(await redis.get<GoogleConnectData>(key))) return null;
    const data = await redis.getdel<GoogleConnectData>(key);
    if (!data || !matches(data)) return null;
    const location = data.locations.find((entry) => entry.name === locationName);
    return location ? { tokens: data.tokens, location } : null;
}
