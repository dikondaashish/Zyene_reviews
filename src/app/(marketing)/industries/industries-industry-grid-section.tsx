import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INDUSTRIES } from "@/lib/industries/industry-data";
import { industryAccentTint, industryAccentVar } from "@/lib/industries/industry-accent-tokens";
import { IndustryIcon } from "@/lib/industries/industry-icons";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

export function IndustriesIndustryGridSection() {
    return (
        <section id="industry-grid" className="py-20 px-4 bg-muted border-t border-border">
            <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl font-bold text-foreground text-center mb-3">Choose your industry</h2>
                <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
                    See exactly how Zyene solves reputation challenges specific to your type of business.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {INDUSTRIES.map((industry) => (
                        <Link
                            key={industry.slug}
                            href={`/industries/${industry.slug}`}
                            className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5 transition-[border-color,box-shadow,transform] duration-[180ms] ease-out flex flex-col"
                        >
                            {/* Media: image with curated accent gradient overlay + top accent hairline. */}
                            <div className="relative w-full h-64 sm:h-60">
                                <div
                                    aria-hidden
                                    className="absolute inset-x-0 top-0 h-[3px] z-10"
                                    style={{ background: industryAccentVar(industry.accentColor) }}
                                />
                                <Image
                                    src={getIndustryImage(industry.slug).src}
                                    alt={getIndustryImage(industry.slug, industry.name).alt}
                                    fill
                                    sizes="(max-width: 639px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-[300ms] ease-out group-hover:scale-[1.04]"
                                />
                                <div
                                    aria-hidden
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: `linear-gradient(180deg, transparent 55%, ${industryAccentTint(industry.accentColor)} 100%)`,
                                    }}
                                />
                            </div>
                            <div className="p-7 flex flex-col flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="grid place-items-center size-9 rounded-lg"
                                    style={{
                                        color: industryAccentVar(industry.accentColor),
                                        background: industryAccentTint(industry.accentColor),
                                    }}
                                >
                                    <IndustryIcon slug={industry.slug} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                    {industry.name}
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                                {industry.heroSub.split(".")[0]}.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                Learn more <ArrowRight className="group-hover:translate-x-1 transition-transform duration-[180ms] size-3.5" />
                            </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
