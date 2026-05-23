import { MessageSquare, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review, ReviewCardTone } from "@/components/reviews/review-card-types";

export function ReviewCardPendingReplyActions({
    review,
    isReplying,
    activeTone,
    onCancelReplyComposer,
    onSetReplying,
    onToneClick,
    onSuggestProfessional,
}: {
    review: Review;
    isReplying: boolean;
    activeTone: string | null;
    onCancelReplyComposer: () => void;
    onSetReplying: (v: boolean) => void;
    onToneClick: (tone: ReviewCardTone) => void;
    onSuggestProfessional: () => void;
}) {
    if (review.response_status === "responded") return null;

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {review.platform === "yelp" ? (
                <div className="flex items-start gap-2 rounded-md border border-chart-4/35 bg-chart-4/12 px-3 py-2 text-xs text-chart-4">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                        Replies to Yelp reviews must be made on{" "}
                        <a
                            href="https://biz.yelp.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline hover:text-chart-4"
                        >
                            yelp.com
                        </a>
                    </span>
                </div>
            ) : isReplying ? (
                <div className="grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 w-full border-border px-4 text-xs font-semibold text-muted-foreground hover:bg-muted"
                        onClick={onCancelReplyComposer}
                    >
                        <MessageSquare className="mr-2 h-3.5 w-3.5" />
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 w-full border border-primary/20 bg-primary/10 px-4 text-xs font-semibold text-primary hover:bg-primary/20"
                        onClick={() => !activeTone && onToneClick("professional")}
                    >
                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                        AI suggest
                    </Button>
                </div>
            ) : (
                <div className="grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                    <Button
                        size="sm"
                        className="h-9 w-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                        onClick={() => onSetReplying(true)}
                    >
                        <MessageSquare className="mr-2 h-3.5 w-3.5" />
                        Reply
                    </Button>
                    <Button
                        size="sm"
                        className="h-9 w-full border border-primary/20 bg-primary/10 px-4 text-xs font-semibold text-primary hover:bg-primary/20"
                        onClick={onSuggestProfessional}
                    >
                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                        AI suggest
                    </Button>
                </div>
            )}
        </div>
    );
}
