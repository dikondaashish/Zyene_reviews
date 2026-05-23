import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/components/reviews/review-card-types";
import { Badge } from "@/components/ui/badge";
import { getReviewDisplayContent, getReviewGoogleAttributeChips, getReviewGooglePhotos, getReviewGooglePlaceContext } from "@/components/reviews/review-card-derived";

export function ReviewCardBody({
    review,
    isExpanded,
    onToggleExpanded,
    onPhotoClick,
}: {
    review: Review;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onPhotoClick: (url: string) => void;
}) {
    const displayContent = getReviewDisplayContent(review);
    const googlePhotos = getReviewGooglePhotos(review);
    const googleAttributeChips = getReviewGoogleAttributeChips(review);
    const googlePlaceContext = getReviewGooglePlaceContext(review);

    return (
        <div className="relative z-10 space-y-2">
            <div className="text-sm leading-relaxed text-muted-foreground">
                <p className={cn("break-words", !isExpanded && "line-clamp-3")}>{displayContent}</p>
                {displayContent.length > 200 && (
                    <button
                        onClick={onToggleExpanded}
                        className="text-primary text-xs font-medium mt-1 hover:underline focus:outline-none"
                    >
                        {isExpanded ? "Show less" : "Read more"}
                    </button>
                )}
            </div>

            {review.themes && review.themes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
                    {review.themes.map((theme) => (
                        <span
                            key={theme}
                            className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full border border-border capitalize"
                        >
                            {theme.replace(/_/g, " ")}
                        </span>
                    ))}
                </div>
            )}

            {googlePlaceContext.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {googlePlaceContext.map((ctx) => (
                        <Badge
                            key={`ctx-${ctx}`}
                            variant="secondary"
                            className="px-2 py-0.5 h-5 text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/30 font-medium"
                        >
                            {ctx}
                        </Badge>
                    ))}
                </div>
            )}

            {googleAttributeChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {googleAttributeChips.map((chip) => (
                        <Badge
                            key={`google-chip-${chip}`}
                            variant="secondary"
                            className="px-2 py-0.5 h-5 text-[10px] bg-primary/10 text-primary border-primary/30 font-medium"
                        >
                            {chip}
                        </Badge>
                    ))}
                </div>
            )}

            {googlePhotos.length > 0 && (
                <div className="pt-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <ImageIcon className="text-muted-foreground size-3.5" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Review Photos
                        </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {googlePhotos.slice(0, 6).map((url, idx) => (
                            <button
                                key={`${url}-${idx}`}
                                type="button"
                                onClick={() => onPhotoClick(url)}
                                className="shrink-0 rounded-md border border-border overflow-hidden hover:opacity-90 size-16"
                                title="Open photo"
                            >
                                <img
                                    src={url}
                                    alt={`Review photo ${idx + 1}`}
                                    className="object-cover size-full"
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {review.selected_staff && review.selected_staff.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Served by:
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {review.selected_staff.map((staff) => (
                            <Badge
                                key={staff}
                                variant="secondary"
                                className="px-2 py-0 h-4 text-[9px] bg-primary/10 text-primary border-primary/20 font-medium"
                            >
                                {staff}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
