import { HomeHeroContent } from "@/components/marketing/marketing-home/home-hero-content";
import { HomeHeroMotion } from "@/components/marketing/marketing-home/home-hero-motion";
import { HomeProductScene } from "@/components/marketing/marketing-home/home-product-scene";

export function MarketingHomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-container">
        <HomeHeroMotion content={<HomeHeroContent />} scene={<HomeProductScene />} />
      </div>
    </section>
  );
}
