import { HomeProductStage } from "@/components/marketing/marketing-home/home-product-stage";

/** Follows "How it works": the real interactive product tour ("Try the product tour" scrolls here). */
export function MarketingHomeIntro() {
  return (
    <section className="marketing-section home-intro" aria-labelledby="home-tour-heading">
      <div className="marketing-container">
        <div className="home-section-head">
          <p className="marketing-eyebrow">Try it yourself</p>
          <h2 id="home-tour-heading">Click around a real workspace.</h2>
          <p className="home-section-lede">Open a sample coffee shop&apos;s inbox, pick a reply tone and see how reviews, requests and reporting fit together.</p>
        </div>
      </div>
      <HomeProductStage />
    </section>
  );
}
