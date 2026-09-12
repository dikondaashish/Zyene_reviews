import { BarChart3, Bot, MessageSquare, Shield } from "lucide-react";

const BENEFITS = [
    {
        icon: MessageSquare,
        title: "Branded review requests",
        desc: "Invite customers by SMS, email, shareable link, or QR code after a visit or completed service.",
    },
    {
        icon: Bot,
        title: "AI drafts & automatic Google replies",
        desc: "Edit a draft yourself, or automatically publish replies to eligible new Google reviews in your chosen tone.",
    },
    {
        icon: Shield,
        title: "Private feedback follow-up",
        desc: "Give someone a private way to share a concern so your team can follow up without taking away their public-review choice.",
    },
    {
        icon: BarChart3,
        title: "Review intelligence",
        desc: "Use request and review trends, local visibility signals, and nearby competitor context to decide what to improve next.",
    },
] as const;

export function IndustriesSharedBenefitsStripSection() {
    return (
        <section className="py-16 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-center text-2xl font-bold text-foreground mb-3">
                    One practical review routine for every local business
                </h2>
                <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto mb-10">
                    Invite feedback fairly, respond with care, follow up on what needs attention, and use the data to keep improving.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                    {BENEFITS.map((item) => (
                        <div key={item.title} className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex justify-center text-primary mb-3">
                                <item.icon size={32} strokeWidth={1.5} aria-hidden />
                            </div>
                            <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
