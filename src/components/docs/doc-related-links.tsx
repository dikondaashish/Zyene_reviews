"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_SEARCH_INDEX } from "@/lib/docs/doc-nav";

/** Help and product pages every docs page links to, so docs are not a dead end for crawlers. */
const SUPPORT_LINKS = [
    { title: "Using the API (help article)", href: "/help/integrations/using-the-api" },
    { title: "Embedding review widgets", href: "/help/integrations/embedding-review-widgets" },
    { title: "Review platform integrations", href: "/integrations" },
    { title: "Review widgets", href: "/features/review-widgets" },
];

function normalize(pathname: string) {
    return pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/** Previous/next docs pages plus related help articles, rendered under every docs page. */
export function DocRelatedLinks() {
    const pathname = normalize(usePathname());
    const index = DOC_SEARCH_INDEX.findIndex((item) => item.href === pathname);
    if (index === -1) return null;
    const prev = DOC_SEARCH_INDEX[index - 1];
    const next = DOC_SEARCH_INDEX[index + 1];

    return (
        <nav aria-label="Keep reading" className="mx-6 mb-12 mt-4 border-t border-border pt-6 text-sm lg:mx-12 lg:max-w-3xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                {prev ? (
                    <Link href={prev.href} className="text-primary underline underline-offset-4">
                        &larr; {prev.title}
                    </Link>
                ) : <span />}
                {next ? (
                    <Link href={next.href} className="text-primary underline underline-offset-4 sm:text-right">
                        {next.title} &rarr;
                    </Link>
                ) : null}
            </div>
            <p className="mb-2 mt-6 font-medium text-foreground">Related guides</p>
            <ul className="flex flex-col gap-1.5 text-muted-foreground">
                {SUPPORT_LINKS.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="hover:text-primary transition-colors">
                            {link.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
