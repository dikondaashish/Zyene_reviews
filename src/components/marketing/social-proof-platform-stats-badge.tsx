import { Star } from "lucide-react";
import { getPlatformStats } from "@/lib/social-proof/social-proof-data";

export function PlatformStatsBadge({ className = "" }: { className?: string }) {
    const stats = getPlatformStats();
    return (
        <div
            className={`inline-flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground ${className}`}
        >
            <span className="inline-flex items-center gap-1.5">
                <Star className="fill-primary text-primary size-4" />
                <span className="font-semibold text-foreground">{stats.starRating}/5</span>
                <span>from local business owners</span>
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span>
                Managing <span className="font-semibold text-foreground">{stats.reviewCountFormatted}</span> reviews
                for <span className="font-semibold text-foreground">{stats.businessCountFormatted}</span> businesses
            </span>
        </div>
    );
}
