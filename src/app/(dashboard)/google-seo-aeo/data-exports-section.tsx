import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXPORTS = [
    { label: "Prompts & results", href: "/api/aeo/prompts/export" },
    { label: "Citations", href: "/api/aeo/citations/export" },
    { label: "Competitors", href: "/api/competitors/export" },
    { label: "Crawl findings", href: "/api/aeo/crawl-findings/export" },
] as const;

/** F7.2: CSV export, one link per table. Citations and crawl findings have no dedicated browsing page yet, so this is their only export entry point. */
export function DataExportsSection() {
    return (
        <section
            className="flex flex-col gap-4 rounded-xl border bg-muted/25 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            aria-labelledby="data-exports-title"
        >
            <div>
                <h2 id="data-exports-title" className="font-semibold">
                    Data exports
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Download the raw rows behind every metric on this page.
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                {EXPORTS.map((item) => (
                    <Button key={item.href} variant="outline" size="sm" asChild>
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 size-4" /> {item.label}
                        </a>
                    </Button>
                ))}
            </div>
        </section>
    );
}
