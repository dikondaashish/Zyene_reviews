import { notFound } from "next/navigation";
import Link from "next/link";
import { IndustryHero } from "@/components/marketing/industries/industry-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";
import { getLocalizedIndustry } from "@/lib/industries/localized-industries";
import { getEsIndustryImage } from "@/lib/industries/localized-industry-imagery";
import { EsIndustryClosingSection, EsIndustryFeaturesSection, EsIndustryHelpSection } from "./es-industry-sections";

export default async function EsIndustryPage({
    params,
}: {
    params: Promise<{ industry: string }>;
}) {
    const { industry: localizedSlug } = await params;
    const data = getLocalizedIndustry("es", localizedSlug);
    if (!data) notFound();

    return (
        <div className="ind-page" lang="es">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Industrias", url: "https://www.zyenereviews.com/es/industries" },
                    { name: data.name, url: `https://www.zyenereviews.com/es/industries/${localizedSlug}` },
                ]}
            />
            <IndustryHero
                kicker={data.metaTitle}
                headline={data.heroTitle}
                lede={data.heroSubtitle}
                primary={{ label: "Prueba gratis", href: SIGNUP_URL, track: "trial", trackLocation: "es-industry-hero" }}
                secondary={{ label: "Ver precios", href: "/pricing" }}
                terms="Prueba de 7 días, se requiere tarjeta. Planes desde $29.99/mes. Cancela cuando quieras en Facturación."
                image={getEsIndustryImage(data.industrySlug, data.name)}
            >
                <Link href={`/industries/${data.industrySlug}`} hrefLang="en">Read in English</Link>
                <Link href="/es/industries">Todas las industrias</Link>
            </IndustryHero>
            <EsIndustryHelpSection data={data} />
            <EsIndustryFeaturesSection />
            <EsIndustryClosingSection data={data} />
        </div>
    );
}
