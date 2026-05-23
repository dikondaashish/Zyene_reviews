"use client";

import type { CompetitorsChartsSectionProps } from "./competitors-types";
import { CompetitorsChartRatingCard } from "./competitors-chart-rating-card";
import { CompetitorsChartReviewsCard } from "./competitors-chart-reviews-card";

export function CompetitorsChartsSection({ chartData }: CompetitorsChartsSectionProps) {
    if (chartData.length === 0) {
        return null;
    }

    return (
        <>
            <CompetitorsChartRatingCard chartData={chartData} />
            <CompetitorsChartReviewsCard chartData={chartData} />
        </>
    );
}
