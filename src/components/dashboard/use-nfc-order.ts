"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { NfcShippingId } from "@/lib/nfc/catalog";
import { clampNfcQuantity, NFC_CARD } from "@/lib/nfc/catalog";

export function useNfcOrder() {
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [cartQty, setCartQty] = useState(0);
    const [shippingId, setShippingId] = useState<NfcShippingId>("standard");
    const [checkingOut, setCheckingOut] = useState(false);

    function addToCart() {
        setCartQty((prev) => clampNfcQuantity(prev + quantity));
        toast.success("Added to cart", {
            description: `${quantity === 1 ? "1 NFC card" : `${quantity} NFC cards`} ready to ship.`,
        });
    }

    function setCartQuantity(next: number) {
        setCartQty(clampNfcQuantity(next));
    }

    async function checkout() {
        if (cartQty < NFC_CARD.minQty) return;
        setCheckingOut(true);
        try {
            const response = await fetch("/api/nfc/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: cartQty, shippingId }),
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
        setQuantity: (next: number) => setQuantity(clampNfcQuantity(next)),
        cartQty,
        setCartQuantity,
        shippingId,
        setShippingId,
        checkingOut,
        addToCart,
        checkout,
    };
}
