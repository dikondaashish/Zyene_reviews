import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Building2 } from "lucide-react";
import {
    CUSTOMER_LOGOS,
    FEATURED_TESTIMONIALS,
    getPlatformStats,
    THIRD_PARTY_TRUST,
    type TestimonialCard,
} from "@/lib/phase5/social-proof-data";

/** Hero / section badge: "Managing 12k+ reviews for 380+ businesses" */
export function PlatformStatsBadge({ className = "" }: { className?: string }) {
    const stats = getPlatformStats();
    return (
        <div
            className={`inline-flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground ${className}`}
        >
            <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{stats.starRating}/5</span>
                <span>from local business owners</span>
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span>
                Managing <span className="font-semibold text-foreground">{stats.reviewCountFormatted}</span> reviews
                for <span className="font-semibold text-foreground">{stats.businessCountFormatted}</span> businesses
            </span>
        </div>
    );
}

/** Scrolling-style logo bar (text marks until licensed logos are added) */
export function CustomerLogoBar({ title = "Trusted by local businesses nationwide" }: { title?: string }) {
    return (
        <section className="w-full py-12 border-y border-border bg-muted/40">
            <div className="container mx-auto max-w-6xl px-4">
                <p className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground mb-8">
                    {title}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                    {CUSTOMER_LOGOS.map((logo) => (
                        <div
                            key={logo.name}
                            className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity"
                            title={`${logo.name} · ${logo.industry}`}
                        >
                            <div
                                className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 ${logo.colorClass}`}
                            >
                                {logo.initials}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-semibold text-foreground leading-none">{logo.name}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{logo.industry}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TestimonialCardUI({ t }: { t: TestimonialCard }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full hover:border-primary/30 transition-colors">
            <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
            </div>
            <p className="text-sm text-foreground leading-relaxed flex-1 mb-5">&ldquo;{t.quote}&rdquo;</p>
            <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">{t.author}</p>
                <p className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                </p>
                <Link
                    href={`/case-studies/${t.caseStudySlug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-2 hover:brightness-90"
                >
                    Read case study <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}

export function TestimonialGrid({
    title = "What local business owners say",
    subtitle = "Real outcomes from restaurants, dental practices, home services, and more.",
    limit,
}: {
    title?: string;
    subtitle?: string;
    limit?: number;
}) {
    const items = limit ? FEATURED_TESTIMONIALS.slice(0, limit) : FEATURED_TESTIMONIALS;
    return (
        <section className="w-full py-20 px-4 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {items.map((t) => (
                        <TestimonialCardUI key={t.caseStudySlug} t={t} />
                    ))}
                </div>
                <div className="text-center mt-10">
                    <Link
                        href="/case-studies"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-90"
                    >
                        View all case studies <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

/** G2 / Capterra / Product Hunt / GBP trust row */
export function ThirdPartyTrustRow() {
    return (
        <section className="w-full py-16 px-4 bg-muted border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Verified on the platforms you already trust</h2>
                    <p className="text-sm text-muted-foreground">
                        We&apos;re building our presence on third-party review sites — get early access and help shape our profile.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {THIRD_PARTY_TRUST.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                    {item.name}
                                </span>
                                {item.status === "coming_soon" && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                        Soon
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

/** Footer trust strip */
export function FooterTrustStrip() {
    const stats = getPlatformStats();
    return (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                {stats.starRating}/5 average rating
            </span>
            <Link href="/security" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <ShieldCheck className="h-3.5 w-3.5" />
                Security
            </Link>
            <Link href="/case-studies" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                <Building2 className="h-3.5 w-3.5" />
                Case studies
            </Link>
        </div>
    );
}

/** Industry page trust badge */
export function IndustryTrustBadge({ label }: { label: string }) {
    return (
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-full">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            {label}
        </div>
    );
}

/** Widget preview for homepage — iframe when slug configured, else static preview */
export function LiveWidgetPreview() {
    const slug = process.env.NEXT_PUBLIC_DEMO_WIDGET_SLUG;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    const widgetSrc = slug && appUrl ? `${appUrl}/w/${slug}?type=carousel` : null;

    return (
        <section className="w-full py-20 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-foreground mb-2">See reviews live on your website</h2>
                    <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                        Embed a review carousel or star badge on your site — the same widget your customers&apos; visitors see.
                    </p>
                </div>
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                    {widgetSrc ? (
                        <iframe
                            src={widgetSrc}
                            title="Zyene Reviews widget preview"
                            className="w-full h-[280px] border-0"
                            loading="lazy"
                        />
                    ) : (
                        <div className="p-8 bg-gradient-to-br from-muted to-background">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex -space-x-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                                    ))}
                                </div>
                                <span className="text-lg font-bold text-foreground">4.8</span>
                                <span className="text-sm text-muted-foreground">· 94 Google reviews</span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { name: "Sarah M.", text: "Best experience we've had. Professional and fast.", stars: 5 },
                                    { name: "James T.", text: "They went above and beyond. Highly recommend.", stars: 5 },
                                    { name: "Lisa K.", text: "Great service — will definitely come back.", stars: 5 },
                                ].map((r) => (
                                    <div key={r.name} className="bg-background border border-border rounded-xl p-4">
                                        <div className="flex gap-0.5 mb-2">
                                            {Array.from({ length: r.stars }).map((_, i) => (
                                                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                                            ))}
                                        </div>
                                        <p className="text-sm text-foreground">{r.text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">— {r.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="px-4 py-3 border-t border-border bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Powered by Zyene Reviews</span>
                        <Link href="/integrations" className="text-primary font-medium hover:brightness-90">
                            Get your widget →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
