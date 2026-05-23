"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, Star } from "lucide-react";

import type { ReviewRequest } from "@/components/analytics/zyene-platform-analytics-types";

export function ZyenePlatformLowRatingAlertsCard({
    lowRatingEntries,
    lowRatingsLength,
}: {
    lowRatingEntries: ReviewRequest[];
    lowRatingsLength: number;
}) {
    return (
        <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-chart-4" />
                            Low Rating Alerts
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">
                            Ratings ≤ 3★ intercepted before reaching Google
                        </p>
                    </div>
                    {lowRatingEntries.length > 0 && (
                        <Badge className="bg-chart-4/120/10 text-chart-4 border-chart-4/30 font-bold">
                            {lowRatingsLength} total
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {lowRatingEntries.length > 0 ? (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {lowRatingEntries.map((r, idx) => {
                            const stars = r.rating_given || 0;
                            const ratingEmoji = stars === 1 ? "😞" : stars === 2 ? "😕" : "😐";
                            return (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors"
                                >
                                    <span className="text-2xl">{ratingEmoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold truncate">
                                                {r.customer_name || r.customer_email || "Anonymous"}
                                            </p>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "h-3 w-3",
                                                            i < stars
                                                                ? "fill-chart-4 text-chart-4"
                                                                : "text-muted-foreground/30"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {new Date(r.created_at).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-[9px] px-1.5 py-0 bg-muted/40 font-bold capitalize"
                                            >
                                                {r.channel}
                                            </Badge>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                        <CheckCircle2 className="w-10 h-10 opacity-20 text-chart-2" />
                        <p className="text-sm font-medium">No low ratings in this period! 🎉</p>
                        <p className="text-xs">All your customers are happy</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
