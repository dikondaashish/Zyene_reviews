"use client";

import Image from "next/image";
import { CUSTOMER_PORTAL_GOOGLE_G_SVG } from "@/components/dashboard/customer-portal-card-constants";
import { NfcOrderDialog } from "@/components/dashboard/nfc-order-dialog";
import { useNfcOrder } from "@/components/dashboard/use-nfc-order";

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
                            Get more reviews with an NFC card!
                        </h4>
                        <p className="max-w-[240px] text-[12px] leading-snug font-medium text-white/80">
                            Customers can simply tap their phone to it to leave you a review.
                        </p>
                    </div>
                    <span className="flex w-fit items-center justify-center rounded-[10px] bg-white px-5 py-1.5 text-[13px] font-bold text-[rgb(0,82,204)] transition-[box-shadow,transform] duration-150 ease-out group-hover:shadow-lg">
                        Order now
                    </span>
                </div>

                <div className="pointer-events-none relative hidden h-28 w-40 shrink-0 items-center justify-end pr-1 select-none md:flex">
                    <div className="absolute top-[28px] right-[76px] h-[90px] w-[62px] rotate-[-28deg] scale-[0.9] opacity-20 blur-[0.4px]">
                        <Image
                            src="/google-nfc-card-design.png"
                            alt=""
                            fill
                            sizes="62px"
                            className="size-full rounded-lg object-contain shadow-2xl"
                        />
                    </div>
                    <div className="absolute top-[36px] right-[4px] h-[90px] w-[62px] rotate-[22deg] scale-[0.95] opacity-40 blur-[0.2px]">
                        <Image
                            src="/google-nfc-card-design.png"
                            alt=""
                            fill
                            sizes="62px"
                            className="size-full rounded-lg object-contain shadow-2xl"
                        />
                    </div>
                    <div className="absolute top-[0px] right-[20px] z-20 h-[106px] w-[74px] rotate-[-6deg] transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-[1.02]">
                        <Image
                            src="/google-nfc-card-design.png"
                            alt="Google Review NFC card"
                            fill
                            sizes="74px"
                            className="size-full rounded-[8px] object-contain shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
                        />
                    </div>
                </div>
            </button>

            <NfcOrderDialog businessName={businessName} order={order} />
        </div>
    );
}
