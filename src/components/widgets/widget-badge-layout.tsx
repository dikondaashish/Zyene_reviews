import { Award, MessageSquare, Star } from "lucide-react";
import type { WidgetConfig } from "@/lib/widgets/config";
import { WidgetStars } from "@/components/widgets/widget-stars";
import { GoogleLogoIcon } from "@/components/widgets/review-carousel-google-logo";

export function WidgetBadgeLayout({ config, rating, count, businessName, onOpen, writeReviewUrl }: {
    config: WidgetConfig; rating: number; count: number; businessName: string; onOpen: () => void; writeReviewUrl?: string;
}) {
    const google = config.source === "google";
    const label = count ? rating >= 4.5 ? "Excellent" : rating >= 4 ? "Highly rated" : "Customer reviews" : "Customer reviews";
    if (config.layout === "review-request") return <div className="rw-request rw-surface">
        <MessageSquare size={32} /><h2>How was your experience?</h2><p>Share your experience with {businessName}.</p>
        {writeReviewUrl ? <a className="rw-cta" href={writeReviewUrl} target="_blank" rel="noopener noreferrer">Write a review</a> : <button className="rw-cta" onClick={onOpen}>Read customer reviews</button>}
    </div>;
    return <button className={`rw-badge rw-surface rw-${config.layout}`} onClick={onOpen} aria-label={`Read ${count} reviews for ${businessName}`}>
        {config.layout === "achievement" && <Award className="rw-award" size={42} />}
        {config.layout === "reviews-button" ? <MessageSquare size={22} /> : google ? <GoogleLogoIcon /> : <Star size={25} />}
        <span className="rw-badge-label">{label}{google && " on Google"}</span>
        {config.showRating && <span className="rw-rating-line"><strong>{rating.toFixed(1)}</strong><WidgetStars rating={rating} /></span>}
        {config.showCount && <span className="rw-badge-count">{count.toLocaleString()} reviews</span>}
        <span className="rw-badge-business">{businessName}</span>
    </button>;
}
