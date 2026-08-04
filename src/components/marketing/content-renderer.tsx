import Image from "next/image";
import Link from "next/link";
import { Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";
import type { ContentSection } from "@/lib/content/blog-data";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
// Renders the structured content section array used by blog posts, resource guides, and help articles.
export function ContentRenderer({ sections }: { sections: ContentSection[] }) {
    return (
        <div className="prose-zyene space-y-5 text-foreground">
            {sections.map((section) => {
                const sectionKey = JSON.stringify(section);
                switch (section.type) {
                    case "h2":
                        return (
                            <h2 key={sectionKey} className="text-2xl font-bold text-foreground mt-10 mb-3 first:mt-0 scroll-mt-24" id={section.text?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
                                {section.text}
                            </h2>
                        );
                    case "summary":
                        return (
                            <p
                                key={sectionKey}
                                className="text-sm text-foreground leading-relaxed rounded-xl border border-primary/20 bg-primary/5 px-5 py-4"
                                data-geo-summary=""
                            >
                                <span className="sr-only">Key takeaway: </span>
                                {section.text}
                            </p>
                        );
                    case "h3":
                        return (
                            <h3 key={sectionKey} className="text-lg font-bold text-foreground mt-7 mb-2">
                                {section.text}
                            </h3>
                        );
                    case "p":
                        return (
                            <p key={sectionKey} className="text-base text-muted-foreground leading-relaxed">
                                {section.text}
                            </p>
                        );
                    case "ul":
                        return (
                            <ul key={sectionKey} className="space-y-2 pl-1">
                                {section.items?.map((item) => (
                                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                                        <span className="mt-1.5 shrink-0 rounded-full bg-primary size-1.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        );
                    case "ol":
                        return (
                            <ol key={sectionKey} className="space-y-3 pl-1 counter-reset-list">
                                {section.items?.map((item, j) => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                                        <span className="mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary size-6">
                                            {j + 1}
                                        </span>
                                        <span className="mt-0.5">{item}</span>
                                    </li>
                                ))}
                            </ol>
                        );
                    case "tip":
                        return (
                            <div key={sectionKey} className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                                <Lightbulb className="shrink-0 text-primary mt-0.5 size-5" />
                                <p className="text-sm text-foreground leading-relaxed">{section.text}</p>
                            </div>
                        );
                    case "warning":
                        return (
                            <div key={sectionKey} className="flex gap-3 rounded-xl border border-chart-4/20 bg-chart-4/5 px-5 py-4">
                                <AlertTriangle className="shrink-0 text-chart-4 mt-0.5 size-5" />
                                <p className="text-sm text-foreground leading-relaxed">{section.text}</p>
                            </div>
                        );
                    case "quote":
                        return (
                            <blockquote key={sectionKey} className="rounded-xl border-l-4 border-primary bg-muted px-6 py-4">
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line font-mono">{section.text}</p>
                            </blockquote>
                        );
                    case "cta":
                        return (
                            <div key={sectionKey} className="rounded-xl border border-primary/30 bg-primary/5 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <p className="text-sm font-semibold text-foreground">{section.ctaLabel}</p>
                                <Link
                                    href={section.ctaHref === "/signup" || !section.ctaHref ? SIGNUP_URL : section.ctaHref}
                                    className="shrink-0"
                                >
                                    <Button size="sm" className="gap-2 rounded-lg">
                                        Get Started <ArrowRight className="size-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        );
                    case "image":
                        return section.image ? (
                            <figure key={sectionKey} className="rounded-xl border border-border overflow-hidden bg-muted/30">
                                <Image
                                    src={section.image.src}
                                    alt={section.image.alt}
                                    width={section.image.width}
                                    height={section.image.height}
                                    className="w-full h-auto object-cover"
                                />
                                {section.image.caption ? (
                                    <figcaption className="px-4 py-3 text-xs text-muted-foreground leading-relaxed border-t border-border">
                                        {section.image.caption}
                                    </figcaption>
                                ) : null}
                            </figure>
                        ) : null;
                    case "table":
                        return (
                            <div key={sectionKey} className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-muted">
                                            {section.table?.headers.map((h) => (
                                                <th key={h} className="px-4 py-3 font-semibold text-foreground border-b border-border text-left">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.table?.rows.map((row) => (
                                            <tr key={JSON.stringify(row)} className="border-b border-border last:border-0 hover:bg-muted/30">
                                                {row.map((cell, k) => (
                                                    <td key={section.table?.headers[k] ?? cell} className="px-4 py-3 text-muted-foreground">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    default: return null;
                }
            })}
        </div>
    );
}
