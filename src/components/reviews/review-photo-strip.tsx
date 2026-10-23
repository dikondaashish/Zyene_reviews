"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const REVIEW_PHOTO_STRIP_MAX = 6;

/** Usable photo URLs from a review row, in the order the customer posted them. */
export function reviewPhotoUrls(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
}

/**
 * The customer's photos shown right in the review list, so the owner sees them without
 * opening the review. Clicking one opens it large, with arrows to step through the rest.
 */
export function ReviewPhotoStrip({ urls, author }: { urls: string[]; author: string }) {
    const [index, setIndex] = useState<number | null>(null);
    if (urls.length === 0) return null;
    const shown = urls.slice(0, REVIEW_PHOTO_STRIP_MAX);
    const hidden = urls.length - shown.length;
    const step = (by: number) => setIndex((i) => (i === null ? i : (i + by + urls.length) % urls.length));

    return (
        <>
            <ul className="flex flex-wrap gap-2" aria-label={`${urls.length} ${urls.length === 1 ? "photo" : "photos"} from ${author}`}>
                {shown.map((url, i) => {
                    const more = i === shown.length - 1 && hidden > 0;
                    return (
                        <li key={`${url}-${i}`}>
                            <button type="button" onClick={() => setIndex(i)}
                                className="relative block size-16 overflow-hidden rounded-lg border border-border bg-muted transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-20"
                                aria-label={more ? `Open photo ${i + 1}, ${hidden} more` : `Open photo ${i + 1} of ${urls.length}`}>
                                <img src={url} alt="" className="size-full object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                                {more && <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">+{hidden}</span>}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <Dialog open={index !== null} onOpenChange={(open) => !open && setIndex(null)}>
                <DialogContent className="p-2 sm:max-w-4xl"
                    onKeyDown={(e) => {
                        if (urls.length < 2) return;
                        if (e.key === "ArrowRight") step(1);
                        if (e.key === "ArrowLeft") step(-1);
                    }}>
                    <DialogTitle className="sr-only">Photo {(index ?? 0) + 1} of {urls.length} from {author}</DialogTitle>
                    {index !== null && (
                        <div className="relative">
                            <img src={urls[index]} alt={`Photo ${index + 1} of ${urls.length} from ${author}`}
                                className="max-h-[80vh] w-full rounded-md object-contain" referrerPolicy="no-referrer" />
                            {urls.length > 1 && <>
                                <Button type="button" size="icon" variant="secondary" onClick={() => step(-1)} aria-label="Previous photo"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow"><ChevronLeft /></Button>
                                <Button type="button" size="icon" variant="secondary" onClick={() => step(1)} aria-label="Next photo"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow"><ChevronRight /></Button>
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
                                    {index + 1} / {urls.length}
                                </span>
                            </>}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
