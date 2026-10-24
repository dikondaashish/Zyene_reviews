"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/db/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/** Who is signed in, and a way out, so nobody is stuck in setup on the wrong account. */
export function OnboardingAccountMenu({ email }: { email: string }) {
    const signOut = async () => {
        await createClient().auth.signOut();
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        window.location.href = `https://auth.${rootDomain}`;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={`Account: ${email}`}
                    className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {email.charAt(0).toUpperCase() || "U"}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                    <span className="block text-xs text-muted-foreground">Signed in as</span>
                    <span className="block truncate text-sm font-medium text-foreground">{email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()}>
                    <LogOut className="size-4" aria-hidden />Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
