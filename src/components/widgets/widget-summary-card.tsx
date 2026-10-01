import { Check, Sparkles } from "lucide-react";
import type { PublicWidgetData } from "@/lib/widgets/public-types";
import { WidgetStars } from "@/components/widgets/widget-stars";

export function WidgetSummaryCard({ summary, rating, bubble = false }: { summary: NonNullable<PublicWidgetData["summary"]>; rating: number; bubble?: boolean }) {
    return <article className={`rw-review rw-summary ${bubble ? "rw-bubble-review" : ""}`}>
        {!bubble && <div className="rw-author"><span className="rw-summary-icon"><Sparkles size={22} /></span><div className="rw-author-info">
            <strong>AI-Generated Summary</strong><span className="rw-muted">Based on {summary.reviewCount.toLocaleString()} visible reviews</span>
        </div></div>}
        <div className="rw-review-body"><WidgetStars rating={rating} /><ul>{summary.points.map(point => <li key={point}><Check size={16} /><span>{point}</span></li>)}</ul></div>
        {bubble && <div className="rw-author"><span className="rw-summary-icon"><Sparkles size={22} /></span><div className="rw-author-info"><strong>AI-Generated Summary</strong><span className="rw-muted">Based on {summary.reviewCount.toLocaleString()} visible reviews</span></div></div>}
    </article>;
}
