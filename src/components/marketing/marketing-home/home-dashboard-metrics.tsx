import { Star } from "lucide-react";

const METRICS = [
  { value: "4.8", label: "Average Rating", change: "+12%", star: true },
  { value: "248", label: "Total Reviews", change: "+28%" },
  { value: "92%", label: "Response Rate", change: "+18%" },
];
export function HomeDashboardMetrics() {
  return (
    <div className="hero-dashboard-metrics">
      {METRICS.map(({ value, label, change, star }, index) => (
        <div key={label} className="hero-enter" style={{ animationDelay: `${850 + index * 80}ms` }}>
          <strong>
            {value}
            {star && <Star aria-hidden="true" />}
          </strong>
          <span>{label}</span>
          <small>↑ {change}</small>
        </div>
      ))}
    </div>
  );
}
