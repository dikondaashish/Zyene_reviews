"use client";

import Link from "next/link";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";
import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebarHeader() {
    const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
    const compact = state === "collapsed" && !isMobile;
    const label = isMobile ? "Close sidebar" : compact ? "Expand sidebar" : "Collapse sidebar";
    const Icon = isMobile ? X : compact ? ChevronsRight : ChevronsLeft;

    return (
        <header className="app-sidebar-header">
            <Link href="/dashboard" aria-label="Zyene Reviews home" className="app-sidebar-brand" onClick={() => setOpenMobile(false)}>
                <ZyeneReviewsLogoMark size={28} priority className="shadow-none ring-0" />
                {!compact && <span>Zyene Reviews</span>}
            </Link>
            <button type="button" className="app-sidebar-toggle" aria-label={label} title={label}
                aria-expanded={isMobile || !compact} aria-controls="app-sidebar-navigation"
                onClick={() => isMobile ? setOpenMobile(false) : toggleSidebar()}>
                <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
            </button>
        </header>
    );
}
