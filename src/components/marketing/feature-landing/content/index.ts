import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";
import type { FeatureLandingContent } from "@/components/marketing/feature-landing/types";
import { REVIEW_COLLECTION_CONTENT } from "@/components/marketing/feature-landing/content/review-collection";
import { QR_CODE_REVIEWS_CONTENT } from "@/components/marketing/feature-landing/content/qr-code-reviews";
import { NFC_REVIEW_STANDS_CONTENT } from "@/components/marketing/feature-landing/content/nfc-review-stands";
import { ANALYTICS_CONTENT } from "@/components/marketing/feature-landing/content/analytics";
import { SMART_INSIGHTS_CONTENT } from "@/components/marketing/feature-landing/content/smart-insights";
import { COMPETITOR_TRACKING_CONTENT } from "@/components/marketing/feature-landing/content/competitor-tracking";
import { REVIEW_MONITORING_CONTENT } from "@/components/marketing/feature-landing/content/review-monitoring";
import { AI_REPLIES_CONTENT } from "@/components/marketing/feature-landing/content/ai-replies";
import { AUTOMATIC_REVIEW_REPLIES_CONTENT } from "@/components/marketing/feature-landing/content/automatic-review-replies";
import { REVIEW_REQUESTS_CONTENT } from "@/components/marketing/feature-landing/content/review-requests";
import { REVIEW_CAMPAIGNS_CONTENT } from "@/components/marketing/feature-landing/content/review-campaigns";
import { CUSTOMER_CRM_CONTENT } from "@/components/marketing/feature-landing/content/customer-crm";
import { LOCAL_SEO_CONTENT } from "@/components/marketing/feature-landing/content/local-seo";
import { AI_VISIBILITY_CONTENT } from "@/components/marketing/feature-landing/content/ai-visibility";
import { REVIEW_WIDGETS_CONTENT } from "@/components/marketing/feature-landing/content/review-widgets";
import { MULTI_LOCATION_CONTENT } from "@/components/marketing/feature-landing/content/multi-location";
import { REVIEW_PAGE_CONTENT } from "@/components/marketing/feature-landing/content/review-page";

/** Page body for each /features/[slug]. Every slug in FEATURE_PILLARS must have an entry. */
export const FEATURE_LANDING_CONTENT: Record<FeaturePillarSlug, FeatureLandingContent> = {
  "review-page": REVIEW_PAGE_CONTENT,
  "multi-location": MULTI_LOCATION_CONTENT,
  "review-widgets": REVIEW_WIDGETS_CONTENT,
  "ai-visibility": AI_VISIBILITY_CONTENT,
  "local-seo": LOCAL_SEO_CONTENT,
  "customer-crm": CUSTOMER_CRM_CONTENT,
  "review-campaigns": REVIEW_CAMPAIGNS_CONTENT,
  "review-requests": REVIEW_REQUESTS_CONTENT,
  "automatic-review-replies": AUTOMATIC_REVIEW_REPLIES_CONTENT,
  "ai-replies": AI_REPLIES_CONTENT,
  "review-monitoring": REVIEW_MONITORING_CONTENT,
  "competitor-tracking": COMPETITOR_TRACKING_CONTENT,
  "smart-insights": SMART_INSIGHTS_CONTENT,
  "analytics": ANALYTICS_CONTENT,
  "nfc-review-stands": NFC_REVIEW_STANDS_CONTENT,
  "qr-code-reviews": QR_CODE_REVIEWS_CONTENT,
  "review-collection": REVIEW_COLLECTION_CONTENT,
};
