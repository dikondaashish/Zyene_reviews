"use client";

import { useState } from "react";
import Image from "next/image";
import { NFC_CARD } from "@/lib/nfc/catalog";

function thumbClass(active: boolean) {
    return `relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.97] ${
        active ? "border-primary ring-2 ring-primary/30" : "border-border"
    }`;
}

export function NfcOrderMedia() {
    const [selected, setSelected] = useState<"video" | number>("video");
    const photoSrc = selected === "video" ? NFC_CARD.imageSrc : NFC_CARD.imageSrcs[selected];

    return (
        <div className="space-y-2">
            <div className="relative aspect-square max-h-[280px] w-full overflow-hidden rounded-2xl bg-muted">
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
                        sizes="(max-width: 448px) 100vw, 448px"
                        className="object-contain"
                        priority={selected === 0}
                    />
                )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    aria-pressed={selected === "video"}
                    aria-label="Show product video"
                    onClick={() => setSelected("video")}
                    className={thumbClass(selected === "video")}
                >
                    <Image src={NFC_CARD.imageSrc} alt="" fill sizes="44px" className="object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-[10px] font-semibold text-white">
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
                        <Image src={src} alt="" fill sizes="44px" className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
