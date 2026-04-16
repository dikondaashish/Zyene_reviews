"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { DocSearchTrigger } from "@/components/docs/doc-search";
import { getAppDashboardUrl, getAppIntegrationsUrl } from "@/config/env";

export function DocNavbar() {
    const dashboardHref = getAppDashboardUrl();
    const integrationsHref = getAppIntegrationsUrl();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 min-w-0 max-w-[1400px] items-center gap-4 px-4 md:gap-8 md:px-8">
                <Link href="/" className="group flex shrink-0 items-center gap-2">
                    <div className="flex size-8 aspect-square items-center justify-center overflow-hidden rounded shadow-sm ring-1 ring-border/60 transition-colors group-hover:ring-primary/50">
                        <Image
                            src="/favicon_io/android-chrome-192x192.png"
                            alt="Zyene Reviews"
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                            priority
                        />
                    </div>
                </Link>

                <DocSearchTrigger className="inline-flex max-w-sm flex-1 items-center md:flex">
                    <span className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:px-3">
                        <Search className="h-4 w-4 shrink-0" />
                        <span className="hidden md:inline">Search docs…</span>
                        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 md:inline-flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </span>
                </DocSearchTrigger>

                <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
                    <Link href="/docs" className="text-primary transition-colors hover:text-primary">
                        Developer Platform
                    </Link>
                    <Link
                        href={integrationsHref}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        API Integrations
                    </Link>
                    <Link href="/docs/plugins" className="text-muted-foreground transition-colors hover:text-foreground">
                        Plugins
                    </Link>
                    <Link href="/docs/api" className="text-muted-foreground transition-colors hover:text-foreground">
                        API Reference
                    </Link>
                    <Link href="/docs/cookbook" className="text-muted-foreground transition-colors hover:text-foreground">
                        Cookbook
                    </Link>
                    <Link href="/docs/changelog" className="text-muted-foreground transition-colors hover:text-foreground">
                        Changelog
                    </Link>
                </nav>

                <div className="flex-1" />

                <div className="flex shrink-0 items-center gap-4">
                    <Link
                        href="/help"
                        className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                    >
                        Support
                    </Link>
                    <Link
                        href={dashboardHref}
                        className="cta-button hidden items-center justify-center px-4 py-1.5 text-sm sm:inline-flex"
                    >
                        Dashboard
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
