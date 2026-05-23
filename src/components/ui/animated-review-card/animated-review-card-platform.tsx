import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ThemeColor } from "@/components/ui/animated-review-card/animated-review-card-types";

export function spotlightInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }
    const one = parts[0] || "?";
    return one.slice(0, 2).toUpperCase();
}

export function SpotlightRatingStars({ rating, className }: { rating: number; className?: string }) {
    const r = Math.min(5, Math.max(0, Math.round(rating)));
    return (
        <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${r} of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    strokeWidth={i < r ? 0 : 1.35}
                    className={cn(
                        "shrink-0 text-chart-4 sm:h-4 sm:w-4 size-3.5",
                        i < r ? "fill-chart-4" : "fill-none"
                    )}
                    aria-hidden
                />
            ))}
        </span>
    );
}

function GooglePlatformIcon({ className = "size-3.5" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="var(--brand-google)"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="var(--google-logo-green)"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="var(--google-logo-yellow)"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="var(--google-logo-red)"
            />
        </svg>
    );
}

function PlatformGlyph({ platform }: { platform: string }) {
    const p = platform.toLowerCase();
    if (p === "google") {
        return <GooglePlatformIcon className="size-3.5" />;
    }
    if (p === "facebook") {
        return (
            <span className="inline-flex items-center justify-center rounded-full bg-[rgb(24,119,242)] text-[10px] font-bold leading-none text-white size-3.5">
                f
            </span>
        );
    }
    if (p === "yelp") {
        return (
            <span className="inline-flex items-center justify-center rounded-full bg-[rgb(255,26,26)] text-[9px] font-bold leading-none text-white size-3.5">
                Y
            </span>
        );
    }
    if (p === "zyene") {
        return (
            <span className="inline-flex items-center justify-center rounded-full bg-primary text-[9px] font-bold leading-none text-primary-foreground size-3.5">
                Z
            </span>
        );
    }
    return (
        <span className="inline-flex items-center justify-center rounded-full bg-muted text-[9px] font-semibold uppercase leading-none text-muted-foreground size-3.5">
            {platform.slice(0, 1)}
        </span>
    );
}

export function PlatformBadge({ platform, theme }: { platform: string; theme: ThemeColor }) {
    const p = platform.toLowerCase();
    const label =
        p === "google"
            ? "Google"
            : p === "yelp"
              ? "Yelp"
              : p === "facebook"
                ? "Facebook"
                : p === "zyene"
                  ? "Zyene"
                  : platform;
    const subtle =
        theme === "vibrant"
            ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
            : p === "google"
              ? "border-[rgba(251,191,36,0.7)] bg-[rgba(254,243,199,0.9)] text-[rgb(69,26,3)] dark:border-[rgba(120,53,15,0.5)] dark:bg-[rgba(69,26,3,0.4)] dark:text-[rgb(254,243,199)]"
              : "border-border/80 bg-muted/80 text-foreground/80 dark:bg-muted/60";

    return (
        <Badge
            variant="outline"
            className={cn("h-6 shrink-0 rounded-full px-2 py-0", subtle)}
            aria-label={label}
            title={label}
        >
            <PlatformGlyph platform={platform} />
        </Badge>
    );
}

export function SentimentPill({ sentiment, theme }: { sentiment: string; theme: ThemeColor }) {
    const s = sentiment.toLowerCase();
    const colors =
        s === "positive"
            ? theme === "vibrant"
                ? "bg-chart-2/30 text-primary-foreground"
                : "bg-chart-2/15 text-chart-2 dark:text-chart-2"
            : s === "negative"
              ? theme === "vibrant"
                  ? "bg-destructive/30 text-destructive-foreground"
                  : "bg-destructive/15 text-destructive dark:text-destructive"
                : s === "mixed"
                  ? theme === "vibrant"
                      ? "bg-chart-4/30 text-foreground"
                      : "bg-chart-4/15 text-chart-4 dark:text-chart-4"
                  : theme === "vibrant"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground";
    return (
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", colors)}>
            {sentiment}
        </span>
    );
}
