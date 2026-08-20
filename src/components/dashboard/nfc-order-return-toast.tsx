"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function NfcOrderReturnToast() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const nfc = searchParams.get("nfc");
        if (nfc !== "success" && nfc !== "canceled") return;

        if (nfc === "success") {
            toast.success("NFC stand order placed", {
                description: "Stripe confirmed payment. We’ll ship to the address you entered.",
            });
        } else {
            toast.info("Checkout canceled", {
                description: "No charge was made. You can order the NFC stand anytime.",
            });
        }

        router.replace("/dashboard");
    }, [searchParams, router]);

    return null;
}
