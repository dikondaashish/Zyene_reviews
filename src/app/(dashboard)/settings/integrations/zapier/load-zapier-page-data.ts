import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { getAppBaseUrl } from "@/config/env";

export async function loadZapierPageData() {
    const { business } = await getActiveBusinessId();

    if (!business) {
        return { kind: "no-business" as const };
    }

    const supabase = await createClient();
    const { data: apiPlatform } = await supabase
        .from("review_platforms")
        .select("external_id, sync_status")
        .eq("business_id", business.id)
        .eq("platform", "api")
        .maybeSingle();

    const apiKey =
        apiPlatform?.sync_status === "active" && apiPlatform?.external_id
            ? apiPlatform.external_id
            : null;

    return {
        kind: "ok" as const,
        business,
        apiKey,
        appBaseUrl: getAppBaseUrl(),
    };
}
