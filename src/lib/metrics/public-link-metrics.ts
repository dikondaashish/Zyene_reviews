import {
  isCompletedRequest,
  isOutboundRequest,
  type RequestMetricRow,
} from "@/lib/metrics/business-metrics";

export type PublicLinkMetricRow = RequestMetricRow & {
  rating_given?: number | null;
};

export type PublicLinkMetrics = ReturnType<typeof calculatePublicLinkMetrics>;

const RATED_STATUSES = new Set(["rated_positive", "rated_negative"]);

/**
 * A visit to the business's public review link or QR code. These rows have no customer and
 * no campaign, so they are not requests anyone sent and stay out of the sent funnel.
 */
export function isPublicLinkVisit(request: RequestMetricRow): boolean {
  return !isOutboundRequest(request);
}

export function isRatedVisit(request: PublicLinkMetricRow): boolean {
  return Boolean(
    (request.rating_given !== null && request.rating_given !== undefined) ||
    (request.status && RATED_STATUSES.has(request.status)) ||
    isCompletedRequest(request),
  );
}

function percent(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

/** Visits, then how many rated, finished, and were handed to Google. Every rate uses visits. */
export function calculatePublicLinkMetrics(requests: PublicLinkMetricRow[]) {
  const visits = requests.filter(isPublicLinkVisit);
  const rated = visits.filter(isRatedVisit).length;
  const completed = visits.filter(isCompletedRequest).length;
  const googleHandoff = visits.filter((r) => r.status === "completed").length;
  const privateFeedback = visits.filter((r) => r.status === "feedback_left").length;

  return {
    visits: visits.length,
    rated,
    completed,
    googleHandoff,
    privateFeedback,
    ratedRate: percent(rated, visits.length),
    completionRate: percent(completed, visits.length),
    googleHandoffRate: percent(googleHandoff, visits.length),
  };
}
