"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AEO_TEST_PRICE_USD, formatUsd, microUsdToUsd } from "@/lib/billing/aeo-topup-catalog";
import { AddBalanceDialog } from "./add-balance-dialog";
import { useAeoBalance } from "./use-aeo-balance";

/**
 * Prepaid AI-visibility balance, top-right of the header on Google SEO/AEO
 * pages only. Renders nothing while metered billing is off or on other pages.
 */
export function AeoBalanceHeader() {
    const pathname = usePathname();
    const onAeoPage = pathname?.startsWith("/google-seo-aeo") ?? false;
    const { data } = useAeoBalance(onAeoPage);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    if (!onAeoPage || !data?.live) return null;

    const total = microUsdToUsd(data.totalMicroUsd);
    const empty = data.testsRemaining === 0;
    const openDialog = () => {
        setMenuOpen(false);
        setDialogOpen(true);
    };

    return (
        <>
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger
                    data-aeo-balance
                    aria-label={`AI visibility balance ${formatUsd(total)}${empty ? ", tests paused" : ""}`}
                    className={cn(
                        "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-sm sm:gap-2 sm:px-3 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        empty
                            ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
                            : "bg-background text-foreground hover:bg-muted",
                    )}
                >
                    <Wallet className="size-4" aria-hidden />
                    <span className="tabular-nums">{formatUsd(total)}</span>
                    <span className="hidden text-muted-foreground sm:inline">{empty ? "· Add balance" : "balance"}</span>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                    <div className="p-4">
                        <p className="text-sm font-medium text-muted-foreground">AI visibility balance</p>
                        <p className="mt-1 text-3xl font-semibold tabular-nums">{formatUsd(total)}</p>
                        <p className={cn("mt-1 text-sm", empty ? "text-destructive" : "text-muted-foreground")}>
                            {empty
                                ? "Tests are paused until you add balance."
                                : `About ${data.testsRemaining} tests left at ${formatUsd(AEO_TEST_PRICE_USD)} each.`}
                        </p>
                    </div>
                    <dl className="space-y-2 border-t px-4 py-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Plan credit</dt>
                            <dd className="tabular-nums">
                                {formatUsd(microUsdToUsd(data.planMicroUsd))} of{" "}
                                {formatUsd(microUsdToUsd(data.planGrantedMicroUsd))}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Paid balance</dt>
                            <dd className="tabular-nums">{formatUsd(microUsdToUsd(data.purchasedMicroUsd))}</dd>
                        </div>
                        <p className="pt-1 text-xs text-muted-foreground">
                            Plan credit resets each billing cycle and is used first. Paid balance never expires.
                        </p>
                    </dl>
                    <div className="border-t p-3">
                        {data.canTopUp ? (
                            <Button className="w-full" onClick={openDialog}>
                                <Plus className="size-4" />
                                Add balance
                            </Button>
                        ) : (
                            <p className="text-center text-xs text-muted-foreground">
                                Ask your organization owner to add balance.
                            </p>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            {data.canTopUp ? <AddBalanceDialog open={dialogOpen} onOpenChange={setDialogOpen} /> : null}
        </>
    );
}
