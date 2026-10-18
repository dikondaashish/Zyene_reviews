import { MessageSquareReply, Send, ShieldCheck } from "lucide-react";
import type { CaseStudy } from "@/lib/social-proof/case-study-data";

const MEASURES = [
    { icon: Send, label: "Requests sent, delivered, and completed" },
    { icon: MessageSquareReply, label: "Reviews with a published business reply" },
    { icon: ShieldCheck, label: "Recent feedback themes and resolved concerns" },
];

export function CaseStudiesSlugResultsSection({ study }: { study: CaseStudy }) {
    return (
        <section id="results" className="marketing-section scroll-mt-24" aria-labelledby="case-study-results-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Check your own results</p>
                    <h2 id="case-study-results-heading">Measure the routine, then improve it</h2>
                    <p>For your {study.industry.toLowerCase()} business, compare the same date range before and after changing the workflow. These are measures to track, not promised results.</p>
                </div>
                <ul className="mi-cards">
                    {MEASURES.map(({ icon: Icon, label }) => (
                        <li key={label} className="mi-card">
                            <Icon size={20} aria-hidden="true" />
                            <h3>{label}</h3>
                        </li>
                    ))}
                </ul>
                <p className="mi-table-note">Request completion includes private feedback or a Google handoff. A click does not confirm that Google published a review.</p>
            </div>
        </section>
    );
}
