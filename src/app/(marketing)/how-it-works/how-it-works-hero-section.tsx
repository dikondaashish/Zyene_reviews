import Link from "next/link";
import { LandingHero } from "@/components/marketing/landing-hero";
import { STEPS } from "@/app/(marketing)/how-it-works/how-it-works-data";

export function HowItWorksHeroSection() {
    return (
        <LandingHero
            eyebrow="From setup to your next review"
            title="A simpler routine for your reputation."
            description="Connect your business, invite customer feedback, and keep the conversation going. Here’s how it all works."
            primary={{ label: "Start free trial", href: "/signup" }}
            secondary={{ label: "Book a demo", href: "/demo" }}
        >
            <nav aria-label="Steps to get started" className="mt-7 flex flex-wrap gap-3">
                {STEPS.map(step => <Link key={step.step} href={`#step-${step.step}`} className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary"><span className="mr-2 text-primary">{step.step}</span>{step.title}</Link>)}
            </nav>
        </LandingHero>
    );
}
