import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
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
        </>
    );
}
