"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PublicWidgetReview } from "@/lib/widgets/public-types";

export function WidgetPhotoDialog({ selection, onClose }: { selection: { review: PublicWidgetReview; index: number } | null; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [cursor, setCursor] = useState<{ selection: typeof selection; index: number } | null>(null);
    const index = cursor?.selection === selection ? cursor?.index || 0 : selection?.index || 0;
    const photos = selection?.review.photos || [];
    useEffect(() => {
        const node = dialog.current;
        if (selection) { if (!node?.open) node?.showModal(); }
        else if (node?.open) node.close();
    }, [selection]);
    const move = (step: number) => { if (photos.length) setCursor({ selection, index: (index + step + photos.length) % photos.length }); };
    return <dialog ref={dialog} className="rw-photo-dialog" aria-label="Review photo gallery" onClose={onClose} onCancel={onClose} onKeyDown={event => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
    }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        <button className="rw-dialog-close" onClick={onClose} aria-label="Close photo gallery" autoFocus><X size={24} /></button>
        {photos[index] && <Image src={photos[index]} alt={`Photo ${index + 1} from ${selection?.review.author_name}'s review`} width={1000} height={800} unoptimized />}
        {photos.length > 1 && <><button className="rw-photo-prev" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft size={28} /></button><button className="rw-photo-next" onClick={() => move(1)} aria-label="Next photo"><ChevronRight size={28} /></button></>}
        <p>{selection?.review.author_name} · {index + 1} / {photos.length}</p>
    </dialog>;
}
