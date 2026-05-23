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
        <DashboardTourProvider>
            <div className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col bg-canvas">
            <header className="flex h-16 min-w-0 shrink-0 items-center gap-2 border-b border-border/70 bg-card px-3 max-lg:gap-1.5 lg:px-4">
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

            <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-x-hidden p-3 sm:p-4 max-md:pb-20 max-lg:pb-[max(1rem,env(safe-area-inset-bottom,0px))] lg:gap-4 lg:p-6 lg:overflow-x-visible lg:pb-6">
                {children}
            </main>
            <footer className="mt-auto shrink-0 flex flex-col gap-3 border-t border-border bg-canvas px-3 py-4 text-[11.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-5 lg:px-6">
                <div className="shrink-0 text-center sm:text-left">
                    © {new Date().getFullYear()} Zyene, Inc. · Local to Global
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
                    <Link href="/terms" className="transition-colors hover:text-foreground">
                        Legal
                    </Link>
                    <Link href="/privacy" className="transition-colors hover:text-foreground">
                        Privacy
                    </Link>
                    <button
                        type="button"
                        onClick={handleManageCookies}
                        className="transition-colors hover:text-foreground"
                    >
                        Manage cookies
                    </button>
                </div>
            </footer>
            </div>
        </DashboardTourProvider>
    );
}
