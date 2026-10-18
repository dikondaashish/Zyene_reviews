import { Building, Building2, Gavel, MessageSquare, Star, Store } from "lucide-react";
import { COMPARE_HUB_BUYER_GUIDES } from "./compare-hub-content";

const ICONS = [Store, Building2, Building, Star, MessageSquare, Gavel] as const;

export function CompareHubHowToChooseSection() {
    return (
        <section className="marketing-section" aria-labelledby="compare-how-to-choose-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Buyer guide</p>
                    <h2 id="compare-how-to-choose-heading">How to choose</h2>
                    <p>
                        Match the platform to how you operate - not the logo on the slide deck. Pricing can vary by package,
                        contract terms, and location count; confirm with each vendor before you sign.
                    </p>
                </div>
                <ul className="mi-list">
                    {COMPARE_HUB_BUYER_GUIDES.map((guide, index) => {
                        const Icon = ICONS[index % ICONS.length];
                        return (
                            <li key={guide.title}>
                                <Icon size={18} aria-hidden="true" />
                                <div>
                                    <h3>{guide.title}</h3>
                                    <p>{guide.body}</p>
                                    {guide.pick ? (
                                        <p className="mi-list-pick">
                                            <span className="font-semibold">Often starts with: </span>
                                            {guide.pick}
                                        </p>
                                    ) : null}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
