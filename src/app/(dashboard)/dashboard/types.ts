import type { ReactElement } from "react";
import type { User } from "@supabase/supabase-js";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { GooglePerformanceTotals } from "@/services/google/performance-queries";
import type {
  BusinessContextBusiness,
  BusinessContextOrganization,
} from "@/types/business-context";

export interface RawReviewRow {
  id: string | number;
  author_name?: string | null;
  author_avatar_url?: string | null;
  rating: number | string;
  urgency_score?: number | null;
  review_date?: string | null;
  created_at?: string | null;
  text?: string | null;
  themes?: string[] | null;
  platform?: string | null;
  response_status?: string | null;
  sentiment?: string | null;
}

export interface ReviewPlatformRow {
  platform: string;
  last_synced_at?: string | null;
  google_qa_unavailable?: boolean | null;
  google_lodging_health_score?: number | null;
  google_lodging_available?: boolean | null;
  google_performance_synced_at?: string | null;
  google_profile_health_score?: number | null;
}

export interface BusinessExtended {
  id: string;
  name: string;
  slug: string;
  status?: string;
  total_reviews: number;
  average_rating: number;
  review_request_frequency_cap_days?: number;
  category?: string;
  logo_url?: string | null;
  brand_color?: string | null;
  review_page_background_color?: string | null;
  review_platforms?: ReviewPlatformRow[];
}

export interface DashboardCachedStats {
  responseRate: number;
  pendingCount: number;
  recentReviews: RawReviewRow[];
  attentionReviews: RawReviewRow[];
  trendData: Array<{ day: string; count: number }>;
  ratingData: Array<{ rating: number; count: number }>;
  totalReviewsTrend: number;
  averageRatingTrend: number;
  positivePercent: number;
  negativePercent: number;
  hasSentimentData: boolean;
  engagementRate: number;
  hasEngagementData: boolean;
  requestsThisMonth: number;
  newReviews30d: number;
}

export interface DashboardViewProps {
  canConfigureNotifications?: boolean;
  user: User;
  dict: Dictionary;
  business: BusinessExtended;
  organization: BusinessContextOrganization | null;
  useDemoData: boolean;
  isGoogleConnected: boolean;
  customerCount: number;
  notificationsConfigured: boolean;
  requestsThisMonth: number;
  displayTotalReviews: number;
  displayAverageRating: number;
  responseRate: number;
  pendingCount: number;
  totalReviewsTrend: number;
  averageRatingTrend: number;
  responseRateLabel: string;
  showUnansweredQaCard: boolean;
  unansweredQaCount: number;
  brokenPlaceLinksCount: number;
  googleProfileHealthScore: number | null;
  showLodgingCard: boolean;
  googleLodgingHealthScore: number | null;
  googleLodgingApplicable: boolean | null;
  googleHealthMetricsGridClass: string;
  googlePerf: GooglePerformanceTotals | null;
  positivePercent: number;
  negativePercent: number;
  hasSentimentData: boolean;
  engagementRate: number;
  hasEngagementData: boolean;
  maxRequestsPerMonth: number;
  isPaidPlan: boolean;
  newReviews30d: number;
  trendData: Array<{ day: string; count: number }>;
  ratingData: Array<{ rating: number; count: number }>;
  recentReviews: RawReviewRow[];
  attentionReviews: RawReviewRow[];
  planAllowsAiReplies: boolean;
}

export type LoadDashboardPageDataResult =
  | { errorElement: ReactElement }
  | { data: DashboardViewProps };

export type { BusinessContextBusiness, BusinessContextOrganization };
