import { isRequestChannel } from "@/components/analytics/zyene-platform-analytics-channel-utils";
import { pct } from "@/components/analytics/zyene-platform-analytics-math";
import type { ReviewRequest } from "@/components/analytics/zyene-platform-analytics-types";

export function computeZyenePlatformAnalyticsBase(
    requests: ReviewRequest[],
    previousRequests: ReviewRequest[]
) {
    const allSourceRequests = requests;
    const previousAllSourceRequests = previousRequests;

    const requestFlow = requests.filter(isRequestChannel);
    const previousRequestFlow = previousRequests.filter(isRequestChannel);

    const totalSent = requestFlow.filter((r) => r.sent_at).length;
    const totalDelivered = requestFlow.filter((r) => r.delivered_at).length;
    const totalOpened = requestFlow.filter(
        (r) => (r.channel === "email" || r.channel === "both") && r.opened_at
    ).length;
    const totalClicked = requestFlow.filter((r) => r.clicked_at).length;
    const totalCompleted = requestFlow.filter((r) => r.completed_at).length;
    const totalPostedToGoogle = requestFlow.filter((r) => r.status === "completed").length;

    const prevSent = previousRequestFlow.filter((r) => r.sent_at).length;
    const prevClicked = previousRequestFlow.filter((r) => r.clicked_at).length;
    const prevCompleted = previousRequestFlow.filter((r) => r.completed_at).length;

    const allSourceClicked = allSourceRequests.filter((r) => r.clicked_at).length;
    const allSourcePostedToGoogle = allSourceRequests.filter((r) => r.status === "completed").length;
    const allSourceRatingsGiven = allSourceRequests.filter((r) => r.rating_given !== null);
    const allSourceAvgRating =
        allSourceRatingsGiven.length > 0
            ? allSourceRatingsGiven.reduce((acc, r) => acc + (r.rating_given || 0), 0) /
              allSourceRatingsGiven.length
            : 0;
    const allSourceLowRatings = allSourceRequests.filter(
        (r) => r.rating_given !== null && r.rating_given <= 3
    );

    const prevAllSourceClicked = previousAllSourceRequests.filter((r) => r.clicked_at).length;
    const prevAllSourcePostedToGoogle = previousAllSourceRequests.filter(
        (r) => r.status === "completed"
    ).length;
    const prevAllSourceRatingsGiven = previousAllSourceRequests.filter((r) => r.rating_given !== null);
    const prevAllSourceAvgRating =
        prevAllSourceRatingsGiven.length > 0
            ? prevAllSourceRatingsGiven.reduce((acc, r) => acc + (r.rating_given || 0), 0) /
              prevAllSourceRatingsGiven.length
            : 0;
    const prevAllSourceLowRatings = previousAllSourceRequests.filter(
        (r) => r.rating_given !== null && r.rating_given <= 3
    );

    const allSourceClickRate = pct(allSourceClicked, totalSent);
    const allSourceConversionRate = pct(allSourcePostedToGoogle, allSourceClicked);

    const ratingsGiven = requestFlow.filter((r) => r.rating_given !== null);
    const avgRating =
        ratingsGiven.length > 0
            ? ratingsGiven.reduce((acc, r) => acc + (r.rating_given || 0), 0) / ratingsGiven.length
            : 0;
    const lowRatings = allSourceLowRatings;
    const clickRate = pct(totalClicked, totalSent);
    const conversionRate = pct(totalCompleted, totalClicked);

    const prevRatingsGiven = previousRequestFlow.filter((r) => r.rating_given !== null);
    const prevAvgRating =
        prevRatingsGiven.length > 0
            ? prevRatingsGiven.reduce((acc, r) => acc + (r.rating_given || 0), 0) / prevRatingsGiven.length
            : 0;
    const prevLowRatings = prevAllSourceLowRatings;

    return {
        allSourceRequests,
        previousAllSourceRequests,
        requestFlow,
        previousRequestFlow,
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalCompleted,
        totalPostedToGoogle,
        prevSent,
        prevClicked,
        prevCompleted,
        allSourceClicked,
        allSourcePostedToGoogle,
        allSourceRatingsGiven,
        allSourceAvgRating,
        allSourceLowRatings,
        prevAllSourceClicked,
        prevAllSourcePostedToGoogle,
        prevAllSourceRatingsGiven,
        prevAllSourceAvgRating,
        prevAllSourceLowRatings,
        allSourceClickRate,
        allSourceConversionRate,
        ratingsGiven,
        avgRating,
        lowRatings,
        clickRate,
        conversionRate,
        prevRatingsGiven,
        prevAvgRating,
        prevLowRatings,
    };
}
