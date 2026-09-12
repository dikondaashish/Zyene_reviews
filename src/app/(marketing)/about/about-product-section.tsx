import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export function AboutProductSection() {
    return (
        <>
                    <div className="border-t border-border pt-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">What Zyene Reviews Does</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Zyene Reviews is a SaaS platform that connects to your Google Business Profile through
                            Google&apos;s official OAuth authorization. It helps your team build a consistent reputation routine,
                            from a branded review request to a thoughtful response and the next improvement:
                        </p>
                        <ul className="space-y-2 text-muted-foreground mb-8">
                            <li className="flex items-start gap-2">
                                <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                                Keep Google, Facebook, and Yelp review activity in one dashboard so your team can stay on top of customer feedback
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                                Draft AI-assisted Google review replies, then tailor each response to the customer and your voice
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                                Send review requests by email, SMS, shareable link, or QR code, with a private feedback path for customers who need help
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                                Follow up on private feedback while keeping every customer&apos;s public-review choice intact
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                                Learn from review and request analytics, competitor context, local visibility signals, and review widgets on paid plans
                            </li>
                        </ul>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/#features"
                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:brightness-90 transition-colors"
                            >
                                See all features <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href="/#pricing"
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                View pricing <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href="/docs"
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                Read the docs <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="border-t border-border pt-8 mt-8">
                        <p className="text-xs text-muted-foreground">
                            Zyene Reviews is an independent platform and is not affiliated with, endorsed by, or sponsored by Google LLC.
                            Our use of Google API data adheres to the{" "}
                            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:brightness-90">
                                Google API Services User Data Policy
                            </a>
                           , including the Limited Use requirements.
                        </p>
                    </div>
        </>
    );
}
