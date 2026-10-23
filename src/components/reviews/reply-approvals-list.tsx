"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PendingReplyDraft } from "@/services/reviews/reply-drafts-load";

function DraftCard({ draft, canApprove }: { draft: PendingReplyDraft; canApprove: boolean }) {
    const router = useRouter();
    const [text, setText] = useState(draft.draftText);
    const [pending, startTransition] = useTransition();

    const decide = (action: "approve" | "reject") => startTransition(async () => {
        const response = await fetch(`/api/reviews/reply-approvals/${draft.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action === "approve" ? { action, text } : { action }),
        });
        const body = await response.json().catch(() => null) as { error?: string; data?: { status?: string } } | null;
        if (!response.ok) {
            toast.error(body?.error || "Could not update this reply");
            return;
        }
        const status = body?.data?.status;
        toast.success(status === "posted" ? "Reply posted to Google" : status === "superseded" ? "Already answered, nothing posted" : "Draft rejected");
        router.refresh();
    });

    const rating = draft.review?.rating ?? draft.rating ?? 0;
    return (
        <li className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
                <span className="flex" aria-label={`${rating} stars`}>
                    {Array.from({ length: 5 }, (_, i) => <Star key={i} strokeWidth={0} aria-hidden className={`size-4 fill-current ${i < rating ? "text-warning" : "text-muted-foreground/25"}`} />)}
                </span>
                <span className="text-sm font-medium">{draft.review?.authorName || "Google reviewer"}</span>
                <Badge variant="outline">{draft.source === "ai" ? "AI draft" : "Template"}</Badge>
                {draft.status === "failed" && <Badge variant="destructive">Posting failed</Badge>}
            </div>
            {draft.review?.text && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{draft.review.text}</p>}
            {draft.error && <p className="text-xs text-destructive">{draft.error}</p>}
            <Textarea rows={4} value={text} disabled={!canApprove || pending} onChange={(e) => setText(e.target.value)} aria-label="Reply text" />
            {canApprove && (
                <div className="flex gap-2">
                    <Button size="sm" disabled={pending || text.trim().length < 3} onClick={() => decide("approve")}>Approve and post</Button>
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => decide("reject")}>Reject</Button>
                </div>
            )}
        </li>
    );
}

export function ReplyApprovalsList({ drafts, canApprove }: { drafts: PendingReplyDraft[]; canApprove: boolean }) {
    if (!drafts.length) {
        return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No replies are waiting for approval.</p>;
    }
    return (
        <div className="space-y-3">
            {!canApprove && (
                <p className="text-sm text-muted-foreground">You can see these drafts, but only designated approvers can post or reject them.</p>
            )}
            <ul className="space-y-3">
                {drafts.map((d) => <DraftCard key={d.id} draft={d} canApprove={canApprove} />)}
            </ul>
        </div>
    );
}
