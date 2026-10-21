import { toast } from "sonner";

type SyncResponse = {
    error?: string;
    details?: string;
};

export async function postYelpReviewSync(businessId: string): Promise<{ ok: boolean }> {
    try {
        const res = await fetch("/api/sync/yelp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessId }),
        });
        const data = (await res.json().catch(() => ({}))) as SyncResponse;

        if (!res.ok) {
            toast.error(data.error || "Sync failed", { description: data.details });
            return { ok: false };
        }

        toast.success("Yelp reviews synced");
        return { ok: true };
    } catch {
        toast.error("Sync failed");
        return { ok: false };
    }
}
