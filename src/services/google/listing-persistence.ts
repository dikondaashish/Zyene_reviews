import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import type { GoogleLocationFull } from "@/services/google/listing-information";

export async function persistGoogleListingSnapshot(
    supabase: SupabaseClient<Database>,
    input: {
        businessId: string;
        platformId: string;
        location: GoogleLocationFull;
        profileHealthScore: number;
    },
): Promise<void> {
    const now = new Date().toISOString();
    const { businessId, platformId, location, profileHealthScore } = input;

    const writes = await Promise.allSettled([
        supabase
            .from("businesses")
            .update({
                phone: location.phoneNumbers?.primaryPhone || null,
                address_line1: location.storefrontAddress?.addressLines?.join(", ") || null,
                city: location.storefrontAddress?.locality || null,
                state: location.storefrontAddress?.administrativeArea || null,
                zip: location.storefrontAddress?.postalCode || null,
                website: location.websiteUri || null,
                updated_at: now,
            })
            .eq("id", businessId),
        supabase
            .from("review_platforms")
            .update({
                google_profile_health_score: profileHealthScore,
                google_listing_synced_at: now,
                updated_at: now,
            })
            .eq("id", platformId),
    ]);

    for (const write of writes) {
        if (write.status === "rejected") {
            logger.warn({ err: write.reason }, "[Google Listing] Snapshot persistence failed");
        } else if (write.value.error) {
            logger.warn({ err: write.value.error }, "[Google Listing] Snapshot persistence failed");
        }
    }
}
