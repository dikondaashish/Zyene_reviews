"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { businessInitials, businessLogoUrl, MIN_LOGO_PX } from "@/lib/competitors/business-logo";

/**
 * The business's favicon as its logo, over an initials badge that shows while it
 * loads and stays when there's no usable logo. Decorative: the name is always
 * printed next to it.
 */
export function BusinessLogo({
    name,
    website,
    className = "size-8",
}: {
    name: string;
    website: string | null | undefined;
    className?: string;
}) {
    const src = businessLogoUrl(website);
    const [state, setState] = useState<"loading" | "ok" | "none">("loading");

    return (
        <span
            aria-hidden
            className={cn(
                "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-muted text-[10px] font-semibold text-muted-foreground",
                className,
            )}
        >
            {businessInitials(name)}
            {src && state !== "none" ? (
                <Image
                    src={src}
                    alt=""
                    width={64}
                    height={64}
                    unoptimized
                    referrerPolicy="no-referrer"
                    onLoad={(e) => setState(e.currentTarget.naturalWidth >= MIN_LOGO_PX ? "ok" : "none")}
                    onError={() => setState("none")}
                    className={cn("absolute inset-0 size-full bg-white object-contain p-0.5", state === "ok" ? "opacity-100" : "opacity-0")}
                />
            ) : null}
        </span>
    );
}
