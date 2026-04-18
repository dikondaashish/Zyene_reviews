"use client";

import { FractionalStar } from "@/components/ui/fractional-star";

export function ReviewBadge({
    businessName,
    avgRating,
    totalReviews,
}: {
    businessName: string;
    avgRating: number;
    totalReviews: number;
}) {
    const rating = Math.max(0, Math.min(5, avgRating));

    return (
        <div className="flex min-h-[280px] w-full items-center justify-center bg-transparent p-6 font-sans">
            <div className="w-full max-w-[520px] rounded-[28px] border border-border bg-card px-8 py-10 text-center shadow-sm">
                <div className="mx-auto mb-4 inline-flex items-center justify-center">
                    <svg className="google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="52" height="52" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                </div>

                <div className="mb-5 flex items-center justify-center gap-4">
                    <span className="text-5xl font-semibold tracking-tight text-[#241a59]">{rating.toFixed(1)}</span>
                    <div
                        className="flex items-center gap-1"
                        aria-label={`${rating.toFixed(1)} out of 5 stars`}
                    >
                        {Array.from({ length: 5 }).map((_, i) => (
                            <FractionalStar
                                key={i}
                                fill={Math.min(1, Math.max(0, rating - i))}
                                starClassName="h-10 w-10"
                            />
                        ))}
                    </div>
                </div>

                <p className="text-center text-[20px] text-foreground">
                    <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="underline underline-offset-4 hover:text-primary"
                        title={businessName}
                    >
                        Read our {totalReviews.toLocaleString()} reviews
                    </a>
                </p>
            </div>
        </div>
    );
}
