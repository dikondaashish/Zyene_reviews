"use client";

import Image from "next/image";
import { CUSTOMER_PORTAL_GOOGLE_G_SVG } from "@/components/dashboard/customer-portal-card-constants";
import { NfcOrderDialog } from "@/components/dashboard/nfc-order-dialog";
import { useNfcOrder } from "@/components/dashboard/use-nfc-order";
import { NFC_CARD } from "@/lib/nfc/catalog";

export function CustomerPortalCardNfcUpsell({ businessName }: { businessName: string }) {
    const order = useNfcOrder();

    return (
        <div className="relative z-10 mb-4 w-full">
            <button
                type="button"
                onClick={() => order.setOpen(true)}
                className="group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-[22px] bg-[rgb(0,82,204)] px-8 py-5 text-left shadow-sm transition-transform duration-150 ease-out active:scale-[0.99]"
            >
                <div className="pointer-events-none absolute -top-10 -left-10 size-36 opacity-[0.05] select-none transition-transform duration-700 group-hover:scale-110">
                    <Image
                        src={CUSTOMER_PORTAL_GOOGLE_G_SVG}
                        alt=""
                        width={144}
                        height={144}
                        unoptimized
                        className="size-full object-contain brightness-0 invert filter"
                    />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />

                <div className="relative z-10 flex flex-1 flex-col justify-center gap-3.5">
                    <div className="space-y-1">
                        <h4 className="text-[18px] leading-tight font-bold tracking-tight text-white">
                            Get more reviews with an NFC stand!
                        </h4>
                        <p className="max-w-[240px] text-[12px] leading-snug font-medium text-white/80">
                            Customers tap NFC or scan the QR code to leave you a Google review.
                        </p>
                    </div>
                    <span className="flex w-fit items-center justify-center rounded-[10px] bg-white px-5 py-1.5 text-[13px] font-bold text-[rgb(0,82,204)] transition-[box-shadow,transform] duration-150 ease-out group-hover:shadow-lg">
                        Order now
                    </span>
                </div>

                <div className="pointer-events-none relative hidden h-28 w-28 shrink-0 md:block">
                    <div className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.25)] ring-1 ring-white/25 transition-transform duration-500 group-hover:scale-[1.03]">
                        <Image
                            src={NFC_CARD.imageSrc}
                            alt={NFC_CARD.name}
                            fill
                            sizes="112px"
                            className="object-cover"
                        />
                    </div>
                </div>
            </button>

            <NfcOrderDialog businessName={businessName} order={order} />
        </div>
    );
}
