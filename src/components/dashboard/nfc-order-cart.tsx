"use client";

import { Button } from "@/components/ui/button";
import {
    NFC_CARD,
    NFC_SHIPPING,
    formatUsdFromCents,
    nfcItemLabel,
    nfcOrderTotals,
    type NfcShippingId,
} from "@/lib/nfc/catalog";

export function NfcOrderCart({
    quantity,
    shippingId,
    checkingOut,
    onBack,
    onShippingChange,
    onCheckout,
}: {
    quantity: number;
    shippingId: NfcShippingId;
    checkingOut: boolean;
    onBack: () => void;
    onShippingChange: (id: NfcShippingId) => void;
    onCheckout: () => void;
}) {
    const totals = nfcOrderTotals(quantity, shippingId);

    return (
        <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
                <div>
                    <p className="text-base font-semibold text-foreground">Cart</p>
                    <p className="text-xs text-muted-foreground">
                        {nfcItemLabel(quantity)} · ships to US & Canada
                    </p>
                </div>
                <p className="text-sm font-medium tabular-nums">
                    {formatUsdFromCents(totals.subtotalCents)}
                </p>
            </div>

            <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-muted-foreground">Shipping</legend>
                {(Object.keys(NFC_SHIPPING) as NfcShippingId[]).map((id) => {
                    const option = NFC_SHIPPING[id];
                    const selected = shippingId === id;
                    return (
                        <label
                            key={id}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-[border-color,background-color] duration-150 ${
                                selected
                                    ? "border-primary bg-primary/5"
                                    : "border-border/70 bg-background"
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="nfc-shipping"
                                    className="accent-primary"
                                    checked={selected}
                                    onChange={() => onShippingChange(id)}
                                />
                                <span>
                                    <span className="block text-sm font-medium">{option.name}</span>
                                    <span className="text-xs text-muted-foreground">{option.estimate}</span>
                                </span>
                            </span>
                            <span className="text-sm tabular-nums">
                                {formatUsdFromCents(option.amountCents)}
                            </span>
                        </label>
                    );
                })}
            </fieldset>

            <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <p className="text-sm font-semibold">Total</p>
                <p className="text-base font-semibold tabular-nums">
                    {formatUsdFromCents(totals.totalCents)}
                </p>
            </div>

            <Button
                type="button"
                className="h-11 w-full rounded-full transition-transform duration-150 ease-out active:scale-[0.97]"
                disabled={checkingOut || quantity < NFC_CARD.minQty}
                onClick={onCheckout}
            >
                {checkingOut ? "Redirecting to Stripe…" : "Pay with Stripe"}
            </Button>
            <button
                type="button"
                className="mx-auto block text-xs text-muted-foreground underline-offset-4 hover:underline"
                onClick={onBack}
            >
                Back to stand
            </button>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                Card details are entered on Stripe. Address is collected at checkout.
            </p>
        </div>
    );
}
