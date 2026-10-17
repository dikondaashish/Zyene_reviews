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
        <section className={`popular-resources-section w-full py-16 ${className}`} aria-labelledby="popular-resources-heading">
            <div className="marketing-container border-t border-border pt-12">
                <div className="mb-8 max-w-2xl">
                    <h2 id="popular-resources-heading" className="text-2xl font-semibold text-foreground">
                        Guides, tools and comparisons
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Playbooks for getting more reviews, free tools, and honest side-by-sides with other platforms.
                    </p>
                </div>
                <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                    {POPULAR_RESOURCES.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className="group -mx-3 block rounded-lg px-3 py-3 transition-colors hover:bg-card">
                                <span className="flex items-start justify-between gap-3 text-sm font-medium text-foreground">
                                    {item.title}
                                    <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
