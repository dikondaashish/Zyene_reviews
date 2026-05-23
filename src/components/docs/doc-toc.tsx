"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type TocItem = {
    title: string;
    href: string;
};

export function DocToc({ items }: { items: TocItem[] }) {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(`#${entry.target.id}`);
                    }
                });
            },
            { rootMargin: "0% 0% -80% 0%" }
        );

        items.forEach((item) => {
            const id = item.href.replace("#", "");
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [items]);

    if (!items.length) return null;

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto py-8 pl-6 xl:block">
            <h4 className="mb-4 text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="rounded-full bg-border size-3" />
                On this page
            </h4>
            <div className="flex flex-col gap-2.5">
                {items.map((item) => {
                    const isActive = activeId === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-[13px] transition-colors ${
                                isActive
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </div>
            
            <div className="mt-8 border-t border-border pt-6">
                <h4 className="mb-4 text-xs font-semibold tracking-tight text-foreground uppercase text-muted-foreground">
                    Next steps
                </h4>
                <div className="flex flex-col gap-2.5">
                    <Link href="/docs/api" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                        Check API Reference
                    </Link>
                    <Link href="/docs/quickstart" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                        Read Quickstart
                    </Link>
                </div>
            </div>
        </aside>
    );
}
