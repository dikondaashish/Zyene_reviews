import Link from "next/link";
import { LandingHero } from "@/components/marketing/landing-hero";
import type { IndustryData } from "@/lib/industries/industry-data";
import { getEsIndustryPathForEnglishSlug } from "@/lib/industries/localized-industries";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

export function IndustriesIndustryHeroSection({ data, slug }: { data: IndustryData; slug: string }) {
    const esIndustryPath = getEsIndustryPathForEnglishSlug(slug);
    return (
        <LandingHero
            eyebrow={`Zyene for ${data.name.toLowerCase()}`}
            title={data.heroHeadline}
            description={data.heroSub}
            image={getIndustryImage(slug, data.name)}
            primary={{ label: "Start free trial", href: "/signup" }}
            secondary={{ label: "Explore pricing", href: "/pricing" }}
        >
            <p>7 days free · From $29.99/month · Cancel anytime</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                <Link href="/industries" className="underline underline-offset-4">Explore all industries</Link>
                {esIndustryPath && <Link href={esIndustryPath} className="underline underline-offset-4">Ver en español</Link>}
            </div>
        </LandingHero>
    );
}
