"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { NFC_CARD } from "@/lib/nfc/catalog";

const SLIDES = [
    { key: "video", isVideo: true, src: NFC_CARD.videoSrc, thumb: NFC_CARD.imageSrc },
    ...NFC_CARD.imageSrcs.map((src) => ({ key: src, isVideo: false, src, thumb: src })),
];

const ARROW_CLASS =
    "absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm transition-transform duration-150 ease-out hover:bg-background active:scale-[0.94]";

export function NfcOrderMedia() {
    const [index, setIndex] = useState(0);
    const slide = SLIDES[index];

    function step(delta: number) {
        setIndex((current) => (current + delta + SLIDES.length) % SLIDES.length);
    }

    return (
        <div className="space-y-2.5">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border/60 bg-background sm:aspect-[4/3]">
                {slide.isVideo ? (
                    <video
                        src={slide.src}
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
                        src={slide.src}
                        alt={`${NFC_CARD.name} photo ${index}`}
                        fill
                        sizes="(max-width: 640px) 90vw, 480px"
                        className="object-contain"
                        priority={index === 1}
                    />
                )}

                <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() => step(-1)}
                    className={`${ARROW_CLASS} left-2`}
                >
                    <ChevronLeft className="size-4" />
                </button>
                <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => step(1)}
                    className={`${ARROW_CLASS} right-2`}
                >
                    <ChevronRight className="size-4" />
                </button>
                <span className="absolute right-2 bottom-2 rounded-full bg-foreground/70 px-2 py-0.5 text-[10px] font-medium text-background tabular-nums">
                    {index + 1} / {SLIDES.length}
                </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {SLIDES.map((item, itemIndex) => (
                    <button
                        key={item.key}
                        type="button"
                        aria-pressed={itemIndex === index}
                        aria-label={item.isVideo ? "Show product video" : `Show photo ${itemIndex}`}
                        onClick={() => setIndex(itemIndex)}
                        className={`relative size-11 shrink-0 overflow-hidden rounded-lg border transition-transform duration-150 ease-out active:scale-[0.94] ${
                            itemIndex === index
                                ? "border-primary ring-2 ring-primary/25"
                                : "border-border/60 opacity-80 hover:opacity-100"
                        }`}
                    >
                        <Image src={item.thumb} alt="" fill sizes="40px" className="object-cover" />
                        {item.isVideo ? (
                            <span className="absolute inset-0 flex items-center justify-center bg-foreground/45 text-background">
                                <Play className="size-3.5 fill-current" />
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>
        </div>
    );
}
