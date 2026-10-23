import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrivateFeedbackCardStars({ rating }: { rating: number }) {
    const colorClass = rating === 3 ? "text-chart-4" : "text-destructive";
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={cn("size-3.5", i < rating ? colorClass : "text-muted-foreground/25")}
                />
            ))}
        </div>
    );
}
