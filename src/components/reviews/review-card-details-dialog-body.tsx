import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/components/reviews/review-card-types";
import { getReviewDisplayContent, getReviewGoogleAttributeChips, getReviewGooglePhotos, getReviewGooglePlaceContext } from "@/components/reviews/review-card-derived";

export function ReviewCardDetailsDialogBody({
    review,
    googleMapsHref,
    onPhotoClick,
}: {
    review: Review;
    googleMapsHref: string | null;
    onPhotoClick: (url: string) => void;
}) {
    const displayContent = getReviewDisplayContent(review);
    const googlePhotos = getReviewGooglePhotos(review);
    const googleAttributeChips = getReviewGoogleAttributeChips(review);
    const googlePlaceContext = getReviewGooglePlaceContext(review);

    return (
        <div className="space-y-4">
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {displayContent || "No review text."}
            </div>
            {googlePlaceContext.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Place context</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {googlePlaceContext.map((ctx) => (
                            <Badge key={`drawer-ctx-${ctx}`} variant="secondary">
                                {ctx}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
            {googleAttributeChips.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Google attributes</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {googleAttributeChips.map((chip) => (
                            <Badge key={`drawer-chip-${chip}`} variant="secondary">
                                {chip}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
            {googlePhotos.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Photos</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {googlePhotos.map((url, idx) => (
                            <button
                                key={`drawer-photo-${url}-${idx}`}
                                type="button"
                                onClick={() => onPhotoClick(url)}
                                className="rounded-md overflow-hidden border border-border"
                            >
                                <img
                                    src={url}
                                    alt={`Review photo ${idx + 1}`}
                                    className="h-28 w-full object-cover"
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {googleMapsHref && (
                <div className="rounded-lg border border-border bg-muted/90 px-3 py-2.5 text-sm text-muted-foreground">
                    <a
                        href={googleMapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                        Open listing on Google Maps
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Customer photos attached to reviews usually appear there, not in this app.
                    </p>
                </div>
            )}
        </div>
    );
}
