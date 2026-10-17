import Link from "next/link";
import { ArrowRight, BarChart3, MessageSquare, Reply, Shield } from "lucide-react";

const BENEFITS = [
    {
        icon: MessageSquare,
        title: "Branded review requests",
        desc: "Invite customers by SMS, email, shareable link or QR code after a visit or a finished job.",
    },
    {
        icon: Reply,
        title: "AI drafts and automatic Google replies",
        desc: "Edit a draft yourself, or let eligible new Google reviews get a reply in the tone you choose.",
    },
    {
        icon: Shield,
        title: "Private feedback follow-up",
        desc: "Give customers a private way to raise a concern without taking away their choice to review publicly.",
    },
    {
        icon: BarChart3,
        title: "Review intelligence",
        desc: "Request and review trends, local visibility and nearby competitors, so you know what to improve next.",
    },
] as const;

export function IndustriesSharedBenefitsStripSection() {
    return (
        <section className="marketing-section" aria-labelledby="industries-routine-heading">
            <div className="marketing-container ind-routine">
                <div>
                    <p className="marketing-eyebrow">Every industry</p>
                    <h2 id="industries-routine-heading">One routine underneath it all.</h2>
                    <p className="home-section-lede">
                        The moment you ask changes by industry. The routine that follows it does not.
                    </p>
                    <Link href="/how-it-works" className="home-text-link ind-routine-link">
                        How it works <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>
                <ul className="ind-steps">
                    {BENEFITS.map((item) => (
                        <li key={item.title}>
                            <item.icon size={18} aria-hidden="true" />
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
