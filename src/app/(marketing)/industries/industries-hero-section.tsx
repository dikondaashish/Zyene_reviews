import Link from "next/link";
import { IndustryHero } from "@/components/marketing/industries/industry-hero";
import { SIGNUP_URL } from "@/config/env";

export function IndustriesHeroSection() {
    return (
        <IndustryHero
            kicker="Review management by industry"
            headline="Built for the way your business runs."
            lede="Restaurants, clinics, shops and trades earn reviews in different moments. Find yours and see the routine."
            primary={{ label: "Start free trial", href: SIGNUP_URL, track: "trial" }}
            secondary={{ label: "Find your industry", href: "#industry-grid" }}
            terms="7-day free trial, card required. Plans from $29.99/month. Cancel anytime in Billing."
            image={{ src: "/images/industries/restaurant-guests.webp", alt: "Guests sharing a meal and conversation at a restaurant" }}
        >
            <Link href="/es/industries">Ver soluciones en español</Link>
        </IndustryHero>
    );
}
