"use client";

import { useState } from "react";
import Image from "next/image";
import type { PublicWidgetReview } from "@/lib/widgets/public-types";
import type { WidgetConfig } from "@/lib/widgets/config";
import { WidgetStars } from "@/components/widgets/widget-stars";
import { GoogleLogoIcon } from "@/components/widgets/review-carousel-google-logo";

export function WidgetReviewCard({ review, config }: { review: PublicWidgetReview; config: WidgetConfig }) {
    const [expanded, setExpanded] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);
    const date = new Date(review.created_at);
    return <article className="rw-review">
        <div className="rw-author">
            {config.showAvatar && <div className="rw-avatar">
                {review.avatar && !avatarFailed ? <Image src={review.avatar} alt="" width={40} height={40} unoptimized onError={() => setAvatarFailed(true)} /> :
                    <span>{review.author_name.slice(0, 1).toUpperCase()}</span>}
                {review.platform.toLowerCase() === "google" && <span className="rw-source-icon"><GoogleLogoIcon /></span>}
            </div>}
            <div className="rw-author-info">
                <strong title={review.author_name}>{review.author_name}</strong>
                {config.showDate && !Number.isNaN(date.valueOf()) && <time dateTime={review.created_at}>
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </time>}
            </div>
        </div>
        <WidgetStars rating={review.rating} />
        <p className={expanded || review.content.length <= 180 ? "rw-review-text" : "rw-review-text rw-clamped"}>{review.content || "This customer left a rating without a written review."}</p>
        {review.content.length > 180 && <button className="rw-text-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? "Read less" : "Read more"}
        </button>}
        {config.showPhotos && !!review.photos?.length && <div className="rw-photos">
            {review.photos.slice(0, 4).map((photo, index) => <a key={photo} href={photo} target="_blank" rel="noopener noreferrer" aria-label={`Open review photo ${index + 1}`}>
                <Image src={photo} alt={`Photo from ${review.author_name}'s review`} width={120} height={90} unoptimized />
            </a>)}
        </div>}
        {review.external_url && <a className="rw-original" href={review.external_url} target="_blank" rel="noopener noreferrer">View on {review.platform === "google" ? "Google" : review.platform}</a>}
    </article>;
}
