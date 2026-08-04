import type { createAdminClient } from "@/lib/db/supabase/admin";

/** The service-role client the webhook handlers write through. */
export type WebhookAdminClient = ReturnType<typeof createAdminClient>;
