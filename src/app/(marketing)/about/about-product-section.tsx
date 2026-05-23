import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AboutProductSection() {
    return (
        <>
                    <div className="border-t border-border pt-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">What Zyene Reviews Does</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Zyene Reviews is a SaaS platform that connects to your Google Business Profile through
                            Google&apos;s official OAuth authorization. Once connected, our platform helps you:
                        </p>
                        <ul className="space-y-2 text-muted-foreground mb-8">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Monitor and respond to customer reviews from Google, Facebook, and Yelp in one dashboard
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Generate AI-powered reply suggestions and auto-respond to reviews hands-free
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Send review requests to customers via email, SMS, or shareable links ,  with the Negative Feedback Shield routing low ratings to private resolution
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Track competitors, monitor your Google Business Profile performance, and optimize for local SEO
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Manage multiple business locations from one account ,  starting at $29.99/mo
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
