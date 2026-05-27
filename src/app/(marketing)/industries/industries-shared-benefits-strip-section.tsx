import { BarChart3, Bot, MapPin, Shield } from "lucide-react";

const BENEFITS = [
    {
        icon: Bot,
        title: "AI Replies",
        desc: "Respond to every review in seconds with one-click AI suggestions.",
    },
    {
        icon: Shield,
        title: "Negative Feedback Shield",
        desc: "Route bad experiences to private resolution before they hit Google.",
    },
    {
        icon: BarChart3,
        title: "Competitor Tracking",
        desc: "See how you compare to nearby competitors in real time.",
    },
    {
        icon: MapPin,
        title: "Local SEO Dashboard",
        desc: "GBP keyword performance data to rank higher on Google Maps.",
    },
] as const;

export function IndustriesSharedBenefitsStripSection() {
    return (
        <section className="py-16 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-10">
                    Every industry gets the same core platform
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
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
