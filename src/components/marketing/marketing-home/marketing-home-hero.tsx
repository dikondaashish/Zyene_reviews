import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { HomeProductStage } from "@/components/marketing/marketing-home/home-product-stage";

/** The H1 keeps the "review management software" phrase for search, set as a quiet kicker above the headline. */
export function MarketingHomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="marketing-container home-hero-grid">
        <h1 id="home-hero-title" className="home-hero-title">
          <span className="home-hero-kicker">Review management software for local businesses</span>{" "}
          <span className="home-hero-headline"><span>More Google reviews.</span> <span>Less busywork.</span></span>
        </h1>
        <div className="home-hero-aside">
          <p className="home-hero-lede">
            Send review requests by text and email, reply to every Google review with AI, and see what customers keep
            saying. All in one workspace.
          </p>
          <div className="home-hero-actions">
            <Link href={SIGNUP_URL} className="marketing-button" data-track="trial" data-track-location="hero">
              Start free trial <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/demo" className="marketing-button marketing-button-secondary" data-track="demo" data-track-location="hero">
              Book a demo
            </Link>
          </div>
          <p className="home-hero-terms">7-day free trial, card required. Plans from $29.99/month. Cancel anytime in Billing.</p>
        </div>
      </div>
      <HomeProductStage />
    </section>
  );
}
