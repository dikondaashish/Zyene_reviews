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
            <div className="grid flex-1 sm:grid-cols-2">
                <div className="border-b border-border/60 bg-secondary/40 p-5 sm:border-r sm:border-b-0 sm:p-6">
                    <NfcOrderMedia />
                </div>
                <div className="p-5 sm:p-6">
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
