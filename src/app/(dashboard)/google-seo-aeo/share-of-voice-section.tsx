import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ShareOfVoiceResult } from "@/services/aeo/reporting/share-of-voice";

/** F3.2: share of tracked-brand mentions that named us, vs. each configured competitor. */
export function ShareOfVoiceSection({ result }: { result: ShareOfVoiceResult }) {
    return (
        <section className="overflow-hidden rounded-xl border bg-card" aria-labelledby="share-of-voice-title">
            <header className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
                <h2 id="share-of-voice-title" className="text-lg font-semibold">
                    Share of voice
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Among mentions of your tracked competitor set in the last 30 days.
                </p>
            </header>
            <div className="p-5 sm:p-6">
                {result.suppressed && result.reason === "insufficient_competitors" && (
                    <div className="max-w-2xl space-y-3">
                        <p className="text-sm leading-6 text-muted-foreground">
                            Add at least {result.required} competitors to see a meaningful share of voice - with{" "}
                            {result.competitorCount} configured, the metric would mislead.
                        </p>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/competitors">Manage competitors</Link>
                        </Button>
                    </div>
                )}
                {result.suppressed && result.reason === "insufficient_observations" && (
                    <p className="text-sm text-muted-foreground">
                        Only {result.observations} observation
                        {result.observations === 1 ? "" : "s"} in the last 30 days - need at least {result.required}{" "}
                        before share of voice is reliable.
                    </p>
                )}
                {result.suppressed && result.reason === "no_brands_named" && (
                    <p className="text-sm text-muted-foreground">
                        Across {result.observations} answers, no tracked brand - yours or a competitor&apos;s - was
                        named. That&apos;s an opportunity signal in its own right, not a data gap.
                    </p>
                )}
                {!result.suppressed && (
                    <div className="max-w-3xl space-y-4">
                        {result.noBrandNamedCount > 0 && (
                            <p className="rounded-md bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                                {result.noBrandNamedCount} of {result.observations} answers named no tracked brand at
                                all - excluded from the share below.
                            </p>
                        )}
                        <ul className="divide-y divide-border rounded-lg border">
                            {result.ranking.map((brand) => (
                                <li key={brand.competitorId ?? "own"} className="space-y-2 px-4 py-3">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span
                                            className={
                                                brand.competitorId === null
                                                    ? "font-semibold text-foreground"
                                                    : "text-foreground"
                                            }
                                        >
                                            {brand.competitorId === null ? "You" : brand.label}
                                        </span>
                                        <span className="shrink-0 tabular-nums text-muted-foreground">
                                            {(brand.share * 100).toFixed(0)}% ({brand.mentions})
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={
                                                brand.competitorId === null
                                                    ? "h-full bg-primary"
                                                    : "h-full bg-muted-foreground/40"
                                            }
                                            style={{ width: `${brand.share * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
