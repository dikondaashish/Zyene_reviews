import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShareOfVoiceResult } from "@/services/aeo/reporting/share-of-voice";
import { SeoSection } from "./seo-section";

/** F3.2: share of tracked-brand mentions that named us, vs. each configured competitor. */
export function ShareOfVoiceSection({ result }: { result: ShareOfVoiceResult }) {
    return (
        <SeoSection
            id="share-of-voice-title"
            title="Share of voice"
            description="When AI answers mention you or a tracked competitor, how often it is you. Last 30 days."
            actions={
                <Button asChild size="sm" variant="ghost">
                    <Link href="/competitors">Manage competitors</Link>
                </Button>
            }
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
