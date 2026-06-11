import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INDUSTRIES } from "@/lib/phase3/industry-data";
import { IndustryIcon } from "@/lib/phase3/industry-icons";

export function IndustriesIndustryGridSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
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
                            className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all flex flex-col"
                        >
                            <div className="relative w-full h-64 sm:h-60">
                                <Image
                                    src={industry.imagePath}
                                    alt={`${industry.name} review management with Zyene Reviews`}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                            <div className="p-7 flex flex-col flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="text-primary">
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
                                Learn more <ArrowRight className="group-hover:translate-x-1 transition-transform size-3.5" />
                            </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
