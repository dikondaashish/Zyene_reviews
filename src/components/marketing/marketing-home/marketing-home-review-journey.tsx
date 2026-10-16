import Link from "next/link";
import { ArrowRight, Copy, PenLine, ScanLine, ShieldCheck, Star, Tags } from "lucide-react";
import { HomeJourneyPhone } from "@/components/marketing/marketing-home/home-journey-phone";
import { HomeJourneyInStore } from "@/components/marketing/marketing-home/home-journey-in-store";

const STEPS = [
  {
    icon: ScanLine,
    title: "Scan or tap",
    text: "A QR code on the table, counter or receipt, or an NFC review stand. No app to install.",
  },
  {
    icon: Star,
    title: "Rate the visit",
    text: "You choose the question and the style: stars, emoji, numbers or a slider.",
  },
  {
    icon: Tags,
    title: "Pick what stood out",
    text: "Tags you set, like “Friendly staff” or “Fresh food”, plus the team member who helped.",
  },
  {
    icon: PenLine,
    title: "Get a drafted review",
    text: "AI turns their choices into a short review in plain words. They can change any of it.",
  },
  {
    icon: Copy,
    title: "Copy and post on Google",
    text: "One tap copies the text and opens your Google review form. Posting is always their choice.",
  },
];

export function MarketingHomeReviewJourney() {
  return (
    <section className="marketing-section home-journey" aria-labelledby="home-journey-heading">
      <div className="marketing-container">
        <div className="home-journey-grid">
          <div className="home-journey-copy">
            <p className="marketing-eyebrow">What your customers see</p>
            <h2 id="home-journey-heading">A happy visit, turned into a Google review.</h2>
            <p className="home-journey-lede">
              Your branded review page does the hard part. Customers say how it went, pick what they liked, and get a
              review drafted from their own choices, ready to paste into Google.
            </p>
            <ol className="home-journey-steps">
              {STEPS.map(({ icon: Icon, title, text }, index) => (
                <li key={title}>
                  <span className="home-journey-step-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3>
                      <span className="sr-only">Step {index + 1}: </span>
                      {title}
                    </h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="home-journey-note">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                Ratings below your threshold see a private feedback form instead, and your team gets an alert so you
                can follow up.
              </span>
            </p>
            <Link href="/features/review-page" className="home-journey-link">
              How the review page works <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <HomeJourneyPhone />
        </div>
        <HomeJourneyInStore />
      </div>
    </section>
  );
}
