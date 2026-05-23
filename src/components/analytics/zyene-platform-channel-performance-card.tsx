"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Mail, MessageSquare, Send } from "lucide-react";

export type ZyeneChannelDatum = {
    channel: string;
    sent: number;
    clicked: number;
    completed: number;
    clickRate: number;
    conversionRate: number;
};

export function ZyenePlatformChannelPerformanceCard({ channelData }: { channelData: ZyeneChannelDatum[] }) {
    return (
        <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
            <CardHeader>
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Send className="text-primary size-5" />
                        Channel Performance
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">
                        Compare SMS, Email, and Link effectiveness
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {channelData.map((ch) => {
                    const ChannelIcon =
                        ch.channel === "SMS" ? MessageSquare : ch.channel === "Email" ? Mail : Link2;
                    return (
                        <div key={ch.channel} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-lg bg-primary/10 flex items-center justify-center size-8">
                                        <ChannelIcon className="text-primary size-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{ch.channel}</p>
                                        <p className="text-[10px] text-muted-foreground">{ch.sent} sent</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-sm font-black text-primary">{ch.clickRate}% CTR</p>
                                    <p className="text-[10px] text-muted-foreground">{ch.conversionRate}% converted</p>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-border rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-primary rounded-l-full transition-all duration-700"
                                    style={{
                                        width: `${ch.sent > 0 ? (ch.completed / ch.sent) * 100 : 0}%`,
                                    }}
                                />
                                <div
                                    className="h-full bg-primary/40 transition-all duration-700"
                                    style={{
                                        width: `${ch.sent > 0 ? ((ch.clicked - ch.completed) / ch.sent) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <div className="rounded-full bg-primary size-1.5" />
                                    {ch.completed} completed
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="rounded-full bg-primary/40 size-1.5" />
                                    {ch.clicked - ch.completed} clicked only
                                </span>
                            </div>
                        </div>
                    );
                })}
                {channelData.every((ch) => ch.sent === 0) && (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                        <Send className="opacity-20 size-8" />
                        <p className="text-sm">No requests sent in this period</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
