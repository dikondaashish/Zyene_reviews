"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

import { CookieBanner } from "@/components/ui/cookie-banner";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

            {/* Zapier Black footer band (docs/DESIGN.md) — explicit hex so it stays correct in light + dark theme */}
            <footer className="border-t border-[#36342e] bg-[#201515] py-12 text-[#fffefb]">
                <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
                        <div className="col-span-2 md:col-span-2">
                            <Link href="/" className="font-bold text-lg text-[#fffefb] mb-4 block">
                                <span className="text-primary">Zyene</span> Reviews
                            </Link>
                            <p className="text-sm text-[#c5c0b1] mb-4 max-w-sm">
                                Review management software for local businesses.
                            </p>
                            <p className="text-sm text-[#c5c0b1] mb-4">
                                © {new Date().getFullYear()}{" "}
                                <a
                                    href="https://zyene.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#c5c0b1] hover:text-[#fffefb] transition-colors underline-offset-2 hover:underline"
                                >
                                    Zyene, Inc.
                                </a>{" "}
                                All rights reserved.
                            </p>
                            <div className="max-w-full overflow-hidden">
                                <iframe
                                    src="https://status.zyenereviews.com/badge?theme=light"
                                    width="250"
                                    height="30"
                                    title="Service status"
                                    className="max-w-full"
                                    frameBorder="0"
                                    scrolling="no"
                                    style={{
                                        colorScheme: "normal",
                                        maxWidth: "100%",
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#fffefb] mb-3">Product</h3>
                            <ul className="space-y-2 text-sm text-[#c5c0b1]">
                                <li><Link href="/#features" className="hover:text-[#fffefb]">Features</Link></li>
                                <li><Link href="/#pricing" className="hover:text-[#fffefb]">Pricing</Link></li>
                                <li><Link href="/docs" className="hover:text-[#fffefb]">Docs</Link></li>
                                <li><Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/login" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`} className="hover:text-[#fffefb]">Log In</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#fffefb] mb-3">Resources</h3>
                            <ul className="space-y-2 text-sm text-[#c5c0b1]">
                                <li><Link href="/about" className="hover:text-[#fffefb]">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-[#fffefb]">Contact</Link></li>
                                <li><Link href="/help" className="hover:text-[#fffefb]">Help Center</Link></li>
                                <li><a href="https://status.zyenereviews.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#fffefb]">System Status</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#fffefb] mb-3">Legal</h3>
                            <ul className="space-y-2 text-sm text-[#c5c0b1]">
                                <li><Link href="/privacy" className="hover:text-[#fffefb]">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-[#fffefb]">Terms of Service</Link></li>
                                <li><Link href="/data-retention" className="hover:text-[#fffefb]">Data Retention</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-[#36342e] pt-6">
                        <p className="text-xs text-[#939084] text-center">
                            Zyene Reviews is an independent platform and is not affiliated with, endorsed by, or sponsored by Google LLC.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
