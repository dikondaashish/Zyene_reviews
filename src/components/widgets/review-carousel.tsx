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
            <div className="flex items-center justify-center p-8 bg-card border border-border rounded-xl font-sans size-full">
                <p className="text-muted-foreground text-sm">No reviews to display yet.</p>
            </div>
        );
    }


    return (
        <div className="relative w-full overflow-hidden bg-transparent font-sans py-4">
            <ReviewCarouselHeader businessName={businessName} />
            <ReviewCarouselMarquee reviews={reviews} mounted={mounted} />
        </div>
    );
}
