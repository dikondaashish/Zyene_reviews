import Link from "next/link";
import { FAQPageJsonLd, type FaqItem } from "@/components/seo/json-ld";

const FAQS: FaqItem[] = [
    {
        question: "How long should a Google review response be?",
        answer: "Aim for 3 to 5 sentences or roughly 50 to 150 words. Concise responses communicate professionalism and accountability; overly long responses often look defensive or combative to prospective buyers reading the thread.",
    },
    {
        question: "Should a business reply to every customer review?",
        answer: "Yes. Replying to positive reviews reinforces customer loyalty, while responding calmly to negative or mixed reviews demonstrates to prospective customers reading the thread that your business is attentive and takes feedback seriously.",
    },
    {
        question: "How should I respond to a suspected fake or malicious review?",
        answer: "Post a calm, neutral response stating that you have no record of the customer or transaction, provide an official email for direct contact, and report the review to Google through your Google Business Profile account for policy review.",
    },
    {
        question: "Does this free tool analyze the text of my review using AI?",
        answer: "This free tool selects a curated, template-based structure matched to your chosen star rating; it does not analyze review sentiment or text meaning. Zyene Reviews' paid platform provides contextual AI drafts and automated reply workflows.",
    },
    {
        question: "Can I use the exact same response template for every customer?",
        answer: "No. Using identical copy on multiple reviews signals to customers that responses are automated. Always adapt the template by inserting unique details from the customer's specific feedback.",
    },
];

export function ReviewResponseGeneratorGuide() {
    return (
        <section className="border-t border-border bg-muted/10 py-16 px-4">
            <FAQPageJsonLd faqs={FAQS} />
            <div className="container mx-auto max-w-3xl space-y-12">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">About the Review Response Generator</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Review Response Generator is a free utility that creates structured, professional reply drafts tailored to your business name and the customer&apos;s star rating (from 1 to 5 stars). It is designed for local business owners, office managers, customer support teams, and agency staff who want a proven response framework without starting from a blank page for every Google review.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        A clear, well-phrased reply shows prospective customers on Google Maps that you are responsive and take service quality seriously.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">How to generate a response draft in 4 steps</h2>
                    <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Enter business name:</strong> Type your business name as you want it to appear in the greeting.
                        </li>
                        <li>
                            <strong className="text-foreground">Select star rating:</strong> Choose the rating of the review you received (1, 2, 3, 4, or 5 stars).
                        </li>
                        <li>
                            <strong className="text-foreground">Optional review text:</strong> Paste the customer&apos;s comment into the text box for easy reference while editing.
                        </li>
                        <li>
                            <strong className="text-foreground">Generate and personalize:</strong> Click &quot;Generate response&quot;, customize the editable draft with specific details from the customer&apos;s visit, and copy the text to post on Google.
                        </li>
                    </ol>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Practical tips and editing example</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        For a 2-star review citing a long wait, start with the generator&apos;s template and insert personal specifics: <em className="text-foreground">&quot;Hi Marcus, thank you for sharing this feedback. We apologize for the wait time during your Friday afternoon visit—our kitchen fell behind our usual standard. We have reviewed staffing for that shift. Please contact us at support@example.com so we can make this right.&quot;</em>
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Aim for roughly 50 to 150 words per public response. Avoid debating facts or negotiating financial settlements in public comments; instead, direct sensitive discussions to a private phone number or email address.
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
                            <Link href="/resources/negative-review-templates" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                20+ Negative Review Response Templates (Google Reviews)
                            </Link>
                            <span className="text-muted-foreground"> — Ready-to-use scripts for service, billing, and delay complaints.</span>
                        </li>
                        <li>
                            <Link href="/blog/how-to-respond-to-a-1-star-review" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                How to Respond to a 1-Star Review (5 Real Templates)
                            </Link>
                            <span className="text-muted-foreground"> — A practical 5-step framework for handling negative customer feedback.</span>
                        </li>
                        <li>
                            <Link href="/blog/ai-reply-mistakes-to-avoid" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                5 AI Reply Mistakes to Avoid When Responding to Reviews
                            </Link>
                            <span className="text-muted-foreground"> — Guidelines for editing and personalizing automated review drafts.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
