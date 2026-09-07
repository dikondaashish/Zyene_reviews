import { LandingHero } from "@/components/marketing/landing-hero";
import { PARTNER_CONTACT_EMAIL } from "@/lib/campaign-content/partnerships-data";

export function PartnersHeroSection() {
    return <LandingHero eyebrow="Better, together" title="Help local businesses put their best foot forward." description="Partner with Zyene to bring practical, affordable review management to the businesses you serve." primary={{ label: "Contact partnerships", href: `mailto:${PARTNER_CONTACT_EMAIL}?subject=Partnership%20inquiry` }} secondary={{ label: "Explore the agency program", href: "/agencies" }} />;
}
