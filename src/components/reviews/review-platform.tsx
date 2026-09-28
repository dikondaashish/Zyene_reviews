"use client";

import Image from "next/image";
import { Globe } from "lucide-react";
import { useState } from "react";

const platforms: Record<string, { name: string; domain: string }> = {
    google: { name: "Google", domain: "google.com" },
    facebook: { name: "Facebook", domain: "facebook.com" },
    yelp: { name: "Yelp", domain: "yelp.com" },
    tripadvisor: { name: "Tripadvisor", domain: "tripadvisor.com" },
    trustpilot: { name: "Trustpilot", domain: "trustpilot.com" },
};

export function ReviewPlatformIcon({ platform, className = "size-4" }: { platform: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    const source = platforms[platform.toLowerCase()];
    if (!source || failed) return <Globe className={className} aria-hidden="true" />;
    return (
        <Image
            src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${source.domain}&size=256`}
            alt="" width={16} height={16} unoptimized onError={() => setFailed(true)}
            className={`${className} object-contain`} referrerPolicy="no-referrer"
        />
    );
}

export function ReviewPlatform({ platform, showIcon = true }: { platform: string; showIcon?: boolean }) {
    const source = platforms[platform.toLowerCase()];
    return (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            {showIcon && <ReviewPlatformIcon platform={platform} />}
            <span className="capitalize">{source?.name || platform || "Review"}</span>
        </span>
    );
}
