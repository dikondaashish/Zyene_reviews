import { formatDistanceToNow } from "date-fns";
import { Check, ChevronDown, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NeedsAttentionCopy, NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";
import { formatThemeTag, initialsFromAuthor } from "@/components/dashboard/needs-attention-format-helpers";
import { urgencyText } from "@/components/dashboard/needs-attention-default-copy";

export function NeedsAttentionReviewRowTrigger({
    review,
    copy,
    open,
    onToggle,
    isSent,
}: {
    review: NeedsAttentionReview;
    copy: NeedsAttentionCopy;
    open: boolean;
    onToggle: () => void;
    isSent: boolean;
}) {
    const rating = Math.min(5, Math.max(0, Math.round(review.rating)));
    const urgency = Math.min(10, Math.max(0, Math.round(review.urgency)));
    const showUrgency = urgency >= 8;

    const dateLabel = (() => {
        try {
            return formatDistanceToNow(new Date(review.date), { addSuffix: true });
        } catch {
            return "";
        }
    })();

    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "flex w-full min-w-0 items-start gap-3 px-4 py-3.5 text-left transition-colors duration-200 ease-out sm:gap-3.5 sm:px-5",
                "hover:bg-[rgb(241,235,222)] dark:hover:bg-chart-4/10",
                open && "bg-chart-4/10 dark:bg-chart-4/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
            aria-expanded={open}
        >
            <Avatar className="h-[34px] w-[34px] shrink-0 ring-1 ring-border">
                {review.avatarUrl?.trim() ? (
                    <AvatarImage
                        src={review.avatarUrl.trim()}
                        alt={review.author}
                        referrerPolicy="no-referrer"
                        className="object-cover"
                    />
                ) : null}
                <AvatarFallback className="bg-destructive/15 text-[11px] font-bold text-destructive dark:bg-destructive/25 dark:text-destructive-foreground">
                    <span className="font-display tracking-tight">{initialsFromAuthor(review.author)}</span>
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1.5 overflow-hidden">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="max-w-full break-words text-[13.5px] font-semibold leading-snug text-foreground">
                        {review.author}
                    </span>
                    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                strokeWidth={i < rating ? 0 : 1.35}
                                className={cn(
                                    "h-2.5 w-2.5 shrink-0 text-chart-4",
                                    i < rating ? "fill-chart-4" : "fill-none"
                                )}
                                aria-hidden
                            />
                        ))}
                    </span>
                    <span className="text-[11px] text-muted-foreground">· {dateLabel}</span>
                    {showUrgency ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11.5px] font-semibold tracking-[0.02em] text-destructive dark:bg-destructive/25 dark:text-destructive-foreground">
                            <Flame className="h-3 w-3" aria-hidden />
                            {urgencyText(copy, urgency)}
                        </span>
                    ) : null}
                    {isSent ? (
                        <Badge
                            variant="secondary"
                            className="border-chart-2/30 bg-chart-2/15 text-chart-2 dark:bg-chart-2/20"
                        >
                            <Check className="mr-1 h-3 w-3" aria-hidden />
                            {copy.sent}
                        </Badge>
                    ) : null}
                </div>
                {review.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {review.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-[0.02em] text-muted-foreground"
                            >
                                {formatThemeTag(tag)}
                            </span>
                        ))}
                    </div>
                ) : null}
                <p className="line-clamp-2 break-words text-[13px] leading-snug text-muted-foreground">{review.text}</p>
            </div>
            <ChevronDown
                className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 sm:mt-1",
                    open && "rotate-180"
                )}
                aria-hidden
            />
        </button>
    );
}
