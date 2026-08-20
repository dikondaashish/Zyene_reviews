"use client";

import { NfcOrderBenefits } from "@/components/dashboard/nfc-order-benefits";
import { NfcOrderDetails } from "@/components/dashboard/nfc-order-details";
import { NfcOrderMedia } from "@/components/dashboard/nfc-order-media";

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
        <div className="flex h-full flex-col">
            <div className="grid flex-1 sm:grid-cols-[1.05fr_1fr]">
                <div className="border-b border-border/60 bg-secondary/40 p-4 sm:border-r sm:border-b-0">
                    <NfcOrderMedia />
                </div>
                <div className="p-4 sm:p-5">
                    <NfcOrderDetails
                        businessName={businessName}
                        quantity={quantity}
                        onQuantityChange={onQuantityChange}
                        onAddToCart={onAddToCart}
                    />
                </div>
            </div>
            <NfcOrderBenefits />
        </div>
    );
}
