"use client";

import { useState } from "react";
import Image from "next/image";
import { NFC_CARD } from "@/lib/nfc/catalog";

function thumbClass(active: boolean) {
    return `relative aspect-square overflow-hidden rounded-md border transition-transform duration-150 ease-out active:scale-[0.97] ${
        active ? "border-primary ring-1 ring-primary/30" : "border-border"
    }`;
}

export function NfcOrderMedia() {
    const [selected, setSelected] = useState<"video" | number>("video");
    const photoSrc = selected === "video" ? NFC_CARD.imageSrc : NFC_CARD.imageSrcs[selected];

    return (
        <div className="space-y-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                {selected === "video" ? (
                    <video
                        src={NFC_CARD.videoSrc}
                        poster={NFC_CARD.imageSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        aria-label={`${NFC_CARD.name} product video`}
                        className="size-full object-contain"
                    />
                ) : (
                    <Image
                        src={photoSrc}
                        alt={NFC_CARD.name}
                        fill
                        sizes="(max-width: 640px) 90vw, 280px"
                        className="object-contain"
                        priority={selected === 0}
                    />
                )}
            </div>
            <div className="grid grid-cols-7 gap-1">
                <button
                    type="button"
                    aria-pressed={selected === "video"}
                    aria-label="Show product video"
                    onClick={() => setSelected("video")}
                    className={thumbClass(selected === "video")}
                >
                    <Image src={NFC_CARD.imageSrc} alt="" fill sizes="36px" className="object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[8px] font-semibold text-white">
                        Video
                    </span>
                </button>
                {NFC_CARD.imageSrcs.map((src, index) => (
                    <button
                        key={src}
                        type="button"
                        aria-pressed={selected === index}
                        aria-label={`Show product photo ${index + 1}`}
                        onClick={() => setSelected(index)}
                        className={thumbClass(selected === index)}
                    >
                        <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
