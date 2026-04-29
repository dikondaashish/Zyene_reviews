"use client";

import { Menu, X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

export function MobileSidebarFAB() {
    const { openMobile, toggleSidebar } = useSidebar();
    const isMobile = !useMediaQuery("(min-width: 768px)");

    if (!isMobile) {
        return null;
    }

    return (
        <Button
            variant="default"
            size="lg"
            onClick={() => toggleSidebar()}
            className={`
                fixed z-40 rounded-full
                bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))]
                right-[max(1.25rem,env(safe-area-inset-right,0px))]
                bg-primary hover:bg-primary/90 text-primary-foreground
                h-14 w-14 p-0
                transition-all duration-200
            `}
            aria-label={openMobile ? "Close sidebar" : "Open sidebar"}
        >
            {openMobile ? (
                <X className="h-6 w-6" />
            ) : (
                <Menu className="h-6 w-6" />
            )}
        </Button>
    );
}
