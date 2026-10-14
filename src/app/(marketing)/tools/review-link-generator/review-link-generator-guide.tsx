import Link from "next/link";
import { FAQPageJsonLd, type FaqItem } from "@/components/seo/json-ld";

const FAQS: FaqItem[] = [
    {
        question: "What is a Google Place ID?",
        answer: "A Google Place ID is a unique alphanumeric identifier assigned by Google to physical locations on Google Maps. This tool retrieves your Place ID from the Google Places API to construct your direct review submission link.",
    },
    {
        question: "Does this link open the review box directly?",
        answer: "Yes. Using Google's official writereview?placeid= URL structure prompts the browser to load your listing and immediately trigger the rating and review dialogue box if the user is signed into a Google account.",
    },
    {
        question: "What size should a review QR code be for print?",
        answer: "For receipts, business cards, table tents, or counter signage, print your QR code at least 1 x 1 inch (25 x 25 mm). Ensure high contrast with dark elements on a light background and at least 4 mm of quiet margin around the code.",
    },
    {
        question: "Do customers need a Google account to submit a review?",
        answer: "Yes. Google requires reviewer authentication through an active Google account to post public reviews on Google Maps and Google Search to reduce spam and unverified submissions.",
    },
    {
        question: "Can I use this link in automated SMS or email messages?",
        answer: "Yes. You can paste the generated URL directly into SMS and email messages. Zyene Reviews also provides automated review collection campaigns that send direct links after customer visits or transactions.",
    },
];

export function ReviewLinkGeneratorGuide() {
    return (
        <section className="border-t border-border bg-muted/10 py-16 px-4">
            <FAQPageJsonLd faqs={FAQS} />
            <div className="container mx-auto max-w-3xl space-y-12">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">About the Google Review Link Generator</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Google Review Link Generator is a free utility that looks up your official Google Place ID using Google Places data and formats a direct review submission URL. It is designed for local business owners, healthcare practices, contractors, retail operators, and service professionals who need a reliable link to share with customers via text message, email invoices, or printed QR codes.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Instead of asking customers to open Google Maps, search for your business name, and locate the review button, a direct URL opens the rating dialog in one click on both desktop and mobile browsers.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">How to use this tool in 4 steps</h2>
                    <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
                        <li>
                            <strong className="text-foreground">Search for your business:</strong> Enter your business name and city in the search bar above.
                        </li>
                        <li>
                            <strong className="text-foreground">Select your listing:</strong> Choose your verified location from the Google autocomplete suggestions to load its Place ID.
                        </li>
                        <li>
                            <strong className="text-foreground">Optional email backup:</strong> Enter your email address if you want a copy of your link sent directly to your inbox.
                        </li>
                        <li>
                            <strong className="text-foreground">Copy and distribute:</strong> Click &quot;Get my review link&quot; and copy the URL into your customer outreach templates or QR code generator.
                        </li>
                    </ol>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Practical tips and print example</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        A typical post-service follow-up message can be short and direct: <em className="text-foreground">&quot;Hi John, thanks for visiting Apex Auto today. If you have a minute, please share your experience on Google: [Your Link]&quot;</em>.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        If you convert your review URL into a printed QR code for invoices, appointment cards, or counter displays, print it at a minimum of 1 x 1 inch (25 x 25 mm). Maintain high contrast and adequate white border space around the code so smartphone cameras can scan it without focusing delays.
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
                            <Link href="/blog/how-to-get-a-google-review-link" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                How to Get a Google Review Link (Step-by-Step Guide)
                            </Link>
                            <span className="text-muted-foreground"> — Manual Place ID lookup and link testing methods.</span>
                        </li>
                        <li>
                            <Link href="/resources/review-request-templates" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                Free Review Request Template Pack (SMS + Email)
                            </Link>
                            <span className="text-muted-foreground"> — Ready-to-use message scripts for local businesses.</span>
                        </li>
                        <li>
                            <Link href="/blog/how-to-get-50-google-reviews-in-30-days" className="text-primary underline underline-offset-4 hover:text-primary/80">
                                How to Get 50 Google Reviews in 30 Days
                            </Link>
                            <span className="text-muted-foreground"> — Timing and customer outreach strategies.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
