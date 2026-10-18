import type { ReactNode } from "react";
import { AutoRepliesEligibilityVisual } from "@/components/marketing/feature-landing/visuals/automatic-review-replies-visuals";
import { CompetitorHeroVisual } from "@/components/marketing/feature-landing/visuals/competitor-tracking-visuals";
import { ReviewCollectionTriggersVisual } from "@/components/marketing/feature-landing/visuals/review-collection-visuals";
import { MonitoringHeroVisual } from "@/components/marketing/feature-landing/visuals/review-monitoring-visuals";
import { RequestsHeroVisual } from "@/components/marketing/feature-landing/visuals/review-requests-visuals";
import type { CompetitorData, CompetitorVisualKey } from "@/lib/comparisons/competitor-data";

/** Real Zyene product mocks, reused from the feature pages. */
const VISUALS: Record<CompetitorVisualKey, () => ReactNode> = {
    "auto-reply-rules": () => <AutoRepliesEligibilityVisual />,
    "sms-request": () => <RequestsHeroVisual />,
    "request-triggers": () => <ReviewCollectionTriggersVisual />,
    "competitor-board": () => <CompetitorHeroVisual />,
    "review-inbox": () => <MonitoringHeroVisual />,
};

export function CompareCompetitorVisualSection({ data }: { data: CompetitorData }) {
    const { key, title, caption } = data.visual;
    return (
        <section className="marketing-section" aria-labelledby="compare-visual-heading">
            <div className="marketing-container mi-split cmp-visual-grid">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Inside Zyene Reviews</p>
                    <h2 id="compare-visual-heading">{title}</h2>
                    <p>{caption}</p>
                    <p className="cmp-visual-note">Product screen with a fictional business.</p>
                </div>
                <figure className="mi-visual" aria-label={title}>
                    {VISUALS[key]()}
                </figure>
            </div>
        </section>
    );
}
