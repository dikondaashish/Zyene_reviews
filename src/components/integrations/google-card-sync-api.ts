import { toast } from "sonner";

export async function postGoogleReviewSync(
    businessId: string,
    force: boolean,
    onConflictForce: () => void
): Promise<{ ok: true } | { ok: false }> {
    const res = await fetch("/api/sync/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, force }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = (data as { error?: string }).error || "Sync failed";
        const details = (data as { details?: string }).details;
        const activationUrl = (data as { activationUrl?: string }).activationUrl;

        if (res.status === 409) {
            toast.error("Sync is already running", {
                description: "If it's been running for a long time, you can try to Force Sync.",
                action: {
                    label: "Force Sync",
                    onClick: onConflictForce,
                },
            });
            return { ok: false };
        }

        const description = [details, activationUrl].filter(Boolean).join("\n\n");
        toast.error(msg, { description: description || undefined, duration: 12_000 });
        return { ok: false };
    }
    return { ok: true };
}
