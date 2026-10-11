import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";

export function HomeHeroContent() {
  return (
    <div className="home-hero-content">
      <p className="home-hero-eyebrow">
        <Star size={18} aria-hidden="true" /> Big love for local businesses
      </p>
      <h1 id="home-hero-title">
        <span>
          Review management software for local businesses.
        </span>
        <span>
          More Google reviews, less busywork.
        </span>
      </h1>
      <p className="home-hero-description">
        Zyene Reviews brings text and email requests, connected reviews, and AI-assisted replies into one workspace. Choose reviewed drafts or automatic replies for eligible new Google reviews.
      </p>
      <div className="home-hero-actions">
        <div>
          <Link href={SIGNUP_URL} className="marketing-button" data-track="trial" data-track-location="hero">
            Start your free trial <ArrowRight size={22} aria-hidden="true" />
          </Link>
        </div>
        <div>
          <Link href="#home-product-tour" className="marketing-button marketing-button-secondary">
            Try the product tour <ArrowRight size={22} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <ul className="home-hero-benefits" aria-label="Trial details">
        {["7-day trial · card required", "Plans from $29.99/month", "Cancel in Billing"].map((benefit) => (
          <li key={benefit}>
            <Check size={19} aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">Your selected plan bills automatically after the trial unless you cancel.</p>
    </div>
  );
}
