"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { AutoReplyTone } from "@/components/reviews/auto-reply-toolbar-types";

const SAMPLE: Record<AutoReplyTone, string> = {
    professional:
        "Thank you for sharing your experience. We appreciate your feedback and look forward to welcoming you again.",
    friendly: "Thank you for the lovely feedback! We’re so glad you enjoyed your visit and hope to see you again soon.",
    concise: "Thank you for your feedback. We look forward to your next visit.",
};

export function AutoReplyEnableDialog({
    open,
    onOpenChange,
    minRating,
    tone,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    minRating: number;
    tone: AutoReplyTone;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Turn on automatic Google replies?</DialogTitle>
                    <DialogDescription>
                        AI replies will be published publicly for the business selected in the header. You will not
                        review each reply before it is posted.
                    </DialogDescription>
                </DialogHeader>
                <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
                    <dt className="text-muted-foreground">Applies to</dt>
                    <dd>New, unanswered reviews</dd>
                    <dt className="text-muted-foreground">Rating</dt>
                    <dd>
                        {minRating} stars {minRating === 5 ? "only" : "and up"}
                    </dd>
                    <dt className="text-muted-foreground">Tone</dt>
                    <dd className="capitalize">{tone}</dd>
                </dl>
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Example reply · actual replies vary</p>
                    <blockquote className="border-l-2 border-primary pl-4 text-sm leading-relaxed">
                        {SAMPLE[tone]}
                    </blockquote>
                </div>
                <p className="text-xs text-muted-foreground">
                    Existing reviews are not included. An active paid subscription or trial is required. Turn this off at any time to stop future
                    automatic replies.
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Keep off
                    </Button>
                    <Button onClick={onConfirm}>Enable automatic publishing</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
