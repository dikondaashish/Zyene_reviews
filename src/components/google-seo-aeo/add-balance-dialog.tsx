"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { parseBillingCheckoutResponse } from "@/lib/billing/parse-checkout-response";
import {
    AEO_TEST_PRICE_USD,
    AEO_TOPUP_MAX_USD,
    AEO_TOPUP_MIN_USD,
    AEO_TOPUP_PACKS_USD,
    formatUsd,
    isValidTopupAmount,
    testsForAmount,
} from "@/lib/billing/aeo-topup-catalog";

type AddBalanceDialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

export function AddBalanceDialog({ open, onOpenChange }: AddBalanceDialogProps) {
    const [selected, setSelected] = useState<number | "custom">(AEO_TOPUP_PACKS_USD[1]);
    const [custom, setCustom] = useState("");
    const [pending, setPending] = useState(false);

    const amount = selected === "custom" ? Number(custom) : selected;
    const valid = isValidTopupAmount(amount);

    async function pay() {
        if (!valid) return;
        setPending(true);
        try {
            const res = await fetch("/api/aeo/balance/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amountUsd: amount }),
            });
            const parsed = parseBillingCheckoutResponse(await res.json().catch(() => null));
            if (!parsed.ok || !parsed.payload?.url) throw new Error(parsed.error || "Unable to start checkout");
            window.location.assign(parsed.payload.url);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Unable to start checkout");
            setPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add balance</DialogTitle>
                    <DialogDescription>
                        Each test is one AI answer and costs {formatUsd(AEO_TEST_PRICE_USD)}. Paid balance never expires.
                    </DialogDescription>
                </DialogHeader>

                <div role="radiogroup" aria-label="Amount" className="grid grid-cols-3 gap-2">
                    {AEO_TOPUP_PACKS_USD.map((pack) => (
                        <button
                            key={pack}
                            type="button"
                            role="radio"
                            aria-checked={selected === pack}
                            onClick={() => setSelected(pack)}
                            className={cn(
                                "rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                selected === pack ? "border-primary bg-primary/5" : "hover:bg-muted/60",
                            )}
                        >
                            <span className="block text-lg font-semibold tabular-nums">{formatUsd(pack)}</span>
                            <span className="text-xs text-muted-foreground">{testsForAmount(pack)} tests</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="aeo-topup-custom">Or enter an amount</Label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                            $
                        </span>
                        <Input
                            id="aeo-topup-custom"
                            inputMode="numeric"
                            placeholder={`${AEO_TOPUP_MIN_USD}–${AEO_TOPUP_MAX_USD}`}
                            className="pl-7"
                            value={custom}
                            onFocus={() => setSelected("custom")}
                            onChange={(e) => {
                                setSelected("custom");
                                setCustom(e.target.value.replace(/[^0-9]/g, "").slice(0, 3));
                            }}
                            aria-invalid={selected === "custom" && custom !== "" && !valid}
                        />
                    </div>
                    {selected === "custom" && custom !== "" && !valid ? (
                        <p className="text-xs text-destructive">
                            Enter a whole amount from {formatUsd(AEO_TOPUP_MIN_USD)} to {formatUsd(AEO_TOPUP_MAX_USD)}.
                        </p>
                    ) : null}
                </div>

                <DialogFooter className="items-center gap-3 sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {valid ? `${formatUsd(amount)} · about ${testsForAmount(amount)} tests` : "Choose an amount"}
                    </p>
                    <Button onClick={pay} disabled={!valid || pending}>
                        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                        {pending ? "Opening checkout…" : valid ? `Pay ${formatUsd(amount)}` : "Pay"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
