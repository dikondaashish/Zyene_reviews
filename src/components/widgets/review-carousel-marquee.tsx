"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CarouselReview } from "@/components/widgets/review-carousel-types";
import { ReviewCarouselCard } from "@/components/widgets/review-carousel-card";

/** Manual browsing keeps every review available on touch, keyboard and reduced motion. */
export function ReviewCarouselMarquee({ reviews, mounted }: { reviews: CarouselReview[]; mounted: boolean }) {
    const track = useRef<HTMLUListElement>(null);
    const move = (direction: number) =>
        track.current?.scrollBy({ left: direction * track.current.clientWidth, behavior: "instant" });
    return (
        <section aria-label="Customer reviews" className="space-y-3">
            <div className="flex items-center justify-between gap-4 px-4">
                <p className="text-sm text-muted-foreground">
                    {reviews.length} customer {reviews.length === 1 ? "review" : "reviews"}
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" aria-label="Previous reviews" onClick={() => move(-1)}>
                        <ArrowLeft aria-hidden="true" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Next reviews" onClick={() => move(1)}>
                        <ArrowRight aria-hidden="true" />
                    </Button>
                </div>
            </div>
            <ul
                ref={track}
                tabIndex={0}
                aria-label="Scroll through customer reviews"
                className="flex snap-x snap-proximity gap-4 overflow-x-auto px-4 pb-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            >
                {reviews.map((review) => (
                    <li key={review.id} className="flex snap-start">
                        <ReviewCarouselCard review={review} mounted={mounted} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
