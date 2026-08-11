import Image from "next/image";
import { ILLUSTRATIVE_BRANDS } from "@/lib/social-proof/illustrative-brands-data";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

export function IllustrativeBrandsBar({
    title = "Built for businesses like these",
}: {
    title?: string;
}) {
    return (
        <section className="w-full py-12 border-y border-border bg-muted/40">
            <div className="container mx-auto max-w-6xl px-4">
                <p className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground mb-8">
                    {title}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                    {ILLUSTRATIVE_BRANDS.map((brand) => (
                        <div
                            key={brand.name}
                            className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity"
                            title={`${brand.name} · ${brand.industry}`}
                        >
                            <Image
                                src={getBrandLogoUrl(brand.domain)}
                                alt={`${brand.name} logo`}
                                width={36}
                                height={36}
                                className="rounded-lg shrink-0 size-9 object-contain"
                                unoptimized
                            />
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-semibold text-foreground leading-none">{brand.name}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{brand.industry}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-center text-[11px] text-muted-foreground/70 mt-6">
                    Shown for illustration only &mdash; not Zyene customers or partners. Logos are trademarks of their respective owners.
                </p>
            </div>
        </section>
    );
}
