import { getActiveBusinessId } from "@/lib/auth/business-context";
import { normalizeSavedBusinessType } from "@/lib/campaigns/business-types";
import CampaignsPage from "./page-client";

/** Loads the saved business type on the server so the template picker starts on it without a flash. */
export default async function CampaignsRoute() {
    const { businessId, business } = await getActiveBusinessId();
    return (
        <CampaignsPage
            businessId={businessId}
            savedBusinessType={normalizeSavedBusinessType(typeof business?.category === "string" ? business.category : null)}
        />
    );
}
