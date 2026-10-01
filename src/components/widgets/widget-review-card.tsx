"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PublicWidgetReview } from "@/lib/widgets/public-types";
import type { WidgetConfig } from "@/lib/widgets/config";
import { WidgetStars } from "@/components/widgets/widget-stars";
import { WidgetAuthor } from "@/components/widgets/widget-author";

export function WidgetReviewCard({ review, config, onOpen, onPhoto, full = false }: {
    review: PublicWidgetReview; config: WidgetConfig; full?: boolean;
    onOpen?: (id: string) => void; onPhoto?: (review: PublicWidgetReview, index: number) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [truncated, setTruncated] = useState(false);
    const text = useRef<HTMLParagraphElement>(null);
    const unclamped = full || expanded || config.textMode === "full";
    useEffect(() => {
        const node = text.current;
        if (!node) return;
        const measure = () => setTruncated(node.scrollHeight > node.clientHeight + 1);
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        measure();
        return () => observer.disconnect();
    }, [review.content, config.textLength, unclamped]);
    const slider = config.layout === "slider" && !full;
    const bubble = config.reviewStyle === "bubble" && !full;
    const photos = config.showPhotos ? review.photos || [] : [];
    return <article className={`rw-review ${bubble ? "rw-bubble-review" : ""} ${slider ? "rw-slider-review" : ""}`} data-review-id={review.id}>
        {!slider && !bubble && <WidgetAuthor review={review} config={config} />}
        <div className="rw-review-body">
            {config.showReviewRating && <WidgetStars rating={review.rating} />}
            {review.content && <p ref={text} className={`rw-review-text ${unclamped ? "" : "rw-clamped"}`}>{review.content}</p>}
            {(truncated || expanded) && !full && <button className="rw-text-button" aria-expanded={expanded} onClick={() => {
                if ((config.showPhotos || config.showReply) && onOpen) onOpen(review.id); else setExpanded(!expanded);
            }}>{expanded ? "Read less" : "Read more"}</button>}
            {!!photos.length && <div className={`rw-photos ${photos.length === 1 ? "rw-photo-single" : ""}`}>
                {photos.slice(0, 4).map((photo, index) => <button type="button" key={photo} onClick={() => onPhoto?.(review, index)} aria-label={`Open ${review.author_name} review photo ${index + 1} of ${photos.length}`}>
                    <Image src={photo} alt={`Photo from ${review.author_name}'s review`} width={240} height={240} unoptimized />
                    {index === 3 && photos.length > 4 && <span className="rw-photo-more">+{photos.length - 3}</span>}
                </button>)}
            </div>}
            {config.showReply && review.ownerReply && <blockquote className="rw-owner-reply"><strong>Response from the owner</strong><p>{review.ownerReply}</p></blockquote>}
        </div>
        {(slider || bubble) && <WidgetAuthor review={review} config={config} />}
    </article>;
}
