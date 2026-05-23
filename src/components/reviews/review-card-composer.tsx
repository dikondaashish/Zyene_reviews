import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Review, ReviewCardTone } from "@/components/reviews/review-card-types";
import { REVIEW_CARD_TONES } from "@/components/reviews/review-card-types";

export function ReviewCardComposer({
    review,
    isEditingReply,
    replyText,
    isAiTyping,
    isSubmitting,
    activeTone,
    loadingTone,
    onReplyTextChange,
    onToneClick,
    onCancelReplyComposer,
    onSubmit,
}: {
    review: Review;
    isEditingReply: boolean;
    replyText: string;
    isAiTyping: boolean;
    isSubmitting: boolean;
    activeTone: ReviewCardTone | null;
    loadingTone: ReviewCardTone | null;
    onReplyTextChange: (value: string) => void;
    onToneClick: (tone: ReviewCardTone) => void;
    onCancelReplyComposer: () => void;
    onSubmit: () => void;
}) {
    return (
        <div className="relative z-10 mt-4 animate-in rounded-xl border border-border bg-muted p-3 slide-in-from-top-2 duration-200 sm:p-5">
            {isEditingReply && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Edit reply</p>
            )}

            {review.platform !== "yelp" && (
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-sync-action size-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">AI Tone</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {REVIEW_CARD_TONES.map((tone) => (
                            <button
                                key={tone}
                                type="button"
                                onClick={() => onToneClick(tone)}
                                disabled={loadingTone !== null}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-all sm:px-4",
                                    activeTone === tone
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:bg-muted",
                                    loadingTone !== null && loadingTone !== tone && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {loadingTone === tone ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin size-3" />
                                        {tone}
                                    </span>
                                ) : (
                                    tone
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="relative mb-4">
                <Textarea
                    placeholder="Write a response or click a tone above for an AI draft..."
                    className={cn(
                        "min-h-[120px] bg-background text-sm resize-none focus-visible:ring-primary border-border focus:border-primary placeholder:text-muted-foreground",
                        isAiTyping && "border-sync-action/30 ring-1 ring-sync-action/20"
                    )}
                    value={replyText}
                    onChange={(e) => onReplyTextChange(e.target.value)}
                    aria-busy={isAiTyping}
                    autoFocus
                />
                {isAiTyping && (
                    <span
                        className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-sync-action/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sync-action border border-sync-action/20"
                        aria-live="polite"
                    >
                        <span className="inline-block animate-pulse rounded-full bg-sync-action/100 size-1.5" />
                        Writing
                    </span>
                )}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <button
                    type="button"
                    onClick={onCancelReplyComposer}
                    className="h-9 w-full rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:h-auto sm:w-auto"
                >
                    Cancel
                </button>
                <Button
                    size="sm"
                    onClick={onSubmit}
                    disabled={isSubmitting || !replyText.trim()}
                    className={cn(
                        "h-9 w-full min-w-0 px-6 font-semibold rounded-lg sm:min-w-[7.5rem] sm:w-auto",
                        "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
                        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground disabled:hover:bg-muted"
                    )}
                >
                    {isSubmitting
                        ? isEditingReply
                            ? "Saving..."
                            : "Posting..."
                        : isEditingReply
                          ? "Update reply"
                          : "Post Reply"}
                </Button>
            </div>
        </div>
    );
}
