import Link from "next/link";

import { Progress } from "@/components/ui/progress";

export function TeamManagementPanelSeatsBanner({
    seatsUsed,
    maxMembers,
    seatPercent,
}: {
    seatsUsed: number;
    maxMembers: number;
    seatPercent: number;
}) {
    if (maxMembers === -1) {
        return (
            <div className="rounded-xl border border-border/80 bg-card px-4 py-3">
                <p className="text-base font-semibold">Unlimited seats on your Enterprise plan</p>
            </div>
        );
    }

    if (maxMembers <= 0) return null;

    return (
        <div className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-base font-semibold">
                    {seatsUsed} / {maxMembers} seats used
                </p>
                <Progress value={seatPercent} className="h-2.5 flex-1 bg-muted" />
                {seatsUsed >= maxMembers ? (
                    <Link
                        href="/settings/billing"
                        className="text-sm font-medium text-primary underline underline-offset-2 hover:brightness-90"
                    >
                        Need more? Upgrade plan
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
