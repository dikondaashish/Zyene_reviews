import { LandingHero } from "@/components/marketing/landing-hero";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoRequestForm } from "@/components/marketing/demo-request-form";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ENTERPRISE_SALES_EMAIL } from "@/lib/enterprise/enterprise-data";
import { getCalComEmbedUrlFromEnv } from "@/lib/enterprise/cal-com-embed";

export default function DemoPage() {
    const calComEmbedUrl = getCalComEmbedUrlFromEnv();
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Book a demo", url: "https://www.zyenereviews.com/demo" },
                ]}
            />

            <LandingHero eyebrow="See Zyene in action" title="Let’s make it work for your business." description="Explore review requests, AI replies, and reporting with our team. Bring your questions. We’ll help you find the right fit." />

            <section className="py-16 px-4">
                <div className="container mx-auto max-w-5xl grid lg:grid-cols-2 gap-10">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                        <h2 className="text-xl font-bold mb-2">Pick a time that suits you</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Pick a time that works for your team. Typical demo: 30 minutes.
                        </p>
                        {calComEmbedUrl ? (
                            <iframe
                                src={calComEmbedUrl}
                                title="Schedule a Zyene Reviews demo on Cal.com"
                                sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                                className="w-full min-h-[520px] rounded-xl border border-border"
                            />
                        ) : (
                            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                                <p className="mb-4">Choose a time on our booking page, or send your details and we’ll arrange a demo.</p>
                                <a href="https://cal.com/zyene/30-min-meeting" target="_blank" rel="noopener noreferrer" className="marketing-button">Choose a time</a>
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                        <h2 className="text-xl font-bold mb-2">Or send us your details</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Tell us about your business and we’ll follow up by email within one business day.
                        </p>
                        <DemoRequestForm />
                        <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
                            <Button variant="outline" size="sm" className="gap-2" asChild>
                                <a href={`mailto:${ENTERPRISE_SALES_EMAIL}?subject=Enterprise%20demo%20request`}>
                                    <Mail className="size-4" /> Email sales directly
                                </a>
                            </Button>
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
