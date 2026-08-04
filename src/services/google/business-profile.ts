/**
 * Google Business Profile API client — barrel re-export.
 *
 * Split by API surface so a change to review handling does not sit next to
 * OAuth refresh and account listing:
 *   - business-profile-core           types, endpoints, error shape, fetchWithRetry
 *   - business-profile-token          OAuth refresh
 *   - business-profile-accounts       account + location listing
 *   - business-profile-reviews        review read/reply
 *   - business-profile-review-errors  403/429 payload interpretation
 */

export {
    type GoogleTokenResponse,
    type GoogleAccount,
    type GoogleLocation,
    type GoogleReview,
    fetchWithRetry,
    parseGoogleLocationResourceIds,
    isGoogleUnauthorizedError,
} from "./business-profile-core";

export { refreshGoogleToken } from "./business-profile-token";

export {
    FULL_LOCATION_READ_MASK,
    listAccounts,
    listLocations,
} from "./business-profile-accounts";

export {
    parseGoogleReviewsApiError,
    parseGoogle403Error,
} from "./business-profile-review-errors";

export {
    listReviews,
    replyToReview,
    deleteReviewReply,
    getReview,
} from "./business-profile-reviews";
