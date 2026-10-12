import { LandingHero } from "@/components/marketing/landing-hero";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ENTERPRISE_SALES_EMAIL } from "@/lib/enterprise/enterprise-data";

export default function DemoPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Book a demo", url: "https://www.zyenereviews.com/demo" },
                ]}
            />

            <LandingHero
                eyebrow="See Zyene in action"
                title="See your review routine in action."
                description="Walk through fair SMS, email, link, and QR-code requests, AI drafts and automatic Google replies, private feedback follow-up, and reporting with our team."
                variant="conversion"
                media={{ kind: "none" }}
            />

            <p className="marketing-container">
                <Link href="/#home-product-tour" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
                    Try automatic replies in the interactive demo before booking →
                </Link>
            </p>

            <section className="py-16 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-10 text-center shadow-sm">
                        <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                            <Calendar className="size-6" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Schedule a 15-minute walkthrough</h2>
                        <p className="text-muted-foreground mb-8 text-base max-w-lg mx-auto">
                            Pick a 15-minute time that works for your team on our live calendar. We’ll show how to select a business, choose a reply tone and star threshold, and turn on automatic Google replies.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
                                <a href="https://cal.com/zyenereviews/15min" target="_blank" rel="noopener noreferrer">
                                    Book on Cal.com <ArrowUpRight className="size-4" />
                                </a>
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2" asChild>
                                <a href={`mailto:${ENTERPRISE_SALES_EMAIL}?subject=Enterprise%20demo%20request`}>
                                    <Mail className="size-4" /> Email sales directly
                                </a>
                            </Button>
                        </div>
                        <div className="mt-8 pt-6 border-t border-border flex justify-center">
                            <Button variant="ghost" size="sm" className="gap-2" asChild>
                                <Link href="/enterprise">
                                    Enterprise overview <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
