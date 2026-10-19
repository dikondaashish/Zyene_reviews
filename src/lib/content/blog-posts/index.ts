/**
 * Blog post registry. One file per post, named by its URL slug.
 * Add a new post: create `<slug>.ts`, then append it here in publish order.
 */

import type { BlogPostSource } from "@/lib/content/blog-types";
import { howToGet50GoogleReviewsIn30DaysPost } from "./how-to-get-50-google-reviews-in-30-days";
import { whyGoogleReviewsMatterIn2026Post } from "./why-google-reviews-matter-in-2026";
import { birdeyePricingBreakdown2026Post } from "./birdeye-pricing-breakdown-2026";
import { birdeyeAlternativesForLocalBusinessesPost } from "./birdeye-alternatives-for-local-businesses";
import { howToRespondToA1StarReviewPost } from "./how-to-respond-to-a-1-star-review";
import { aiReplyMistakesToAvoidPost } from "./ai-reply-mistakes-to-avoid";
import { googleBusinessProfileOptimizationChecklistPost } from "./google-business-profile-optimization-checklist";
import { howReviewsImpactLocalMapPackRankingPost } from "./how-reviews-impact-local-map-pack-ranking";
import { restaurantOwnersGuideToGoogleReviewsPost } from "./restaurant-owners-guide-to-google-reviews";
import { dentalPracticeReputationManagement2026Post } from "./dental-practice-reputation-management-2026";
import { trueCostOfBadOnlineReputationPost } from "./true-cost-of-bad-online-reputation";
import { howToHandleFakeGoogleReviewsPost } from "./how-to-handle-fake-google-reviews";
import { negativeFeedbackShieldPost } from "./negative-feedback-shield";
import { aiVisibilityAuditLocalBusinessesPost } from "./ai-visibility-audit-local-businesses";
import { howToRespondToAPositiveReviewPost } from "./how-to-respond-to-a-positive-review";
import { howToGetAGoogleReviewLinkPost } from "./how-to-get-a-google-review-link";
import { canYouDeleteAGoogleReviewPost } from "./can-you-delete-a-google-review";
import { hvacHomeServicesReputationManagementPost } from "./hvac-home-services-reputation-management";
import { podiumPricingVsZyeneReviewsPost } from "./podium-pricing-vs-zyene-reviews";
import { whyAreMyGoogleReviewsNotShowingUpPost } from "./why-are-my-google-reviews-not-showing-up";
import { howToAskCustomersForReviewsSmsEmailTemplatesPost } from "./how-to-ask-customers-for-reviews-sms-email-templates";
import { howToGetHvacLeadsFromGoogleMapsPost } from "./how-to-get-hvac-leads-from-google-maps";
import { howToCreateAGoogleReviewQrCodePost } from "./how-to-create-a-google-review-qr-code";
import { howToEmbedGoogleReviewsOnWebsitePost } from "./how-to-embed-google-reviews-on-website";

export const BLOG_POST_SOURCES: BlogPostSource[] = [
    howToGet50GoogleReviewsIn30DaysPost,
    whyGoogleReviewsMatterIn2026Post,
    birdeyePricingBreakdown2026Post,
    birdeyeAlternativesForLocalBusinessesPost,
    howToRespondToA1StarReviewPost,
    aiReplyMistakesToAvoidPost,
    googleBusinessProfileOptimizationChecklistPost,
    howReviewsImpactLocalMapPackRankingPost,
    restaurantOwnersGuideToGoogleReviewsPost,
    dentalPracticeReputationManagement2026Post,
    trueCostOfBadOnlineReputationPost,
    howToHandleFakeGoogleReviewsPost,
    negativeFeedbackShieldPost,
    aiVisibilityAuditLocalBusinessesPost,
    howToRespondToAPositiveReviewPost,
    howToGetAGoogleReviewLinkPost,
    canYouDeleteAGoogleReviewPost,
    hvacHomeServicesReputationManagementPost,
    podiumPricingVsZyeneReviewsPost,
    whyAreMyGoogleReviewsNotShowingUpPost,
    howToAskCustomersForReviewsSmsEmailTemplatesPost,
    howToGetHvacLeadsFromGoogleMapsPost,
    howToCreateAGoogleReviewQrCodePost,
    howToEmbedGoogleReviewsOnWebsitePost,
];
