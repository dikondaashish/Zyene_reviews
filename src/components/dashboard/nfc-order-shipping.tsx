"use client";

import { Button } from "@/components/ui/button";
import {
    NFC_CARD,
    NFC_SHIPPING,
    formatUsdFromCents,
    nfcOrderTotals,
    type NfcShippingId,
} from "@/lib/nfc/catalog";

export function NfcOrderShipping({
    quantity,
    shippingId,
    checkingOut,
    onShippingChange,
    onCheckout,
}: {
    quantity: number;
    shippingId: NfcShippingId;
    checkingOut: boolean;
    onShippingChange: (id: NfcShippingId) => void;
    onCheckout: () => void;
}) {
    const totals = nfcOrderTotals(quantity, shippingId);

    return (
        <div className="flex h-full flex-col">
            <fieldset>
                <legend className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Delivery speed
                </legend>
                <div className="mt-2 space-y-2">
                    {(Object.keys(NFC_SHIPPING) as NfcShippingId[]).map((id) => {
                        const option = NFC_SHIPPING[id];
                        const selected = shippingId === id;
                        return (
                            <label
                                key={id}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-150 ${
                                    selected
                                        ? "border-primary bg-primary/5"
                                        : "border-border/70 bg-background hover:border-border"
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <input
                                        type="radio"
                                        name="nfc-shipping"
                                        className="size-4 accent-primary"
                                        checked={selected}
                                        onChange={() => onShippingChange(id)}
                                    />
                                    <span>
                                        <span className="block text-[13px] font-medium text-foreground">
                                            {option.name}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {option.estimate}
                                        </span>
                                    </span>
                                </span>
                                <span className="text-[13px] tabular-nums">
                                    {formatUsdFromCents(option.amountCents)}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            <dl className="mt-4 space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatUsdFromCents(totals.subtotalCents)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="tabular-nums">{formatUsdFromCents(totals.shippingCents)}</dd>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatUsdFromCents(totals.totalCents)}</dd>
                </div>
            </dl>

            <div className="mt-auto pt-4">
                <Button
                    type="button"
                    className="h-10 w-full rounded-full transition-transform duration-150 ease-out active:scale-[0.97]"
                    disabled={checkingOut || quantity < NFC_CARD.minQty}
                    onClick={onCheckout}
                >
                    {checkingOut
                        ? "Redirecting to Stripe…"
                        : `Pay ${formatUsdFromCents(totals.totalCents)} with Stripe`}
                </Button>
            </div>
        </div>
    );
}
