"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { NfcShippingId } from "@/lib/nfc/catalog";
import { clampNfcQuantity, NFC_CARD } from "@/lib/nfc/catalog";

export function useNfcOrder() {
    const [open, setOpenState] = useState(false);
    const [quantity, setQuantityState] = useState(1);
    const [inCart, setInCart] = useState(false);
    const [shippingId, setShippingId] = useState<NfcShippingId>("standard");
    const [checkingOut, setCheckingOut] = useState(false);

    function setOpen(next: boolean) {
        setOpenState(next);
        if (!next) {
            setInCart(false);
            setCheckingOut(false);
        }
    }

    function setQuantity(next: number) {
        setQuantityState(clampNfcQuantity(next));
    }

    function addToCart() {
        setInCart(true);
    }

    function backToProduct() {
        setInCart(false);
    }

    async function checkout() {
        if (!inCart || quantity < NFC_CARD.minQty) return;
        setCheckingOut(true);
        try {
            const response = await fetch("/api/nfc/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity, shippingId }),
            });
            const json = (await response.json()) as {
                success?: boolean;
                data?: { url?: string };
                error?: string;
            };
            if (!response.ok || !json.data?.url) {
                toast.error(json.error || "Unable to start checkout");
                return;
            }
            window.location.assign(json.data.url);
        } catch {
            toast.error("Unable to start checkout");
        } finally {
            setCheckingOut(false);
        }
    }

    return {
        open,
        setOpen,
        quantity,
        setQuantity,
        inCart,
        shippingId,
        setShippingId,
        checkingOut,
        addToCart,
        backToProduct,
        checkout,
    };
}
