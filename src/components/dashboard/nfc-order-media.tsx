"use client";

import { useState } from "react";
import Image from "next/image";
import { NFC_CARD } from "@/lib/nfc/catalog";

export function NfcOrderMedia() {
    const [mode, setMode] = useState<"video" | "photo">("video");

    return (
        <div className="space-y-2">
            <div className="relative aspect-[3/4] max-h-[280px] w-full overflow-hidden rounded-2xl bg-muted">
                {mode === "video" ? (
                    <video
                        src={NFC_CARD.videoSrc}
                        poster={NFC_CARD.imageSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        aria-label={`${NFC_CARD.name} product video`}
                        className="size-full object-cover"
                    />
                ) : (
                    <Image
                        src={NFC_CARD.imageSrc}
                        alt={NFC_CARD.name}
                        fill
                        sizes="(max-width: 448px) 100vw, 448px"
                        className="object-cover"
                        priority
                    />
                )}
            </div>
            <div className="flex gap-2">
                <button
                    type="button"
                    aria-pressed={mode === "video"}
                    aria-label="Show product video"
                    onClick={() => setMode("video")}
                    className={`relative h-14 w-11 overflow-hidden rounded-lg border transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.97] ${
                        mode === "video" ? "border-primary ring-2 ring-primary/30" : "border-border"
                    }`}
                >
                    <Image src={NFC_CARD.imageSrc} alt="" fill sizes="44px" className="object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-[10px] font-semibold text-white">
                        Video
                    </span>
                </button>
                <button
                    type="button"
                    aria-pressed={mode === "photo"}
                    aria-label="Show product photo"
                    onClick={() => setMode("photo")}
                    className={`relative h-14 w-11 overflow-hidden rounded-lg border transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.97] ${
                        mode === "photo" ? "border-primary ring-2 ring-primary/30" : "border-border"
                    }`}
                >
                    <Image src={NFC_CARD.imageSrc} alt="" fill sizes="44px" className="object-cover" />
                </button>
            </div>
        </div>
    );
}
