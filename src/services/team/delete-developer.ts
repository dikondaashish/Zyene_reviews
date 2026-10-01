import type { SupabaseClient } from "@supabase/supabase-js";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { logger } from "@/lib/logger";

// Narrow extension until the next generated database-types refresh.
type DeveloperDatabase = {
    public: {
        Tables: Record<string, never>;
        Views: Record<string, never>;
        Functions: {
            delete_organization_developer: {
                Args: { target_business: string; target_member: string };
                Returns: undefined;
            };
        };
    };
};

export async function deleteDeveloper(client: unknown, businessId: string, memberId: string) {
    try {
        const supabase = client as SupabaseClient<DeveloperDatabase>;
        const { error } = await supabase.rpc("delete_organization_developer", {
            target_business: businessId,
            target_member: memberId,
        });
        if (error?.code === "42501") return apiError("Only organization owners can delete developers", { status: 403 });
        if (error) throw error;
        return apiOk({ deleted: true });
    } catch (error) {
        logger.error({ err: error }, "[team/delete developer] Removal failed");
        return apiError("Unable to remove developer", { status: 500 });
    }
}
