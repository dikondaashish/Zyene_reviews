import Link from "next/link";
import { FAQPageJsonLd, type FaqItem } from "@/components/seo/json-ld";

const FAQS: FaqItem[] = [
    {
        question: "What metrics does the Reputation Score Checker display?",
        answer: "This free tool retrieves two public metrics from Google Places for your listing: your cumulative average star rating (out of 5.0) and your total published Google review count.",
    },
    {
        question: "Why does the checker not show response coverage?",
        answer: "Google's public Places API displays ratings and review counts, but does not disclose whether an owner response has been published for each review. Tracking response coverage requires connecting your Google Business Profile to a dedicated review inbox.",
    },
    {
        question: "How can a local business improve its Google reputation score?",
        answer: "The most dependable method is establishing a consistent post-service review request habit. Inviting genuine feedback consistently builds review volume over time, provides current social proof, and cushions your average rating against occasional negative reviews.",
    },
    {
        question: "How many Google reviews should a local business aim for?",
        answer: "Google does not publish a minimum review threshold for local ranking. Benchmark your profile against active competitors in your specific city and category to understand typical review volume in your market.",
    },
    {
        question: "Does a higher star rating guarantee a top Google Local 3-Pack ranking?",
        answer: "No. Google documents three primary local ranking factors: relevance, distance, and prominence. Review count and positive ratings contribute to prominence, but physical proximity to the searcher and category relevance remain equally influential.",
    },
];

export function ReputationScoreCheckerGuide() {
    return (
        <section className="border-t border-border bg-muted/10 py-16 px-4">
            <FAQPageJsonLd faqs={FAQS} />
            <div className="container mx-auto max-w-3xl space-y-12">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">About the Reputation Score Checker</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Reputation Score Checker queries public Google Places data to provide an instant snapshot of your Google Business Profile rating and review volume. It is built for local business owners, multi-location operators, and marketing teams who need a quick, unauthenticated baseline of their public Google reputation before planning local SEO or review generation initiatives.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Public rating and review count are among the first details prospective customers evaluate when searching on Google Maps. Monitoring these metrics helps you assess how your profile appears to local searchers.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">How to check your reputation in 4 steps</h2>
                    <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Enter business details:</strong> Type your business name and city into the search input.
                        </li>
                        <li>
                            <strong className="text-foreground">Select your listing:</strong> Choose your verified Google profile from the autocomplete dropdown list.
                        </li>
                        <li>
                            <strong className="text-foreground">Run the snapshot:</strong> Click &quot;Check reputation&quot; to fetch your current public Google rating and review count.
                        </li>
                        <li>
                            <strong className="text-foreground">Optional email record:</strong> Enter your email address if you want to store a copy of the diagnostic snapshot in your inbox.
                        </li>
                    </ol>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Practical tips and rating buffer example</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Consider a service business with a 4.1 average rating across 20 reviews. Because the total review count is relatively small, receiving two unaddressed 1-star reviews causes a noticeable dip in the average score. In contrast, a business with 150 reviews can absorb occasional negative feedback without sharp rating volatility.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Consistently requesting reviews from genuine customers after service visits builds a protective buffer over time. To track whether you have responded to all recent reviews, use a connected dashboard like Zyene Reviews that monitors incoming feedback across Google and other platforms in real time.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Frequently asked questions</h2>
                    <div className="divide-y divide-border rounded-xl border border-border bg-card">
                        {FAQS.map((faq) => (
                            <div key={faq.question} className="p-5 space-y-2">
                                <h3 className="font-semibold text-foreground text-base">{faq.question}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                    <h2 className="text-lg font-bold text-foreground">Related guides &amp; resources</h2>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href="/resources/local-seo-checklist" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                Local SEO Checklist (40+ Optimization Steps)
                            </Link>
                            <span className="text-muted-foreground"> — Comprehensive Google Business Profile audit and maintenance.</span>
                        </li>
                        <li>
                            <Link href="/blog/how-reviews-impact-local-map-pack-ranking" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                How Google Reviews Impact Local Map Pack Ranking
                            </Link>
                            <span className="text-muted-foreground"> — Analysis of documented local ranking factors and prominence signals.</span>
                        </li>
                        <li>
                            <Link href="/resources/google-reviews-guide" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                Google Reviews: Complete Local Business Guide
                            </Link>
                            <span className="text-muted-foreground"> — Policies, verification rules, and response workflows.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
