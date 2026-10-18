import Link from "next/link";
import { ArrowRight, Inbox, MessageSquareReply, Send, ShieldCheck } from "lucide-react";
import { SMALL_BUSINESS_FEATURES } from "@/lib/marketing/small-business-content";

const ICONS = [Inbox, MessageSquareReply, Send, ShieldCheck] as const;

export function SmallBusinessFeaturesSection() {
    return (
        <section className="marketing-section" aria-labelledby="small-business-features-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">What you get</p>
                    <h2 id="small-business-features-heading">Everything a small business needs to manage reviews</h2>
                    <p>One plan covers monitoring, replies and review requests for a single location, without add-ons or a sales call.</p>
                </div>
                <ul className="mi-cards" data-cols="2">
                    {SMALL_BUSINESS_FEATURES.map((feature, index) => {
                        const Icon = ICONS[index % ICONS.length];
                        return (
                            <li key={feature.title} className="mi-card">
                                <Icon size={20} aria-hidden="true" />
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                                <Link href={feature.href} className="home-text-link">
                                    {feature.linkLabel} <ArrowRight size={14} aria-hidden="true" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
