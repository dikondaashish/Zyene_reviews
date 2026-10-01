"use client";

import { useEffect, useRef, useState } from "react";
import { isBadgeLayout, type WidgetConfig } from "@/lib/widgets/config";
import type { PublicWidgetData } from "@/lib/widgets/public-types";
import { ConfigurableReviewWidget } from "@/components/widgets/configurable-review-widget";

const sample: PublicWidgetData = {
    businessName: "Example business", reviewsUrl: "", hideBranding: true, reviewCount: 345, averageRating: 4.9, googleCount: 345, googleRating: 4.9,
    summary: { reviewCount: 345, points: ["Friendly, helpful service", "Customers value the quality", "A welcoming atmosphere"] },
    reviews: Array.from({ length: 5 }, (_, index) => ({ id: String(index), author_name: "Sample Reviewer", rating: 5, content: index % 2 ? "A wonderful experience. Friendly service and great attention to detail. We look forward to visiting again." : "Friendly service and a wonderful experience. Thank you!", platform: "google", created_at: "2026-09-29T12:00:00Z", photos: index === 1 || index === 2 ? Array.from({ length: 5 }, (_, photo) => `/widget-preview-landscape.svg?scene=${photo}`) : [] })),
};
export function WidgetTemplateThumbnail({ config }: { config: WidgetConfig }) {
    const container = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(.12);
    const width = isBadgeLayout(config.layout) ? 260 : Math.min(1000, config.width);
    useEffect(() => {
        const measure = () => {
            if (!container.current || !canvas.current) return;
            setScale(Math.min((container.current.clientWidth - 12) / width, (container.current.clientHeight - 16) / canvas.current.offsetHeight));
        };
        const observer = new ResizeObserver(measure);
        if (container.current) observer.observe(container.current);
        if (canvas.current) observer.observe(canvas.current);
        measure(); return () => observer.disconnect();
    }, [width]);
    return <div ref={container} className="wb-thumbnail" aria-hidden="true">
        <div ref={canvas} className="wb-thumb-canvas" style={{ width, transform: `translate(-50%, -50%) scale(${scale})` }} inert>
            <ConfigurableReviewWidget data={sample} config={config} creditUrl="" interactive={false} />
        </div>
    </div>;
}
