import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using the service role key.
 * WARNING: Only use this server-side (API routes, webhooks, server actions).
 * This bypasses Row Level Security.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
