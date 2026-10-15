import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const POPULAR_RESOURCES = [
    {
        href: "/compare/birdeye",
        title: "Birdeye Comparison & Alternatives",
        description: "Compare Zyene Reviews with Birdeye features and pricing.",
    },
    {
        href: "/compare/nicejob",
        title: "NiceJob Comparison & Alternatives",
        description: "See how Zyene Reviews compares with NiceJob for local businesses.",
    },
    {
        href: "/compare/prosperly",
        title: "Prosperly Comparison & Alternatives",
        description: "Detailed breakdown of Zyene Reviews versus Prosperly.",
    },
    {
        href: "/industries/home-services",
        title: "Home Services Review Management",
        description: "Reputation tools for contractors, HVAC, plumbers, and electricians.",
    },
    {
        href: "/industries",
        title: "All Industry Reputation Solutions",
        description: "Explore tailored review workflows for every local business sector.",
    },
    {
        href: "/features/ai-replies",
        title: "AI Review Replies & Google Automation",
        description: "Automate and draft thoughtful Google review responses with AI.",
    },
    {
        href: "/features/review-collection",
        title: "Automated Review Collection & Invites",
        description: "Send multi-channel SMS, email, and QR review requests to customers.",
    },
    {
        href: "/tools/review-response-generator",
        title: "Free Review Response Generator",
        description: "Instant AI tool to generate professional responses to any customer review.",
    },
    {
        href: "/resources/review-request-templates",
        title: "Review Request SMS & Email Templates",
        description: "High-converting templates to ask customers for reviews politely.",
    },
    {
        href: "/resources/negative-review-templates",
        title: "Negative Review Response Templates",
        description: "De-escalate unhappy customers and protect your public rating.",
    },
    {
        href: "/blog/birdeye-pricing-breakdown-2026",
        title: "Birdeye Pricing Breakdown (2026)",
        description: "Birdeye pricing tiers, contract terms and alternatives.",
    },
    {
        href: "/blog/how-to-get-50-google-reviews-in-30-days",
        title: "How to Get 50 Google Reviews in 30 Days",
        description: "A practical step-by-step playbook to rapidly increase local Google reviews.",
    },
    {
        href: "/resources/google-reviews-guide",
        title: "Google Reviews: The Complete Local Business Guide",
        description: "A comprehensive guide to generating, managing, and leveraging Google reviews for local growth.",
    },
    {
        href: "/blog/how-to-handle-fake-google-reviews",
        title: "How to Handle Fake Google Reviews",
        description: "How to identify, flag, and remove illegitimate reviews while protecting your rating.",
    },
    {
        href: "/blog/dental-practice-reputation-management-2026",
        title: "Dental Practice Reputation Management Guide",
        description: "Proven review generation and patient feedback strategies for dental clinics.",
    },
] as const;

export function PopularResourcesBlock({ className = "" }: { className?: string }) {
    return (
        <section
            className={`popular-resources-section w-full border-t border-border/60 py-16 ${className}`}
            aria-labelledby="popular-resources-heading"
        >
            <div className="marketing-container">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Discover</p>
                    <h2
                        id="popular-resources-heading"
                        className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                    >
                        Popular resources
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Explore comparison guides, industry solutions, automated features, free tools, and proven reputation playbooks.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {POPULAR_RESOURCES.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-sm"
                        >
                            <div>
                                <h3 className="flex items-center justify-between text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                                    <span>{item.title}</span>
                                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
