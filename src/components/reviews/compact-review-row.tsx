"use client";

import { useId, useState } from "react";
import { ChevronDown, MessageSquare, ImageIcon } from "lucide-react";
import type { ReviewManagementItem } from "@/types/components";
import type { Review } from "@/components/reviews/review-card-types";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewPlatform } from "@/components/reviews/review-platform";
import { ReviewCardStars, ReviewCardStatusBadge } from "@/components/reviews/review-card-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function CompactReviewRow(props: {
    review: ReviewManagementItem;
    googleMapsListingUrl: string | null;
    planAllowsAiReplies: boolean;
    isSelected: boolean;
    onSelect: (id: string, selected: boolean) => void;
    onRefresh?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const detailId = useId();
    const { review, isSelected, onSelect } = props;
    const rawDate = review.review_date || review.published_at || review.created_at;
    const date = typeof rawDate === "string" ? new Date(rawDate) : null;
    const author = typeof review.author_name === "string" && review.author_name.trim() ? review.author_name : "Anonymous";
    const rating = typeof review.rating === "number" ? review.rating : 0;
    const platform = typeof review.platform === "string" ? review.platform : "Review";
    const text = typeof review.text === "string" && review.text.trim() ? review.text.trim() : typeof review.content === "string" ? review.content.trim() : "";
    const photoCount = Array.isArray(review.review_photo_urls) ? review.review_photo_urls.length : 0;
    return (
        <article className={cn("min-w-0 transition-colors", isSelected ? "bg-primary/5" : "bg-card", open && "bg-muted/20")}>
            <div className="flex min-w-0 items-start gap-3 px-4 py-5 sm:gap-4 sm:px-5">
                <input type="checkbox" className="mt-3 size-4 shrink-0 cursor-pointer rounded accent-primary focus-visible:outline-2 focus-visible:outline-ring"
                    aria-label={`Select review by ${author}`} checked={isSelected} onChange={(e) => onSelect(review.id, e.target.checked)} />
                <button type="button" className="group min-w-0 flex-1 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    aria-expanded={open} aria-controls={detailId} onClick={() => { setHasOpened(true); setOpen(!open); }}>
                    <span className="flex min-w-0 items-start gap-3">
                        <Avatar className="hidden size-10 shrink-0 border border-border sm:flex">
                            {typeof review.author_avatar_url === "string" && <AvatarImage src={review.author_avatar_url} alt="" referrerPolicy="no-referrer" />}
                            <AvatarFallback className="bg-muted text-sm font-medium text-muted-foreground">{author.split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                                <span className="break-words text-sm font-semibold text-foreground [overflow-wrap:anywhere]">{author}</span>
                                <ReviewCardStatusBadge status={String(review.response_status || "pending")} />
                            </span>
                            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                                <ReviewCardStars rating={rating} />
                                <ReviewPlatform key={platform} platform={platform} />
                                {date && !Number.isNaN(date.getTime()) && <time dateTime={date.toISOString()} className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>}
                            </span>
                            {!open && <span className={cn("mt-3 block max-w-[75ch] text-sm leading-relaxed [overflow-wrap:anywhere]", text ? "line-clamp-2 text-foreground/85" : "italic text-muted-foreground")}>{text || "Left a star rating without a written review."}</span>}
                            <span className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {photoCount > 0 && <><ImageIcon className="size-3.5" aria-hidden="true" />{photoCount} {photoCount === 1 ? "photo" : "photos"}</>}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:underline">
                                    <MessageSquare className="size-3.5" aria-hidden="true" />
                                    {open ? "Close review" : review.response_status === "responded" ? "View conversation" : "Read & reply"}
                                    <ChevronDown className={cn("size-3.5 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
                                </span>
                            </span>
                        </span>
                    </span>
                </button>
            </div>
            <div id={detailId} hidden={!open}>
                {hasOpened && <div className="border-t border-border/60 px-4 py-4 sm:pl-[104px] sm:pr-5">
                    <ReviewCard review={review as unknown as Review} googleMapsListingUrl={props.googleMapsListingUrl}
                        planAllowsAiReplies={props.planAllowsAiReplies} onRefresh={props.onRefresh} embedded />
                </div>}
            </div>
        </article>
    );
}
