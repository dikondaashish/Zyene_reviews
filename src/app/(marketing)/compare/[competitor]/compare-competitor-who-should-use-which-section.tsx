import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import { Check } from "lucide-react";

export function CompareCompetitorWhoShouldUseWhichSection({ data }: { data: CompetitorData }) {
    const columns = [
        { title: `${data.name} fits better for:`, items: data.whoShouldUseCompetitor },
        { title: "Zyene Reviews fits better for:", items: data.whoShouldUseZyene },
    ];
    return (
        <section className="marketing-section" aria-labelledby="compare-who-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Honest fit</p>
                    <h2 id="compare-who-heading">Who should pick {data.name} instead?</h2>
                    <p>{data.pickCompetitorInstead}</p>
                </div>
                <div className="mi-cards" data-cols="2">
                    {columns.map((column) => (
                        <div key={column.title} className="mi-card">
                            <h3>{column.title}</h3>
                            <ul className="mi-checks">
                                {column.items.map((item) => (
                                    <li key={item}>
                                        <Check size={16} aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
