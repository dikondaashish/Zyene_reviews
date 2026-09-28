import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewCardStatusBadge({ status }: { status: string }) {
    switch (status) {
        case "responded":
            return (
                <span className="text-xs px-2 py-0.5 rounded-full bg-chart-2/15 text-success font-medium border border-chart-2/30">
                    Responded
                </span>
            );
        case "ignored":
            return (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border">
                    Ignored
                </span>
            );
        default:
            return (
                <span className="text-xs px-2 py-0.5 rounded-full bg-chart-4/15 text-warning-foreground font-medium border border-chart-4/35">
                    Needs reply
                </span>
            );
    }
}

export function ReviewCardStars({ rating }: { rating: number }) {
    return (
        <span className="inline-flex shrink-0 items-center gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    aria-hidden="true"
                    strokeWidth={0}
                    className={cn("size-4 fill-current", i < rating ? "text-warning" : "text-muted-foreground/25")}
                />
            ))}
        </span>
    );
}
