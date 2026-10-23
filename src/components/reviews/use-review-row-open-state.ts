"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { nextReviewToAnswer } from "@/lib/reviews/next-review-to-answer";
import type { ReviewManagementItem } from "@/types/components";

export const reviewRowDomId = (id: string) => `review-row-${id}`;

/**
 * Rows to keep open when the list changes. Open reviews still on the page stay open (a
 * refresh after a reply must not close the next review). Only when none survive and a
 * different review is now on top (new page, filter or search) does the top one open.
 */
export function openRowsAfterListChange(open: Set<string>, reviews: { id: string }[], topChanged: boolean): Set<string> {
    const onPage = new Set(reviews.map((r) => r.id));
    const kept = [...open].filter((id) => onPage.has(id));
    if (kept.length > 0 || !topChanged || reviews.length === 0) return new Set(kept);
    return new Set([reviews[0].id]);
}

function bringIntoView(id: string) {
    const row = document.getElementById(reviewRowDomId(id));
    if (!row) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
    row.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus({ preventScroll: true });
}

/**
 * Which inbox rows are open. The first review opens on its own, like the first FAQ answer;
 * after the owner posts a reply, that review closes and the next one waiting for a reply opens.
 */
export function useReviewRowOpenState(reviews: ReviewManagementItem[]) {
    const firstId = reviews[0]?.id ?? null;
    const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(firstId ? [firstId] : []));
    const [shown, setShown] = useState({ list: reviews, firstId });
    // The review opened after a reply: scrolled to now, and once more when the refreshed list lands.
    const [advancedTo, setAdvancedTo] = useState<{ id: string } | null>(null);
    const following = useRef<{ id: string; list: ReviewManagementItem[] } | null>(null);

    if (reviews !== shown.list) {
        setShown({ list: reviews, firstId });
        setOpenIds(openRowsAfterListChange(openIds, reviews, firstId !== shown.firstId));
    }

    const setOpen = useCallback((id: string, open: boolean) => {
        following.current = null;
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (open) next.add(id);
            else next.delete(id);
            return next;
        });
    }, []);

    const onReplyPosted = useCallback((answeredId: string) => {
        const nextId = nextReviewToAnswer(reviews, answeredId);
        setOpenIds((prev) => {
            const next = new Set(prev);
            next.delete(answeredId);
            if (nextId) next.add(nextId);
            return next;
        });
        following.current = nextId ? { id: nextId, list: reviews } : null;
        setAdvancedTo(nextId ? { id: nextId } : null);
        if (!nextId) toast.success("No more reviews waiting for a reply on this page.");
    }, [reviews]);

    useEffect(() => {
        if (!advancedTo) return;
        const frame = requestAnimationFrame(() => bringIntoView(advancedTo.id));
        return () => cancelAnimationFrame(frame);
    }, [advancedTo]);

    // The answered review usually drops out above the next one when the list refreshes,
    // shifting it up, so scroll to it once more and then stop following.
    useEffect(() => {
        const target = following.current;
        if (!target || reviews === target.list) return;
        following.current = null;
        const frame = requestAnimationFrame(() => bringIntoView(target.id));
        return () => cancelAnimationFrame(frame);
    }, [reviews]);

    return { openIds, setOpen, onReplyPosted };
}
