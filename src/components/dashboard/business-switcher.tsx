"use client"

import * as React from "react"
import { ChevronsUpDown, Store, Plus, Check } from "lucide-react"
import { useRouter } from "next/navigation"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { setActiveBusiness } from "@/lib/business-context"
import Link from "next/link"

interface BusinessSwitcherProps {
    businesses: {
        id: string;
        name: string;
        status: string;
    }[];
    activeBusinessId: string | null;
}

export function BusinessSwitcher({ businesses, activeBusinessId }: BusinessSwitcherProps) {
    const router = useRouter()
    const [switching, setSwitching] = React.useState(false)

    const activeBusiness = businesses.find((b) => b.id === activeBusinessId) || businesses[0]

    const handleSwitch = async (businessId: string) => {
        if (businessId === activeBusinessId) return
        setSwitching(true)
        await setActiveBusiness(businessId)
        router.refresh()
        setSwitching(false)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[220px] justify-between"
                    disabled={switching}
                >
                    <Store className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                        {switching ? "Switching..." : activeBusiness?.name || "Select Business"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px]" align="start">
                <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {businesses.length > 0 ? (
                    businesses.map((biz) => (
                        <DropdownMenuItem
                            key={biz.id}
                            onClick={() => handleSwitch(biz.id)}
                            className="flex items-center justify-between cursor-pointer"
                        >
                            <span className="truncate">{biz.name}</span>
                            {biz.id === activeBusinessId && (
                                <Check className="h-4 w-4 text-blue-600 shrink-0" />
                            )}
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>
                        No businesses yet
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/businesses/add" className="flex items-center gap-2 cursor-pointer">
                        <Plus className="h-4 w-4" />
                        Add a Business
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
