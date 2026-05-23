import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_PILLARS } from "./blog-data";

export function BlogPillarFiltersSection() {
    return (
        <section className="py-6 px-4 bg-muted border-b border-border sticky top-16 z-30">
                <div className="container mx-auto max-w-5xl overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {BLOG_PILLARS.map((p) => (
                            <span key={p.id} className="px-4 py-2 rounded-full text-xs font-semibold border border-border bg-card text-muted-foreground cursor-default hover:border-primary/40 hover:text-foreground transition-colors whitespace-nowrap">
                                {p.label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
    );
}
