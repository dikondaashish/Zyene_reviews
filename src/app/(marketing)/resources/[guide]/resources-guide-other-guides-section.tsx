import { RESOURCE_MAP, RESOURCE_GUIDES } from "@/lib/phase4/resource-data";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResourcesGuideOtherGuidesSection({ otherGuides }: { otherGuides: typeof RESOURCE_GUIDES }) {
    return (
        <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-foreground">More free guides</h2>
                        <Link href="/resources" className="text-sm font-medium text-primary hover:brightness-90 flex items-center gap-1">
                            All guides <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {otherGuides.map((g) => (
                            <Link key={g.slug} href={`/resources/${g.slug}`} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
                                <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug flex-1">{g.title}</h3>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                                    <Clock className="size-3" />
                                    {g.readMinutes} min
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
    );
}
