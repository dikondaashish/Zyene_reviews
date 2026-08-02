import { IndustryTrustBadge } from "@/components/marketing/social-proof";
import { getIndustryTrustLabel } from "@/lib/phase5/social-proof-data";
import type { IndustryData } from "@/lib/phase3/industry-data";
import { getEsIndustryPathForEnglishSlug } from "@/lib/phase8/localized-industries";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";

export function IndustriesIndustryHeroSection({ data, slug }: { data: IndustryData; slug: string }) {
    const esIndustryPath = getEsIndustryPathForEnglishSlug(slug);

    return (
        <section className="relative w-full min-h-[420px] md:min-h-[480px] flex items-center overflow-hidden">
            <Image
                src={data.imagePath}
                alt={`${data.name} using Zyene Reviews`}
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content overlay */}
            <div className="relative z-10 w-full px-4 py-20 md:py-28">
                <div className="container mx-auto max-w-5xl">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-primary-foreground/70 mb-6">
                        <Link href="/industries" className="hover:text-primary-foreground transition-colors">Industries</Link>
                        <ChevronRight className="size-3.5" />
                        <span className="text-primary-foreground font-medium">{data.name}</span>
                    </nav>

                    <div className="max-w-2xl">
                        <div className="mb-5">
                            <IndustryTrustBadge
                                label={getIndustryTrustLabel(slug, data.name)}
                                variant="onDark"
                            />
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground mb-5 leading-[1.08]">
                            {data.heroHeadline}
                        </h1>
                        <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed max-w-xl">
                            {data.heroSub}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={SIGNUP_URL}>
                                <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                                    Start Free Trial <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-8 py-6 text-base font-semibold rounded-xl border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                >
                                    See Pricing
                                </Button>
                            </Link>
                        </div>

                        <p className="mt-4 text-xs text-primary-foreground/60">
                            7-day free trial · No credit card lock-in · Starting at $29.99/mo
                        </p>

                        {esIndustryPath ? (
                            <p className="mt-2 text-sm text-primary-foreground/70">
                                <Link href={esIndustryPath} className="text-primary-foreground hover:underline font-medium">
                                    Ver en español
                                </Link>
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
