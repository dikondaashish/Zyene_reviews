"use client";

import { X } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { NfcOrderCart } from "@/components/dashboard/nfc-order-cart";
import { NfcOrderProduct } from "@/components/dashboard/nfc-order-product";
import type { useNfcOrder } from "@/components/dashboard/use-nfc-order";

type Order = ReturnType<typeof useNfcOrder>;

const STEP_CLASS =
    "col-start-1 row-start-1 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none";

export function NfcOrderDialog({
    businessName,
    order,
}: {
    businessName: string;
    order: Order;
}) {
    return (
        <Dialog open={order.open} onOpenChange={order.setOpen}>
            <DialogContent
                showCloseButton={false}
                className="gap-0 overflow-hidden rounded-2xl border-border/70 p-0 shadow-xl sm:max-w-3xl"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>Order an NFC review stand</DialogTitle>
                    <DialogDescription>
                        Pick how many stands you need, choose a delivery speed, then pay with
                        Stripe.
                    </DialogDescription>
                </DialogHeader>

                <DialogClose
                    aria-label="Close"
                    className="absolute top-3 right-3 z-20 flex size-7 items-center justify-center rounded-full border border-border/60 bg-background/85 text-muted-foreground backdrop-blur transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <X className="size-3.5" />
                </DialogClose>

                <div className="grid overflow-hidden">
                    <div
                        inert={order.inCart}
                        className={`${STEP_CLASS} ${
                            order.inCart ? "-translate-x-4 opacity-0" : "translate-x-0 opacity-100"
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
                        inert={!order.inCart}
                        className={`${STEP_CLASS} ${
                            order.inCart ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                        }`}
                    >
                        <NfcOrderCart
                            businessName={businessName}
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
