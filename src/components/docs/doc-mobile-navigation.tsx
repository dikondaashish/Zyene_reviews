"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DOC_NAV_GROUPS } from "@/lib/docs/doc-nav";

export function DocMobileNavigation() {
    const pathname = usePathname();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Browse documentation">
                    <Menu aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[70dvh] w-72 overflow-y-auto">
                {DOC_NAV_GROUPS.map((group) => (
                    <div key={group.title}>
                        <DropdownMenuLabel>{group.title}</DropdownMenuLabel>
                        {group.items.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                                <Link
                                    href={item.href}
                                    aria-current={pathname === item.href ? "page" : undefined}
                                    className={pathname === item.href ? "bg-accent font-semibold text-primary" : ""}
                                >
                                    {item.title}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
