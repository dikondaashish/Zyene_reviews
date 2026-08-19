"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Zap } from "lucide-react";

import { pct } from "@/components/analytics/zyene-platform-analytics-math";

export type ZyeneFunnelStep = {
  label: string;
  count: number;
  icon: LucideIcon;
  color: string;
};

export function ZyenePlatformReviewRequestFunnelCard({
  dateRange,
  funnelSteps,
  totalSent,
}: {
  dateRange: string;
  funnelSteps: ZyeneFunnelStep[];
  totalSent: number;
}) {
  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-md overflow-hidden">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Zap className="text-primary size-5" />
            Review Request Funnel
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground font-medium">
              Track every step from send to Google review · {dateRange}
            </p>
            <Badge
              variant="secondary"
              className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20"
            >
              Email + SMS only
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LazyMotion features={domAnimation}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {funnelSteps.map((step, idx) => {
              const percentOfSent = pct(step.count, totalSent);
              return (
                <m.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="relative flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-colors group">
                    <div
                      className="rounded-xl flex items-center justify-center transition-colors size-10"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${step.color} 18%, transparent)`,
                      }}
                    >
                      <step.icon
                        className="size-5"
                        style={{ color: step.color }}
                      />
                    </div>
                    <span className="text-2xl font-black tracking-tight">
                      {step.count.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {step.label}
                    </span>
                    {idx > 0 && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0",
                          percentOfSent >= 50
                            ? "bg-chart-2/10 text-chart-2"
                            : percentOfSent >= 20
                              ? "bg-chart-4/120/10 text-chart-4"
                              : "bg-sync-action/100/10 text-sync-action",
                        )}
                      >
                        {percentOfSent}% of sent
                      </Badge>
                    )}
                  </div>
                </m.div>
              );
            })}
          </div>
        </LazyMotion>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Every percentage uses sent requests as the denominator.
        </p>
      </CardContent>
    </Card>
  );
}
