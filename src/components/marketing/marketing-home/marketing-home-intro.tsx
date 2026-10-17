import { HomeProductStage } from "@/components/marketing/marketing-home/home-product-stage";

/** Sits under the hero scene: the real interactive product tour ("Try the product tour" scrolls here). */
export function MarketingHomeIntro() {
  return (
    <section className="home-intro" aria-label="Interactive product tour">
      <HomeProductStage />
    </section>
  );
}
