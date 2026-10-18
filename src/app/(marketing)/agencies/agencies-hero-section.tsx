import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingHero } from "@/components/marketing/landing-hero";

export function AgenciesHeroSection() {
    return (
        <LandingHero
            eyebrow="Zyene for agencies"
            title="A better review routine for the clients who trust you."
            description="Give clients branded review request flows, private feedback follow-up, and white-label widgets for Enterprise accounts while you guide the strategy behind the work."
            image={{ src: "/marketing/about/team-collaboration-candid-v2.webp", alt: "An agency team collaborating around a table" }}
            primary={{ label: "Book a demo", href: "/demo" }}
            secondary={{ label: "Start 7-day free trial", href: "/signup" }}
        >
            <Link href="/partners" className="home-text-link">
                Explore partnerships <ArrowRight size={14} aria-hidden="true" />
            </Link>
        </LandingHero>
    );
}
