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
import { setActiveBusiness } from "@/lib/auth/business-context"
import Link from "next/link"
import { BUSINESS_LIMIT_UPGRADE_BILLING_HREF } from "@/lib/billing/business-limit-upgrade-href"

interface BusinessSwitcherProps {
    businesses: {
        id: string;
        name: string;
        status: string;
    }[];
    activeBusinessId: string | null;
    maxBusinesses?: number;
}

export function BusinessSwitcher({ businesses, activeBusinessId, maxBusinesses = 1 }: BusinessSwitcherProps) {
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
                    className="min-w-0 flex-1 justify-between max-lg:max-w-[min(calc(100vw-10rem),240px)] sm:flex-none sm:w-[220px] lg:w-[220px] lg:max-w-[220px]"
                    disabled={switching}
                    aria-label={
                        activeBusiness
                            ? `Active business: ${activeBusiness.name}. Open menu to switch.`
                            : "Select a business. Open menu."
                    }
                >
                    <Store className="mr-2 shrink-0 size-4" />
                    <span className="truncate">
                        {switching ? "Switching..." : activeBusiness?.name || "Select Business"}
                    </span>
                    <ChevronsUpDown className="ml-2 shrink-0 opacity-50 size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[min(20rem,calc(100vw-1rem))] min-w-[12rem] sm:w-[220px]"
                align="start"
            >
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
                                <Check className="text-primary shrink-0 size-4" />
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
                    {businesses.length >= maxBusinesses ? (
                        <Link 
                            href={BUSINESS_LIMIT_UPGRADE_BILLING_HREF} 
                            className="flex items-center justify-between w-full cursor-pointer text-primary font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <Plus className="size-4" />
                                Add a Business
                            </div>
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">Upgrade</span>
                        </Link>
                    ) : (
                        <Link href="/businesses/add" className="flex items-center gap-2 cursor-pointer">
                            <Plus className="size-4" />
                            Add a Business
                        </Link>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
