import { LandingHero } from "@/components/marketing/landing-hero";
import { BreadcrumbJsonLd, OrganizationJsonLd, WebPageJsonLd } from "@/components/seo/json-ld";
import { AboutMissionSection } from "@/app/(marketing)/about/about-mission-section";
import { AboutProductSection } from "@/app/(marketing)/about/about-product-section";

const ABOUT_URL = "https://www.zyenereviews.com/about";

export default function AboutPage() {
    return (
        <>
            <OrganizationJsonLd />
            <WebPageJsonLd type="AboutPage" name="About Zyene Reviews" description="Zyene Reviews is review management software for local businesses, built by Zyene, Inc." url={ABOUT_URL} />
            <BreadcrumbJsonLd items={[{ name: "Home", url: "https://www.zyenereviews.com/" }, { name: "About", url: ABOUT_URL }]} />
            <LandingHero eyebrow="About Zyene Reviews" title="For the people behind local business." description="You put care into every customer experience. We build the tools that help your reputation reflect it." image={{ src: "/marketing/about/team-collaboration-candid-v2.webp", alt: "A team collaborating on business software" }} />
            <section className="marketing-section"><div className="marketing-container max-w-5xl"><AboutMissionSection /><AboutProductSection /></div></section>
        </>
    );
}
