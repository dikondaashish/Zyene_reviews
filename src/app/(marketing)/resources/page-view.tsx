import { LandingHero } from "@/components/marketing/landing-hero";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, FileText, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
import { RESOURCE_GUIDES } from "@/lib/content/resource-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";


const ICONS = [BookOpen, FileText, Search, Mail];

export default function ResourcesHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Resources", url: "https://www.zyenereviews.com/resources" },
                ]}
            />

            {/* ── Hero ── */}
            <LandingHero eyebrow="The resource library" title="Small steps. A stronger local presence." description="Go deeper with practical guides to Google reviews, local SEO, and customer feedback. Free to read, ready to use." />

            {/* ── Guide Grid ── */}
            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {RESOURCE_GUIDES.map((guide, i) => {
                            const GuideIcon = ICONS[i % ICONS.length];
                            return (
                                <Link key={guide.slug} href={`/resources/${guide.slug}`} className="group bg-card border border-border rounded-3xl p-8 hover:border-primary/40 hover:shadow-lg transition-[border-color,box-shadow] flex flex-col">
                                    <GuideIcon className="mb-5 size-10 text-primary" aria-hidden="true" />
                                <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                                    {guide.title}
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                                    {guide.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="size-3.5" />
                                        {guide.readMinutes} min read
                                    </div>
                                    <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-[gap]">
                                        Read guide <ArrowRight className="size-3.5" />
                                    </span>
                                </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Blog CTA ── */}
            <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-border rounded-3xl p-8">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-1">Looking for shorter reads?</h2>
                            <p className="text-muted-foreground">Visit our blog for practical posts on Google reviews, local SEO, and reputation management.</p>
                        </div>
                        <Button variant="outline" className="gap-2 rounded-xl" asChild>
                            <Link href="/blog" className="shrink-0">
                                <BookOpen className="size-4" /> Browse the Blog
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* ── Product CTA ── */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-3">Ready to put this into practice?</h2>
                    <p className="text-muted-foreground mb-8">Zyene Reviews automates review collection, AI replies, competitor tracking, and more. 7-day free trial, no credit card lock-in.</p>
                    <Button size="lg" className="gap-2 rounded-xl" asChild>
                        <Link href={SIGNUP_URL}>
                            Start Free Trial <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
