"use client";

import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Review {
    id: string;
    author_name: string;
    rating: number;
    content: string;
    platform: string;
    created_at: string;
}

interface ReviewCarouselProps {
    reviews: Review[];
    businessName: string;
}

function GoogleLogoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
            />
        </svg>
    );
}

export function ReviewCarousel({ reviews, businessName }: ReviewCarouselProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    // If no reviews, display a fallback
    if (!reviews || reviews.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 bg-card border border-border rounded-xl font-sans">
                <p className="text-muted-foreground text-sm">No reviews to display yet.</p>
            </div>
        );
    }

    // Duplicate reviews to create standard infinite scroll effect if there are too few
    const displayReviews = [...reviews, ...reviews, ...reviews, ...reviews].slice(0, Math.max(10, reviews.length * 2));

    return (
        <div className="relative w-full overflow-hidden bg-transparent font-sans py-4">
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
                /* Hide scrollbar for Chrome, Safari and Opera */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>

            {/* Header */}
            <div className="mb-4 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-500" />
                        ))}
                    </div>
                    <span className="font-semibold text-foreground text-sm tracking-tight">{businessName}</span>
                </div>
                <div className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full border border-border">
                    Verified Reviews
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative flex w-full overflow-hidden no-scrollbar fade-edges px-4">
                <div className="animate-scroll flex gap-4 pr-4">
                    {displayReviews.map((review, i) => (
                        <div
                            key={`${review.id}-${i}`}
                            className="flex-none w-[280px] sm:w-[320px] bg-card rounded-xl border border-border p-4 flex flex-col gap-3 transition-transform hover:-translate-y-1 cursor-default"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex -space-x-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "w-4 h-4",
                                                i < review.rating ? "fill-yellow-400 text-yellow-500" : "fill-muted text-muted-foreground/40"
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <GoogleLogoIcon />
                                </span>
                            </div>

                            <p className="text-sm text-foreground leading-relaxed line-clamp-4 flex-1">
                                "{review.content || "Great experience!"}"
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                <span className="font-semibold text-sm text-foreground truncate">
                                    {review.author_name || "Valued Customer"}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {mounted ? new Date(review.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' }) : "—"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gradient Fades for Marquee */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
            </div>
        </div>
    );
}
