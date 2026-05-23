import type { CompetitorData } from "@/lib/phase3/competitor-data";
import Link from "next/link";
import { COMPETITOR_MAP, COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";

export function CompareCompetitorOtherComparisonsSection({ data, slug }: { data: CompetitorData; slug: string }) {
    return (
        <section className="py-12 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <p className="text-sm font-semibold text-muted-foreground text-center mb-6">Other comparisons</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {COMPETITOR_SLUGS.filter((s) => s !== slug).map((s) => {
                            const comp = COMPETITOR_MAP[s];
                            return (
                                <Link
                                    key={s}
                                    href={`/compare/${s}`}
                                    className="text-sm font-medium text-muted-foreground hover:text-primary border border-border rounded-lg px-4 py-2 hover:border-primary/50 transition-all bg-card"
                                >
                                    Zyene vs {comp.name} →
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
    );
}
