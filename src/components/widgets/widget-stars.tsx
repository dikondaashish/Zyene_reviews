import { Star } from "lucide-react";

export function WidgetStars({ rating }: { rating: number }) {
    const safe = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
    return <span className="rw-stars" role="img" aria-label={`${safe.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => <span className="rw-star" key={i} aria-hidden="true">
            <Star className="rw-star-empty" />
            <span style={{ width: `${Math.max(0, Math.min(1, safe - i)) * 100}%` }}><Star /></span>
        </span>)}
    </span>;
}
