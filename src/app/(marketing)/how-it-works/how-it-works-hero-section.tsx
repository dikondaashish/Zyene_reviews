import Link from "next/link";
import { LandingHero } from "@/components/marketing/landing-hero";
import { RequestsHeroVisual } from "@/components/marketing/feature-landing/visuals/review-requests-visuals";
import { STEPS } from "@/app/(marketing)/how-it-works/how-it-works-data";

export function HowItWorksHeroSection() {
    return (
        <LandingHero
            eyebrow="From first request to next improvement"
            title="A review routine your team can keep."
            description="Connect your profile, invite feedback fairly, respond with care, and use the signals to improve the next customer experience."
            variant="product"
            media={{
                kind: "product",
                label: "Sending a review request by text message",
                node: <div className="mi-visual"><RequestsHeroVisual /></div>,
            }}
            primary={{ label: "Start 7-day free trial", href: "/signup" }}
            secondary={{ label: "Book a demo", href: "/demo" }}
        >
            <nav aria-label="Steps to get started" className="mi-chips">
                {STEPS.map((step, index) => (
                    <Link key={step.step} href={`#step-${step.step}`}>
                        <span className="sr-only">Step {index + 1}: </span>{step.title}
                    </Link>
                ))}
            </nav>
        </LandingHero>
    );
}
