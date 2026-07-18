import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    cloverUnixSecondsToIso,
    getCloverApiBaseUrl,
    getCloverAppId,
    getCloverAppSecret,
    getCloverEnvironment,
} from "@/services/clover/config";

type Admin = ReturnType<typeof createAdminClient>;

export async function fetchCloverPayment(args: {
    merchantId: string;
    paymentId: string;
    accessToken: string;
}): Promise<unknown> {
    const url =
        `${getCloverApiBaseUrl()}/v3/merchants/${encodeURIComponent(args.merchantId)}` +
        `/payments/${encodeURIComponent(args.paymentId)}` +
        `?expand=order,customer,tender`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${args.accessToken}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Clover payment fetch failed (${res.status}): ${text.slice(0, 300)}`);
    }
    return res.json();
}

/** Expand order customers when payment payload lacks contact. */
export async function fetchCloverOrderCustomers(args: {
    merchantId: string;
    orderId: string;
    accessToken: string;
}): Promise<unknown> {
    const url =
        `${getCloverApiBaseUrl()}/v3/merchants/${encodeURIComponent(args.merchantId)}` +
        `/orders/${encodeURIComponent(args.orderId)}?expand=customers`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${args.accessToken}`,
            Accept: "application/json",
        },
    });
    if (!res.ok) {
        const text = await res.text();
        logger.warn(
            { status: res.status, body: text.slice(0, 200) },
            "[clover] order customers fetch failed",
        );
        return null;
    }
    return res.json();
}

export async function refreshCloverAccessToken(
    admin: Admin,
    connectionId: string,
    refreshTokenPlain: string,
): Promise<string> {
    const appId = getCloverAppId();
    const appSecret = getCloverAppSecret();
    if (!appId || !appSecret) throw new Error("Clover credentials missing");

    const res = await fetch(`${getCloverApiBaseUrl()}/oauth/v2/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: appId,
            refresh_token: refreshTokenPlain,
        }),
    });
    const body = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
        access_token_expiration?: number;
        refresh_token_expiration?: number;
        message?: string;
    };
    if (!res.ok || !body.access_token) {
        throw new Error(body.message || `Clover refresh failed (${res.status})`);
    }

    const { data: encAccess, error: encErr } = await admin.rpc("encrypt_token", {
        plaintext: body.access_token,
    });
    if (encErr || !encAccess) throw encErr ?? new Error("encrypt_token failed");

    let encRefresh: string | null = null;
    if (body.refresh_token) {
        const { data, error } = await admin.rpc("encrypt_token", {
            plaintext: body.refresh_token,
        });
        if (error || !data) throw error ?? new Error("encrypt refresh failed");
        encRefresh = data;
    }

    await admin
        .from("clover_connections")
        .update({
            access_token_encrypted: encAccess,
            ...(encRefresh ? { refresh_token_encrypted: encRefresh } : {}),
            access_token_expires_at: cloverUnixSecondsToIso(body.access_token_expiration),
            refresh_token_expires_at: cloverUnixSecondsToIso(body.refresh_token_expiration),
            updated_at: new Date().toISOString(),
            last_error: null,
        })
        .eq("id", connectionId);

    return body.access_token;
}

export function getCloverEnvForStorage(): string {
    return getCloverEnvironment();
}
