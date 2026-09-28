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

export function ReviewPlatform({ platform }: { platform: string }) {
    const [failed, setFailed] = useState(false);
    const source = platforms[platform.toLowerCase()];
    return (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            {source && !failed ? (
                <Image
                    src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${source.domain}&size=256`}
                    alt="" width={16} height={16} unoptimized onError={() => setFailed(true)}
                    className="size-4 object-contain" referrerPolicy="no-referrer"
                />
            ) : <Globe className="size-4" aria-hidden="true" />}
            <span className="capitalize">{source?.name || platform || "Review"}</span>
        </span>
    );
}
