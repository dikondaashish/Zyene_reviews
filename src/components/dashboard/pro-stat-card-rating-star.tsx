import { Star } from "lucide-react";

export function ProStatCardRatingStarSlot({ fill }: { fill: number }) {
    const f = Math.max(0, Math.min(1, fill));
    return (
        <span className="relative inline-block shrink-0 size-4">
            <Star
                className="pointer-events-none absolute inset-0 fill-muted text-muted-foreground/45 size-4"
                aria-hidden
            />
            <span className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${f * 100}%` }}>
                <Star className="pointer-events-none shrink-0 fill-chart-4 text-chart-4 size-4" aria-hidden />
            </span>
        </span>
    );
}

export function ProStatCardTrendUpGlyph() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="19"
            viewBox="0 0 18 19"
            fill="none"
            className="inline ml-1 size-4"
            aria-hidden="true"
        >
            <path
                d="M16.5 5L9.5 12.56L6.83333 8.24L1.5 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.5 5H16.5V8.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
