import { Link2, Send, UserPlus } from "lucide-react";
import { SMALL_BUSINESS_SETUP_STEPS } from "@/lib/marketing/small-business-content";

const ICONS = [UserPlus, Link2, Send] as const;

export function SmallBusinessSetupSection() {
    return (
        <section className="marketing-section" aria-labelledby="small-business-setup-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Setup</p>
                    <h2 id="small-business-setup-heading">Up and running the same day</h2>
                </div>
                <ol className="mi-list">
                    {SMALL_BUSINESS_SETUP_STEPS.map((step, index) => {
                        const Icon = ICONS[index % ICONS.length];
                        return (
                            <li key={step.title}>
                                <Icon size={18} aria-hidden="true" />
                                <div>
                                    <h3><span className="sr-only">Step {index + 1}: </span>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
