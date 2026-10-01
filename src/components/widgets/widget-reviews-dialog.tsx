"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { WidgetConfig } from "@/lib/widgets/config";
import type { PublicWidgetData, PublicWidgetReview } from "@/lib/widgets/public-types";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { WidgetReviewCard } from "@/components/widgets/widget-review-card";

export function WidgetReviewsDialog({ open, selected, reviews, config, data, rating, count, onClose, onPhoto }: {
    open: boolean; selected?: string; reviews: PublicWidgetReview[]; config: WidgetConfig; data: PublicWidgetData;
    rating: number; count: number; onClose: () => void; onPhoto: (review: PublicWidgetReview, index: number) => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const list = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const node = dialog.current;
        if (!node) return;
        if (open && !node.open) node.showModal();
        if (!open && node.open) node.close();
        const frame = requestAnimationFrame(() => {
            const target = Array.from(list.current?.querySelectorAll<HTMLElement>("[data-review-id]") || []).find(n => n.dataset.reviewId === selected);
            if (list.current) list.current.scrollTop = target ? target.offsetTop - list.current.offsetTop : 0;
        });
        return () => cancelAnimationFrame(frame);
    }, [open, selected]);
    return <dialog ref={dialog} className="rw-dialog" aria-label={`Reviews for ${data.businessName}`} onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        <button className="rw-dialog-close" onClick={onClose} aria-label="Close reviews" autoFocus><X size={22} /></button>
        <WidgetHeader config={{ ...config, showRating: true, showCount: true }} rating={rating} count={count} businessName={data.businessName} writeReviewUrl={data.writeReviewUrl} popup />
        <div ref={list} className="rw-dialog-reviews">{reviews.map(review => <WidgetReviewCard key={review.id} review={review} config={config} full onPhoto={onPhoto} />)}</div>
    </dialog>;
}
