import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
import { RESOURCE_GUIDES } from "@/lib/content/resource-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";


const ICONS = ["📗", "📕", "📘", "📙"];

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
            <section className="pt-20 pb-16 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                            <FileText className="size-3" /> Free Guides
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Comprehensive guides for<br />local business owners
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        In-depth, practical resources on Google reviews, local SEO, review templates, and reputation management. Free. No email required.
                    </p>
                </div>
            </section>

            {/* ── Guide Grid ── */}
            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {RESOURCE_GUIDES.map((guide, i) => (
                            <Link key={guide.slug} href={`/resources/${guide.slug}`} className="group bg-card border border-border rounded-3xl p-8 hover:border-primary/40 hover:shadow-lg transition-[border-color,box-shadow] flex flex-col">
                                <div className="text-5xl mb-5">{ICONS[i]}</div>
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
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Blog CTA ── */}
            <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-border rounded-3xl p-8">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-1">Looking for shorter reads?</h3>
                            <p className="text-muted-foreground">Visit our blog for practical posts on Google reviews, local SEO, and reputation management.</p>
                        </div>
                        <Link href="/blog" className="shrink-0">
                            <Button variant="outline" className="gap-2 rounded-xl">
                                <BookOpen className="size-4" /> Browse the Blog
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Product CTA ── */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-3">Ready to put this into practice?</h2>
                    <p className="text-muted-foreground mb-8">Zyene Reviews automates review collection, AI replies, competitor tracking, and more. 7-day free trial, no credit card lock-in.</p>
                    <Link href={SIGNUP_URL}>
                        <Button size="lg" className="gap-2 rounded-xl">
                            Start Free Trial <ArrowRight className="size-4" />
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
