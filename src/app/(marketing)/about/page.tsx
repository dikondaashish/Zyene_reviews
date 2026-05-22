import type { Metadata } from "next";
import { Building2, Mail, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
    title: "About Zyene Reviews",
    description:
        "Learn about Zyene Reviews — a reputation management platform built for local businesses. Our mission is to make online reputation management accessible and ethical for every local business owner.",
    openGraph: {
        title: "About Zyene Reviews",
        description:
            "Zyene Reviews is a product of Zyene, Inc. We help local businesses monitor reviews, respond with AI, and grow their reputation — ethically and affordably.",
        url: "https://zyenereviews.com/about",
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background py-24 text-foreground">
            <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
                {/* Hero image */}
                <div className="w-full h-56 md:h-72 rounded-lg overflow-hidden mb-8 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=400&fit=crop&q=80"
                        alt="Team collaborating on review management software"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="bg-card p-8 md:p-16 rounded-lg border border-border">
                    <h1 className="text-4xl font-bold text-foreground mb-4">About Zyene Reviews</h1>
                    <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                        Zyene Reviews is a product of{" "}
                        <strong>
                            <a
                                href="https://zyene.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:brightness-90 underline-offset-2 hover:underline"
                            >
                                Zyene, Inc
                            </a>
                        </strong>
                        . We build software that helps local businesses manage their online reputation — so they can
                        focus on what they do best: serving their customers.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 border border-primary/20">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Our Mission</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    To make online reputation management accessible and simple for every local business,
                                    regardless of size or technical ability.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 border border-primary/20">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Who We Serve</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Restaurants, dental offices, auto shops, salons, and thousands of other local businesses
                                    that rely on customer reviews to grow.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 border border-primary/20">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Our Values</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We believe in ethical review practices. We never engage in review gating, incentivized reviews,
                                    or any practice that violates platform policies.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 border border-primary/20">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Get in Touch</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Questions? Feedback? We&apos;d love to hear from you.<br />
                                    Email us at{" "}
                                    <a href="mailto:support@zyenereviews.com" className="text-primary hover:brightness-90 font-medium">
                                        support@zyenereviews.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">What Zyene Reviews Does</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Zyene Reviews is a SaaS platform that connects to your Google Business Profile through
                            Google&apos;s official OAuth authorization. Once connected, our platform helps you:
                        </p>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Monitor and respond to customer reviews from a single dashboard
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Generate AI-powered reply suggestions to save time
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Send review requests to customers via email, SMS, or shareable links
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Track sentiment trends and receive real-time alerts on new reviews
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">✓</span>
                                Manage multiple business locations from one account
                            </li>
                        </ul>
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
                </div>
            </div>
        </div>
    );
}
