import type { Review, ReviewCardTone } from "@/components/reviews/review-card-types";

export const EXAMPLE_REVIEW: Review = {
    id: "demo-marketing-review", business_id: "demo-marketing-business",
    author_name: "Jordan M.", rating: 5, platform: "google", response_status: "pending",
    content: "The team made us feel so welcome. Great coffee, a lovely space, and the kind of service that makes you want to come back.",
};

export const EXAMPLE_REPLIES: Record<ReviewCardTone, string> = {
    friendly: "Jordan, this made our day! We’re so glad you enjoyed the coffee and felt right at home. Can’t wait to welcome you back.",
    professional: "Thank you for your thoughtful review, Jordan. We’re delighted that you enjoyed the coffee, atmosphere, and service. We look forward to welcoming you again.",
    concise: "Thanks, Jordan! We’re glad you enjoyed your visit. Hope to see you again soon.",
};

export const EXAMPLE_TREND = [
    { day: "2026-08-03T12:00:00", count: 3 }, { day: "2026-08-04T12:00:00", count: 5 }, { day: "2026-08-05T12:00:00", count: 4 },
    { day: "2026-08-06T12:00:00", count: 7 }, { day: "2026-08-07T12:00:00", count: 6 }, { day: "2026-08-08T12:00:00", count: 10 }, { day: "2026-08-09T12:00:00", count: 8 },
];
