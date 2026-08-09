import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ShareOfVoiceResult } from "@/services/aeo/reporting/share-of-voice";

/** F3.2: share of tracked-brand mentions that named us, vs. each configured competitor. */
export function ShareOfVoiceSection({ result }: { result: ShareOfVoiceResult }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Share of voice</CardTitle>
                <CardDescription>
                    Among mentions of your tracked competitor set, last 30 days.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {result.suppressed && result.reason === "insufficient_competitors" && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Add at least {result.required} competitors to see a meaningful share of
                            voice — with {result.competitorCount} configured, the metric would mislead.
                        </p>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/competitors">Manage competitors</Link>
                        </Button>
                    </div>
                )}
                {result.suppressed && result.reason === "insufficient_observations" && (
                    <p className="text-sm text-muted-foreground">
                        Only {result.observations} observation{result.observations === 1 ? "" : "s"} in
                        the last 30 days — need at least {result.required} before share of voice is
                        reliable.
                    </p>
                )}
                {result.suppressed && result.reason === "no_brands_named" && (
                    <p className="text-sm text-muted-foreground">
                        Across {result.observations} answers, no tracked brand — yours or a
                        competitor&apos;s — was named. That&apos;s an opportunity signal in its own
                        right, not a data gap.
                    </p>
                )}
                {!result.suppressed && (
                    <div className="space-y-3">
                        {result.noBrandNamedCount > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {result.noBrandNamedCount} of {result.observations} answers named no
                                tracked brand at all — excluded from the share below.
                            </p>
                        )}
                        <ul className="space-y-2">
                            {result.ranking.map((brand) => (
                                <li key={brand.competitorId ?? "own"} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className={brand.competitorId === null ? "font-semibold" : ""}>
                                            {brand.competitorId === null ? "You" : brand.label}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {(brand.share * 100).toFixed(0)}% ({brand.mentions})
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={
                                                brand.competitorId === null ? "h-full bg-primary" : "h-full bg-muted-foreground/40"
                                            }
                                            style={{ width: `${brand.share * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
