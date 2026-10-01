import type { WidgetConfig } from "@/lib/widgets/config";
import { WidgetGoogleWordmark } from "@/components/widgets/widget-google-wordmark";
import { WidgetStars } from "@/components/widgets/widget-stars";
import { isBadgeLayout } from "@/lib/widgets/config";
import { GoogleLogoIcon } from "@/components/widgets/review-carousel-google-logo";

export function WidgetHeader({ config, rating, count, businessName, writeReviewUrl, popup = false }: {
    config: WidgetConfig; rating: number; count: number; businessName: string; writeReviewUrl?: string; popup?: boolean;
}) {
    const brand = config.source === "google" ? <WidgetGoogleWordmark /> : businessName;
    if (popup && isBadgeLayout(config.layout)) return <header className="rw-header rw-header-popup">
        <div><div className="rw-heading-brand"><GoogleLogoIcon /><strong>Excellent on {config.source === "google" ? "Google" : businessName}</strong></div>
            <div className="rw-rating-line"><span style={{ color: config.stars }}>★</span><strong>{rating.toFixed(1)}</strong><span>out of 5 based on {count.toLocaleString()} reviews</span></div>
        </div>
        {config.showButton && writeReviewUrl && <a className="rw-cta" href={writeReviewUrl} target="_blank" rel="noopener noreferrer">Review us on Google</a>}
    </header>;
    return <header className={`rw-header rw-surface rw-header-${popup ? "popup" : config.headerStyle}`}>
        <div className="rw-header-details">
            {config.headerStyle === "google-reviews" || popup ? <>
                <div className="rw-heading-brand">{brand} <strong>Reviews</strong></div>
                <div className="rw-rating-line">{config.showRating && <><strong>{rating.toFixed(1)}</strong><WidgetStars rating={rating} /></>}
                    {config.showCount && <span className="rw-muted">({count.toLocaleString()})</span>}
                </div>
            </> : <div className="rw-rating-line">
                {config.headerStyle === "centered" && brand}
                {config.showRating && <strong className={["rating", "wall"].includes(config.headerStyle) ? "rw-large-rating" : ""}>{rating.toFixed(1)}</strong>}
                <div className="rw-rating-description">{config.headerStyle === "wall" && <strong className="rw-wall-brand">Google Reviews</strong>}{config.showRating && <WidgetStars rating={rating} />}
                    {config.showCount && <span className="rw-header-count">{config.headerStyle === "wall" ? `(${count.toLocaleString()})` : <>{count.toLocaleString()} reviews on {config.headerStyle !== "centered" && brand}</>}</span>}
                </div>
            </div>}
        </div>
        {config.showButton && writeReviewUrl && <a className="rw-cta" href={writeReviewUrl} target="_blank" rel="noopener noreferrer">
            {config.preset === "photos" ? "Write a Review" : "Review us on Google"}</a>}
    </header>;
}
