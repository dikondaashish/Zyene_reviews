import { TrendingUp } from "lucide-react";

/** Kept from original loader (unused in return payload). */
export function formatTrend(val: number, isRating = false) {
    if (val === 0) return null;
    const isPositive = val > 0;
    const text = isRating ? val.toFixed(1) : Math.abs(val);
    const color = isPositive ? "text-chart-2" : "text-destructive";
    const Icon = isPositive ? TrendingUp : TrendingUp;

    return (
        <span className={`text-xs font-medium ${color} flex items-center`}>
            {isPositive ? "+" : "-"}
            {text}
            {isRating ? " stars" : ""}
            {isPositive ? " this month" : " vs last month"}
        </span>
    );
}
