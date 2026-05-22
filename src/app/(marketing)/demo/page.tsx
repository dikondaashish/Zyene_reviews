import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoRequestForm } from "@/components/marketing/demo-request-form";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ENTERPRISE_SALES_EMAIL } from "@/lib/phase8/enterprise-data";
import { getCalComEmbedUrlFromEnv } from "@/lib/phase8/cal-com-embed";

export const metadata: Metadata = {
    title: "Book a Demo — Enterprise & Multi-Location | Zyene Reviews",
    description:
        "Schedule a live walkthrough with our sales team. See review automation, AI replies, white-label widgets, and enterprise SLAs for your brand or agency.",
    alternates: { canonical: "https://zyenereviews.com/demo" },
    openGraph: {
        title: "Book a Demo — Zyene Reviews",
        description: "Enterprise demo for multi-location brands, franchises, and agencies.",
        url: "https://zyenereviews.com/demo",
    },
};

export default function DemoPage() {
    const calComEmbedUrl = getCalComEmbedUrlFromEnv();
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Book a demo", url: "https://zyenereviews.com/demo" },
                ]}
            />

            <section className="pt-24 pb-12 px-4 border-b border-border bg-background">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Calendar className="h-3 w-3" /> Enterprise sales
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        See Zyene Reviews live
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        For brands with multiple locations, franchises, or agency portfolios. Our team will show
                        review automation, AI replies, white-label options, and pricing tailored to your scale.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4">
                <div className="container mx-auto max-w-5xl grid lg:grid-cols-2 gap-10">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                        <h2 className="text-xl font-bold mb-2">Schedule with Cal.com</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Pick a time that works for your team. Typical demo: 30 minutes.
                        </p>
                        {calComEmbedUrl ? (
                            <iframe
                                src={calComEmbedUrl}
                                title="Schedule a Zyene Reviews demo on Cal.com"
                                className="w-full min-h-[520px] rounded-xl border border-border"
                            />
                        ) : (
                            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                                <p className="mb-4">
                                    Cal.com embed is not configured yet. Use the form or email{" "}
                                    <a href={`mailto:${ENTERPRISE_SALES_EMAIL}`} className="text-primary underline">
                                        {ENTERPRISE_SALES_EMAIL}
                                    </a>
                                    .
                                </p>
                                <p className="text-xs">
                                    Set{" "}
                                    <code className="bg-muted px-1 rounded">NEXT_PUBLIC_CAL_COM_EMBED_URL</code> (default:{" "}
                                    <a
                                        href="https://cal.com/zyene/30-min-meeting"
                                        className="text-primary underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        cal.com/zyene/30-min-meeting
                                    </a>
                                    ).
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                        <h2 className="text-xl font-bold mb-2">Or send us your details</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            We route inbound demo requests to <strong>{ENTERPRISE_SALES_EMAIL}</strong> and confirm by
                            email within one business day.
                        </p>
                        <DemoRequestForm />
                        <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
                            <a href={`mailto:${ENTERPRISE_SALES_EMAIL}?subject=Enterprise%20demo%20request`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Mail className="h-4 w-4" /> Email sales directly
                                </Button>
                            </a>
                            <Link href="/enterprise">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    Enterprise overview <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
