"use client";

import Link from "next/link";
import { ZyeneReviewsLogoMark } from "@/components/brand/zyene-reviews-logo-mark";
import { X } from "lucide-react";

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebarHeader() {
    const { setOpenMobile } = useSidebar();

    return (
        <div className="relative gap-3 border-b border-sidebar-border p-4">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                        <Link href="/dashboard">
                            <ZyeneReviewsLogoMark size={36} priority className="shadow-sm" />
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">Zyene Reviews</span>
                                <span className="text-xs">v1.0.0</span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <button
                type="button"
                className="absolute right-3 top-3 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 md:hidden size-8"
                aria-label="Close sidebar"
                onClick={() => setOpenMobile(false)}
            >
                <X className="size-5" />
            </button>
        </div>
    );
}
