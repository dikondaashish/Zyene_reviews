import Image from "next/image";
import type { WidgetConfig } from "@/lib/widgets/config";
import type { PublicWidgetReview } from "@/lib/widgets/public-types";
import { WidgetStars } from "@/components/widgets/widget-stars";
import { WidgetSticker } from "@/components/widgets/widget-sticker";
import { GoogleLogoIcon } from "@/components/widgets/review-carousel-google-logo";

export function WidgetBadgeLayout({ config, rating, count, businessName, writeReviewUrl, reviews, onOpen }: {
    config: WidgetConfig; rating: number; count: number; businessName: string; writeReviewUrl?: string;
    reviews?: PublicWidgetReview[]; onOpen: () => void;
}) {
    const label = `Read ${count} reviews for ${businessName}`;
    const stars = <span className="rw-badge-rating"><strong>{rating.toFixed(1)}</strong><WidgetStars rating={rating} /></span>;
    if (config.layout === "review-request") return <div className={`rw-badge-alignment rw-align-${config.badgeAlign}`}><div className="rw-request">
        <h2>Happy with your experience so far?</h2><p>Your feedback helps us improve and helps other customers like you.</p>
        {writeReviewUrl && <a className="rw-request-button" href={writeReviewUrl} target="_blank" rel="noopener noreferrer"><GoogleLogoIcon />Review us on Google</a>}
        <button type="button" className="rw-request-rating" onClick={onOpen} aria-label={label}>{config.showRating && stars}{config.showCount && <span className="rw-muted">{count.toLocaleString()} reviews</span>}</button>
        <span className="rw-reviewer-stack">{reviews?.slice(0, 5).map(r => <span key={r.id}>{r.avatar ? <Image src={r.avatar} alt="" width={28} height={28} unoptimized /> : r.author_name.slice(0, 1)}</span>)}</span>
    </div></div>;
    const sticker = ["light-sticker", "bold-sticker", "tag-sticker", "oval-sticker", "achievement"].includes(config.layout);
    const content = sticker ? <WidgetSticker rating={rating} config={config} /> : <>
        {config.showGoogleIcon && <GoogleLogoIcon />}
        {config.layout === "reviews-button" ? <strong>Reviews</strong> : <>
            {config.badgeLabel !== "none" && <span className="rw-badge-label">{config.badgeLabel === "excellent" ? "Excellent on Google" : "Google Rating"}{config.preset === "halloween-badge" && " 🎃"}</span>}
            {config.showRating && stars}{config.showCount && <span className="rw-badge-count">{config.layout === "compact-badge" ? `(${count.toLocaleString()})` : `${count.toLocaleString()} reviews`}</span>}
        </>}
    </>;
    const className = `rw-badge rw-${config.layout} ${config.floating ? "rw-floating-badge" : ""}`;
    return <div className={`rw-badge-alignment rw-align-${config.badgeAlign}`}>
        {config.clickAction === "google" && writeReviewUrl ? <a className={className} href={writeReviewUrl} target="_blank" rel="noopener noreferrer">{content}</a> :
            <button type="button" className={className} aria-label={label} aria-haspopup={config.clickAction === "popup" ? "dialog" : undefined}
                aria-disabled={config.clickAction === "none"} onClick={config.clickAction === "popup" ? onOpen : undefined}>{content}</button>}
    </div>;
}
