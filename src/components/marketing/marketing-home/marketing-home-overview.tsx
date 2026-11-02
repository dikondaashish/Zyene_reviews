import { WHAT_IS_ZYENE_REVIEWS } from "@/components/marketing/marketing-home/home-faqs";

export function MarketingHomeOverview() {
  return (
    <section className="marketing-section home-about" aria-labelledby="home-about-heading">
      <div className="marketing-container">
        <div className="home-section-head" style={{ marginBottom: 0, maxWidth: "800px" }}>
          <p className="marketing-eyebrow">Overview</p>
          <h2 id="home-about-heading">What is Zyene Reviews?</h2>
          <p className="home-section-lede" style={{ maxWidth: "68ch" }}>
            {WHAT_IS_ZYENE_REVIEWS}
          </p>
        </div>
      </div>
    </section>
  );
}

