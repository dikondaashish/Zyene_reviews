"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserUser } from "@/lib/auth/stale-session";
import { createClient } from "@/lib/db/supabase/client";
import { getAppDashboardUrl } from "@/config/env";

type MarketingHeaderAuthProps = {
    loginUrl: string;
    signupUrl: string;
    /** desktop = inline nav; mobile = stacked full-width */
    variant?: "desktop" | "mobile";
    onNavigate?: () => void;
};

export function MarketingHeaderAuth({
    loginUrl,
    signupUrl,
    variant = "desktop",
    onNavigate,
}: MarketingHeaderAuthProps) {
    const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();

        const sync = async () => {
            const user = await getBrowserUser(supabase);
            setDashboardUrl(user ? getAppDashboardUrl() : null);
        };

        void sync();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setDashboardUrl(session?.user ? getAppDashboardUrl() : null);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (dashboardUrl) {
        if (variant === "mobile") {
            return (
                <Button className="w-full rounded-md gap-2" asChild>
                    <Link href={dashboardUrl} className="block mt-2 px-2" onClick={onNavigate}>
                        <LayoutDashboard className="size-4" />
                        Dashboard
                    </Link>
                </Button>
            );
        }

        return (
            <Button className="rounded-md px-5 ml-1 gap-2" asChild>
                <Link href={dashboardUrl}>
                    <LayoutDashboard className="size-4" />
                    Dashboard
                </Link>
            </Button>
        );
    }

    if (variant === "mobile") {
        return (
            <>
                <Link
                    href={loginUrl}
                    className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2"
                    onClick={onNavigate}
                >
                    Log In
                </Link>
                <Button className="w-full rounded-md" asChild>
                    <Link href={signupUrl} className="block mt-2 px-2" onClick={onNavigate}>
                        Start Free Trial <ArrowRight className="ml-2 size-4" />
                    </Link>
                </Button>
            </>
        );
    }

    return (
        <>
            <Link href={loginUrl} className="px-3 py-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                Log In
            </Link>
            <Button className="rounded-md px-5 ml-1" asChild>
                <Link href={signupUrl}>
                    Start Free Trial <ArrowRight className="ml-2 size-4" />
                </Link>
            </Button>
        </>
    );
}
