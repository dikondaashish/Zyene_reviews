"use client";

import { Menu, X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

export function MobileSidebarFAB() {
    const { open, setOpen } = useSidebar();
    const isMobile = !useMediaQuery("(min-width: 768px)");

    if (!isMobile) {
        return null;
    }

    return (
        <Button
            variant="default"
            size="lg"
            onClick={() => setOpen(!open)}
            className={`
                fixed bottom-6 right-6 rounded-full shadow-lg
                bg-blue-600 hover:bg-blue-700 text-white
                h-14 w-14 p-0 z-40
                transition-all duration-200
            `}
            aria-label={open ? "Close sidebar" : "Open sidebar"}
        >
            {open ? (
                <X className="h-6 w-6" />
            ) : (
                <Menu className="h-6 w-6" />
            )}
        </Button>
    );
}
