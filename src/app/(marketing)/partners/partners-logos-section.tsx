import Image from "next/image";
import { PARTNER_LOGOS } from "@/lib/campaign-content/partnerships-data";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

export function PartnersLogosSection() {
    return (
        <section className="py-12 px-4 bg-muted/40 border-b border-border">
            <div className="container mx-auto max-w-5xl">
                <p className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground mb-8">
                    Partnership channels we&apos;re building with
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
                    {PARTNER_LOGOS.map((partner) => (
                        <div
                            key={partner.name}
                            className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity"
                        >
                            <Image
                                src={getBrandLogoUrl(partner.domain)}
                                alt={`${partner.name} logo`}
                                width={28}
                                height={28}
                                className="rounded-md shrink-0 size-7 object-contain"
                                unoptimized
                            />
                            <span className="text-sm font-semibold text-foreground">{partner.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
