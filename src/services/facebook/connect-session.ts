import { randomBytes } from "node:crypto";
import { redis } from "@/lib/db/redis";
import type { FbConnectCookieData } from "./confirm-schema";

export const FB_CONNECT_COOKIE = "fb_connect_data";

function key(nonce: string) {
    return `facebook-connect:${nonce}`;
}

export async function saveFacebookConnectData(data: FbConnectCookieData): Promise<string> {
    const nonce = randomBytes(32).toString("base64url");
    await redis.set(key(nonce), data, { ex: 300 });
    return nonce;
}

export async function readFacebookConnectData(nonce: string | undefined) {
    if (!nonce || !/^[A-Za-z0-9_-]{43}$/.test(nonce)) return null;
    return redis.get<FbConnectCookieData>(key(nonce));
}

export async function consumeFacebookConnectData(nonce: string | undefined) {
    if (!nonce || !/^[A-Za-z0-9_-]{43}$/.test(nonce)) return null;
    return redis.getdel<FbConnectCookieData>(key(nonce));
}
