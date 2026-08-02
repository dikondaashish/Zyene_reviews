import Link from "next/link";
import { SIGNUP_URL } from "@/config/env";
import { COMPARE_HUB_RESOURCE_LINKS } from "./compare-hub-content";

export function CompareHubLinksSection() {
    return (
        <section className="py-16 px-4 bg-background border-t border-border" aria-labelledby="compare-resources-heading">
            <div className="container mx-auto max-w-4xl text-center">
                <h2 id="compare-resources-heading" className="text-2xl font-bold text-foreground mb-3">
                    Compare pages & buyer guides
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                    Drill into each competitor, then validate pricing and workflows on your own quote.
                </p>
                <nav aria-label="Compare hub related links" className="flex flex-wrap justify-center gap-3">
                    {COMPARE_HUB_RESOURCE_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href === "/signup" ? SIGNUP_URL : link.href}
                            className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </section>
    );
}
