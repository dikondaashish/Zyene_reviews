"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { pct } from "@/components/analytics/zyene-platform-analytics-math";

export function ZyenePlatformRatingDistributionCard({
    ratingDist,
    maxRatingCount,
    ratingColors,
    allSourceRatingsGivenLength,
}: {
    ratingDist: { star: string; value: number; count: number }[];
    maxRatingCount: number;
    ratingColors: Record<number, string>;
    allSourceRatingsGivenLength: number;
}) {
    return (
        <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
            <CardHeader>
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Star className="text-primary size-5" />
                        Rating Distribution
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">
                        How customers rated their experience on your link
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {ratingDist.map((d) => (
                    <div key={d.star} className="flex items-center gap-3">
                        <span className="text-sm font-bold w-8 text-right">{d.star}</span>
                        <div className="flex-1 h-6 bg-border rounded-lg overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${maxRatingCount > 0 ? (d.count / maxRatingCount) * 100 : 0}%`,
                                }}
                                transition={{ duration: 0.8, delay: 0.2 + (5 - d.value) * 0.1 }}
                                className="h-full rounded-lg flex items-center justify-end pr-2"
                                style={{ backgroundColor: ratingColors[d.value] }}
                            >
                                {d.count > 0 && (
                                    <span className="text-[10px] font-bold text-primary-foreground">{d.count}</span>
                                )}
                            </motion.div>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground w-10 text-right">
                            {pct(d.count, allSourceRatingsGivenLength)}%
                        </span>
                    </div>
                ))}
                {allSourceRatingsGivenLength === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                        <Star className="opacity-20 size-8" />
                        <p className="text-sm">No ratings given yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
