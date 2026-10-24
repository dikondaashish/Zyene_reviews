"use client";

import { Check, Loader2, X } from "lucide-react";
import { reviewCaptureBaseUrl } from "@/lib/review-requests/review-capture-url";
import type { ReviewLinkStatus } from "./use-review-link-draft";

const STATUS: Record<ReviewLinkStatus, { text: string; tone: string } | null> = {
    unchanged: null,
    invalid: { text: "Use at least 3 letters, numbers or dashes.", tone: "text-muted-foreground" },
    checking: { text: "Checking…", tone: "text-muted-foreground" },
    available: { text: "Available", tone: "text-success" },
    taken: { text: "Taken. Try another.", tone: "text-destructive" },
};

/** The public link customers open to leave a review, editable before it is ever shared. */
export function Step3ReviewLinkField({ value, status, onChange, disabled }: { value: string; status: ReviewLinkStatus; onChange: (v: string) => void; disabled: boolean }) {
    const prefix = reviewCaptureBaseUrl("").replace(/^https?:\/\//, "");
    const note = STATUS[status];
    return (
        <div className="space-y-1.5 border-t border-border pt-5">
            <label htmlFor="review-link" className="text-sm font-medium text-foreground">Your review link</label>
            <div className="flex h-11 items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="flex h-full items-center border-r border-input bg-muted px-3 text-sm text-muted-foreground">{prefix}</span>
                <input id="review-link" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
                    aria-describedby="review-link-help" aria-invalid={status === "taken" || status === "invalid"}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none" />
                {status === "checking" && <Loader2 className="mr-3 size-4 animate-spin text-muted-foreground" aria-hidden />}
                {status === "available" && <Check className="mr-3 size-4 text-success" aria-hidden />}
                {status === "taken" && <X className="mr-3 size-4 text-destructive" aria-hidden />}
            </div>
            {note && <p className={`text-xs ${note.tone}`} role="status">{note.text}</p>}
            <p id="review-link-help" className="text-xs leading-relaxed text-muted-foreground">
                Customers open this to leave you a review. You can change it, along with your logo, colours and the
                review page wording, any time in Settings → Public profile.
            </p>
        </div>
    );
}
