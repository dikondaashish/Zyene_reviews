import type { ReviewRequest } from "@/components/analytics/zyene-platform-analytics-types";
import {
    calculateRequestMetrics,
    isOutboundRequest,
    isSentRequest,
} from "@/lib/metrics/business-metrics";

function ratingSummary(requests: ReviewRequest[]) {
    const ratingsGiven = requests.filter(
        (request) => request.rating_given !== null,
    );
    const avgRating =
        ratingsGiven.length > 0
            ? ratingsGiven.reduce(
                  (sum, request) => sum + (request.rating_given ?? 0),
                  0,
              ) / ratingsGiven.length
            : 0;
    const lowRatings = requests.filter(
        (request) => request.rating_given !== null && request.rating_given <= 3,
    );
    return { ratingsGiven, avgRating, lowRatings };
}

export function computeZyenePlatformAnalyticsBase(
    requests: ReviewRequest[],
    previousRequests: ReviewRequest[],
) {
    const allSourceRequests = requests;
    const previousAllSourceRequests = previousRequests;
    const requestFlow = requests.filter(isOutboundRequest);
    const previousRequestFlow = previousRequests.filter(isOutboundRequest);
    const metrics = calculateRequestMetrics(requests);
    const previousMetrics = calculateRequestMetrics(previousRequests);
    const currentRatings = ratingSummary(allSourceRequests);
    const previousRatings = ratingSummary(previousAllSourceRequests);
    const requestRatings = ratingSummary(requestFlow);
    const previousRequestRatings = ratingSummary(previousRequestFlow);

    const totalOpened = requestFlow.filter(
        (request) =>
            isSentRequest(request) &&
            (request.channel === "email" || request.channel === "both") &&
            request.opened_at,
    ).length;
    const totalPostedToGoogle = requestFlow.filter(
        (request) => request.status === "completed",
    ).length;

    return {
        allSourceRequests,
        previousAllSourceRequests,
        requestFlow,
        previousRequestFlow,
        totalSent: metrics.totalSent,
        totalDelivered: metrics.delivered,
        totalOpened,
        totalClicked: metrics.clicked,
        totalCompleted: metrics.completed,
        totalPostedToGoogle,
        prevSent: previousMetrics.totalSent,
        prevClicked: previousMetrics.clicked,
        prevCompleted: previousMetrics.completed,
        allSourceClicked: metrics.clicked,
        allSourcePostedToGoogle: metrics.completed,
        allSourceRatingsGiven: currentRatings.ratingsGiven,
        allSourceAvgRating: currentRatings.avgRating,
        allSourceLowRatings: currentRatings.lowRatings,
        prevAllSourceClicked: previousMetrics.clicked,
        prevAllSourcePostedToGoogle: previousMetrics.completed,
        prevAllSourceRatingsGiven: previousRatings.ratingsGiven,
        prevAllSourceAvgRating: previousRatings.avgRating,
        prevAllSourceLowRatings: previousRatings.lowRatings,
        allSourceClickRate: Math.round(metrics.clickRate),
        allSourceConversionRate: Math.round(metrics.conversionRate),
        ratingsGiven: requestRatings.ratingsGiven,
        avgRating: requestRatings.avgRating,
        lowRatings: currentRatings.lowRatings,
        clickRate: Math.round(metrics.clickRate),
        conversionRate: Math.round(metrics.conversionRate),
        prevRatingsGiven: previousRequestRatings.ratingsGiven,
        prevAvgRating: previousRequestRatings.avgRating,
        prevLowRatings: previousRatings.lowRatings,
    };
}
