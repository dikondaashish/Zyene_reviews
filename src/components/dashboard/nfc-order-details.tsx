"use client";

import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    NFC_CARD,
    NFC_SHIPPING,
    formatUsdFromCents,
    nfcOrderTotals,
} from "@/lib/nfc/catalog";

const STEPPER_BUTTON_CLASS =
    "flex size-10 items-center justify-center rounded-full text-foreground transition-transform duration-150 ease-out hover:bg-accent active:scale-[0.94] disabled:pointer-events-none disabled:opacity-40";

export function NfcOrderDetails({
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
    const subtotal = nfcOrderTotals(quantity, "standard").subtotalCents;
    const features = [
        `Pre-linked to the ${businessName} review page`,
        "Works on iPhone and Android — nothing to install",
        "Countertop stand for checkout counters, desks, and tables",
    ];

    return (
        <div className="flex h-full flex-col">
            <div className="pr-8">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                        NFC + QR
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                        Ships to US &amp; Canada
                    </span>
                </div>

                <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                    {NFC_CARD.name}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {NFC_CARD.description}
                </p>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                    {formatUsdFromCents(NFC_CARD.unitAmountCents)}
                </span>
                <span className="text-xs text-muted-foreground">each</span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
                Shipping from {formatUsdFromCents(NFC_SHIPPING.standard.amountCents)} ·{" "}
                {NFC_SHIPPING.standard.estimate}
            </p>

            <ul className="mt-3.5 space-y-1.5">
                {features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-[12.5px] leading-snug text-foreground">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto pt-4">
                <div className="flex items-center gap-2.5">
                    <div className="inline-flex items-center rounded-full border border-border bg-background">
                        <button
                            type="button"
                            className={STEPPER_BUTTON_CLASS}
                            aria-label="Decrease quantity"
                            disabled={quantity <= NFC_CARD.minQty}
                            onClick={() => onQuantityChange(quantity - 1)}
                        >
                            <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            className={STEPPER_BUTTON_CLASS}
                            aria-label="Increase quantity"
                            disabled={quantity >= NFC_CARD.maxQty}
                            onClick={() => onQuantityChange(quantity + 1)}
                        >
                            <Plus className="size-3.5" />
                        </button>
                    </div>
                    <Button
                        type="button"
                        className="h-10 flex-1 rounded-full transition-transform duration-150 ease-out active:scale-[0.97]"
                        onClick={onAddToCart}
                    >
                        Add to cart · {formatUsdFromCents(subtotal)}
                    </Button>
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Secure checkout with Stripe. Shipping picked on the next step.
                </p>
            </div>
        </div>
    );
}
