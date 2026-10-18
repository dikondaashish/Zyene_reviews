import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import { ArrowRight } from "lucide-react";

export function CompareCompetitorSwitchingSection({ data }: { data: CompetitorData }) {
    return (
        <section className="marketing-section" aria-labelledby="compare-switching-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Switching</p>
                    <h2 id="compare-switching-heading">Switching from {data.name}</h2>
                    <p>{data.switching.intro}</p>
                    <a
                        href={`mailto:hello@zyenereviews.com?subject=${encodeURIComponent(`Switching from ${data.name}`)}`}
                        className="home-text-link"
                    >
                        Talk to us about migration <ArrowRight size={14} aria-hidden="true" />
                    </a>
                </div>
                <ol className="mi-list">
                    {data.switching.steps.map((step, i) => (
                        <li key={step}>
                            <span className="cmp-step-index" aria-hidden="true">{i + 1}</span>
                            <p className="mi-list-title">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
