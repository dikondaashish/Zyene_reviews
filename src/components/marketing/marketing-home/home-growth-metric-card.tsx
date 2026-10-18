import { MessageSquareText } from "lucide-react";

/** A product event from the example scene, not an outcome claim. */
export function HomeGrowthMetricCard() {
  return (
    <div className="hero-growth-enter">
      <div className="hero-growth-card">
        <span className="hero-growth-icon" aria-hidden="true">
          <MessageSquareText />
        </span>
        <div>
          <strong>Review request sent</strong>
          <span>Text to Jordan</span>
          <small>Just now</small>
        </div>
      </div>
    </div>
  );
}
