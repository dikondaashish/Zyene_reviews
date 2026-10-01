"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { PublicWidgetReview } from "@/lib/widgets/public-types";
import type { WidgetConfig } from "@/lib/widgets/config";
import { relativeReviewDate } from "@/lib/widgets/review-date";
import { WidgetGoogleWordmark } from "@/components/widgets/widget-google-wordmark";
import { GoogleLogoIcon } from "@/components/widgets/review-carousel-google-logo";

export function WidgetAuthor({ review, config }: { review: PublicWidgetReview; config: WidgetConfig }) {
    const [failed, setFailed] = useState(false);
    const google = review.platform.toLowerCase() === "google";
    return <div className="rw-author">
        {config.showAvatar && <div className="rw-avatar">
            {review.avatar && !failed ? <Image src={review.avatar} alt="" width={40} height={40} unoptimized onError={() => setFailed(true)} /> : <span>{review.author_name.slice(0, 1).toUpperCase()}</span>}
            {google && config.showSource && config.sourceStyle === "avatar" && <span className="rw-source-icon"><GoogleLogoIcon /></span>}
        </div>}
        <div className="rw-author-info">
            {config.showName && <strong title={review.author_name}>{review.external_url ? <a href={review.external_url} target="_blank" rel="noopener noreferrer">{review.author_name}</a> : review.author_name}
                {config.showVerified && google && <BadgeCheck className="rw-verified" size={14} aria-label="Imported Google review" />}
            </strong>}
            <div className="rw-author-meta">{config.showDate && <time dateTime={review.created_at} title={review.created_at}>{relativeReviewDate(review.created_at)}</time>}
                {google && config.showSource && config.sourceStyle === "inline" && <span>on <WidgetGoogleWordmark /></span>}
            </div>
        </div>
        {google && config.showSource && config.sourceStyle === "right" && <span className="rw-source-right"><GoogleLogoIcon /></span>}
    </div>;
}
