import { toast } from "sonner";

type SyncResponse = {
    success?: boolean;
    data?: { total?: number };
    error?: string;
    details?: string;
};

export async function postFacebookReviewSync(businessId: string): Promise<{ ok: true } | { ok: false }> {
    const res = await fetch("/api/sync/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
    });
    const data = (await res.json().catch(() => ({}))) as SyncResponse;

    if (!res.ok) {
        toast.error(data.error || "Sync failed", {
            description: data.details,
        });
        return { ok: false };
    }

    const total = data.data?.total;
    toast.success(
        typeof total === "number" ? `Synced ${total} Facebook review${total === 1 ? "" : "s"}` : "Facebook reviews synced!",
    );
    return { ok: true };
}
