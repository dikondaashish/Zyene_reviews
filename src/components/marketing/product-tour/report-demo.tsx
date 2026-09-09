"use client";

import { useId, useState } from "react";
import { BarChart3, MessageSquare, Star } from "lucide-react";
import { getDemoReport } from "@/lib/marketing/product-demo";
import type { DemoPlatform } from "@/types/marketing-product-demo";

export function ReportDemo() {
  const id = useId();
  const [days, setDays] = useState<7 | 14>(7);
  const [platform, setPlatform] = useState<DemoPlatform | "all">("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const report = getDemoReport(days, platform);
  const active = report.points.find(point => point.label === selectedDay) ?? report.points[report.points.length - 1];
  const max = Math.max(...report.points.map(point => point.count), 1);
  return (
    <div className="report-demo">
      <div className="tour-page-heading"><div><span className="tour-overline">SEE THE BIGGER PICTURE</span><h3>Reputation overview</h3></div><span className="tour-sample-badge">Fictional August report</span></div>
      <div className="tour-report-controls">
        <div className="tour-segment" aria-label="Sample report date range">{([7, 14] as const).map(value => <button type="button" key={value} aria-pressed={days === value} onClick={() => { setDays(value); setSelectedDay(null); }}>{value} days</button>)}</div>
        <label className="tour-report-platform" htmlFor={id}>Platform<select id={id} value={platform} onChange={event => setPlatform(event.target.value as DemoPlatform | "all")}><option value="all">All platforms</option><option value="google">Google</option><option value="facebook">Facebook</option><option value="yelp">Yelp</option></select></label>
      </div>
      <dl className="tour-report-metrics">
        <div><dt><MessageSquare size={15} aria-hidden="true" />New reviews</dt><dd>{report.total}</dd><span>In the selected sample period</span></div>
        <div><dt><Star size={15} aria-hidden="true" />Average rating</dt><dd>{report.rating.toFixed(1)}<small> / 5</small></dd><span>From these sample reviews</span></div>
        <div><dt><BarChart3 size={15} aria-hidden="true" />Response rate</dt><dd>{report.responseRate}<small>%</small></dd><span>Sample reviews with a reply</span></div>
      </dl>
      <div className="tour-chart">
        <div className="tour-chart-heading"><strong>Review activity</strong><span role="status">{active.label} · <strong>{active.count}</strong> reviews</span></div>
        <div className="tour-bar-chart" aria-label="Sample daily review counts">
          {report.points.map((point, index) => <button type="button" key={point.label} className="tour-chart-column" aria-label={`${point.label}: ${point.count} reviews`} aria-pressed={active.label === point.label} onMouseEnter={() => setSelectedDay(point.label)} onFocus={() => setSelectedDay(point.label)} onClick={() => setSelectedDay(point.label)}>
            <span className="tour-bar-track"><span className="tour-bar" style={{ transform: `scaleY(${point.count / max})` }} /><span className="tour-bar-value">{point.count}</span></span>
            <span className="tour-bar-label">
              {days === 7 || index === days - 1 || (index % 3 === 0 && index < days - 2) ? point.label : ""}
            </span>
          </button>)}
        </div>
        <p className="tour-chart-hint">Hover, tap, or focus a bar to explore each day.</p>
      </div>
      <p className="tour-report-footer">Change the date range or platform to compare this fictional dataset. These are not live business results.</p>
    </div>
  );
}
