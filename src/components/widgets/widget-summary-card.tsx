import { Check, MessageSquareQuote } from "lucide-react";
import type { PublicWidgetData } from "@/lib/widgets/public-types";
import { WidgetStars } from "@/components/widgets/widget-stars";

export function WidgetSummaryCard({ summary, rating, bubble = false }: { summary: NonNullable<PublicWidgetData["summary"]>; rating: number; bubble?: boolean }) {
    return <article className={`rw-review rw-summary ${bubble ? "rw-bubble-review" : ""}`}>
        {!bubble && <div className="rw-author"><span className="rw-summary-icon"><MessageSquareQuote size={20} aria-hidden="true" /></span><div className="rw-author-info">
            <strong>What customers mention</strong><span className="rw-muted">AI summary of {summary.reviewCount.toLocaleString()} visible reviews</span>
        </div></div>}
        <div className="rw-review-body"><WidgetStars rating={rating} /><ul>{summary.points.map(point => <li key={point}><Check size={16} /><span>{point}</span></li>)}</ul></div>
        {bubble && <div className="rw-author"><span className="rw-summary-icon"><MessageSquareQuote size={20} aria-hidden="true" /></span><div className="rw-author-info"><strong>What customers mention</strong><span className="rw-muted">AI summary of {summary.reviewCount.toLocaleString()} visible reviews</span></div></div>}
    </article>;
}
