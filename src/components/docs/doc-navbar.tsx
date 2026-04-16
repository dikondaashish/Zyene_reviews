"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

export function DocNavbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="flex h-16 items-center px-4 md:px-8 max-w-[1400px] mx-auto gap-4 md:gap-8 min-w-0">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded shadow-sm ring-1 ring-border/60 group-hover:ring-primary/50 transition-colors">
                        <Image
                            src="/Main%20logo.png"
                            alt="Zyene Reviews"
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                            priority
                        />
                    </div>
                </Link>

                {/* Search / Mock Command K */}
                <div className="hidden md:flex items-center flex-1 max-w-sm">
                    <button className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
                        <Search className="h-4 w-4" />
                        <span>Search docs...</span>
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </button>
                </div>

                {/* Main Links */}
                <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                    <Link href="/docs" className="text-primary hover:text-primary transition-colors">
                        Developer Platform
                    </Link>
                    <Link href="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">
                        API Integrations
                    </Link>
                    <Link href="/plugins" className="text-muted-foreground hover:text-foreground transition-colors">
                        Plugins
                    </Link>
                    <Link href="/docs/api" className="text-muted-foreground hover:text-foreground transition-colors">
                        API Reference
                    </Link>
                    <Link href="/docs/cookbook" className="text-muted-foreground hover:text-foreground transition-colors">
                        Cookbook
                    </Link>
                    <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                        Changelog
                    </Link>
                </nav>

                <div className="flex-1" />

                {/* Action Items */}
                <div className="flex items-center gap-4 shrink-0">
                    <Link href="/support" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Support
                    </Link>
                    <Link href="/dashboard" className="cta-button py-1.5 px-4 text-sm hidden sm:inline-flex items-center justify-center">
                        Dashboard
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
