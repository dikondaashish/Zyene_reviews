import { AboutHeroImageSection } from "./about-hero-image-section";
import { AboutMissionSection } from "./about-mission-section";
import { AboutProductSection } from "./about-product-section";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background py-24 text-foreground">
            <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
                <AboutHeroImageSection />
                <div className="bg-card p-8 md:p-16 rounded-lg border border-border">
                    <AboutMissionSection />
                    <AboutProductSection />
                </div>
            </div>
        </div>
    );
}
