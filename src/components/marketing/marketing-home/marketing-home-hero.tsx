import { HomeHeroContent } from "@/components/marketing/marketing-home/home-hero-content";
import { HomeHeroSceneMotion } from "@/components/marketing/marketing-home/home-hero-motion";
import { HomeProductScene } from "@/components/marketing/marketing-home/home-product-scene";

export function MarketingHomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-container">
        <div className="home-hero-main">
          <div className="home-hero-copy-layer">
            <HomeHeroContent />
          </div>
          <HomeHeroSceneMotion>
            <HomeProductScene />
          </HomeHeroSceneMotion>
        </div>
      </div>
    </section>
  );
}
