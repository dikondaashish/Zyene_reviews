export function hasSentReviewRequest(input: {
    hasEngagementData: boolean;
    requestsThisMonth: number;
}): boolean {
    return input.hasEngagementData || input.requestsThisMonth > 0;
}

/** Hide Get Started once the account is actually using the product. */
export function shouldShowGettingStartedBanner(input: {
    isGoogleConnected: boolean;
    hasSentReviewRequest: boolean;
}): boolean {
    return !(input.isGoogleConnected && input.hasSentReviewRequest);
}
