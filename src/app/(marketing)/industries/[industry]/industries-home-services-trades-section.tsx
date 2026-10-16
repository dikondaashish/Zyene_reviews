import Link from "next/link";
import { ArrowRight, Flame, Wrench, Zap } from "lucide-react";

const TRADES = [
    {
        title: "HVAC Companies",
        href: "/industries/hvac",
        anchorText: "Review & reputation management for HVAC companies",
        description:
            "Automate seasonal review requests, handle pricing disputes privately, and capture emergency heating and cooling leads on Google Maps.",
        icon: Flame,
    },
    {
        title: "Plumbing Companies",
        href: "/industries/plumbing",
        anchorText: "Review & reputation management for plumbing contractors",
        description:
            "Turn completed repairs into steady 5-star Google reviews, respond with AI in your shop's voice, and keep billing surprises off public pages.",
        icon: Wrench,
    },
    {
        title: "Electricians",
        href: "/industries/electricians",
        anchorText: "Review & reputation management for electricians",
        description:
            "Trigger review requests after panel upgrades and rewires, resolve complaints privately, and outrank competing electrical contractors.",
        icon: Zap,
    },
];

export function IndustriesHomeServicesTradesSection() {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-12">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Specialized Solutions</p>
                    <h2 className="text-[length:var(--fs-h2)] font-semibold text-foreground tracking-tight">Home services by trade</h2>
                    <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                        Explore dedicated reputation management workflows built for the specific operational demands of your trade.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {TRADES.map((trade) => {
                        const Icon = trade.icon;
                        return (
                            <div
                                key={trade.href}
                                className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-sm"
                            >
                                <div>
                                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                        <Icon className="size-5" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{trade.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{trade.description}</p>
                                </div>
                                <Link
                                    href={trade.href}
                                    className="inline-flex items-center text-sm font-semibold text-primary hover:underline group mt-auto"
                                >
                                    <span>{trade.anchorText}</span>
                                    <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
