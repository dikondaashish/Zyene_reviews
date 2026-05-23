"use client";

import Link from "next/link";
import type { GrowthPageEntry } from "@/lib/growth/page-inventory";

export function GrowthDashboardPageRow({ page }: { page: GrowthPageEntry }) {
    const href = page.path.includes("[") ? null : page.path;
    return (
        <tr className="border-b border-border/60 hover:bg-muted/30">
            <td className="py-2 px-3 font-mono text-xs">
                {href && page.status === "live" ? (
                    <Link href={href} className="text-primary hover:underline" target="_blank">
                        {page.path}
                    </Link>
                ) : (
                    page.path
                )}
            </td>
            <td className="py-2 px-2">{page.phase}</td>
            <td className="py-2 px-2">{page.priority}</td>
            <td className="py-2 px-2 text-muted-foreground">{page.pageType}</td>
            <td className="py-2 px-2">{page.status}</td>
            <td className="py-2 px-2">{page.inSitemap ? "yes" : "—"}</td>
            <td className="py-2 px-3 text-xs text-muted-foreground max-w-xs">{page.notes ?? ""}</td>
        </tr>
    );
}
