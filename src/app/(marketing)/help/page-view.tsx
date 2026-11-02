import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import { HelpHeroSection } from "./help-hero-section";
import { HelpArticleListingsByCategorySection } from "./help-article-listings-by-category-section";
import { HelpContactSupportSection } from "./help-contact-support-section";

export default function HelpCenterPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Help Center", url: "https://www.zyenereviews.com/help" },
                ]}
            />
            <HelpHeroSection />
            <HelpArticleListingsByCategorySection />
            <HelpContactSupportSection />
            <MarketingClosingBand
                title="New to Zyene?"
                text="Start with a 7-day free trial and set up review requests, replies, and reporting with these guides beside you."
                secondary={{ label: "Contact support", href: "/contact" }}
                image={{ src: "/images/industries/salons-candid-v2.webp", alt: "Hair stylist combing a client's hair in a neighborhood salon" }}
                trackLocation="help-final"
                headingId="help-final-heading"
            />
        </>
    );
}
