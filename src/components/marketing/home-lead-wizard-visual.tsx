import Image from "next/image";

export function HomeLeadWizardVisual() {
  return (
    <div className="home-lead-wizard-visual">
      <div className="home-lead-wizard-visual-header">
        <span>Zyene Reviews</span>
        <span>Free guide</span>
      </div>
      <div className="home-lead-wizard-cover">
        <Image
          src="/marketing/home/zyene-overview-cover.webp"
          alt="Zyene Reviews guide cover"
          fill
          sizes="(max-width: 680px) 74vw, 380px"
        />
      </div>
      <div className="home-lead-wizard-visual-copy">
        <p className="home-lead-wizard-visual-kicker">
          A practical guide for local businesses
        </p>
        <p className="home-lead-wizard-visual-note">
          Simple ways to collect, respond to, and learn from customer feedback.
        </p>
      </div>
    </div>
  );
}
