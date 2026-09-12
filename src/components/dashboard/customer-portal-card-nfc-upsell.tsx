"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { NfcOrderDialog } from "@/components/dashboard/nfc-order-dialog";
import { useNfcOrder } from "@/components/dashboard/use-nfc-order";

export function CustomerPortalCardNfcUpsell({ businessName }: { businessName: string }) {
    const order = useNfcOrder();
    return (
        <div className="mb-5 w-full">
            <button
                type="button"
                onClick={() => order.setOpen(true)}
                className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[22px] bg-[rgb(0,82,204)] px-8 py-5 text-left shadow-sm transition-transform duration-150 ease-out active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
                <span className="relative z-10 min-w-0 space-y-2">
                    <span className="block text-sm font-semibold text-white">A review, just a tap away</span>
                    <span className="block text-sm leading-relaxed text-white/80">Let customers tap an NFC card to leave a review.</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-white underline underline-offset-4">
                        Explore NFC cards <ArrowUpRight className="size-4 text-white" aria-hidden />
                    </span>
                </span>
                <Image src="/google-nfc-card-design.png" alt="Google Review NFC card" width={62} height={90} className="shrink-0 rounded-lg object-contain" />
            </button>
            <NfcOrderDialog businessName={businessName} order={order} />
        </div>
    );
}
