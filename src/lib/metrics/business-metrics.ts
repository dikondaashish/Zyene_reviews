export type ReviewMetricRow = {
  rating?: number | null;
  response_status?: string | null;
  responded_at?: string | null;
};

export type RequestMetricRow = {
  status?: string | null;
  channel?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  campaign_id?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  clicked_at?: string | null;
  completed_at?: string | null;
  review_left?: boolean | null;
  email_status?: string | null;
  sms_status?: string | null;
};

export type ReviewMetrics = ReturnType<typeof calculateReviewMetrics>;
export type RequestMetrics = ReturnType<typeof calculateRequestMetrics>;

const TERMINAL_REQUEST_STATUSES = new Set([
  "completed",
  "feedback_left",
  "review_left",
]);
const SENT_REQUEST_STATUSES = new Set([
  "sent",
  "delivered",
  "clicked",
  ...TERMINAL_REQUEST_STATUSES,
]);

function percent(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

export function isRespondedReview(review: ReviewMetricRow): boolean {
  return review.response_status === "responded" || Boolean(review.responded_at);
}

export function calculateReviewMetrics(reviews: ReviewMetricRow[]) {
  let ratedReviews = 0;
  let ratingSum = 0;
  let respondedReviews = 0;
  let positiveReviews = 0;
  let neutralReviews = 0;
  let negativeReviews = 0;
  for (const review of reviews) {
    if (isRespondedReview(review)) respondedReviews++;
    const rating = Number(review.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) continue;
    ratedReviews++;
    ratingSum += rating;
    if (rating >= 4) positiveReviews++;
    else if (rating === 3) neutralReviews++;
    else negativeReviews++;
  }

  return {
    totalReviews: reviews.length,
    ratedReviews,
    averageRating: ratedReviews > 0 ? ratingSum / ratedReviews : 0,
    respondedReviews,
    pendingReviews: reviews.length - respondedReviews,
    responseRate: percent(respondedReviews, reviews.length),
    positiveReviews,
    neutralReviews,
    negativeReviews,
    positiveRate: percent(positiveReviews, ratedReviews),
    negativeRate: percent(negativeReviews, ratedReviews),
  };
}

export function isOutboundRequest(request: RequestMetricRow): boolean {
  return Boolean(
    request.customer_phone ||
    request.customer_email ||
    request.customer_name ||
    request.campaign_id,
  );
}

export function isCompletedRequest(request: RequestMetricRow): boolean {
  return Boolean(
    request.completed_at ||
    request.review_left ||
    (request.status && TERMINAL_REQUEST_STATUSES.has(request.status)),
  );
}

export function isClickedRequest(request: RequestMetricRow): boolean {
  return Boolean(
    request.clicked_at ||
    request.status === "clicked" ||
    isCompletedRequest(request),
  );
}

export function isDeliveredRequest(request: RequestMetricRow): boolean {
  return Boolean(
    request.delivered_at ||
    request.status === "delivered" ||
    isClickedRequest(request),
  );
}

export function isSentRequest(request: RequestMetricRow): boolean {
  return Boolean(
    request.sent_at ||
    request.email_status === "sent" ||
    request.sms_status === "sent" ||
    (request.status && SENT_REQUEST_STATUSES.has(request.status)) ||
    isDeliveredRequest(request),
  );
}

function isEmailSent(request: RequestMetricRow): boolean {
  return (
    request.email_status === "sent" ||
    (request.email_status !== "failed" &&
      (request.channel === "email" || request.channel === "both") &&
      isSentRequest(request))
  );
}

function isSmsSent(request: RequestMetricRow): boolean {
  return (
    request.sms_status === "sent" ||
    (request.sms_status !== "failed" &&
      (request.channel === "sms" || request.channel === "both") &&
      isSentRequest(request))
  );
}

export function calculateRequestMetrics(requests: RequestMetricRow[]) {
  const outbound = requests.filter(isOutboundRequest);
  const sent = outbound.filter(isSentRequest);
  const delivered = sent.filter(isDeliveredRequest).length;
  const clicked = sent.filter(isClickedRequest).length;
  const completed = sent.filter(isCompletedRequest).length;
  const totalFailed = outbound.filter(
    (request) =>
      !isSentRequest(request) &&
      (request.email_status === "failed" || request.sms_status === "failed"),
  ).length;

  return {
    totalSent: sent.length,
    delivered,
    clicked,
    completed,
    emailSent: sent.filter(isEmailSent).length,
    smsSent: sent.filter(isSmsSent).length,
    totalFailed,
    deliveryRate: percent(delivered, sent.length),
    clickRate: percent(clicked, sent.length),
    conversionRate: percent(completed, sent.length),
  };
}
