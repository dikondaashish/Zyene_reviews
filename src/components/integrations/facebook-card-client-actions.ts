import { toast } from "sonner";

type AppRouterLike = { refresh: () => void };

export async function runFacebookReviewsSync(router: AppRouterLike): Promise<void> {
    const res = await fetch("/api/cron/sync-reviews", {
        headers: { host: "localhost" },
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg = data.error || "Sync failed";
        const details = data.details;
        toast.error(msg, { description: details });
        return;
    }

    toast.success("Facebook reviews synced!");
    router.refresh();
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
