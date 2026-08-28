import { toast } from "sonner";
import { postFacebookReviewSync } from "@/components/integrations/facebook-card-sync-api";

type AppRouterLike = { refresh: () => void };

export async function runFacebookReviewsSync(router: AppRouterLike, businessId: string): Promise<void> {
    const result = await postFacebookReviewSync(businessId);
    if (result.ok) {
        router.refresh();
    }
}

export async function disconnectFacebookIntegration(businessId: string, router: AppRouterLike): Promise<void> {
    const res = await fetch(`/api/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            disconnectPlatform: "facebook",
        }),
    });
    if (!res.ok) throw new Error("Disconnect failed");
    toast.success("Facebook disconnected");
    router.refresh();
}
