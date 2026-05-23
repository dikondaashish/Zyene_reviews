"use client";

import { useState } from "react";
import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import type { AnalyticsRange } from "@/lib/analytics/date-range";
import { useAnalyticsFullRangeQuery } from "@/hooks/use-range-queries";
import type { RangeKey } from "@/lib/query/date-range-keys";
import { useAnalyticsPageUrlSync } from "@/components/analytics/use-analytics-page-url-sync";
import { AnalyticsPageClientHero } from "@/components/analytics/analytics-page-client-hero";
import { AnalyticsPageZyeneBranch } from "@/components/analytics/analytics-page-zyene-branch";
import { AnalyticsPageDefaultStack } from "@/components/analytics/analytics-page-default-stack";

export function AnalyticsPageClient({
    businessId,
    businessName,
    businessSlug,
    initialPayload,
}: {
    businessId: string;
    businessName: string;
    businessSlug: string;
    initialPayload: AnalyticsFullRangePayload;
}) {
    const [range, setRange] = useState<AnalyticsRange>(() => initialPayload.range);
    const [platform, setPlatform] = useState(() => initialPayload.platform);

    const seedInitial =
        range === initialPayload.range && platform === initialPayload.platform ? initialPayload : undefined;

    const { data: queryData } = useAnalyticsFullRangeQuery(businessId, range as RangeKey, platform, seedInitial);

    const d = queryData ?? initialPayload;
    const isDemo = d.isDemo;
    const isGoogleConnected = d.connectedPlatforms.includes("google");

    useAnalyticsPageUrlSync(range, platform);

    const perfTotals = d.perfTotals as
        | {
              profileViews?: number;
              websiteClicks?: number;
              callClicks?: number;
              directionRequests?: number;
          }
        | null;

    return (
        <div className="relative flex min-w-0 flex-1 flex-col gap-8 overflow-x-hidden p-4 text-foreground md:p-8">
            <AnalyticsPageClientHero
                businessId={businessId}
                businessName={businessName}
                businessSlug={businessSlug}
                d={d}
                isDemo={isDemo}
                range={range}
                platform={platform}
                setPlatform={setPlatform}
                setRange={setRange}
            />

            <MilestoneCelebration currentCount={d.stats.totalReviews} type="reviews" isDemo={isDemo} />
            <MilestoneCelebration currentCount={d.stats.avgRating} type="rating" isDemo={isDemo} />

            {isDemo && <DemoModeBanner className="mb-2" />}

            <div id="analytics-content" className="flex flex-col gap-8 w-full relative">
                {platform === "zyene" ? (
                    <AnalyticsPageZyeneBranch d={d} />
                ) : (
                    <AnalyticsPageDefaultStack
                        d={d}
                        isDemo={isDemo}
                        platform={platform}
                        isGoogleConnected={isGoogleConnected}
                        perfTotals={perfTotals}
                    />
                )}
            </div>
        </div>
    );
}
