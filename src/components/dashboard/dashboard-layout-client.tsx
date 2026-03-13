"use client";

import React, { useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    header: React.ReactNode;
}

export function DashboardLayoutClient({
    children,
    header,
}: DashboardLayoutClientProps) {
    const { open, setOpen } = useSidebar();

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

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                {/* Sidebar trigger only on tablet */}
                {isTablet && (
                    <>
                        <SidebarTrigger className="-ml-1 md:flex lg:hidden" />
                        <Separator orientation="vertical" className="mr-2 h-4 md:flex lg:hidden" />
                    </>
                )}

                {/* Hide sidebar trigger on desktop and mobile (mobile uses FAB) */}
                {isDesktop && (
                    <div className="hidden lg:flex items-center mr-2">
                        <Separator orientation="vertical" className="h-4" />
                    </div>
                )}

                {header}
            </header>

            <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-slate-50 dark:bg-background min-h-[calc(100vh-4rem)]">
                {children}
            </main>
        </>
    );
}
