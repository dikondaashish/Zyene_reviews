import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    getSquareApplicationId,
    getSquareApplicationSecret,
    getSquareConnectBaseUrl,
} from "@/services/square/config";

type Admin = ReturnType<typeof createAdminClient>;

export async function fetchSquarePayment(args: {
    paymentId: string;
    accessToken: string;
}): Promise<unknown> {
    const url = `${getSquareConnectBaseUrl()}/v2/payments/${encodeURIComponent(args.paymentId)}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${args.accessToken}`,
            Accept: "application/json",
            "Square-Version": "2025-01-23",
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Square payment fetch failed (${res.status}): ${text.slice(0, 300)}`);
    }
    const body = (await res.json()) as { payment?: unknown };
    return body.payment ?? body;
}

export async function fetchSquareCustomer(args: {
    customerId: string;
    accessToken: string;
}): Promise<unknown | null> {
    const url = `${getSquareConnectBaseUrl()}/v2/customers/${encodeURIComponent(args.customerId)}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${args.accessToken}`,
            Accept: "application/json",
            "Square-Version": "2025-01-23",
        },
    });
    if (!res.ok) {
        const text = await res.text();
        logger.warn(
            { status: res.status, customerId: args.customerId, body: text.slice(0, 200) },
            "[square] customer fetch failed",
        );
        return null;
    }
    const body = (await res.json()) as { customer?: unknown };
    return body.customer ?? body;
}

export async function refreshSquareAccessToken(
    admin: Admin,
    connectionId: string,
    refreshTokenPlain: string,
): Promise<string> {
    const appId = getSquareApplicationId();
    const appSecret = getSquareApplicationSecret();
    if (!appId || !appSecret) throw new Error("Square credentials missing");

    const res = await fetch(`${getSquareConnectBaseUrl()}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
            client_id: appId,
            client_secret: appSecret,
            grant_type: "refresh_token",
            refresh_token: refreshTokenPlain,
        }),
    });
    const body = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_at?: string;
        message?: string;
        errors?: Array<{ detail?: string }>;
    };
    if (!res.ok || !body.access_token) {
        throw new Error(
            body.errors?.[0]?.detail || body.message || `Square refresh failed (${res.status})`,
        );
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
        .from("square_connections")
        .update({
            access_token_encrypted: encAccess,
            ...(encRefresh ? { refresh_token_encrypted: encRefresh } : {}),
            access_token_expires_at: body.expires_at ?? null,
            updated_at: new Date().toISOString(),
            last_error: null,
        })
        .eq("id", connectionId);

    return body.access_token;
}
