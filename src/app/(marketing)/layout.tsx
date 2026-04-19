"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CookieBanner } from "@/components/ui/cookie-banner";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Warm main navigation routes so first click feels instant.
        ["/docs", "/login", "/signup", "/about", "/contact", "/help", "/privacy", "/terms", "/data-retention"].forEach(
            (href) => router.prefetch(href)
        );
    }, [router]);
    return (
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full min-w-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <div className="container mx-auto flex h-16 min-w-0 max-w-full items-center justify-between gap-2 px-4 sm:px-8 max-w-7xl">
                    <Link
                        href="/"
                        className="flex min-w-0 shrink-0 items-center gap-2 group"
                    >
                        <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded shadow-sm ring-1 ring-border/60 group-hover:ring-primary/50 transition-colors">
                            <Image
                                src="/Main%20logo.png"
                                alt="Zyene Reviews logo"
                                width={36}
                                height={36}
                                className="h-full w-full object-cover"
                                priority
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl text-foreground leading-none tracking-tight">
                                <span className="text-primary">Zyene</span> Reviews
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground tracking-[0.15em] uppercase leading-none mt-1">
                                Grow local to global
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="#features" className="hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#pricing" className="hover:text-primary transition-colors">
                            Pricing
                        </Link>
                        <Link href="/docs" className="hover:text-primary transition-colors">
                            Docs
                        </Link>
                        <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/login" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`} className="hover:text-primary transition-colors">
                            Log In
                        </Link>
                        <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                            <Button className="rounded-md px-6">
                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="sr-only">Toggle menu</span>
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                            >
                                <line x1="4" x2="20" y1="12" y2="12" />
                                <line x1="4" x2="20" y1="6" y2="6" />
                                <line x1="4" x2="20" y1="18" y2="18" />
                            </svg>
                        )}
                    </Button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
                        <Link href="#features" className="block text-sm font-medium text-muted-foreground hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                        <Link href="#pricing" className="block text-sm font-medium text-muted-foreground hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                        <Link href="/docs" className="block text-sm font-medium text-muted-foreground hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>Docs</Link>
                        <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/login" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`} className="block text-sm font-medium text-muted-foreground hover:text-primary py-2">
                            Log In
                        </Link>
                        <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                            <Button className="w-full rounded-md">
                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                )}
            </header>

            <main className="min-w-0 flex-1">
                {children}
            </main>
            <CookieBanner />

            <footer className="mt-auto border-t border-border/70 bg-canvas">
                <div className="container mx-auto flex max-w-7xl flex-row flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-9 sm:px-8">
                    <p className="text-left text-[13px] font-normal leading-normal text-muted-foreground">
                        © {new Date().getFullYear()} Zyene, Inc. · Local to Global
                    </p>
                    <nav
                        className="flex flex-wrap items-center justify-end gap-x-8 gap-y-1 text-[13px] font-normal leading-normal text-muted-foreground"
                        aria-label="Legal and privacy"
                    >
                        <Link
                            href="/terms"
                            className="text-muted-foreground no-underline transition-colors hover:text-foreground"
                        >
                            Legal
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-muted-foreground no-underline transition-colors hover:text-foreground"
                        >
                            Privacy
                        </Link>
                        <button
                            type="button"
                            className="cursor-pointer bg-transparent p-0 text-[13px] font-normal leading-normal text-muted-foreground no-underline transition-colors hover:text-foreground"
                            onClick={() => {
                                const w = window as Window & { openCookiePreferences?: () => void };
                                if (typeof w.openCookiePreferences === "function") {
                                    w.openCookiePreferences();
                                } else {
                                    window.dispatchEvent(new Event("zyene:open-cookie-preferences"));
                                }
                            }}
                        >
                            Manage cookies
                        </button>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
