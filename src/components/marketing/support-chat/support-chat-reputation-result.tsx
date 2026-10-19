import { Star } from "lucide-react";

import type { ReputationCheckResult, ReputationPlace } from "@/lib/support-chat/tools/reputation-check";

function Row({ place, max, you }: { place: ReputationPlace; max: number; you?: boolean }) {
    const width = max > 0 ? Math.max(4, Math.round((place.reviews / max) * 100)) : 4;
    return (
        <li className={`support-chat-rep-row${you ? " support-chat-rep-row--you" : ""}`}>
            <div className="support-chat-rep-row__head">
                <span className="support-chat-rep-row__name">{you ? "You" : place.name}</span>
                <span className="support-chat-rep-row__stat">
                    {place.rating !== null ? (
                        <>
                            <Star size={11} aria-hidden="true" />
                            {place.rating}
                        </>
                    ) : "No rating"}
                    {" · "}
                    {place.reviews.toLocaleString("en-US")} reviews
                </span>
            </div>
            <span className="support-chat-rep-row__bar" style={{ width: `${width}%` }} aria-hidden="true" />
        </li>
    );
}

/** Visitor's Google numbers next to the most-reviewed nearby competitors. */
export function SupportChatReputationResult({ result }: { result: ReputationCheckResult }) {
    const max = Math.max(result.business.reviews, ...result.competitors.map((c) => c.reviews));
    return (
        <div className="support-chat-card" aria-label={`Google rating for ${result.business.name}`}>
            <p className="support-chat-card__title">{result.business.name}</p>
            {result.category ? <p className="support-chat-card__hint">{result.category} · nearby comparison</p> : null}
            <ul className="support-chat-rep">
                <Row place={result.business} max={max} you />
                {result.competitors.map((c) => <Row key={c.name} place={c} max={max} />)}
            </ul>
            {result.competitors.length === 0 ? (
                <p className="support-chat-card__hint">No nearby businesses in the same category to compare yet.</p>
            ) : null}
        </div>
    );
}
