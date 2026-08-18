import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
    { href: "/google-seo-aeo", label: "Overview" },
    { href: "/google-seo-aeo/prompts", label: "Prompts" },
    { href: "/google-seo-aeo/geo-grid", label: "Geo-grid" },
    { href: "/google-seo-aeo/audit", label: "Technical audit" },
    { href: "/google-seo-aeo/alerts", label: "Alerts" },
    { href: "/google-seo-aeo/phase-2", label: "Competitive insights" },
] as const;

/** Shared across every google-seo-aeo page — none of them linked to each other before this. */
export function GoogleSeoAeoSubnav({ active }: { active: (typeof TABS)[number]["href"] }) {
    return (
        <nav className="flex gap-1 border-b border-border">
            {TABS.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                        "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                        active === tab.href
                            ? "border-primary text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}
