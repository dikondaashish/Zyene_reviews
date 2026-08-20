import { UserNav } from "@/components/dashboard/user-nav"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"
import { BusinessSwitcher } from "@/components/dashboard/business-switcher"
import { OrganizationSwitcher } from "@/components/dashboard/organization-switcher"
import type { User } from "@supabase/supabase-js"
import type {
    BusinessContextBusiness,
    BusinessContextOrganization,
} from "@/types/business-context"

type DashboardHeaderControlsProps = {
    user: User
    organization: BusinessContextOrganization | null
    organizations: BusinessContextOrganization[]
    businesses: BusinessContextBusiness[]
    allBusinesses: BusinessContextBusiness[]
    activeBusinessId: string | null
}

function defaultBusinessIdForOrg(
    orgId: string,
    allBusinesses: BusinessContextBusiness[]
): string | null {
    const match = allBusinesses.find(
        (b) => String((b as { organization_id?: string }).organization_id ?? "") === orgId
    )
    return match?.id ?? null
}

export function DashboardHeaderControls({
    user,
    organization,
    organizations,
    businesses,
    allBusinesses,
    activeBusinessId,
}: DashboardHeaderControlsProps) {
    const orgSwitcherItems = organizations.map((org) => ({
        id: org.id,
        name: org.name || "Organization",
        defaultBusinessId: defaultBusinessIdForOrg(org.id, allBusinesses),
    }))

    return (
        <div className="flex flex-1 items-center justify-between gap-2 min-w-0 lg:gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex min-w-0 flex-1 items-end gap-1.5 sm:gap-2 lg:gap-2">
                    <div className="hidden min-w-0 flex-col gap-1 sm:flex">
                        <span className="px-0.5 text-[11px] font-medium text-muted-foreground">
                            Organization
                        </span>
                        <OrganizationSwitcher
                            organizations={orgSwitcherItems}
                            activeOrganizationId={organization?.id ?? null}
                        />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
                        <span className="px-0.5 text-[11px] font-medium text-muted-foreground">
                            Business
                        </span>
                        <BusinessSwitcher
                            businesses={businesses.map((b) => ({
                                id: b.id,
                                name: b.name || "Business",
                                status: b.status || "active",
                            }))}
                            activeBusinessId={activeBusinessId}
                            maxBusinesses={organization?.max_businesses || 1}
                        />
                    </div>
                </div>
                {businesses.length === 0 ? (
                    <p className="hidden px-0.5 text-[11px] text-primary md:block">
                        Add a business to use reviews, integrations, and team features.
                    </p>
                ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle />
                <UserNav user={user} />
            </div>
        </div>
    )
}
