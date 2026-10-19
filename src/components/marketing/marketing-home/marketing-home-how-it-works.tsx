import { HomeFlowPlayer } from "@/components/marketing/marketing-home/home-flow-player";

export function MarketingHomeHowItWorks() {
  return (
    <section className="marketing-section home-how" aria-labelledby="home-how-heading">
      <div className="marketing-container">
        <HomeFlowPlayer
          head={
            <div className="home-section-head">
              <p className="marketing-eyebrow">How it works</p>
              <h2 id="home-how-heading">From a happy visit to a Google review in under a minute.</h2>
            </div>
          }
        />
      </div>
    </section>
  );
}
