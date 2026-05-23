"use client";

import Image from "next/image";
import Link from "next/link";
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
                            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-border/60">
                                <Image
                                    src="/Main%20logo.png"
                                    alt="Zyene Reviews"
                                    width={36}
                                    height={36}
                                    className="h-full w-full object-cover"
                                    priority
                                />
                            </div>
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
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 md:hidden"
                aria-label="Close sidebar"
                onClick={() => setOpenMobile(false)}
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}
