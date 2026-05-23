"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MARKETING_PREFETCH_HREFS } from "./marketing-layout-nav-data";
import { MarketingLayoutHeaderBrand } from "./marketing-layout-header-brand";
import { MarketingLayoutDesktopNav } from "./marketing-layout-desktop-nav";
import { MarketingLayoutMobileNav } from "./marketing-layout-mobile-nav";

export function MarketingLayoutHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [productOpen, setProductOpen] = useState(false);
    const [solutionsOpen, setSolutionsOpen] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const productRef = useRef<HTMLDivElement>(null);
    const solutionsRef = useRef<HTMLDivElement>(null);
    const resourcesRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        MARKETING_PREFETCH_HREFS.forEach((href) => router.prefetch(href));
    }, [router]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (productRef.current && !productRef.current.contains(e.target as Node)) {
                setProductOpen(false);
            }
            if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) {
                setSolutionsOpen(false);
            }
            if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
                setResourcesOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const isLocal = rootDomain.includes("localhost");
    const loginUrl = isLocal ? "/login" : `https://auth.${rootDomain}/login`;
    const signupUrl = isLocal ? "/signup" : `https://auth.${rootDomain}/signup`;

    const closeMobile = () => setMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full min-w-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="container mx-auto flex h-16 min-w-0 max-w-7xl items-center justify-between gap-2 px-4 sm:px-8">
                <MarketingLayoutHeaderBrand />
                <MarketingLayoutDesktopNav
                    loginUrl={loginUrl}
                    signupUrl={signupUrl}
                    productOpen={productOpen}
                    solutionsOpen={solutionsOpen}
                    resourcesOpen={resourcesOpen}
                    productRef={productRef}
                    solutionsRef={solutionsRef}
                    resourcesRef={resourcesRef}
                    onProductToggle={() => setProductOpen(!productOpen)}
                    onSolutionsToggle={() => setSolutionsOpen(!solutionsOpen)}
                    onResourcesToggle={() => setResourcesOpen(!resourcesOpen)}
                    onProductOpen={() => {
                        setProductOpen(true);
                        setSolutionsOpen(false);
                    }}
                    onSolutionsOpen={() => {
                        setSolutionsOpen(true);
                        setProductOpen(false);
                    }}
                    onResourcesOpen={() => {
                        setResourcesOpen(true);
                        setProductOpen(false);
                        setSolutionsOpen(false);
                    }}
                    onProductClose={() => setProductOpen(false)}
                    onSolutionsClose={() => setSolutionsOpen(false)}
                    onResourcesClose={() => setResourcesOpen(false)}
                />
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
            {mobileMenuOpen ? (
                <MarketingLayoutMobileNav
                    loginUrl={loginUrl}
                    signupUrl={signupUrl}
                    onNavigate={closeMobile}
                />
            ) : null}
        </header>
    );
}
