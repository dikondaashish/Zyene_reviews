import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewCardStatusBadge({ status }: { status: string }) {
    switch (status) {
        case "responded":
            return (
                <span className="text-xs px-2 py-0.5 rounded-full bg-chart-2/15 text-chart-2 font-medium border border-chart-2/30">
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
                <span className="text-xs px-2 py-0.5 rounded-full bg-chart-4/15 text-chart-4 font-medium border border-chart-4/35">
                    Pending
                </span>
            );
    }
}

export function ReviewCardStars({ rating }: { rating: number }) {
    const colorClass =
        rating >= 4
            ? "text-chart-2 fill-chart-2"
            : rating === 3
              ? "text-chart-4 fill-chart-4"
              : "text-destructive fill-destructive";
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={cn("w-3.5 h-3.5", i < rating ? colorClass : "text-muted-foreground/40 fill-muted")}
                />
            ))}
        </div>
    );
}
