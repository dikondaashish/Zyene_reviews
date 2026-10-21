"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Manual review confirmation. Shown because platforms do not tell us which customer wrote
 * a review (only a public display name), so we cannot confirm it automatically.
 */
export function RequestReviewConfirmButton({
    requestId,
    confirmedSource,
    status,
}: {
    requestId: string;
    confirmedSource: string | null | undefined;
    /** Only requests that actually went out can lead to a review. */
    status: string;
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [confirmed, setConfirmed] = useState(Boolean(confirmedSource));
    if (confirmedSource && confirmedSource !== "manual") return null;
    if (!confirmedSource && ["queued", "sending", "processing", "skipped", "failed"].includes(status)) return null;

    const toggle = () => {
        startTransition(async () => {
            const response = await fetch(`/api/requests/${requestId}/confirm-review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmed: !confirmed }),
            });
            if (!response.ok) {
                toast.error("Could not update the review confirmation");
                return;
            }
            setConfirmed(!confirmed);
            toast.success(confirmed ? "Confirmation removed" : "Marked as reviewed. Reminders stopped.");
            router.refresh();
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={toggle}
            title="Use this after you've seen this customer's review on Google, Yelp or Facebook. We can't match reviews to customers automatically."
        >
            {confirmed ? "Undo review confirmation" : "Mark review confirmed"}
        </Button>
    );
}

/** Why a request was skipped, delayed or failed, in plain words. */
export function RequestOutcomeNote({ req }: {
    req: { status: string; error_message?: string | null; deferred_reason?: string | null };
}) {
    const note = req.status === "queued" ? req.deferred_reason
        : ["skipped", "failed"].includes(req.status) ? req.error_message : null;
    if (!note) return null;
    return <p className="mt-1 max-w-[260px] text-xs text-muted-foreground">{note}</p>;
}
