import type { CarouselReview } from "./review-carousel-types";
import { ReviewCarouselCard } from "./review-carousel-card";

const marqueeKeyframes = (reviewCount: number) => `
@keyframes review-carousel-marquee-scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-250px * ${reviewCount} - 1rem * ${reviewCount})); }
}
.review-carousel-marquee-track {
    display: flex;
    width: max-content;
    animation: review-carousel-marquee-scroll 40s linear infinite;
}
.review-carousel-marquee-track:hover {
    animation-play-state: paused;
}
.review-carousel-marquee-root .no-scrollbar::-webkit-scrollbar {
    display: none;
}
.review-carousel-marquee-root .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
`;

export function ReviewCarouselMarquee({
    reviews,
    displayReviews,
    mounted,
}: {
    reviews: CarouselReview[];
    displayReviews: CarouselReview[];
    mounted: boolean;
}) {
    return (
        <div className="review-carousel-marquee-root relative flex w-full overflow-hidden no-scrollbar fade-edges px-4">
            <style dangerouslySetInnerHTML={{ __html: marqueeKeyframes(reviews.length) }} />
            <div className="review-carousel-marquee-track flex gap-4 pr-4">
                {displayReviews.map((review, i) => (
                    <ReviewCarouselCard key={`${review.id}-${i}`} review={review} mounted={mounted} />
                ))}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
        </div>
    );
}
