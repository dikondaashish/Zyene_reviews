"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISS_KEY = "zyene-announcement-dismissed-v1";

export function MarketingLayoutAnnouncementBar() {
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    }, []);

    if (dismissed) return null;

    function handleDismiss() {
        setDismissed(true);
        localStorage.setItem(DISMISS_KEY, "true");
    }

    return (
        <div className="relative z-50 flex w-full items-center justify-center gap-3 border-b border-border bg-muted px-4 py-2.5 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                New
            </span>
            <span className="text-muted-foreground">
                Auto-Reply to Google Reviews is here.
            </span>
            <Link
                href="/features"
                className="font-medium text-foreground hover:text-primary transition-colors"
            >
                See what&apos;s new
                <span className="ml-1">→</span>
            </Link>
            <button
                type="button"
                onClick={handleDismiss}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Dismiss announcement"
            >
                <X className="size-4" />
            </button>
        </div>
    );
}
