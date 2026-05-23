import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";

export type PlaceLinkRow = {
    id: string;
    place_action_type: string;
    uri: string;
    is_preferred: boolean;
    is_broken: boolean;
};

export type BusinessInformationPageData =
    | { kind: "no-business" }
    | { kind: "place-links-error" }
    | {
          kind: "ok";
          business: NonNullable<Awaited<ReturnType<typeof getActiveBusinessId>>["business"]>;
          isGoogleConnected: boolean;
          isLodgingBusiness: boolean;
          placeLinks: PlaceLinkRow[];
      };

export async function loadBusinessInformationPageData(): Promise<BusinessInformationPageData> {
    const { business } = await getActiveBusinessId();

    if (!business) {
        return { kind: "no-business" };
    }

    const isGoogleConnected = !!business.review_platforms?.find(
        (p: { platform?: string }) => p.platform === "google"
    );
    const isLodgingBusiness = business.category === "hotel";

    let placeLinks: PlaceLinkRow[] = [];

    if (isGoogleConnected) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("gbp_place_action_links")
            .select("id, place_action_type, uri, is_preferred, is_broken")
            .eq("business_id", business.id)
            .order("place_action_type", { ascending: true });
        if (error) {
            logger.error({ err: error }, "[Business information] Place links fetch failed:");
            return { kind: "place-links-error" };
        }
        placeLinks = data ?? [];
    }

    return {
        kind: "ok",
        business,
        isGoogleConnected,
        isLodgingBusiness,
        placeLinks,
    };
}
