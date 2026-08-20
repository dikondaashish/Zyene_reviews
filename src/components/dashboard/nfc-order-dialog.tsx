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
            <DialogContent className="overflow-hidden rounded-2xl p-5 sm:max-w-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Order an NFC review stand</DialogTitle>
                    <DialogDescription>
                        Choose a stand, then shipping, then pay with Stripe.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid overflow-hidden">
                    <div
                        aria-hidden={order.inCart}
                        className={`col-start-1 row-start-1 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                            order.inCart
                                ? "pointer-events-none -translate-x-6 opacity-0"
                                : "translate-x-0 opacity-100"
                        }`}
                    >
                        <NfcOrderProduct
                            businessName={businessName}
                            quantity={order.quantity}
                            onQuantityChange={order.setQuantity}
                            onAddToCart={order.addToCart}
                        />
                    </div>
                    <div
                        aria-hidden={!order.inCart}
                        className={`col-start-1 row-start-1 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                            order.inCart
                                ? "translate-x-0 opacity-100"
                                : "pointer-events-none translate-x-6 opacity-0"
                        }`}
                    >
                        <NfcOrderCart
                            quantity={order.quantity}
                            shippingId={order.shippingId}
                            checkingOut={order.checkingOut}
                            onBack={order.backToProduct}
                            onShippingChange={order.setShippingId}
                            onCheckout={() => void order.checkout()}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
