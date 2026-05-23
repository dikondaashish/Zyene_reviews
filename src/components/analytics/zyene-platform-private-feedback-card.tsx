"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageCircle, Star } from "lucide-react";

import type { PrivateFeedback } from "@/components/analytics/zyene-platform-analytics-types";

export function ZyenePlatformPrivateFeedbackCard({ privateFeedback }: { privateFeedback: PrivateFeedback[] }) {
    return (
        <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <MessageCircle className="text-primary size-5" />
                            Private Feedback
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">
                            Direct feedback from customers who rated low
                        </p>
                    </div>
                    {privateFeedback.length > 0 && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                            {privateFeedback.length}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {privateFeedback.length > 0 ? (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {privateFeedback.slice(0, 10).map((fb, idx) => {
                            const ratingEmoji =
                                fb.rating === 1
                                    ? "😞"
                                    : fb.rating === 2
                                      ? "😕"
                                      : fb.rating === 3
                                        ? "😐"
                                        : "😊";
                            return (
                                <motion.div
                                    key={fb.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{ratingEmoji}</span>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "size-3",
                                                            i < fb.rating
                                                                ? "fill-chart-4 text-chart-4"
                                                                : "text-muted-foreground/30"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            {new Date(fb.created_at).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    {fb.content ? (
                                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                                            &ldquo;{fb.content}&rdquo;
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No written feedback provided</p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                        <MessageCircle className="opacity-20 size-10" />
                        <p className="text-sm font-medium">No private feedback yet</p>
                        <p className="text-xs">Feedback appears when customers rate ≤3 stars</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
