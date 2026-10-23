import { cn } from "@/lib/utils";
import type { ShareOfVoiceResult } from "@/services/aeo/reporting/share-of-voice";
import { SeoSection } from "./seo-section";

/** Headline an owner can repeat in a meeting: where you place, and who leads if not you. */
function placementSentence(ranking: { competitorId: string | null; label: string; mentions: number }[]): string {
    const place = ranking.findIndex((brand) => brand.competitorId === null) + 1;
    const own = ranking[place - 1];
    if (place > 1 && own && ranking[0].mentions === own.mentions) return `You're tied for most mentions with ${ranking[0].label}.`;
    if (place === 1 && ranking.length === 1) return "You are the only tracked business AI assistants named.";
    if (place === 1) return `You are mentioned most often, ahead of ${ranking.length - 1} competitor${ranking.length === 2 ? "" : "s"}.`;
    if (place === 0) return `You were not named. ${ranking[0]?.label ?? "A competitor"} leads.`;
    return `You place #${place} of ${ranking.length}. ${ranking[0]?.label} is mentioned most often.`;
}

/** F3.2: share of tracked-brand mentions that named us, vs. each configured competitor. */
export function ShareOfVoiceSection({ result }: { result: ShareOfVoiceResult }) {
    return (
        <SeoSection
            id="share-of-voice-title"
            title="You vs. competitors in AI answers"
            description="Out of every AI answer that named you or a competitor you track, the share that named you. Last 30 days."
            bodyClassName="p-5 sm:p-6"
        >
            {result.suppressed && result.reason === "insufficient_competitors" && (
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Add at least {result.required} competitors to see a fair comparison. With{" "}
                    {result.competitorCount} configured, the number would be misleading.
                </p>
            )}
            {result.suppressed && result.reason === "insufficient_observations" && (
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Only {result.observations} answer{result.observations === 1 ? "" : "s"} collected so far. We need
                    at least {result.required} before share of voice is reliable.
                </p>
            )}
            {result.suppressed && result.reason === "no_brands_named" && (
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Across {result.observations} answers, no tracked brand was named, yours or a competitor&apos;s.
                    That is an open opportunity, not a data gap.
                </p>
            )}
            {!result.suppressed && (
                <div className="max-w-3xl space-y-4">
                    <p className="text-sm font-medium text-foreground">{placementSentence(result.ranking)}</p>
                    <ul className="space-y-4">
                        {result.ranking.map((brand) => {
                            const isYou = brand.competitorId === null;
                            return (
                                <li key={brand.competitorId ?? "own"} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span
                                            className={cn(
                                                "truncate",
                                                isYou ? "font-semibold text-foreground" : "text-foreground",
                                            )}
                                        >
                                            {isYou ? "You" : brand.label}
                                        </span>
                                        <span className="shrink-0 tabular-nums text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {(brand.share * 100).toFixed(0)}%
                                            </span>{" "}
                                            · {brand.mentions} mention{brand.mentions === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                "h-full rounded-full",
                                                isYou ? "bg-primary" : "bg-muted-foreground/40",
                                            )}
                                            style={{ width: `${brand.share * 100}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {result.noBrandNamedCount > 0 && (
                        <p className="text-xs leading-5 text-muted-foreground">
                            {result.noBrandNamedCount} of {result.observations} answers named no tracked brand and are
                            left out of the shares above.
                        </p>
                    )}
                </div>
            )}
        </SeoSection>
    );
}
