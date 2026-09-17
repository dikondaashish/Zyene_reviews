import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncButton } from "@/components/dashboard/sync-button";
import type { DashboardViewProps } from "./types";

type Props = Pick<DashboardViewProps, "user" | "dict" | "business">;

export function DashboardViewHeader({ user, dict, business }: Props) {
    return (
        <div className="mb-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                    Welcome back,{" "}
                    {user.user_metadata?.full_name ||
                        user.user_metadata?.first_name ||
                        user.email?.split("@")[0] ||
                        "there"}
                </p>
                <h1
                    className="break-words pb-1 font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl"
                >
                    {business.name || dict.dashboard.title}
                </h1>
            </div>
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
                <Link href="/requests" className="min-w-0">
                    <Button
                        className="min-h-11 w-full gap-2 rounded-lg px-4 text-sm font-semibold lg:w-auto"
                    >
                        <Send className="shrink-0 size-3.5" />
                        <span>Request review</span>
                    </Button>
                </Link>
                <SyncButton
                    businessId={business.id}
                    variant="outline"
                    syncShortLabel="Sync"
                    className="min-h-11 gap-2 rounded-lg border-border/60 bg-background px-4 font-medium text-[13px] text-foreground hover:bg-muted"
                />
            </div>
        </div>
    );
}
