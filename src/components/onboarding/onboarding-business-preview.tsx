"use client";

import Image from "next/image";
import { MapPin, Star, Store } from "lucide-react";
import { BusinessLogo } from "@/components/competitors/business-logo";
import { cn } from "@/lib/utils";
import type { OnboardingPreview } from "./onboarding-preview-model";

function Stars({ rating, className }: { rating: number; className?: string }) {
    return (
        <span className={cn("flex", className)} aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={cn("size-3.5", i < Math.round(rating) ? "text-warning" : "text-muted-foreground/25")} />
            ))}
        </span>
    );
}

/** The owner's business as customers see it, filling in as they go: photo, logo, name, place, stars. */
export function OnboardingBusinessPreview({ preview }: { preview: OnboardingPreview }) {
    const name = preview.name ?? "Your business";
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative h-36 bg-muted">
                {preview.photoUrl ? (
                    <Image src={preview.photoUrl} alt="" fill unoptimized referrerPolicy="no-referrer" className="object-cover" sizes="360px" />
                ) : (
                    <>
                        <Image src={preview.sampleCoverUrl} alt="" fill className="object-cover" sizes="360px" />
                        <span className="absolute bottom-2 right-2 rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white">Sample photo</span>
                    </>
                )}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" aria-hidden />
            </div>
            <div className="px-5 pb-5">
                <div className="-mt-7 mb-3 inline-flex rounded-lg bg-card p-1 shadow-sm ring-1 ring-border">
                    {preview.name ? (
                        <BusinessLogo name={name} website={preview.website} className="size-12 text-sm" />
                    ) : (
                        <span className="grid size-12 place-items-center rounded-md bg-muted text-muted-foreground" aria-hidden>
                            <Store className="size-5" />
                        </span>
                    )}
                </div>
                {preview.name ? (
                    <p className="font-display text-lg font-semibold leading-snug text-foreground">{preview.name}</p>
                ) : (
                    <div className="space-y-2 py-1" aria-label="Your business will appear here">
                        <div className="h-4 w-40 rounded bg-muted" />
                    </div>
                )}
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    {preview.place ? <><MapPin className="size-3.5 shrink-0" aria-hidden />{preview.place}</> : "Location shows here"}
                    {preview.category ? <span className="before:mx-1 before:content-['·']">{preview.category}</span> : null}
                </p>
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-sm">
                    {preview.rating ? (
                        <>
                            <span className="font-semibold tabular-nums text-foreground">{preview.rating.toFixed(1)}</span>
                            <Stars rating={preview.rating} />
                            <span className="text-xs text-muted-foreground">
                                {preview.reviews.toLocaleString("en-US")} Google review{preview.reviews === 1 ? "" : "s"}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs text-muted-foreground">Your Google rating appears here once we find your business.</span>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Phones: the same business in one slim row above the step. */
export function OnboardingBusinessStrip({ preview }: { preview: OnboardingPreview }) {
    if (!preview.name) return null;
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
            <BusinessLogo name={preview.name} website={preview.website} className="size-9" />
            <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-foreground">{preview.name}</p>
                {preview.rating ? (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{preview.rating.toFixed(1)}</span>
                        <Stars rating={preview.rating} />
                        {preview.reviews.toLocaleString("en-US")} reviews
                    </p>
                ) : (
                    <p className="truncate text-xs text-muted-foreground">{preview.place || "Setting up"}</p>
                )}
            </div>
        </div>
    );
}
