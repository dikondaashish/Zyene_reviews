"use client"

import * as React from "react"
import { ChevronsUpDown, Store } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function BusinessSwitcher({ organizations }: { organizations: any[] }) {
    // Placeholder logic - pick first org or default
    const activeOrg = organizations?.[0] || { name: "My Business" }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[200px] justify-between"
                >
                    <Store className="mr-2 h-4 w-4" />
                    <span className="truncate">{activeOrg.name}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
                <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations?.length > 0 ? (
                    organizations.map((org) => (
                        <DropdownMenuItem key={org.id}>
                            {org.name}
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>
                        No organizations found
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    Create Business
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
