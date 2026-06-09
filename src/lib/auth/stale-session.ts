import type { AuthError, SupabaseClient } from "@supabase/supabase-js";

/** Supabase session cookies point at a refresh token that no longer exists server-side. */
export function isStaleRefreshTokenError(error: AuthError | null | undefined): boolean {
    if (!error) return false;
    return (
        error.code === "refresh_token_not_found" ||
        error.code === "invalid_refresh_token" ||
        error.message.includes("Refresh Token Not Found") ||
        error.message.includes("Invalid Refresh Token")
    );
}

/** Clear broken auth cookies without calling the remote revoke endpoint. */
export async function signOutStaleSession(supabase: SupabaseClient): Promise<void> {
    try {
        await supabase.auth.signOut({ scope: "local" });
    } catch {
        // Session already cleared or cookies missing.
    }
}

/** getUser() that treats expired/missing refresh tokens as logged out. */
export async function getBrowserUser(supabase: SupabaseClient) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (isStaleRefreshTokenError(error)) {
        await signOutStaleSession(supabase);
        return null;
    }
    return user;
}
