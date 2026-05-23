"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";

export function ZyenePlatformPopularTagsCard({
    popularTags,
    maxTagCount,
}: {
    popularTags: { tag: string; count: number }[];
    maxTagCount: number;
}) {
    return (
        <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
            <CardHeader>
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Hash className="w-5 h-5 text-primary" />
                        What Customers Loved
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">
                        Most selected positive tags from the review flow
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                {popularTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((t, idx) => {
                            const intensity = Math.max(0.3, t.count / maxTagCount);
                            return (
                                <motion.div
                                    key={t.tag}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.04 }}
                                >
                                    <div
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-default"
                                        style={{ opacity: 0.5 + intensity * 0.5 }}
                                    >
                                        <span className="text-sm font-semibold">{t.tag}</span>
                                        <Badge
                                            variant="secondary"
                                            className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 font-bold"
                                        >
                                            {t.count}
                                        </Badge>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                        <Hash className="w-8 h-8 opacity-20" />
                        <p className="text-sm">No tags selected yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
