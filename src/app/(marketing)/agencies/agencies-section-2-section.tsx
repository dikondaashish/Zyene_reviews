import { EyeOff, LayoutTemplate, Palette } from "lucide-react";
import { WHITE_LABEL_FEATURES } from "@/lib/enterprise/agency-pricing-data";

const ICONS = [EyeOff, LayoutTemplate, Palette] as const;

export function AgenciesSection2Section() {
    return (
        <section className="marketing-section" aria-labelledby="agencies-white-label-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">White-label</p>
                    <h2 id="agencies-white-label-heading">White-label branding</h2>
                    <p>
                        Put your agency’s identity first with unbranded review collection flows. Enterprise client accounts also unlock white-label widgets, creating a consistent experience from the first request to the website.
                    </p>
                </div>
                <ul className="mi-cards">
                    {WHITE_LABEL_FEATURES.map((feature, index) => {
                        const Icon = ICONS[index % ICONS.length];
                        return (
                            <li key={feature.title} className="mi-card">
                                <Icon size={20} aria-hidden="true" />
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
