import { Download } from "lucide-react";

const EXPORTS = [
    { label: "AI questions & answers", href: "/api/aeo/prompts/export" },
    { label: "Sources AI cited", href: "/api/aeo/citations/export" },
    { label: "Competitors", href: "/api/competitors/export" },
    { label: "Website check results", href: "/api/aeo/crawl-findings/export" },
] as const;

/** F7.2: CSV export, one link per table. Citations and crawl findings have no dedicated browsing page yet, so this is their only export entry point. */
export function DataExportsSection() {
    return (
        <footer
            className="flex flex-col gap-3 border-t border-border pt-6 text-sm sm:flex-row sm:items-center sm:justify-between"
            aria-labelledby="data-exports-title"
        >
            <h2 id="data-exports-title" className="ui-section-title">
                Download your data (CSV)
            </h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {EXPORTS.map((item) => (
                    <li key={item.href}>
                        <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Download className="size-3.5 text-muted-foreground" aria-hidden />
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </footer>
    );
}
