import Link from "next/link";
import {
    INDUSTRY_TEMPLATES,
    SITUATION_TEMPLATES,
    STAR_RESPONSE_EXAMPLES,
    type ResponseExampleItem,
} from "@/lib/content/review-response-generator-examples";

function TemplateCardGrid({ items }: { items: ResponseExampleItem[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
                <article key={item.label} className="rounded-xl border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.template}</p>
                </article>
            ))}
        </div>
    );
}

export function ReviewResponseExamples() {
    return (
        <>
            <section className="marketing-section mi-section-tight" aria-labelledby="rrg-star-examples-heading">
                <div className="marketing-container space-y-6">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">1–5 star examples</p>
                        <h2 id="rrg-star-examples-heading">Static review response examples for 1 to 5 stars</h2>
                        <p className="mt-2 max-w-3xl text-muted-foreground">
                            Prefer to copy directly? Use these crawlable 1-star through 5-star review response templates, personalize the bracketed details, and review your draft before posting.
                        </p>
                    </div>
                    <TemplateCardGrid items={STAR_RESPONSE_EXAMPLES} />
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby="rrg-situations-heading">
                <div className="marketing-container space-y-6">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">By situation</p>
                        <h2 id="rrg-situations-heading">Review response templates by situation</h2>
                    </div>
                    <TemplateCardGrid items={SITUATION_TEMPLATES} />
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby="rrg-industries-heading">
                <div className="marketing-container space-y-6">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">By industry</p>
                        <h2 id="rrg-industries-heading">Review response templates by industry</h2>
                    </div>
                    <TemplateCardGrid items={INDUSTRY_TEMPLATES} />
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby="rrg-ai-vs-templates-heading">
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">Choosing a workflow</p>
                        <h2 id="rrg-ai-vs-templates-heading">AI review response generator vs. static templates</h2>
                    </div>
                    <div className="mk-prose">
                        <p>
                            Static review response templates work well when you get a handful of reviews each month and want a fast starting structure. An AI review response generator makes more sense when you manage multiple locations or high weekly volume and want drafts tailored to each customer&apos;s comment inside a single approval queue (always reviewed before posting).
                        </p>
                        <p>
                            Compare platforms in our guide to the{" "}
                            <Link href="/blog/best-review-response-generator-tools" className="mi-inline-link">best AI review response software</Link>, or grab outreach scripts from our{" "}
                            <Link href="/resources/review-request-templates" className="mi-inline-link">review request templates</Link>.
                        </p>
                    </div>
                </div>
            </section>

            <section className="marketing-section mi-section-tight" aria-labelledby="rrg-privacy-heading">
                <div className="marketing-container mi-split">
                    <div className="mi-head">
                        <p className="marketing-eyebrow">Data handling</p>
                        <h2 id="rrg-privacy-heading">Privacy note: what this free tool sends</h2>
                    </div>
                    <div className="mk-prose">
                        <p>
                            This free generator only asks for your star rating (1–5) and your business name—it does not ask you to paste customer review text, phone numbers, or private customer details. Submitting an email address is completely optional and is only used if you choose to have the bonus templates emailed to you.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}

