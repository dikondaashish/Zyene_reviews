import Link from "next/link";
import { FAQPageJsonLd, type FaqItem } from "@/components/seo/json-ld";
import { MarketingFaqSection } from "@/components/marketing/marketing-faq-section";

export const TOOLS_HUB_FAQS: FaqItem[] = [
    {
        question: "Are these review tools really free to use?",
        answer: "Yes. You can generate a Google review link, check your public reputation score, and draft response templates on this page without creating an account or entering a credit card.",
    },
    {
        question: "What is the difference between free review generation tools and paid software?",
        answer: "Free tools handle one-off tasks manually—like looking up your link or copying a reply template. Paid review generation and reputation software (such as Zyene Reviews Starter at $29.99/month as of November 2026) automates SMS/email requests, syncs your Google reviews into one inbox, and prepares AI reply drafts for your team to review before posting.",
    },
    {
        question: "Do I need a separate tool for email and SMS review request scripts?",
        answer: "No. Pair our free Google Review Link Generator with our free Review Request Templates (/resources/review-request-templates) for ready-to-copy SMS, email, and industry scripts.",
    },
    {
        question: "Can I use these tools for multiple business locations?",
        answer: "Yes. You can look up a separate Google review link and check public ratings for each location individually, or manage multiple locations from one workspace on a paid Zyene Reviews plan.",
    },
];

export function ToolsHubSections() {
    return (
        <>
            <FAQPageJsonLd faqs={TOOLS_HUB_FAQS} />

            <section className="marketing-section mi-section-tight" aria-labelledby="tools-workflow-heading">
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">Workflow</p>
                        <h2 id="tools-workflow-heading">How to use these three tools together</h2>
                    </div>
                    <ol className="mi-list">
                        <li>
                            <div>
                                <h3>1. Benchmark your current profile</h3>
                                <p>
                                    Start with the{" "}
                                    <Link href="/tools/reputation-score-checker" className="mi-inline-link">Reputation Score Checker</Link>{" "}
                                    to see your public Google star rating and total review count.
                                </p>
                            </div>
                        </li>
                        <li>
                            <div>
                                <h3>2. Create your direct customer link</h3>
                                <p>
                                    Use the{" "}
                                    <Link href="/tools/review-link-generator" className="mi-inline-link">Google Review Link Generator</Link>{" "}
                                    to get a direct link customers can tap without searching Maps.
                                </p>
                            </div>
                        </li>
                        <li>
                            <div>
                                <h3>3. Reply to incoming feedback</h3>
                                <p>
                                    Use the{" "}
                                    <Link href="/tools/review-response-generator" className="mi-inline-link">Review Response Generator</Link>{" "}
                                    to pick a 1-to-5 star starting template, personalize it, and review your draft before posting.
                                </p>
                            </div>
                        </li>
                    </ol>
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby="tools-rgt-heading">
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">Review generation tools</p>
                        <h2 id="tools-rgt-heading">What review generation tools cover</h2>
                    </div>
                    <div className="mk-prose">
                        <p>
                            Review generation tools help local businesses ask customers for honest feedback consistently and respond without starting from scratch. If you are sending requests manually, pair your generated link with our{" "}
                            <Link href="/resources/review-request-templates" className="mi-inline-link">20+ review request templates</Link>{" "}
                            (SMS, email, and industry scripts).
                        </p>
                        <p>
                            If you are evaluating full platforms for automated outreach and reply workflows, see our{" "}
                            <Link href="/blog/best-review-response-generator-tools" className="mi-inline-link">best AI review response software comparison</Link>{" "}
                            or compare platforms side by side on{" "}
                            <Link href="/compare" className="mi-inline-link">Zyene Reviews comparisons</Link>.
                        </p>
                    </div>
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby="tools-free-vs-paid-heading">
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">Free vs. paid</p>
                        <h2 id="tools-free-vs-paid-heading">Free utilities vs. Zyene Reviews paid plans</h2>
                    </div>
                    <div className="mk-prose">
                        <p>
                            The free utilities on this hub are built for quick, one-off tasks with no signup required. When manual copy-paste stops scaling, Zyene Reviews paid plans (Starter from $29.99/month as of November 2026; 7-day trial, card required) add automated SMS, email, and QR campaigns, a unified review inbox, AI-assisted reply drafts (reviewed before posting), and optional private feedback routing.
                        </p>
                    </div>
                </div>
            </section>

            <MarketingFaqSection faqs={TOOLS_HUB_FAQS} headingId="tools-faq-heading" title="Free tools questions" />
        </>
    );
}

