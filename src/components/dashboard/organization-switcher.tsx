"use client"

import * as React from "react"
import { Building2, ChevronsUpDown, Check } from "lucide-react"
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

interface OrganizationSwitcherProps {
    organizations: {
        id: string
        name: string
        defaultBusinessId: string | null
    }[]
    activeOrganizationId: string | null
}

export function OrganizationSwitcher({
    organizations,
    activeOrganizationId,
}: OrganizationSwitcherProps) {
    const router = useRouter()
    const [switching, setSwitching] = React.useState(false)

    const activeOrg =
        organizations.find((org) => org.id === activeOrganizationId) || organizations[0]
    const canSwitch = organizations.length > 1

    const handleSwitch = async (org: OrganizationSwitcherProps["organizations"][number]) => {
        if (org.id === activeOrganizationId || !org.defaultBusinessId) return
        setSwitching(true)
        try {
            await setActiveBusiness(org.defaultBusinessId)
            router.refresh()
        } finally {
            setSwitching(false)
        }
    }

    if (!canSwitch) {
        return (
            <Button
                variant="outline"
                className="pointer-events-none hidden min-w-0 max-w-[min(42vw,11rem)] justify-start sm:flex lg:max-w-[220px]"
                tabIndex={-1}
            >
                <Building2 className="shrink-0 size-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden truncate font-medium sm:inline">
                    {activeOrg?.name || "Organization"}
                </span>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex size-10 shrink-0 justify-center px-2 sm:h-10 sm:w-auto sm:max-w-[11rem] sm:justify-between lg:max-w-[220px]"
                    disabled={switching}
                    aria-label={
                        activeOrg
                            ? `Active organization: ${activeOrg.name}. Open menu to switch.`
                            : "Select an organization. Open menu."
                    }
                >
                    <Building2 className="shrink-0 size-4 sm:mr-2" aria-hidden="true" />
                    <span className="hidden truncate font-medium sm:inline">
                        {switching ? "Switching..." : activeOrg?.name || "Organization"}
                    </span>
                    <ChevronsUpDown className="ml-2 hidden shrink-0 opacity-50 size-4 sm:block" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[min(20rem,calc(100vw-1rem))] min-w-[12rem] sm:w-[220px]"
                align="start"
            >
                <DropdownMenuLabel>Organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => (
                    <DropdownMenuItem
                        key={org.id}
                        onClick={() => handleSwitch(org)}
                        disabled={!org.defaultBusinessId}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <span className="truncate">{org.name}</span>
                        {org.id === activeOrganizationId ? (
                            <Check className="text-primary shrink-0 size-4" />
                        ) : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
