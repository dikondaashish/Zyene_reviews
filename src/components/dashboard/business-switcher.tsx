"use client"

import * as React from "react"
import { ChevronsUpDown, Store, PlusCircle, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation"
import { setActiveBusiness } from "@/app/actions/business"

export function BusinessSwitcher({ 
    organizations, 
    activeBusinessId 
}: { 
    organizations: any[],
    activeBusinessId?: string 
}) {
    const router = useRouter()
    console.log("BusinessSwitcher activeBusinessId:", activeBusinessId);

    // Find active business or default to first one
    const activeBusiness = organizations
        ?.flatMap(org => org.businesses)
        .find(b => b.id === activeBusinessId) 
        || organizations?.[0]?.businesses?.[0]
        || { name: "Select Business" };
    
    // Fallback: if no active business found (e.g. org owner with no businesses), show Org Name
    const displayName = activeBusiness.name || organizations?.[0]?.name || "My Business";

    const handleSwitch = async (businessId: string) => {
        await setActiveBusiness(businessId);
        router.refresh();
    }

    const supabase = createClient()
    
    // Use window.location logic for redirect URL similar to onboarding page
    const handleAddBusiness = async () => {
        try {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
            const redirectTo = rootDomain.includes("localhost")
                ? `http://${rootDomain}/api/auth/callback/connect-business`
                : `http://auth.${rootDomain}/api/auth/callback/connect-business`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'openid email profile https://www.googleapis.com/auth/business.manage',
                    redirectTo,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })
            if (error) throw error
        } catch (error: any) {
            console.error("Failed to start add business flow:", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[200px] justify-between"
                >
                    <Store className="mr-2 h-4 w-4" />
                    <span className="truncate">{displayName}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px]">
                <DropdownMenuLabel>
                    Switch Location
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {organizations?.map((org) => (
                    <React.Fragment key={org.id}>
                        {/* Organization Level (All Locations) */}
                        <DropdownMenuItem className="font-semibold cursor-default">
                            <Store className="mr-2 h-4 w-4" />
                            {org.name} (HQ)
                        </DropdownMenuItem>
                        
                        {/* Businesses (Locations) */}
                        {org.businesses?.length > 0 && (
                            <div className="pl-2">
                                {org.businesses.map((business: any) => (
                                    <DropdownMenuItem 
                                        key={business.id} 
                                        className="cursor-pointer flex justify-between"
                                        onClick={() => handleSwitch(business.id)}
                                    >
                                        <span className="truncate">{business.name}</span>
                                        {activeBusinessId === business.id && (
                                            <Check className="h-4 w-4 ml-2" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        )}
                        <DropdownMenuSeparator />
                    </React.Fragment>
                ))}

                <DropdownMenuItem onClick={handleAddBusiness} className="cursor-pointer bg-muted/50">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Business
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
