"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import { Star } from "lucide-react";

interface RatingData {
    rating: number;
    count: number;
}

const RATING_COLORS: Record<number, string> = {
    1: "var(--destructive)",
    2: "var(--destructive)",
    3: "var(--chart-4)", // Orange/yellowish
    4: "var(--primary)",
    5: "var(--primary)",
};

export function RatingDistributionChart({ data }: { data: RatingData[] }) {
    // Ensure all 5 ratings are represented
    const fullData = [5, 4, 3, 2, 1].map((rating) => {
        const found = data.find((d) => d.rating === rating);
        return {
            rating,
            count: found?.count || 0,
        };
    });

    const total = fullData.reduce((acc, curr) => acc + curr.count, 0);
    const hasData = total > 0;

    if (!hasData) {
        return (
            <div className="flex h-62.5 items-center justify-center text-muted-foreground text-sm">
                No ratings data yet
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center h-full gap-3.5 pt-2">
            {fullData.map((d) => {
                const percent = total > 0 ? (d.count / total) * 100 : 0;
                return (
                    <div key={d.rating} className="flex items-center gap-4">
                        <div className="flex items-center gap-[2px] justify-end w-[70px] shrink-0" aria-label={`${d.rating} stars`}>
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    strokeWidth={i < d.rating ? 0 : 1.35}
                                    className={`h-3.5 w-3.5 ${
                                        i < d.rating ? "fill-chart-4 text-chart-4" : "fill-none text-muted-foreground/30 stroke-muted-foreground/30"
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="flex-1 h-[22px] rounded-md overflow-hidden bg-muted/60 relative">
                            {/* Inner background that mimics 'empty' state slightly better */}
                            <div className="absolute inset-0 bg-muted dark:bg-muted/20 opacity-70" />
                            <div
                                className="absolute top-0 left-0 bottom-0 rounded-md transition-all duration-1000 ease-in-out"
                                style={{
                                    width: `${percent}%`,
                                    backgroundColor: RATING_COLORS[d.rating],
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 w-[75px] shrink-0">
                            <span className="font-bold text-[13px] text-foreground">{d.count}</span>
                            <span className="text-muted-foreground text-[11px] w-8 text-right">&middot; {percent.toFixed(0)}%</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
