import Link from "next/link";
import { ArrowUpRight, Bell, MessageSquare, Send, ChartNoAxesCombined } from "lucide-react";

const WORKFLOWS = [
    { icon: Bell, title: "Every review, in view.", description: "Bring Google, Facebook, and Yelp reviews together. Know what needs your attention without checking three different places.", href: "/features/review-monitoring", label: "Review monitoring" },
    { icon: MessageSquare, title: "A thoughtful reply. In less time.", description: "Draft responses with AI, make them your own, and keep every conversation sounding like your business.", href: "/features/ai-replies", label: "AI review replies" },
    { icon: Send, title: "Make the next review easy.", description: "Invite customers to share their experience with SMS, email, QR codes, and a review link built for your business.", href: "/features/review-collection", label: "Review collection" },
    { icon: ChartNoAxesCombined, title: "Know where you stand.", description: "Follow your ratings, compare local competitors, and give your team a clearer view of progress across locations.", href: "/features/analytics", label: "Reporting and insights" },
];

export function MarketingHomeWorkflow() {
    return (
        <section id="features" className="marketing-section">
            <div className="marketing-container">
                <div className="marketing-section-heading">
                    <h2>A little less review admin.<br />A lot more time for your business.</h2>
                    <p>From the first request to the latest reply, your reputation has a home.</p>
                </div>
                <div className="grid grid-cols-1 gap-x-16 md:grid-cols-2">
                    {WORKFLOWS.map(({ icon: Icon, title, description, href, label }) => (
                        <article key={href} className="border-t border-border py-8">
                            <Icon className="mb-5 size-6 text-primary" aria-hidden="true" />
                            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{title}</h3>
                            <p className="mb-5 max-w-lg text-muted-foreground">{description}</p>
                            <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">{label}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
