"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DashboardTourProvider } from "@/components/tours/DashboardTourProvider";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    header: React.ReactNode;
}

export function DashboardLayoutClient({
    children,
    header,
}: DashboardLayoutClientProps) {
    const { setOpen } = useSidebar();

    // Desktop: always open (≥1024px)
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    // Tablet: collapse to icon (768px-1023px)
    const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
    // Mobile: hidden (< 768px)
    const isMobile = !useMediaQuery("(min-width: 768px)");

    // Effect: auto-manage sidebar state
    useEffect(() => {
        if (isDesktop) {
            setOpen(true);
        } else if (isTablet) {
            setOpen(false); // Collapsed to icon
        } else if (isMobile) {
            setOpen(false); // Hidden
        }
    }, [isDesktop, isTablet, isMobile, setOpen]);

    const handleManageCookies = () => {
        const w = window as Window & {
            OneTrust?: { ToggleInfoDisplay?: () => void };
            Cookiebot?: { renew?: () => void };
            UC_UI?: { showSecondLayer?: () => void };
            openCookiePreferences?: () => void;
        };

        if (typeof w.OneTrust?.ToggleInfoDisplay === "function") {
            w.OneTrust.ToggleInfoDisplay();
            return;
        }
        if (typeof w.Cookiebot?.renew === "function") {
            w.Cookiebot.renew();
            return;
        }
        if (typeof w.UC_UI?.showSecondLayer === "function") {
            w.UC_UI.showSecondLayer();
            return;
        }
        if (typeof w.openCookiePreferences === "function") {
            w.openCookiePreferences();
            return;
        }
        window.dispatchEvent(new Event("zyene:open-cookie-preferences"));

        // Final fallback: open privacy policy section with cookie info
        setTimeout(() => {
            if (typeof w.openCookiePreferences !== "function") {
                window.location.href = "/privacy";
            }
        }, 100);
    };

    return (
        <>
            <DashboardTourProvider />
            <header className="flex h-16 min-w-0 shrink-0 items-center gap-2 border-b border-border/70 bg-card px-4">
                {/* Sidebar trigger on tablet and mobile (FAB also toggles the same sheet) */}
                {(isTablet || isMobile) && (
                    <>
                        <SidebarTrigger className="-ml-1 shrink-0 lg:hidden" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4 shrink-0 lg:hidden"
                        />
                    </>
                )}

                {isDesktop && (
                    <div className="hidden lg:flex items-center mr-2">
                        <Separator orientation="vertical" className="h-4" />
                    </div>
                )}

                {header}
            </header>

            <main className="flex min-w-0 flex-1 flex-col gap-4 bg-canvas p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
                {children}
            </main>
            <footer className="border-t border-border/70 bg-card px-4 py-4">
                <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} Zyene Inc.</span>
                    <Link href="/terms" className="transition-colors hover:text-primary">
                        Legal
                    </Link>
                    <Link href="/privacy" className="transition-colors hover:text-primary">
                        Privacy
                    </Link>
                    <button
                        type="button"
                        onClick={handleManageCookies}
                        className="transition-colors hover:text-primary"
                    >
                        Manage cookies
                    </button>
                </div>
            </footer>
        </>
    );
}
