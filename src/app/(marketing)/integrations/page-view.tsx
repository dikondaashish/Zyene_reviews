import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Sparkles, Globe, Clock, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";


const INTEGRATIONS = [
    {
        name: "Google Business Profile",
        color: "var(--brand-google)",
        letter: "G",
        badge: null,
        status: "live" as const,
        features: [
            "Sync all Google reviews in real time",
            "Publish AI replies directly to Google",
            "Track review keywords & GBP performance",
            "Manage Q&A from your dashboard",
            "Access local pack ranking insights",
        ],
        description:
            "The heart of your local SEO. Zyene connects to your Google Business Profile via official OAuth — syncing every review, monitoring your keyword performance, and letting you publish AI-crafted replies without leaving the dashboard.",
    },
    {
        name: "Facebook Reviews",
        color: "var(--brand-facebook)",
        letter: "f",
        badge: null,
        status: "live" as const,
        features: [
            "Sync Facebook page reviews in real time",
            "Reply to Facebook reviews from your inbox",
            "Unified view alongside Google & Yelp",
            "Sentiment analysis on Facebook reviews",
        ],
        description:
            "Manage your Facebook page reviews alongside Google and Yelp in one unified inbox. Never switch tabs to respond to a Facebook review again.",
    },
    {
        name: "Yelp",
        color: "var(--brand-yelp)",
        letter: "Y",
        badge: null,
        status: "live" as const,
        features: [
            "Sync Yelp reviews into your inbox",
            "Monitor new Yelp reviews in real time",
            "Track Yelp star rating trends",
            "Alert when a new review arrives",
        ],
        description:
            "Yelp reviews matter for restaurants, salons, and service businesses. Zyene syncs your Yelp profile so you never miss a new review or a drop in your rating.",
    },
    {
        name: "Zapier",
        color: "var(--brand-zapier)",
        letter: "Z",
        badge: null,
        status: "live" as const,
        features: [
            "Trigger review requests from 5,000+ apps",
            "Connect CRMs: HubSpot, Salesforce, Zoho",
            "Trigger after POS sales, bookings, or support tickets",
            "Build multi-step automation workflows",
            "No code required",
        ],
        description:
            "If your workflow lives in another app, Zapier bridges the gap. Trigger a review request the moment a booking is completed, a sale is closed, or a support ticket is resolved — automatically.",
    },
    {
        name: "Square",
        color: "var(--brand-square)",
        letter: "S",
        badge: null,
        status: "live" as const,
        features: [
            "Auto-send review requests after every Square sale",
            "Uses customer email/phone from Square transaction",
            "Configurable delay (e.g. send 2 hours after purchase)",
            "Works for retail and food & beverage",
        ],
        description:
            "Square is the most popular POS for local businesses. Connect once and Zyene will automatically send a review request after every completed sale — no manual work required.",
    },
    {
        name: "REST API",
        color: "var(--brand-api-neutral)",
        letter: "</>",
        badge: null,
        status: "live" as const,
        features: [
            "Full API access on all paid plans",
            "Send review requests programmatically",
            "Read and write reviews, responses, and analytics",
            "Webhook support for real-time events",
            "OpenAPI spec + Postman collection available",
        ],
        description:
            "Build exactly what your business needs. Our REST API gives developers full access to review data, request automation, and analytics — with webhooks for real-time triggers.",
    },
    {
        name: "Website Review Widget",
        color: "var(--brand-hubspot)",
        letter: "W",
        badge: null,
        status: "live" as const,
        features: [
            "Embed your latest Google reviews on any website",
            "Responsive, customizable design",
            "Automatically updates as new reviews arrive",
            "Supports all major website builders",
            "Increases conversion from visitors to customers",
        ],
        description:
            "Turn your 5-star reviews into website social proof. Embed a live review feed on your homepage, about page, or checkout page — it updates automatically as new reviews come in.",
    },
    {
        name: "Clover POS",
        color: "var(--brand-clover)",
        letter: "C",
        badge: "Coming Soon",
        status: "soon" as const,
        features: [
            "Auto-send review requests after Clover sales",
            "Native Clover app marketplace integration",
            "Works with all Clover hardware",
        ],
        description:
            "Native Clover POS integration is in development. Join the waitlist to be notified when it launches.",
    },
    {
        name: "Toast POS",
        color: "var(--brand-toast)",
        letter: "T",
        badge: "Coming Soon",
        status: "soon" as const,
        features: [
            "Auto-send review requests after Toast orders",
            "Syncs customer data from Toast",
            "Ideal for restaurants and quick service",
        ],
        description:
            "Toast POS integration is coming for restaurants. Join the waitlist to be notified when it launches.",
    },
];

const LIVE = INTEGRATIONS.filter((i) => i.status === "live");
const COMING = INTEGRATIONS.filter((i) => i.status === "soon");

export default function IntegrationsPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Integrations", url: "https://zyenereviews.com/integrations" },
                ]}
            />

            {/* ── Hero ── */}
            <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Zap className="h-3.5 w-3.5" />
                        Integrations
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        Connects with the tools<br />
                        <span className="text-primary">you already use</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        From Google to your POS system, Zyene plugs into your existing workflow — so getting more reviews never requires changing how you work.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/docs/api">
                            <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl gap-2">
                                <Code2 className="h-4 w-4" /> API Documentation
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Live Integrations ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Live integrations</h2>
                    <p className="text-muted-foreground text-center mb-12">Connect today — no waitlist, available on all paid plans.</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {LIVE.map((int) => (
                            <div key={int.name} className="bg-card border border-border rounded-2xl p-7 flex flex-col hover:shadow-md transition-shadow group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
                                        style={{ backgroundColor: int.color }}
                                    >
                                        {int.letter}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-lg leading-tight">{int.name}</h3>
                                        <span className="inline-block mt-1 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                                            Live
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-5 leading-relaxed flex-1">{int.description}</p>
                                <ul className="space-y-2">
                                    {int.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Coming Soon ── */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Coming soon</h2>
                    <p className="text-muted-foreground text-center mb-12">More integrations are on the roadmap. Join the waitlist.</p>
                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {COMING.map((int) => (
                            <div key={int.name} className="bg-card border border-border rounded-2xl p-7 opacity-80">
                                <div className="flex items-center gap-4 mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 opacity-60"
                                        style={{ backgroundColor: int.color }}
                                    >
                                        {int.letter}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-lg leading-tight">{int.name}</h3>
                                        <span className="inline-block mt-1 bg-muted text-muted-foreground text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-border">
                                            {int.badge}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{int.description}</p>
                                <ul className="space-y-2 mb-5">
                                    {int.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="mailto:hello@zyenereviews.com?subject=Waitlist%20Interest"
                                    className="text-sm font-medium text-primary hover:brightness-90 transition-colors inline-flex items-center gap-1"
                                >
                                    Join waitlist <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Developer Section ── */}
            <section className="py-20 px-4 bg-[color:var(--marketing-footer-bg)] text-[color:var(--marketing-footer-fg)] border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                                <Code2 className="h-3.5 w-3.5" /> For Developers
                            </div>
                            <h2 className="text-4xl font-bold mb-4 leading-tight">Build exactly what your business needs</h2>
                            <p className="text-[color:var(--marketing-footer-muted)] mb-6 leading-relaxed text-lg">
                                Our REST API gives full programmatic access to reviews, requests, responses, analytics, and webhooks. Included on every paid plan — no enterprise contract required.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {[
                                    "OpenAPI 3.0 specification + Postman collection",
                                    "Webhook events for new reviews, replies, and requests",
                                    "Full read/write access to all review data",
                                    "API key management per team member",
                                    "Rate-limited and secure by default",
                                ].map((f) => (
                                    <li key={f} className="flex items-start gap-3 text-[color:var(--marketing-footer-list)]">
                                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-4">
                                <Link href="/docs/api">
                                    <Button className="gap-2">
                                        <Globe className="h-4 w-4" /> Read API Docs
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button variant="outline" className="gap-2 border-[color:var(--marketing-footer-muted)] text-[color:var(--marketing-footer-fg)] hover:bg-white/10">
                                        <Sparkles className="h-4 w-4" /> Get API Key Free
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Code block */}
                        <div className="bg-[color:var(--code-block-bg)] rounded-2xl border border-white/10 p-6 font-mono text-sm overflow-hidden">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                                <span className="w-3 h-3 rounded-full bg-destructive/70" />
                                <span className="w-3 h-3 rounded-full bg-chart-4/70" />
                                <span className="w-3 h-3 rounded-full bg-chart-2/70" />
                                <span className="text-white/30 text-xs ml-2">POST /v1/requests</span>
                            </div>
                            <pre className="text-[13px] leading-relaxed overflow-x-auto text-left whitespace-pre">
                                <code>
                                    <span className="text-chart-1">curl</span>{" "}
                                    <span className="text-chart-2">-X POST</span>{" \\\n"}
                                    {"  "}
                                    <span className="text-chart-4">https://api.zyenereviews.com/v1/requests</span>{" \\\n"}
                                    {"  "}
                                    <span className="text-chart-2">-H</span>{" "}
                                    <span className="text-primary">&quot;Authorization: Bearer $API_KEY&quot;</span>{" \\\n"}
                                    {"  "}
                                    <span className="text-chart-2">-H</span>{" "}
                                    <span className="text-primary">&quot;Content-Type: application/json&quot;</span>{" \\\n"}
                                    {"  "}
                                    <span className="text-chart-2">-d</span>{" "}
                                    <span className="text-primary">&apos;&#123;</span>{"\n"}
                                    {"    "}
                                    <span className="text-primary">&quot;customer_name&quot;: &quot;Jane Smith&quot;,</span>{"\n"}
                                    {"    "}
                                    <span className="text-primary">&quot;phone&quot;: &quot;+15551234567&quot;,</span>{"\n"}
                                    {"    "}
                                    <span className="text-primary">&quot;channel&quot;: &quot;sms&quot;,</span>{"\n"}
                                    {"    "}
                                    <span className="text-primary">&quot;location_id&quot;: &quot;loc_abc123&quot;</span>{"\n"}
                                    {"  "}
                                    <span className="text-primary">&#125;&apos;</span>
                                </code>
                            </pre>
                            <div className="mt-4 pt-3 border-t border-white/10 text-chart-2 text-xs">
                                ✓ 200 OK — Review request sent via SMS
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Connect your first integration today</h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        All integrations are included with every paid plan. Start with Google, add more as you grow.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup">
                            <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl">
                                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Compare plans →
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
