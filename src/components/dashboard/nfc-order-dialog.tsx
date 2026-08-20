"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { NfcOrderCart } from "@/components/dashboard/nfc-order-cart";
import { NfcOrderProduct } from "@/components/dashboard/nfc-order-product";
import { formatUsdFromCents, NFC_CARD, NFC_SHIPPING } from "@/lib/nfc/catalog";
import type { useNfcOrder } from "@/components/dashboard/use-nfc-order";

type Order = ReturnType<typeof useNfcOrder>;

export function NfcOrderDialog({
    businessName,
    order,
}: {
    businessName: string;
    order: Order;
}) {
    return (
        <Dialog open={order.open} onOpenChange={order.setOpen}>
            <DialogContent className="max-w-md gap-5 rounded-2xl sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl tracking-tight">
                        Order an NFC review stand
                    </DialogTitle>
                    <DialogDescription>
                        {formatUsdFromCents(NFC_CARD.unitAmountCents)} plus shipping from{" "}
                        {formatUsdFromCents(NFC_SHIPPING.standard.amountCents)}. NFC tap and QR
                        stand, set up for this location.
                    </DialogDescription>
                </DialogHeader>

                <NfcOrderProduct
                    businessName={businessName}
                    quantity={order.quantity}
                    onQuantityChange={order.setQuantity}
                    onAddToCart={order.addToCart}
                />

                {order.inCart ? (
                    <NfcOrderCart
                        quantity={order.quantity}
                        shippingId={order.shippingId}
                        checkingOut={order.checkingOut}
                        onShippingChange={order.setShippingId}
                        onCheckout={() => void order.checkout()}
                    />
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Add a stand to your cart to choose shipping and pay.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
