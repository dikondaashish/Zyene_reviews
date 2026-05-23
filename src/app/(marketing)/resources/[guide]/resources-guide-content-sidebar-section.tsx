import { ContentRenderer } from "@/components/marketing/content-renderer";
import { RESOURCE_MAP, RESOURCE_GUIDES } from "@/lib/phase4/resource-data";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, List, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResourcesGuideContentSidebarSection({ resource, otherGuides }: { resource: (typeof RESOURCE_MAP)[string]; otherGuides: typeof RESOURCE_GUIDES }) {
    return (
        <div className="py-12 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">

                        {/* Guide content */}
                        <article>
                            {/* Table of Contents */}
                            {resource.tableOfContents.length > 0 && (
                                <div className="mb-10 bg-muted border border-border rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <List className="text-primary size-4" />
                                        <span className="text-sm font-bold text-foreground">Table of Contents</span>
                                    </div>
                                    <ol className="space-y-2">
                                        {resource.tableOfContents.map((item, i) => (
                                            <li key={item.anchor} className="flex items-start gap-2.5">
                                                <span className="text-xs font-bold text-primary mt-0.5">{String(i + 1).padStart(2, "0")}.</span>
                                                <a href={`#${item.anchor}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</a>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            <ContentRenderer sections={resource.body} />

                            {/* Guide footer CTA */}
                            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8">
                                <h3 className="text-xl font-bold text-foreground mb-2">Put this guide into practice with Zyene</h3>
                                <p className="text-muted-foreground mb-5">Automate review collection, AI replies, and reputation protection. 7-day free trial — no credit card lock-in.</p>
                                <Link href="/signup">
                                    <Button className="gap-2">
                                        Start Free Trial <ArrowRight className="size-4" />
                                    </Button>
                                </Link>
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="hidden lg:block space-y-6 sticky top-24">
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <p className="text-sm font-bold text-foreground mb-2">Try Zyene free</p>
                                <p className="text-xs text-muted-foreground mb-4">Everything in this guide — automated. Review requests, AI replies, Shield, competitor tracking. $29.99/mo. No contract.</p>
                                <Link href="/signup">
                                    <Button size="sm" className="w-full gap-2">
                                        Start Free Trial <ArrowRight className="size-3.5" />
                                    </Button>
                                </Link>
                            </div>

                            {otherGuides.length > 0 && (
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <p className="text-sm font-bold text-foreground mb-4">Other guides</p>
                                    <div className="space-y-4">
                                        {otherGuides.map((g) => (
                                            <Link key={g.slug} href={`/resources/${g.slug}`} className="group block">
                                                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">{g.title}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {g.readMinutes} min
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
    );
}
