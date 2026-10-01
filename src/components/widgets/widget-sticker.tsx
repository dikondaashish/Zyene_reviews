import { WidgetStars } from "@/components/widgets/widget-stars";
import { WidgetGoogleWordmark } from "@/components/widgets/widget-google-wordmark";
import { GoogleLogoIcon } from "@/components/widgets/review-carousel-google-logo";
import type { WidgetConfig } from "@/lib/widgets/config";

export function WidgetSticker({ rating, config }: { rating: number; config: WidgetConfig }) {
    const label = config.badgeLabel === "excellent" ? "Excellent on Google" : config.badgeLabel === "google-rating" ? "Google Rating" : "";
    if (config.layout === "achievement") return <span className="rw-shield"><span className="rw-shield-inner">
        {config.showRating && <><strong>{rating.toFixed(1)}</strong><WidgetStars rating={rating} /></>}{label && <span className="rw-sticker-label">{label}</span>}
        {config.showGoogleIcon && <GoogleLogoIcon />}
    </span></span>;
    if (config.layout === "light-sticker") return <span className="rw-ring"><span className="rw-ring-inner">
        {config.showRating && <><strong>{rating.toFixed(1)}</strong><WidgetStars rating={rating} /></>}{config.showGoogleIcon && <WidgetGoogleWordmark />}
    </span></span>;
    return <span className={`rw-sticker-tag ${config.layout === "tag-sticker" && label ? "rw-tag-tail" : ""}`}>
        <span className={`rw-colored-sticker ${config.layout === "oval-sticker" ? "rw-colored-oval" : ""}`}>
            {config.showRating && <><strong>{rating.toFixed(1)}</strong><WidgetStars rating={rating} /></>}{config.showGoogleIcon && <GoogleLogoIcon />}
        </span>
        {label && <span className="rw-sticker-label">{label}</span>}
    </span>;
}
