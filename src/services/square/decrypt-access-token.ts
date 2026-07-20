import { createAdminClient } from "@/lib/db/supabase/admin";
import { refreshSquareAccessToken } from "@/services/square/api-client";

type Admin = ReturnType<typeof createAdminClient>;

export async function decryptSquareAccessToken(
    admin: Admin,
    connection: {
        id: string;
        access_token_encrypted: string;
        refresh_token_encrypted: string | null;
        access_token_expires_at: string | null;
    },
): Promise<string> {
    const expiresAt = connection.access_token_expires_at
        ? new Date(connection.access_token_expires_at).getTime()
        : null;
    const expired = expiresAt != null && expiresAt < Date.now() + 60_000;

    if (expired && connection.refresh_token_encrypted) {
        const { data: refreshPlain, error } = await admin.rpc("decrypt_token", {
            ciphertext: connection.refresh_token_encrypted,
        });
        if (error || !refreshPlain) throw error ?? new Error("decrypt refresh failed");
        return refreshSquareAccessToken(admin, connection.id, refreshPlain);
    }

    const { data: accessPlain, error } = await admin.rpc("decrypt_token", {
        ciphertext: connection.access_token_encrypted,
    });
    if (error || !accessPlain) throw error ?? new Error("decrypt access failed");
    return accessPlain;
}
