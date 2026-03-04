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

export function ReviewCarousel({ reviews, businessName }: ReviewCarouselProps) {
    // If no reviews, display a fallback
    if (!reviews || reviews.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 bg-white border rounded-xl shadow-sm font-sans">
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
                    <span className="font-semibold text-slate-900 text-sm tracking-tight">{businessName}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full border border-slate-200 shadow-sm">
                    Verified Reviews
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative flex w-full overflow-hidden no-scrollbar fade-edges px-4">
                <div className="animate-scroll flex gap-4 pr-4">
                    {displayReviews.map((review, i) => (
                        <div
                            key={`${review.id}-${i}`}
                            className="flex-none w-[280px] sm:w-[320px] bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-md cursor-default"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex -space-x-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "w-4 h-4",
                                                i < review.rating ? "fill-yellow-400 text-yellow-500" : "fill-slate-100 text-slate-200"
                                            )}
                                        />
                                    ))}
                                </div>
                                {review.platform && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                        {review.platform}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-slate-700 leading-relaxed line-clamp-4 flex-1">
                                "{review.content || "Great experience!"}"
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <span className="font-semibold text-sm text-slate-900 truncate">
                                    {review.author_name || "Valued Customer"}
                                </span>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {new Date(review.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
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
