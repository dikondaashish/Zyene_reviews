"use client";

import Image from "next/image";
import { NFC_CARD } from "@/lib/nfc/catalog";

export function NfcOrderMedia() {
    return (
        <div className="relative aspect-square max-h-[280px] w-full overflow-hidden rounded-2xl bg-muted">
            <Image
                src={NFC_CARD.imageSrc}
                alt={NFC_CARD.name}
                fill
                sizes="(max-width: 448px) 100vw, 448px"
                className="object-contain"
                priority
            />
        </div>
    );
}
