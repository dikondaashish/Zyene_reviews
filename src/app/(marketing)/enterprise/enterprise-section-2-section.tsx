import { Building2, Palette, ShieldCheck, Map, LifeBuoy, Webhook } from "lucide-react";
import { ENTERPRISE_VALUE_PROPS } from "@/lib/enterprise/enterprise-data";

const ICONS = [Building2, Palette, ShieldCheck, Map, LifeBuoy, Webhook] as const;

export function EnterpriseSection2Section() {
    return (
        <section className="marketing-section" aria-labelledby="enterprise-scale-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Built for scale</p>
                    <h2 id="enterprise-scale-heading">One standard across every location.</h2>
                </div>
                <ul className="mi-cards">
                    {ENTERPRISE_VALUE_PROPS.map((item, index) => {
                        const Icon = ICONS[index % ICONS.length];
                        return (
                            <li key={item.title} className="mi-card">
                                <Icon size={20} aria-hidden="true" />
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
