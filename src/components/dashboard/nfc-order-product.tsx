"use client";

import { Minus, Plus } from "lucide-react";
import { NfcOrderMedia } from "@/components/dashboard/nfc-order-media";
import { Button } from "@/components/ui/button";
import { NFC_CARD, formatUsdFromCents, nfcOrderTotals } from "@/lib/nfc/catalog";

export function NfcOrderProduct({
    businessName,
    quantity,
    onQuantityChange,
    onAddToCart,
}: {
    businessName: string;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    onAddToCart: () => void;
}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <NfcOrderMedia />
            <div className="mt-4 min-w-0">
                <p className="text-sm font-semibold text-foreground">{NFC_CARD.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {NFC_CARD.description} We&apos;ll set the review link for {businessName}.
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-foreground tabular-nums">
                    {formatUsdFromCents(nfcOrderTotals(quantity, "standard").subtotalCents)}
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatUsdFromCents(NFC_CARD.unitAmountCents)} each
                    {quantity > 1 ? ` × ${quantity}` : ""}
                </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full border border-border bg-background">
                    <button
                        type="button"
                        className="flex size-9 items-center justify-center rounded-full text-foreground transition-transform duration-150 ease-out active:scale-[0.97]"
                        aria-label="Decrease quantity"
                        onClick={() => onQuantityChange(quantity - 1)}
                    >
                        <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                        {quantity}
                    </span>
                    <button
                        type="button"
                        className="flex size-9 items-center justify-center rounded-full text-foreground transition-transform duration-150 ease-out active:scale-[0.97]"
                        aria-label="Increase quantity"
                        onClick={() => onQuantityChange(quantity + 1)}
                    >
                        <Plus className="size-3.5" />
                    </button>
                </div>
                <Button
                    type="button"
                    className="h-10 rounded-full px-5 transition-transform duration-150 ease-out active:scale-[0.97]"
                    onClick={onAddToCart}
                >
                    Add to cart
                </Button>
            </div>
        </div>
    );
}
