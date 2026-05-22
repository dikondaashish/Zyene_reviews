"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, ChevronDown, Zap, GitBranch, Sparkles, BarChart3, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CookieBanner } from "@/components/ui/cookie-banner";

const PUBLIC_STATUS_URL = "https://status.zyenereviews.com/";

const PRODUCT_LINKS = [
    { href: "/features", label: "Features", icon: Sparkles, desc: "Everything Zyene can do for your business" },
    { href: "/how-it-works", label: "How It Works", icon: GitBranch, desc: "4 steps to more 5-star reviews" },
    { href: "/integrations", label: "Integrations", icon: Zap, desc: "Google, Zapier, Square, and more" },
    { href: "/pricing", label: "Pricing", icon: BarChart3, desc: "Plans from $29.99/mo — no contracts" },
];

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [productOpen, setProductOpen] = useState(false);
    const productRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        [
            "/docs", "/login", "/signup", "/about", "/contact", "/help",
            "/privacy", "/terms", "/data-retention",
            "/pricing", "/features", "/how-it-works", "/integrations",
        ].forEach((href) => router.prefetch(href));
    }, [router]);

    // Close product dropdown when clicking outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (productRef.current && !productRef.current.contains(e.target as Node)) {
                setProductOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const isLocal = rootDomain.includes("localhost");
    const loginUrl = isLocal ? "/login" : `https://auth.${rootDomain}/login`;
    const signupUrl = isLocal ? "/signup" : `https://auth.${rootDomain}/signup`;

    return (
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full min-w-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <div className="container mx-auto flex h-16 min-w-0 max-w-7xl items-center justify-between gap-2 px-4 sm:px-8">
                    <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 group">
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
                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        {/* Product dropdown */}
                        <div ref={productRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setProductOpen(!productOpen)}
                                onMouseEnter={() => setProductOpen(true)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors ${productOpen ? "text-foreground bg-accent" : ""}`}
                            >
                                Product
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${productOpen ? "rotate-180" : ""}`} />
                            </button>
                            {productOpen && (
                                <div
                                    onMouseLeave={() => setProductOpen(false)}
                                    className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-50"
                                >
                                    {PRODUCT_LINKS.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setProductOpen(false)}
                                                className="flex items-start gap-3 px-4 py-3.5 hover:bg-accent transition-colors group"
                                            >
                                                <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                                                    <Icon className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground text-[13px]">{item.label}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Link href="/docs" className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                            Docs
                        </Link>
                        <Link href="/about" className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                            Contact
                        </Link>

                        <div className="mx-2 h-5 w-px bg-border" />

                        <Link href={loginUrl} className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                            Log In
                        </Link>
                        <Link href={signupUrl}>
                            <Button className="rounded-md px-5 ml-1">
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
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                                <line x1="4" x2="20" y1="12" y2="12" />
                                <line x1="4" x2="20" y1="6" y2="6" />
                                <line x1="4" x2="20" y1="18" y2="18" />
                            </svg>
                        )}
                    </Button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-0.5">
                        <p className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Product</p>
                        {PRODUCT_LINKS.map((item) => (
                            <Link key={item.href} href={item.href} className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2" onClick={() => setMobileMenuOpen(false)}>
                                {item.label}
                            </Link>
                        ))}
                        <div className="pt-1 border-t border-border/50 mt-1" />
                        <Link href="/docs" className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2" onClick={() => setMobileMenuOpen(false)}>Docs</Link>
                        <Link href="/about" className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                        <Link href="/contact" className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                        <div className="pt-1 border-t border-border/50 mt-1">
                            <Link href={loginUrl} className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2" onClick={() => setMobileMenuOpen(false)}>
                                Log In
                            </Link>
                            <Link href={signupUrl} className="block mt-2 px-2" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full rounded-md">
                                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main className="min-w-0 flex-1">
                {children}
            </main>
            <CookieBanner />

            <footer className="mt-auto border-t border-border/70 bg-canvas">
                <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-8">
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                        {/* Brand */}
                        <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-2">
                            <Link href="/" className="inline-flex items-center gap-2 mb-4">
                                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded shadow-sm ring-1 ring-border/60">
                                    <Image src="/Main%20logo.png" alt="Zyene Reviews" width={32} height={32} className="h-full w-full object-cover" />
                                </div>
                                <span className="font-bold text-base text-foreground">
                                    <span className="text-primary">Zyene</span> Reviews
                                </span>
                            </Link>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                                Review management and local SEO for owner-operators — at a fraction of enterprise pricing.
                            </p>
                            <p className="mt-4 text-xs text-muted-foreground/70">
                                © {new Date().getFullYear()} Zyene, Inc. · Local to Global
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Product</h4>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                                <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
                                <li><Link href="/docs" className="hover:text-primary transition-colors">Docs</Link></li>
                                <li><Link href="/docs/api" className="hover:text-primary transition-colors">API</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Company</h4>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                                <li>
                                    <a href={PUBLIC_STATUS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                        Status
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Legal</h4>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
                                <li><Link href="/data-retention" className="hover:text-primary transition-colors">Data Retention</Link></li>
                                <li>
                                    <button
                                        type="button"
                                        className="cursor-pointer bg-transparent p-0 text-sm text-muted-foreground hover:text-primary transition-colors text-left"
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
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
