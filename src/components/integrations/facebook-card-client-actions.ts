import { toast } from "sonner";
import { postFacebookReviewSync } from "@/components/integrations/facebook-card-sync-api";
import { disconnectListingPlatform } from "@/app/(dashboard)/settings/integrations/disconnect-listing-platform";

type AppRouterLike = { refresh: () => void };

export async function runFacebookReviewsSync(router: AppRouterLike, businessId: string): Promise<void> {
    const result = await postFacebookReviewSync(businessId);
    if (result.ok) {
        router.refresh();
    }
}

export async function disconnectFacebookIntegration(platformId: string, router: AppRouterLike): Promise<void> {
    const result = await disconnectListingPlatform(platformId, "facebook");
    if (!result.ok) throw new Error(result.error);
    toast.success("Facebook disconnected");
    router.refresh();
}
