import { LandingHero } from "@/components/marketing/landing-hero";
import { AboutMissionSection } from "@/app/(marketing)/about/about-mission-section";
import { AboutProductSection } from "@/app/(marketing)/about/about-product-section";

export default function AboutPage() {
    return (
        <>
            <LandingHero eyebrow="About Zyene Reviews" title="For the people behind local business." description="You put care into every customer experience. We build the tools that help your reputation reflect it." image={{ src: "/marketing/about/team-collaboration.png", alt: "A team collaborating on business software" }} />
            <section className="marketing-section"><div className="marketing-container max-w-5xl"><AboutMissionSection /><AboutProductSection /></div></section>
        </>
    );
}
