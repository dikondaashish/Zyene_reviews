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
                <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground sm:text-[11px]">
                    WELCOME BACK,{" "}
                    {user.user_metadata?.full_name?.toUpperCase() ||
                        user.user_metadata?.first_name?.toUpperCase() ||
                        user.email?.split("@")[0].toUpperCase() ||
                        "OWNER"}
                </p>
                <h1
                    className="break-words pb-1 font-serif text-3xl text-foreground lg:text-4xl"
                    style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
                >
                    {business.name || dict.dashboard.title}
                </h1>
            </div>
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
                <Link href="/requests" className="min-w-0">
                    <Button
                        variant="outline"
                        className="h-[38px] w-full gap-2 rounded-full border-border/60 bg-background px-4 font-medium text-[13px] hover:bg-muted lg:w-auto"
                    >
                        <Send className="h-3.5 w-3.5 shrink-0" />
                        <span className="md:hidden">Request</span>
                        <span className="hidden md:inline">Request review</span>
                    </Button>
                </Link>
                <SyncButton
                    businessId={business.id}
                    variant="outline"
                    syncShortLabel="Sync"
                    className="h-[38px] gap-2 rounded-full border-border/60 bg-background px-4 font-medium text-[13px] text-foreground hover:bg-muted"
                />
            </div>
        </div>
    );
}
