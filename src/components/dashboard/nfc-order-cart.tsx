"use client";

import Image from "next/image";
import { ChevronLeft, Lock } from "lucide-react";
import { NfcOrderShipping } from "@/components/dashboard/nfc-order-shipping";
import {
    NFC_CARD,
    formatUsdFromCents,
    nfcItemLabel,
    nfcOrderTotals,
    type NfcShippingId,
} from "@/lib/nfc/catalog";

export function NfcOrderCart({
    businessName,
    quantity,
    shippingId,
    checkingOut,
    onBack,
    onShippingChange,
    onCheckout,
}: {
    businessName: string;
    quantity: number;
    shippingId: NfcShippingId;
    checkingOut: boolean;
    onBack: () => void;
    onShippingChange: (id: NfcShippingId) => void;
    onCheckout: () => void;
}) {
    const subtotal = nfcOrderTotals(quantity, shippingId).subtotalCents;

    return (
        <div className="flex h-full flex-col">
            <div className="grid flex-1 sm:grid-cols-[1.05fr_1fr]">
                <div className="border-b border-border/60 bg-secondary/40 p-4 sm:border-r sm:border-b-0">
                    <button
                        type="button"
                        className="-ml-1 inline-flex items-center gap-1 rounded-full px-1 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        onClick={onBack}
                    >
                        <ChevronLeft className="size-3.5" aria-hidden />
                        Back to stand
                    </button>

                    <p className="mt-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Your order
                    </p>

                    <div className="mt-2 flex gap-3 rounded-xl border border-border/60 bg-background p-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/60">
                            <Image
                                src={NFC_CARD.imageSrc}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-foreground">
                                {NFC_CARD.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {nfcItemLabel(quantity)} ·{" "}
                                {formatUsdFromCents(NFC_CARD.unitAmountCents)} each
                            </p>
                            <p className="mt-1 text-[13px] font-medium tabular-nums">
                                {formatUsdFromCents(subtotal)}
                            </p>
                        </div>
                    </div>

                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                        Linked to the {businessName} review page before it ships. Delivers to the US
                        and Canada.
                    </p>
                </div>

                <div className="p-4 sm:p-5">
                    <NfcOrderShipping
                        quantity={quantity}
                        shippingId={shippingId}
                        checkingOut={checkingOut}
                        onShippingChange={onShippingChange}
                        onCheckout={onCheckout}
                    />
                </div>
            </div>

            <p className="flex items-center justify-center gap-1.5 border-t border-border/60 bg-secondary/30 px-4 py-3 text-[11px] text-muted-foreground">
                <Lock className="size-3" aria-hidden />
                Card details and shipping address are collected on Stripe&apos;s secure checkout.
            </p>
        </div>
    );
}
