import type { CarouselReview } from "./review-carousel-types";
import { ReviewCarouselCard } from "./review-carousel-card";

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
        <div className="relative flex w-full overflow-hidden no-scrollbar fade-edges px-4">
            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-250px * ${reviews.length} - 1rem * ${reviews.length})); }
                }
                .animate-scroll {
                    display: flex;
                    width: max-content;
                    animation: scroll 40s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="animate-scroll flex gap-4 pr-4">
                {displayReviews.map((review, i) => (
                    <ReviewCarouselCard key={`${review.id}-${i}`} review={review} mounted={mounted} />
                ))}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
        </div>
    );
}
