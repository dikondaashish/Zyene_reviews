import { LandingHero } from "@/components/marketing/landing-hero";
import Link from "next/link";

export function IndustriesHeroSection() {
    return (
        <LandingHero
            eyebrow="Made for local business"
            title="A clearer review routine for your industry."
            description="Invite feedback fairly, respond with care, follow up on private concerns, and learn from the trends that shape your reputation."
            image={{ src: "/images/industries/window-installation.webp", alt: "A tradesperson fitting a window frame with a cordless drill" }}
            primary={{ label: "Find your industry", href: "#industry-grid" }}
            secondary={{ label: "Explore pricing", href: "/pricing" }}
        >
            <Link href="/es/industries" className="underline underline-offset-4">Ver soluciones en español</Link>
        </LandingHero>
    );
}
