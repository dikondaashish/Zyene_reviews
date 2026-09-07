"use client";

import { ReviewTrendChart } from "@/components/dashboard/review-trend-chart";
import { EXAMPLE_TREND } from "@/components/marketing/product-tour/sample-data";

export function ReportDemo() {
  return (
    <div className="report-demo">
      <div className="tour-page-heading">
        <div>
          <span className="tour-overline">SEE THE BIGGER PICTURE</span>
          <h2>Small moments. Visible progress.</h2>
        </div>
        <span className="tour-live-label">Sample data</span>
      </div>
      <p>Follow review activity and understand how your reputation changes over time.</p>
      <div className="tour-chart">
        <div>
          <strong>New reviews</strong>
          <span>Example week</span>
        </div>
        <ReviewTrendChart data={EXAMPLE_TREND} />
      </div>
      <div className="tour-report-footer">
        <span>Google, Facebook & Yelp</span>
        <span>One clear view of your reputation</span>
      </div>
    </div>
  );
}
