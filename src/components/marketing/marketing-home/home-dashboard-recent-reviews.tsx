import { ArrowRight } from "lucide-react";
import { HomeReviewPlatformIcon } from "@/components/marketing/marketing-home/home-review-platform-icon";

const REVIEWS = [
  { platform: "google" as const, quote: "Amazing service! Highly recommend!", time: "2 days ago" },
  { platform: "facebook" as const, quote: "Best coffee shop in town!", time: "4 days ago" },
  { platform: "yelp" as const, quote: "Great atmosphere and friendly staff.", time: "1 week ago" },
];

export function HomeDashboardRecentReviews() {
  return (
    <>
      <div className="hero-reviews-heading">
        <h3>Recent Reviews</h3>
        <a href="#home-product-tour">
          View all <ArrowRight aria-hidden="true" />
        </a>
      </div>
      <div className="hero-dashboard-reviews">
        {REVIEWS.map(({ platform, quote, time }, index) => (
          <div
            key={platform}
            className="hero-review-row hero-enter"
            style={{ animationDelay: `${1050 + index * 80}ms` }}
          >
            <HomeReviewPlatformIcon platform={platform} />
            <div>
              <span className="hero-rating" aria-label="5 out of 5 stars">
                ★★★★★
              </span>
              <p>“{quote}”</p>
            </div>
            <span className="hero-review-time">{time}</span>
          </div>
        ))}
      </div>
    </>
  );
}
