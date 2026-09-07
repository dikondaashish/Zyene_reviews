import { LandingHero } from "@/components/marketing/landing-hero";
import Link from "next/link";

export function IndustriesHeroSection() {
    return (
        <LandingHero
            eyebrow="Made for local business"
            title="Your industry. Your reputation."
            description="Find review workflows that fit the way your business serves customers, from the front desk to the job site."
            image={{ src: "/images/industries/window-installation.webp", alt: "A tradesperson fitting a window frame with a cordless drill" }}
            primary={{ label: "Find your industry", href: "#industry-grid" }}
            secondary={{ label: "Explore pricing", href: "/pricing" }}
        >
            <Link href="/es/industries" className="underline underline-offset-4">Ver soluciones en español</Link>
        </LandingHero>
    );
}
