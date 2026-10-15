import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { SyncButton } from "@/components/dashboard/sync-button";
import type { DashboardViewProps } from "./types";

type Props = Pick<DashboardViewProps, "user" | "dict" | "business">;

export function DashboardViewHeader({ user, dict, business }: Props) {
    return (
        <PageHeader
            eyebrow={<>
                Welcome back,{" "}
                {user.user_metadata?.full_name ||
                    user.user_metadata?.first_name ||
                    user.email?.split("@")[0] ||
                    "there"}
            </>}
            title={business.name || dict.dashboard.title}
            titleClassName="font-display"
            actionsClassName="w-full sm:w-auto sm:justify-end"
            actions={<>
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
            </>}
        />
    );
}
