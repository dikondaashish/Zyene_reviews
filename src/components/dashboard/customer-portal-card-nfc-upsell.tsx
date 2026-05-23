import { CUSTOMER_PORTAL_GOOGLE_G_SVG } from "@/components/dashboard/customer-portal-card-constants";

export function CustomerPortalCardNfcUpsell() {
    return (
        <div className="relative z-10 w-full mb-4">
            <div
                className="bg-[rgb(0,82,204)] rounded-[22px] px-8 py-5 flex items-center justify-between overflow-hidden relative cursor-pointer group shadow-sm"
                onClick={() => window.open("https://zyenereviews.com/nfc-cards", "_blank")}
            >
                <div className="absolute -left-10 -top-10 w-36 h-36 opacity-[0.05] pointer-events-none select-none group-hover:scale-110 transition-transform duration-700">
                    <img
                        src={CUSTOMER_PORTAL_GOOGLE_G_SVG}
                        alt=""
                        className="w-full h-full object-contain filter brightness-0 invert"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none"></div>

                <div className="relative z-10 flex flex-col justify-center gap-3.5 flex-1">
                    <div className="space-y-1">
                        <h4 className="text-[18px] font-bold text-white leading-tight tracking-tight">
                            Get more reviews with an NFC card!
                        </h4>
                        <p className="text-[12px] text-white/80 leading-snug font-medium max-w-[240px]">
                            Customers can simply tap their phone to it to leave you a review.
                        </p>
                    </div>
                    <div className="w-fit">
                        <button className="bg-white text-[rgb(0,82,204)] text-[13px] font-bold px-5 py-1.5 rounded-[10px] hover:shadow-lg active:scale-95 transition-all flex items-center justify-center">
                            Order now
                        </button>
                    </div>
                </div>

                <div className="relative w-40 h-28 shrink-0 pointer-events-none select-none hidden md:flex items-center justify-end pr-1">
                    <div className="absolute right-[76px] top-[28px] w-[62px] h-[90px] rotate-[-28deg] opacity-20 blur-[0.4px] scale-[0.9]">
                        <img
                            src="/google-nfc-card-design.png"
                            alt=""
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                    <div className="absolute right-[4px] top-[36px] w-[62px] h-[90px] rotate-[22deg] opacity-40 blur-[0.2px] scale-[0.95]">
                        <img
                            src="/google-nfc-card-design.png"
                            alt=""
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                    <div className="absolute right-[20px] top-[0px] w-[74px] h-[106px] rotate-[-6deg] z-20 transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-[1.02]">
                        <img
                            src="/google-nfc-card-design.png"
                            alt=""
                            className="w-full h-full object-contain rounded-[8px] shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
