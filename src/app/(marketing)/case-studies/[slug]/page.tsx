import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";

export function generateStaticParams() {
    return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const study = CASE_STUDY_MAP[slug];
    if (!study) return {};
    return {
        title: study.metaTitle,
        description: study.metaDescription,
        alternates: { canonical: `https://zyenereviews.com/case-studies/${slug}` },
        keywords: study.keywords,
        openGraph: {
            title: study.metaTitle,
            description: study.metaDescription,
            url: `https://zyenereviews.com/case-studies/${slug}`,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: study.metaTitle,
            description: study.metaDescription,
        },
    };
}

export default async function CaseStudyPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const study = CASE_STUDY_MAP[slug];
    if (!study) notFound();

    const related = CASE_STUDY_SLUGS.filter((s) => s !== slug)
        .slice(0, 2)
        .map((s) => CASE_STUDY_MAP[s]);

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Case Studies", url: "https://zyenereviews.com/case-studies" },
                    { name: study.company, url: `https://zyenereviews.com/case-studies/${slug}` },
                ]}
            />

            <header className="pt-20 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-3xl">
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/case-studies" className="hover:text-primary transition-colors">Case Studies</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium truncate">{study.company}</span>
                    </nav>

                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-4xl" aria-hidden>{study.emoji}</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">
                                {study.industry} · {study.location}
                            </p>
                            <p className="text-sm text-muted-foreground">{study.size}</p>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5 leading-[1.1]">
                        {study.headline}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">{study.excerpt}</p>
                    <p className="mt-4 text-xs text-muted-foreground">{study.timeline}</p>
                </div>
            </header>

            <article className="py-16 px-4 bg-background">
                <div className="container mx-auto max-w-3xl space-y-14">
                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">The challenge</h2>
                        <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">The solution</h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                            {study.company} implemented Zyene Reviews with these capabilities:
                        </p>
                        <ul className="space-y-3">
                            {study.solutionFeatures.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-6">Results</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {study.metrics.map((m) => (
                                <div key={m.label} className="bg-card border border-border rounded-xl p-6">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                        {m.label}
                                    </p>
                                    <div className="flex items-baseline gap-3 mb-1">
                                        <span className="text-lg text-muted-foreground line-through">{m.before}</span>
                                        <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                                        <span className="text-2xl font-bold text-foreground">{m.after}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-primary">{m.change}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-muted border border-border rounded-2xl p-8 relative">
                        <Quote className="h-8 w-8 text-primary/30 absolute top-6 left-6" />
                        <blockquote className="text-lg text-foreground leading-relaxed pl-10 mb-6">
                            &ldquo;{study.quote}&rdquo;
                        </blockquote>
                        <footer className="pl-10 border-t border-border pt-4">
                            <p className="font-semibold text-foreground">{study.quoteAuthor}</p>
                            <p className="text-sm text-muted-foreground">{study.quoteRole}</p>
                        </footer>
                    </section>

                    <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Get results like {study.company}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Start your 7-day free trial — same features, no annual contract.
                        </p>
                        <Link href={SIGNUP_URL}>
                            <Button size="lg" className="px-10 py-6 font-semibold rounded-xl">
                                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <p className="mt-4">
                            <Link
                                href={`/industries/${study.industrySlug}`}
                                className="text-sm text-primary font-medium hover:brightness-90"
                            >
                                See Zyene for {study.industry} →
                            </Link>
                        </p>
                    </section>
                </div>
            </article>

            {related.length > 0 && (
                <section className="py-16 px-4 bg-muted border-t border-border">
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-xl font-bold text-foreground mb-6">More case studies</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {related.map((r) => (
                                <Link
                                    key={r.slug}
                                    href={`/case-studies/${r.slug}`}
                                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                                >
                                    <span className="text-2xl">{r.emoji}</span>
                                    <p className="font-semibold text-foreground mt-2">{r.company}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                        <Link
                            href="/case-studies"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary mt-8 hover:brightness-90"
                        >
                            <ArrowLeft className="h-4 w-4" /> All case studies
                        </Link>
                    </div>
                </section>
            )}
        </>
    );
}
