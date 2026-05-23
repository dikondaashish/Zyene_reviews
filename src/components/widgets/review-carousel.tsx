"use client";

import { useEffect, useState } from "react";
import type { ReviewCarouselProps } from "./review-carousel-types";
import { ReviewCarouselHeader } from "./review-carousel-header";
import { ReviewCarouselMarquee } from "./review-carousel-marquee";

export function ReviewCarousel({ reviews, businessName }: ReviewCarouselProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!reviews || reviews.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 bg-card border border-border rounded-xl font-sans">
                <p className="text-muted-foreground text-sm">No reviews to display yet.</p>
            </div>
        );
    }

    const displayReviews = [...reviews, ...reviews, ...reviews, ...reviews].slice(0, Math.max(10, reviews.length * 2));

    return (
        <div className="relative w-full overflow-hidden bg-transparent font-sans py-4">
            <ReviewCarouselHeader businessName={businessName} />
            <ReviewCarouselMarquee reviews={reviews} displayReviews={displayReviews} mounted={mounted} />
        </div>
    );
}
