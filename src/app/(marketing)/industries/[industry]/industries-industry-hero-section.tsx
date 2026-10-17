import Link from "next/link";
import { IndustryHero } from "@/components/marketing/industries/industry-hero";
import { SIGNUP_URL } from "@/config/env";
import type { IndustryData } from "@/lib/industries/industry-data";
import { getIndustryHeroCopy } from "@/lib/industries/industry-hero-copy";
import { getEsIndustryPathForEnglishSlug } from "@/lib/industries/localized-industries";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

export function IndustriesIndustryHeroSection({ data, slug }: { data: IndustryData; slug: string }) {
    const esIndustryPath = getEsIndustryPathForEnglishSlug(slug);
    const copy = getIndustryHeroCopy(slug, data.name, data.heroSub);
    return (
        <IndustryHero
            kicker={copy.kicker}
            headline={copy.headline}
            lede={copy.lede}
            primary={{ label: "Start free trial", href: SIGNUP_URL, track: "trial" }}
            secondary={{ label: "See pricing", href: "/pricing" }}
            terms="7-day free trial, card required. Plans from $29.99/month. Cancel anytime in Billing."
            image={getIndustryImage(slug, data.name)}
        >
            <Link href="/industries">All industries</Link>
            {esIndustryPath && <Link href={esIndustryPath} hrefLang="es">Ver en español</Link>}
        </IndustryHero>
    );
}
