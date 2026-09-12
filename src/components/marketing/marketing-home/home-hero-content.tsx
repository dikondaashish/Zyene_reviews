import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";

export function HomeHeroContent() {
  return (
    <div className="home-hero-content">
      <p className="home-hero-eyebrow hero-enter" style={{ animationDelay: "150ms" }}>
        <Star size={18} aria-hidden="true" /> Big love for local businesses
      </p>
      <h1 id="home-hero-title">
        <span className="hero-enter" style={{ animationDelay: "250ms" }}>
          More reviews.
        </span>
        <span className="hero-enter" style={{ animationDelay: "350ms" }}>
          Less busywork.
        </span>
      </h1>
      <p className="home-hero-description hero-enter" style={{ animationDelay: "550ms" }}>
        Collect customer feedback by text, email, or QR code. Manage reviews and draft thoughtful replies in one workspace built for local businesses.
      </p>
      <div className="home-hero-actions">
        <div className="hero-enter" style={{ animationDelay: "700ms" }}>
          <Link href={SIGNUP_URL} className="marketing-button">
            Start your free trial <ArrowRight size={22} aria-hidden="true" />
          </Link>
        </div>
        <div className="hero-enter" style={{ animationDelay: "780ms" }}>
          <Link href="#home-product-tour" className="marketing-button marketing-button-secondary">
            Try the product tour <ArrowRight size={22} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <ul className="home-hero-benefits" aria-label="Trial details">
        {["7 days free", "Cancel anytime", "Plans from $29.99/month"].map((benefit, index) => (
          <li key={benefit} className="hero-enter" style={{ animationDelay: `${900 + index * 100}ms` }}>
            <Check size={19} aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}
