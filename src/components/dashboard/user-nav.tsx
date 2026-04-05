"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/db/supabase/client"
import { useRouter } from "next/navigation"
import { Globe, LogOut, Settings } from "lucide-react"
import { useLanguage, SUPPORTED_LOCALES } from "@/lib/language-context"
import type { AppUserSummary } from "@/types/components"

export function UserNav({ user }: { user: AppUserSummary }) {
    const router = useRouter()
    const supabase = createClient()
    const { locale, setLocale, currentLocaleConfig, dict } = useLanguage()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        // Redirect to login subdomain
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
        window.location.href = `https://auth.${rootDomain}`
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url ?? undefined} alt={user?.email ?? undefined} />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer py-2 px-3">
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{dict.nav.settings}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer py-2 px-3">
                            <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{dict.nav.language}: {currentLocaleConfig.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-56" alignOffset={-5}>
                                {SUPPORTED_LOCALES.map((config) => (
                                    <DropdownMenuItem 
                                        key={config.code}
                                        onClick={() => setLocale(config.code)}
                                        className="cursor-pointer py-2 px-3 flex items-center gap-3"
                                    >
                                        <span className="text-base leading-none">{config.flag}</span>
                                        <span className={locale === config.code ? "font-bold" : ""}>
                                            {config.label}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2 px-3">
                    <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{dict.nav.logout}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
