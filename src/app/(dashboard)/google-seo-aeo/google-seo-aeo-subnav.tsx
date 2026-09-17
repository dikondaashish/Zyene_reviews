import Link from "next/link";
import { cn } from "@/lib/utils";
import { isLiveCrawlingEnabled, isLiveAlertingEnabled } from "@/lib/features/aeo-surfaces";

const TABS = [
    { href: "/google-seo-aeo", label: "Overview" },
    { href: "/google-seo-aeo/prompts", label: "Prompts" },
    { href: "/google-seo-aeo/geo-grid", label: "Geo-grid" },
    { href: "/google-seo-aeo/audit", label: "Technical audit" },
    { href: "/google-seo-aeo/alerts", label: "Alerts" },
    { href: "/google-seo-aeo/phase-2", label: "Competitive insights" },
    { href: "/google-seo-aeo/phase-3", label: "Advanced tools" },
] as const;

/** Shared across every google-seo-aeo page - none of them linked to each other before this. */
export function GoogleSeoAeoSubnav({ active }: { active: (typeof TABS)[number]["href"] }) {
    return (
        <nav
            aria-label="Google visibility sections"
            className="max-w-full overflow-x-auto rounded-lg border bg-muted/35 p-1"
        >
            <div className="flex min-w-max gap-1">
                {TABS.filter(
                    (tab) =>
                        tab.href === active ||
                        ((tab.href !== "/google-seo-aeo/audit" || isLiveCrawlingEnabled()) &&
                            (tab.href !== "/google-seo-aeo/alerts" || isLiveAlertingEnabled())),
                ).map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        aria-current={active === tab.href ? "page" : undefined}
                        className={cn(
                            "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active === tab.href
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                        )}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
